class GPTService {
    constructor() {
        this.currentGrade = null;
        this.currentSubject = null;
        this.chatHistory = [];
        this.baseUrl = '/api/chat'; // Ensure this matches your endpoint
    }
    
    async sendMessage(userMessage) {
        try {
            this.chatHistory.push({ role: 'user', content: userMessage });
            
            const requestBody = {
                messages: this.chatHistory,
                grade: this.currentGrade || 'Class 2', // Default value
                subject: this.currentSubject || 'General', // Default value
                response_format: 'markdown',
                language: document.getElementById('preferredLanguage').value || 'en'
            };

            console.log('Sending request:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.response) {
                throw new Error('Invalid response format from API');
            }
            
            this.chatHistory.push({ role: 'assistant', content: data.response });
            return data.response;
        } catch (error) {
            console.error('API Error:', error);
            return `I'm having trouble connecting right now. ${error.message}`;
        }
    }

    async searchOnlineResources(userMessage) {
        const subject = this.detectSubject(userMessage);
        const gradeLevel = this.getGradeLevel();
        const resourceUrl = this.educationalResources[subject]?.[gradeLevel] || this.getGeneralResource(subject);
        return `I've consulted educational resources for ${this.currentGrade} ${subject}. ` +
               `Here's what I found:\n\n` +
               `1. Key Concept: [Brief explanation based on grade level]\n` +
               `2. Example: [Grade-appropriate example]\n` +
               `3. Practice: Try this - [Simple exercise]\n\n` +
               `For more details, visit: ${resourceUrl}\n\n` +
               `Would you like me to explain any specific part in more detail?`;
    }

    detectSubject(message) {
        if (/math|algebra|geometry|calculus/i.test(message)) return 'Math';
        if (/science|physics|chemistry|biology/i.test(message)) return 'Science';
        if (/english|grammar|writing|literature/i.test(message)) return 'English';
        return this.currentSubject || 'General';
    }

    getGradeLevel() {
        if (!this.currentGrade) return 'General';
        const gradeNum = parseInt(this.currentGrade.replace(/\D/g, ''));
        if (gradeNum <= 5) return 'Class 1-5';
        if (gradeNum <= 8) return 'Class 6-8';
        return 'Class 9-10';
    }

    getGeneralResource(subject) {
        return {
            'Math': 'https://www.khanacademy.org/math',
            'Science': 'https://www.ck12.org/student/',
            'English': 'https://learnenglish.britishcouncil.org/',
            'General': 'https://www.education.com/resources/'
        }[subject];
    }
}

// Initialize service
const gptService = new GPTService();
window.gptService = gptService;

// Export utility functions
export const updateContext = () => {
    const grade = document.getElementById('grade-select').value;
    const subject = document.getElementById('subject-select').value;
    gptService.setContext(grade, subject);
};

export const handleChat = async () => {
    const messageInput = document.getElementById('message-input');
    const userMessage = messageInput.value;
    if (!userMessage.trim()) return;
    addMessage('user', userMessage);
    messageInput.value = '';
    const response = await gptService.sendMessage(userMessage);
    addMessage('ai', response);
};

// Initialize event listeners
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const sendButton = document.getElementById('send-button');
        const messageInput = document.getElementById('message-input');

        if (sendButton) {
            sendButton.addEventListener('click', handleChat);
        }

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleChat();
            });
        }
    });
} 