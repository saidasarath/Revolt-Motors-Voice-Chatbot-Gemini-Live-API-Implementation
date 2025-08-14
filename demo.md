# 🎬 Demo Guide - Revolt Motors Voice Chatbot

## 🚀 Quick Demo Setup

### 1. Get Your Gemini API Key
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy the key to your clipboard

### 2. Configure Environment
```bash
# Copy the example file
cp env.example .env

# Edit .env and paste your API key
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start the Server
```bash
npm start
```

### 4. Open in Browser
Navigate to: `http://localhost:3000`

## 🎯 Demo Scenarios

### Scenario 1: Basic Voice Interaction
1. **Select Language**: Choose "English" from dropdown
2. **Start Recording**: Click the microphone button
3. **Ask Question**: "What electric vehicles does Revolt Motors offer?"
4. **Stop Recording**: Click the microphone button again
5. **Listen**: AI responds with voice and text

### Scenario 2: Interruption Handling
1. **Start AI Response**: Ask a question and let AI start speaking
2. **Interrupt**: Click microphone while AI is talking
3. **New Question**: Ask "What about battery range?"
4. **Verify**: AI stops previous response and answers new question

### Scenario 3: Multilingual Support
1. **Change Language**: Select "Hindi" from dropdown
2. **Ask in Hindi**: "Revolt Motors ke electric vehicles ke baare mein bataiye"
3. **Response**: AI responds in Hindi

### Scenario 4: Domain Restriction
1. **Ask Non-Revolt Question**: "What's the weather like today?"
2. **Expected Response**: AI should redirect to Revolt Motors topics
3. **Ask Valid Question**: "Tell me about Revolt RV400"

## 🧪 Testing Checklist

### ✅ Core Functionality
- [ ] Microphone permission granted
- [ ] Recording starts/stops correctly
- [ ] WebSocket connection established
- [ ] Audio sent to backend successfully
- [ ] AI response received and displayed
- [ ] Text-to-speech works correctly

### ✅ Interruption Handling
- [ ] AI stops speaking when interrupted
- [ ] New audio input processed immediately
- [ ] No audio overlap or conflicts

### ✅ Multilingual Support
- [ ] Language selection changes UI
- [ ] AI responds in selected language
- [ ] Speech synthesis uses correct language

### ✅ Domain Restriction
- [ ] AI only answers Revolt Motors questions
- [ ] Off-topic questions are redirected appropriately
- [ ] Responses are relevant and accurate

### ✅ Performance
- [ ] Response latency ≤ 2 seconds
- [ ] Audio quality is clear
- [ ] UI is responsive and smooth

## 🐛 Common Demo Issues & Solutions

### Issue: "Microphone Permission Denied"
**Solution**: 
- Check browser permissions
- Refresh page and try again
- Ensure microphone is not used by other applications

### Issue: "WebSocket Connection Failed"
**Solution**:
- Verify server is running on port 3000
- Check browser console for connection errors
- Ensure no firewall blocking localhost

### Issue: "Gemini API Error"
**Solution**:
- Verify API key is correct in .env file
- Check API key has sufficient quota
- Ensure API key has audio model access

### Issue: "Audio Not Playing"
**Solution**:
- Check system audio settings
- Verify browser supports Web Audio API
- Try refreshing the page

## 🎥 Demo Script for Video Recording

### Introduction (30 seconds)
"Welcome to the Revolt Motors Voice Chatbot demo. This application showcases real-time voice interaction with an AI assistant that specializes in Revolt Motors products and services."

### Feature 1: Basic Voice Interaction (1 minute)
"Let me demonstrate the basic voice interaction. I'll select English as the language and ask about Revolt Motors electric vehicles. [Demonstrate recording and response]"

### Feature 2: Interruption Handling (1 minute)
"Now let me show you the interruption feature. I'll ask a question and then interrupt the AI while it's speaking to ask a new question. [Demonstrate interruption]"

### Feature 3: Multilingual Support (1 minute)
"Let me switch to Hindi and ask the same question. Notice how the AI responds in the selected language. [Demonstrate language change and Hindi interaction]"

### Feature 4: Domain Restriction (30 seconds)
"Finally, let me ask an off-topic question to show how the AI stays focused on Revolt Motors topics. [Demonstrate domain restriction]"

### Conclusion (30 seconds)
"This concludes our demo. The Revolt Motors Voice Chatbot provides a seamless, multilingual voice experience with intelligent interruption handling and domain-specific responses."

## 📊 Performance Metrics to Highlight

- **Response Time**: 1-2 seconds after stopping speech
- **Language Support**: 10+ Indian languages
- **Interruption Latency**: <100ms
- **Audio Quality**: 16kHz, mono, noise-cancelled
- **Browser Support**: Chrome, Firefox, Safari, Edge

## 🔍 Debug Information

### Console Logs
Open browser console to see:
- WebSocket connection status
- Audio recording events
- API response details
- Error messages

### Server Logs
Check terminal for:
- WebSocket connections
- API calls to Gemini
- Error handling
- Performance metrics

---

**Happy Demo-ing! 🎉**
