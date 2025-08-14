# 🚗 Revolt Motors Voice Chatbot

A real-time voice chatbot web application that mimics the Revolt Motors chatbot experience, powered by Google's Gemini Live API. Built with Node.js, Express, WebSockets, and vanilla JavaScript.

## ✨ Features

- **🎤 Real-time Voice Interaction**: Speak to AI and get voice responses
- **🌍 Multilingual Support**: Supports 10+ Indian languages including English, Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu, Kannada, Malayalam, and Punjabi
- **⏹️ Interruption Handling**: Interrupt AI mid-speech for immediate response
- **⚡ Low Latency**: Response time of 1-2 seconds
- **🎯 Domain Restricted**: AI only responds to Revolt Motors related queries
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🔌 WebSocket Streaming**: Real-time communication for seamless experience

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) ←→ WebSocket ←→ Backend (Node.js/Express) ←→ Gemini API
```

- **Frontend**: Vanilla JavaScript with Web Audio API for voice capture
- **Backend**: Node.js + Express server with WebSocket support
- **AI**: Google Gemini 2.5 Flash Preview Native Audio Dialog
- **Communication**: WebSocket for real-time bidirectional communication

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Modern web browser with microphone access

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd voicechatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env and add your Gemini API key
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key (required) | - |
| `MODEL_NAME` | Gemini model to use | `gemini-2.5-flash-preview-native-audio-dialog` |
| `PORT` | Server port | `3000` |

### Language Support

The chatbot supports the following languages:

| Code | Language | Speech Recognition | Text-to-Speech |
|------|----------|-------------------|----------------|
| `en` | English | ✅ | ✅ |
| `hi` | Hindi | ✅ | ✅ |
| `mr` | Marathi | ✅ | ✅ |
| `gu` | Gujarati | ✅ | ✅ |
| `bn` | Bengali | ✅ | ✅ |
| `ta` | Tamil | ✅ | ✅ |
| `te` | Telugu | ✅ | ✅ |
| `kn` | Kannada | ✅ | ✅ |
| `ml` | Malayalam | ✅ | ✅ |
| `pa` | Punjabi | ✅ | ✅ |

## 🎯 Usage

### Basic Voice Interaction

1. **Select your preferred language** from the dropdown
2. **Click the microphone button** to start recording
3. **Speak your question** about Revolt Motors
4. **Click again to stop** recording and send
5. **Listen to AI response** in the same language

### Interruption Handling

- **While AI is speaking**: Click the microphone button to interrupt
- **AI stops immediately** and listens to your new input
- **Seamless conversation flow** without waiting

### Supported Query Types

The AI is restricted to Revolt Motors domain and can answer questions about:

- 🚗 Electric vehicle models and specifications
- 🔋 Battery technology and range
- 💰 Pricing and financing options
- 🛠️ Service and maintenance
- 📍 Dealership locations
- 🏢 Company information and policies
- 🌱 Environmental benefits
- 📱 Mobile app features

## 🧪 Testing Checklist

- [ ] **Multilingual Support**: Test in English and Hindi
- [ ] **Interruption Handling**: Speak while AI is responding
- [ ] **Response Latency**: Verify ≤2 seconds after stopping speech
- [ ] **Domain Restriction**: AI only answers Revolt-related queries
- [ ] **Voice Quality**: Clear audio input and output
- [ ] **Responsive Design**: Works on mobile and desktop

## 🏃‍♂️ Development

### Project Structure

```
voicechatbot/
├── server.js              # Backend server with WebSocket support
├── public/
│   ├── index.html         # Main HTML interface
│   ├── styles.css         # Modern CSS styling
│   └── script.js          # Frontend JavaScript logic
├── package.json           # Dependencies and scripts
├── env.example            # Environment variables template
└── README.md              # This file
```

### Available Scripts

```bash
npm start          # Start the production server
npm run dev        # Start the development server
```

### API Endpoints

- `GET /` - Main application interface
- `GET /health` - Server health check
- `WS /` - WebSocket connection for real-time communication

## 🔒 Security Considerations

- **API Key Protection**: Never commit your `.env` file to version control
- **HTTPS in Production**: Use HTTPS for production deployments
- **Input Validation**: All audio input is validated before processing
- **Rate Limiting**: Consider implementing rate limiting for production use

## 🐛 Troubleshooting

### Common Issues

1. **Microphone Permission Denied**
   - Check browser microphone permissions
   - Refresh the page and try again

2. **WebSocket Connection Failed**
   - Verify server is running on correct port
   - Check firewall settings

3. **Gemini API Errors**
   - Verify API key is correct and has sufficient quota
   - Check API key permissions for audio models

4. **Audio Not Playing**
   - Ensure browser supports Web Audio API
   - Check system audio settings

### Debug Mode

Open browser console to see detailed logs:
```javascript
// Access chatbot instance for debugging
console.log(window.voiceChatbot);
```

## 📱 Browser Compatibility

- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 14+
- ✅ Edge 79+

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure reverse proxy (nginx/Apache)
3. Use PM2 or similar process manager
4. Enable HTTPS with valid SSL certificate

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review browser console for errors
- Verify API key configuration
- Test with different browsers

---

**Built with ❤️ for Revolt Motors Voice Assistant Experience**
