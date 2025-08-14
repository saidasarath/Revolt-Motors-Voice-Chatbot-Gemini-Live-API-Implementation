class VoiceChatbot {
    constructor() {
        this.ws = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.isProcessing = false;
        this.currentAudio = null;
        this.speechSynthesis = window.speechSynthesis;
        this.speechRecognition = null;
        this.performanceMetrics = {
            startTime: Date.now(),
            messagesSent: 0,
            messagesReceived: 0,
            totalAudioTime: 0,
            connectionTime: 0
        };
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.initializeWebSocket();
        this.bindEvents();
        this.initializePerformanceMonitoring();
    }

    initializePerformanceMonitoring() {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
                    console.warn('High memory usage detected:', Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB');
                    this.cleanupOldMessages();
                }
            }, 30000); // Check every 30 seconds
        }
        
        // Monitor WebSocket performance
        setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.performanceMetrics.connectionTime = Date.now() - this.performanceMetrics.startTime;
            }
        }, 10000);
    }

    initializeElements() {
        this.recordBtn = document.getElementById('recordBtn');
        this.recordingStatus = document.getElementById('recordingStatus');
        this.chatMessages = document.getElementById('chatMessages');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.languageSelect = document.getElementById('languageSelect');
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';
        } else {
            console.warn('Speech recognition not supported');
        }
        
        // Check TTS support for different languages
        this.checkTTSSupport();
    }

    checkTTSSupport() {
        if (!this.speechSynthesis) return;
        
        // Get available voices
        const voices = this.speechSynthesis.getVoices();
        
        if (voices.length > 0) {
            this.availableVoices = voices;
            this.logAvailableLanguages();
        } else {
            // Wait for voices to load
            this.speechSynthesis.onvoiceschanged = () => {
                this.availableVoices = this.speechSynthesis.getVoices();
                this.logAvailableLanguages();
            };
        }
    }

    logAvailableLanguages() {
        if (!this.availableVoices) return;
        
        const supportedLanguages = new Set();
        this.availableVoices.forEach(voice => {
            if (voice.lang) {
                const langCode = voice.lang.split('-')[0];
                supportedLanguages.add(langCode);
            }
        });
        
        console.log('🌍 Browser TTS supported languages:', Array.from(supportedLanguages));
        
        // Check our specific languages
        const ourLanguages = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'pa'];
        const supported = ourLanguages.filter(lang => supportedLanguages.has(lang));
        const unsupported = ourLanguages.filter(lang => !supportedLanguages.has(lang));
        
        console.log('✅ Supported by browser:', supported);
        console.log('❌ Not supported by browser:', unsupported);
    }

    initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.ws = new WebSocket(wsUrl);
        
        // Connection timeout
        const connectionTimeout = setTimeout(() => {
            if (this.ws.readyState === WebSocket.CONNECTING) {
                this.ws.close();
                this.updateStatus('Connection timeout', 'error');
            }
        }, 10000); // 10 second timeout
        
        this.ws.onopen = () => {
            clearTimeout(connectionTimeout);
            console.log('WebSocket connected');
            this.updateStatus('Connected to server', 'success');
            
            // Send heartbeat to keep connection alive
            this.startHeartbeat();
        };
        
        this.ws.onmessage = (event) => {
            this.handleWebSocketMessage(event.data);
        };
        
        this.ws.onclose = (event) => {
            clearTimeout(connectionTimeout);
            this.stopHeartbeat();
            console.log('WebSocket disconnected:', event.code, event.reason);
            
            if (event.code === 1000) {
                this.updateStatus('Connection closed normally', 'success');
            } else {
                this.updateStatus('Connection lost - reconnecting...', 'error');
                // Attempt to reconnect after 3 seconds
                setTimeout(() => this.initializeWebSocket(), 3000);
            }
        };
        
        this.ws.onerror = (error) => {
            clearTimeout(connectionTimeout);
            console.error('WebSocket error:', error);
            this.updateStatus('Connection error', 'error');
        };
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Send ping every 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    bindEvents() {
        this.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.languageSelect.addEventListener('change', () => this.updateLanguage());
        
        // Error modal close
        window.closeErrorModal = () => this.closeErrorModal();
    }

    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            // Optimized audio constraints for better quality and performance
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    latency: 0.01
                } 
            });
            
            // Try to use the most efficient audio format available
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg;codecs=opus'
            ];
            
            let selectedMimeType = null;
            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType;
                    break;
                }
            }
            
            if (!selectedMimeType) {
                throw new Error('No supported audio format found');
            }
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: selectedMimeType,
                audioBitsPerSecond: 128000 // Optimize for voice
            });
            
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
                // Properly clean up audio stream
                stream.getTracks().forEach(track => {
                    track.stop();
                    track.enabled = false;
                });
            };
            
            this.mediaRecorder.start(1000); // Collect data every second for better streaming
            this.isRecording = true;
            this.updateRecordingUI(true);
            this.updateStatus('Recording...', 'recording');
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showError('Failed to start recording. Please check microphone permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.updateRecordingUI(false);
            this.updateStatus('Processing audio...', 'processing');
        }
    }

    async processRecording() {
        if (this.audioChunks.length === 0) return;
        
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = this.arrayBufferToBase64(arrayBuffer);
        
        // Get selected language
        const language = this.languageSelect.value;
        
        // Send audio to server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'audio',
                audio: base64Audio,
                language: language
            }));
            
            // Update performance metrics
            this.performanceMetrics.messagesSent++;
            this.performanceMetrics.totalAudioTime += this.audioChunks.length * 1000; // Approximate time
        }
    }

    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    handleWebSocketMessage(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'processing':
                    this.showLoading(true);
                    break;
                    
                case 'ai_response':
                    this.showLoading(false);
                    this.handleAIResponse(message);
                    break;
                    
                case 'interrupt':
                    this.handleInterruption();
                    break;
                    
                case 'error':
                    this.showLoading(false);
                    this.showError(message.message);
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
            }
            
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    handleAIResponse(message) {
        // Add AI response to chat
        this.addMessage('ai', message.text, message.language);
        
        // Speak the response
        this.speakText(message.text, message.language);
        
        this.updateStatus('Ready to listen', 'success');
        
        // Hide welcome message and show chat
        this.welcomeMessage.style.display = 'none';
        this.chatMessages.style.display = 'block';
    }

    handleInterruption() {
        // Stop current speech
        this.speechSynthesis.cancel();
        
        // Update status
        this.updateStatus('Listening to new input...', 'recording');
        
        this.showLoading(false);
    }

    addMessage(sender, text, language) {
        // Create message element with optimized DOM manipulation
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();
        
        content.appendChild(messageText);
        content.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        // Add to fragment first, then append to DOM
        fragment.appendChild(messageDiv);
        this.chatMessages.appendChild(fragment);
        
        // Optimized scrolling with requestAnimationFrame
        requestAnimationFrame(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        });
        
        // Clean up old messages to prevent memory bloat (keep last 50)
        this.cleanupOldMessages();
    }

    cleanupOldMessages() {
        const messages = this.chatMessages.querySelectorAll('.message');
        if (messages.length > 50) {
            const messagesToRemove = messages.length - 50;
            for (let i = 0; i < messagesToRemove; i++) {
                messages[i].remove();
            }
        }
    }

    speakText(text, language) {
        if (this.speechSynthesis) {
            // Stop any current speech
            this.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getLanguageCode(language);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Interrupt handling
            utterance.onstart = () => {
                this.updateStatus('AI speaking...', 'speaking');
            };
            
            utterance.onend = () => {
                this.updateStatus('Ready to listen', 'success');
            };
            
            // Check if language is supported
            utterance.onerror = (event) => {
                console.log(`TTS error for ${language}:`, event.error);
                this.handleTTSFallback(text, language);
            };
            
            // Try to speak
            try {
                this.speechSynthesis.speak(utterance);
            } catch (error) {
                console.log(`TTS failed for ${language}:`, error);
                this.handleTTSFallback(text, language);
            }
        } else {
            this.handleTTSFallback(text, language);
        }
    }

    handleTTSFallback(text, language) {
        if (language === 'en') {
            // For English, just show text (should work)
            this.updateStatus('Ready to listen', 'success');
            return;
        }
        
        // For other languages, show a helpful message
        this.showLanguageTTSMessage(language, text);
        this.updateStatus('Ready to listen', 'success');
    }

    showLanguageTTSMessage(language, text) {
        const languageNames = {
            'hi': 'Hindi',
            'mr': 'Marathi', 
            'gu': 'Gujarati',
            'bn': 'Bengali',
            'ta': 'Tamil',
            'te': 'Telugu',
            'kn': 'Kannada',
            'ml': 'Malayalam',
            'pa': 'Punjabi'
        };
        
        const languageName = languageNames[language] || language;
        
        // Create a temporary message to show TTS limitation
        const tempMessage = `AI responded in ${languageName}: "${text}"\n\nNote: Voice playback for ${languageName} is not supported by your browser. The response is displayed as text.`;
        
        // Add this as a system message
        this.addSystemMessage(tempMessage);
    }

    addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        
        const content = document.createElement('div');
        content.className = 'message-content system';
        content.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
        
        messageDiv.appendChild(content);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    getLanguageCode(language) {
        const languageMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'mr': 'mr-IN',
            'gu': 'gu-IN',
            'bn': 'bn-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'kn': 'kn-IN',
            'ml': 'ml-IN',
            'pa': 'pa-IN'
        };
        return languageMap[language] || 'en-US';
    }

    updateRecordingUI(isRecording) {
        if (isRecording) {
            this.recordBtn.classList.add('recording');
            this.recordBtn.innerHTML = '<div class="record-icon"><i class="fas fa-stop"></i></div><div class="pulse-ring"></div>';
            this.recordingStatus.innerHTML = '<span class="recording-text">Click to stop</span>';
        } else {
            this.recordBtn.classList.remove('recording');
            this.recordBtn.innerHTML = '<div class="record-icon"><i class="fas fa-microphone"></i></div><div class="pulse-ring"></div>';
            this.recordingStatus.innerHTML = '<span class="recording-text">Click to start</span>';
        }
    }

    updateStatus(text, type) {
        const statusText = this.statusIndicator.querySelector('.status-text');
        const statusDot = this.statusIndicator.querySelector('.status-dot');
        
        statusText.textContent = text;
        
        // Update status dot color
        statusDot.className = 'status-dot';
        switch (type) {
            case 'success':
                statusDot.style.background = '#28a745';
                break;
            case 'error':
                statusDot.style.background = '#dc3545';
                break;
            case 'recording':
                statusDot.style.background = '#fd7e14';
                break;
            case 'processing':
                statusDot.style.background = '#007bff';
                break;
            case 'speaking':
                statusDot.style.background = '#6f42c1';
                break;
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.add('show');
        } else {
            this.loadingOverlay.classList.remove('show');
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        this.errorModal.classList.add('show');
    }

    closeErrorModal() {
        this.errorModal.classList.remove('show');
    }

    updateLanguage() {
        const language = this.languageSelect.value;
        console.log('Language changed to:', language);
        
        // Update speech recognition language if supported
        if (this.speechRecognition) {
            this.speechRecognition.lang = this.getLanguageCode(language);
        }
        
        // Update language selector with TTS support info
        this.updateLanguageSelectorInfo(language);
        
        // Show language change notification
        this.showLanguageChangeNotification(language);
    }

    showLanguageChangeNotification(language) {
        const languageNames = {
            'en': 'English',
            'hi': 'Hindi',
            'mr': 'Marathi', 
            'gu': 'Gujarati',
            'bn': 'Bengali',
            'ta': 'Tamil',
            'te': 'Telugu',
            'kn': 'Kannada',
            'ml': 'Malayalam',
            'pa': 'Punjabi'
        };
        
        const languageName = languageNames[language] || language;
        const hasTTS = this.isLanguageSupported(language);
        
        const notification = document.createElement('div');
        notification.className = 'language-notification';
        notification.innerHTML = `
            <i class="fas fa-language"></i>
            <span>Switched to ${languageName} ${hasTTS ? '🔊' : '📝'}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    updateLanguageSelectorInfo(selectedLanguage) {
        const languageSelect = this.languageSelect;
        const options = languageSelect.querySelectorAll('option');
        
        options.forEach(option => {
            const langCode = option.value;
            const hasTTS = this.isLanguageSupported(langCode);
            
            if (hasTTS) {
                option.text = `${option.text} 🔊`;
            } else {
                option.text = `${option.text} 📝`;
            }
        });
        
        // Reset selected option text
        const selectedOption = languageSelect.querySelector(`option[value="${selectedLanguage}"]`);
        if (selectedOption) {
            const baseText = selectedOption.text.replace(/[🔊📝]/g, '').trim();
            const hasTTS = this.isLanguageSupported(selectedLanguage);
            selectedOption.text = hasTTS ? `${baseText} 🔊` : `${baseText} 📝`;
        }
    }

    isLanguageSupported(language) {
        if (!this.availableVoices) return language === 'en'; // Default to English
        
        return this.availableVoices.some(voice => {
            const voiceLang = voice.lang.split('-')[0];
            return voiceLang === language;
        });
    }

    // Cleanup method
    destroy() {
        // Cleanup WebSocket
        if (this.ws) {
            this.ws.close();
        }
        
        // Cleanup audio recording
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
        
        // Cleanup speech synthesis
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
        
        // Cleanup intervals
        this.stopHeartbeat();
        
        // Cleanup performance monitoring
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }
        
        // Log final performance metrics
        console.log('🎯 Final Performance Metrics:', {
            totalRuntime: Date.now() - this.performanceMetrics.startTime,
            messagesSent: this.performanceMetrics.messagesSent,
            messagesReceived: this.performanceMetrics.messagesReceived,
            totalAudioTime: this.performanceMetrics.totalAudioTime,
            averageResponseTime: this.performanceMetrics.totalAudioTime / Math.max(this.performanceMetrics.messagesSent, 1)
        });
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new VoiceChatbot();
    
    // Make chatbot globally accessible for debugging
    window.voiceChatbot = chatbot;
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        chatbot.destroy();
    });
});

// Utility function to close error modal
function closeErrorModal() {
    const errorModal = document.getElementById('errorModal');
    errorModal.classList.remove('show');
}
