// claudeChat.js - Claude API integration for Tutor.AI

// Simple Claude Chat implementation for vanilla JavaScript
if (typeof window.ClaudeChat === 'undefined') {
    window.ClaudeChat = class ClaudeChat {
        constructor() {
            this.baseUrl = window.TUTOR_CONFIG ? window.TUTOR_CONFIG.apiBaseUrl + '/api/chat' : '/api/chat';
        }

        async sendMessage(message, context = {}) {
            try {
                const response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message,
                        ...context
                    }),
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to get response');
                }

                return {
                    response: data.response,
                    usage: data.usage
                };

            } catch (err) {
                console.error('Claude Chat Error:', err);
                throw err;
            }
        }
    }
}

// Initialize Claude Chat
window.claudeChat = new ClaudeChat();

// Usage tracking for cost monitoring
const logUsage = (usage) => {
  console.log('Claude Usage:', {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    estimated_cost: (usage.input_tokens * 0.000003) + (usage.output_tokens * 0.000015)
  });
}; 
