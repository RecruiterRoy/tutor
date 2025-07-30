// AI Health Check Service
// This file checks if the AI services are properly connected

class AIHealthCheck {
    constructor() {
        // Use relative URL to avoid CORS issues
        this.apiBaseUrl = '/api';
        this.healthStatus = {
            anthropic: false,
            chat: false,
            enhanced: false
        };
    }

    async checkAllServices() {
        console.log('🔍 Checking AI service health...');
        
        try {
            // Check basic health endpoint
            const healthResponse = await fetch(`${window.TUTOR_CONFIG?.apiBaseUrl || ''}/api/health`);
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log('✅ Health check response:', healthData);
                
                this.healthStatus.anthropic = healthData.anthropic || false;
                this.healthStatus.chat = healthData.chat || false;
                this.healthStatus.enhanced = healthData.enhanced || false;
                
                if (this.healthStatus.anthropic) {
                    console.log('✅ Anthropic API is connected');
                } else {
                    console.warn('⚠️ Anthropic API is not connected');
                }
                
                if (this.healthStatus.chat) {
                    console.log('✅ Chat API is working');
                } else {
                    console.warn('⚠️ Chat API is not working');
                }
                
                if (this.healthStatus.enhanced) {
                    console.log('✅ Enhanced AI is working');
                } else {
                    console.warn('⚠️ Enhanced AI is not working');
                }
                
                return this.healthStatus;
            } else {
                console.error('❌ Health check failed:', healthResponse.status);
                return this.healthStatus;
            }
        } catch (error) {
            console.error('❌ Health check error:', error);
            return this.healthStatus;
        }
    }

    async testChatConnection() {
        try {
            console.log('🧪 Testing chat connection...');
            
            const response = await fetch(`${window.TUTOR_CONFIG?.apiBaseUrl || ''}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Hello, this is a test message.',
                    userId: 'test-user',
                    context: 'health-check'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Chat test successful:', data);
                return true;
            } else {
                const errorData = await response.json();
                console.error('❌ Chat test failed:', errorData);
                return false;
            }
        } catch (error) {
            console.error('❌ Chat test error:', error);
            return false;
        }
    }

    getStatus() {
        return this.healthStatus;
    }

    isHealthy() {
        return this.healthStatus.anthropic && this.healthStatus.chat;
    }

    showStatusNotification() {
        const status = this.getStatus();
        const isHealthy = this.isHealthy();
        
        if (isHealthy) {
            showSuccess('AI services are connected and ready!');
        } else {
            let message = 'Some AI services are not available: ';
            if (!status.anthropic) message += 'Anthropic API, ';
            if (!status.chat) message += 'Chat API, ';
            if (!status.enhanced) message += 'Enhanced AI, ';
            message = message.slice(0, -2); // Remove last comma and space
            
            showWarning(message);
        }
    }
}

// Initialize global AI health check
window.aiHealthCheck = new AIHealthCheck();

// Auto-check on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (window.aiHealthCheck) {
        await window.aiHealthCheck.checkAllServices();
        window.aiHealthCheck.showStatusNotification();
    }
}); 