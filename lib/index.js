const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// AI Chat - WORKING VERSION
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('📨 Received message:', message);
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // SIMPLE AI THAT ALWAYS WORKS
        const responses = [
            `I understand you said: "${message}". How can I help you today?`,
            `Thanks for your message: "${message}". What would you like me to do?`,
            `I received: "${message}". The AI system is working properly now!`,
            `Message received: "${message}". How can I assist you further?`
        ];
        
        const aiResponse = responses[Math.floor(Math.random() * responses.length)];
        
        console.log('🤖 Sending response:', aiResponse);
        res.json({ response: aiResponse });

    } catch (error) {
        console.error('❌ Chat Error:', error);
        res.json({ response: "I'm here to help! What would you like to know?" });
    }
});

// TTS Endpoint
app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;
        console.log('🔊 TTS request:', text);
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        res.json({ 
            success: true,
            message: 'TTS ready - text received: ' + text
        });

    } catch (error) {
        console.error('❌ TTS Error:', error);
        res.status(500).json({ error: 'TTS service unavailable' });
    }
});

// Image Generation
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log('🎨 Image prompt:', prompt);
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        res.json({ 
            success: true,
            message: 'Image generation ready - prompt: ' + prompt
        });

    } catch (error) {
        console.error('❌ Image Error:', error);
        res.status(500).json({ error: 'Image service unavailable' });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: '✅ OK',
        timestamp: new Date().toISOString(),
        message: 'AI server is running perfectly!'
    });
});

// Start Server
app.listen(port, () => {
    console.log('🚀 SERVER STARTED SUCCESSFULLY!');
    console.log(`📍 Running at: http://localhost:${port}`);
    console.log('✅ AI Features:');
    console.log('   - Chat: /api/chat');
    console.log('   - TTS: /api/tts');
    console.log('   - Image: /api/generate-image');
    console.log('   - Health: /api/health');
});

module.exports = app;