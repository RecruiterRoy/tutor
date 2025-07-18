// api-claude.js - Simple Claude API proxy for TUTOR.AI
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Claude API proxy endpoint
app.post('/api/claude', async (req, res) => {
    try {
        const { messages, system, model = 'claude-3-sonnet-20240229' } = req.body;
        
        // You'll need to set your Claude API key as environment variable
        const apiKey = process.env.CLAUDE_API_KEY || 'YOUR_CLAUDE_API_KEY_HERE';
        
        if (!apiKey || apiKey === 'YOUR_CLAUDE_API_KEY_HERE') {
            return res.status(400).json({ 
                error: 'Claude API key not configured. Please set CLAUDE_API_KEY environment variable.' 
            });
        }
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model,
                max_tokens: 1000,
                system,
                messages
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('Claude API error:', response.status, errorData);
            return res.status(response.status).json({ 
                error: `Claude API error: ${response.status}` 
            });
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'TUTOR.AI Claude Proxy' });
});

app.listen(PORT, () => {
    console.log(`🤖 TUTOR.AI Claude API Proxy running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 