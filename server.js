import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public', {
  maxAge: '1h',
  etag: true,
  lastModified: true
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME || 'gemini-2.0-flash';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in environment variables');
  console.error('Please create a .env file with your Gemini API key');
  process.exit(1);
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection established');
  
  let isProcessing = false;
  let currentAudioStream = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'audio') {
        // Stop any current AI response
        if (isProcessing) {
          ws.send(JSON.stringify({ type: 'interrupt' }));
          isProcessing = false;
        }
        
        // Set processing flag and process new audio input
        isProcessing = true;
        await processAudioInput(ws, data.audio, data.language, () => { isProcessing = false; });
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process audio input' 
      }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    isProcessing = false;
  });
});

async function processAudioInput(ws, audioData, language, setProcessingCallback) {
  try {
    // Send processing status
    ws.send(JSON.stringify({ type: 'processing' }));
    
    // Call Gemini API
    const response = await callGeminiAPI(audioData, language);
    
    if (response.success) {
      // Send AI response
      ws.send(JSON.stringify({
        type: 'ai_response',
        text: response.text,
        audio: response.audio,
        language: response.language
      }));
    } else {
      ws.send(JSON.stringify({
        type: 'error',
        message: response.error
      }));
    }
    
  } catch (error) {
    console.error('Error processing audio:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process audio with Gemini API'
    }));
  } finally {
    if (setProcessingCallback) {
      setProcessingCallback();
    }
  }
}

async function callGeminiAPI(audioData, language) {
  try {
    const systemPrompt = `You are Rev, an AI assistant for Revolt Motors. 
    Answer only questions about Revolt Motors products, services, policies, and company details. 
    Keep responses concise and helpful. 
    Respond in the same language as the user's question (${language || 'English'}).`;
    
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{
          text: systemPrompt
        }, {
          inline_data: {
            mime_type: "audio/webm",
            data: audioData
          }
        }]
      }],
      generation_config: {
        temperature: 0.7,
        top_p: 0.8,
        top_k: 40
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return {
        success: false,
        error: `Gemini API error: ${response.status}`
      };
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      
      // For now, we'll return text only
      // In a full implementation, you'd also get audio back from Gemini
      return {
        success: true,
        text: text,
        audio: null, // Placeholder for audio response
        language: language || 'English'
      };
    } else {
      return {
        success: false,
        error: 'No response from Gemini API'
      };
    }
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    gemini_api_key: GEMINI_API_KEY ? 'Configured' : 'Missing',
    model: MODEL_NAME
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🔑 Gemini API Key: ${GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🤖 Model: ${MODEL_NAME}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});
