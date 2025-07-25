class GPTService {
    constructor() {
        this.currentGrade = null;
        this.currentSubject = null;
        this.currentTeacher = null;
        this.chatHistory = [];
        // Dynamic API URL based on current domain
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            this.baseUrl = 'http://localhost:3000/api/chat';
        } else if (hostname === 'tution.app') {
            this.baseUrl = 'https://tution.app/api/chat';
        } else if (hostname === 'tutor-omega-seven.vercel.app') {
            this.baseUrl = 'https://tutor-omega-seven.vercel.app/api/chat';
        } else {
            this.baseUrl = `${window.location.origin}/api/chat`;
        }
    }
    
    setContext(grade, subject) {
        this.currentGrade = grade;
        this.currentSubject = subject;
        console.log(`GPT Service Context Updated: Grade=${grade}, Subject=${subject}`);
    }
    
    setTeacher(teacherName) {
        this.currentTeacher = teacherName;
        console.log(`GPT Service Teacher Updated: ${teacherName}`);
        // Clear chat history when switching teachers for fresh context
        this.chatHistory = [];
    }
    
    async sendMessage(userMessage, userProfile = null) {
        try {
            this.chatHistory.push({ role: 'user', content: userMessage });
            
            // Format request for the simple chat API
            const requestBody = {
                messages: this.chatHistory, // Send full chat history
                grade: this.currentGrade || '6',
                subject: this.currentSubject || 'General',
                language: this.currentTeacher === 'Ms. Sapana' ? 'hi' : 'en',
                user_profile: userProfile // Send user profile to API
            };

            console.log('Sending request to chat API:', JSON.stringify(requestBody, null, 2));

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
            
            // Log usage for cost monitoring
            if (data.usage) {
                console.log('Claude Usage:', {
                    input_tokens: data.usage.input_tokens,
                    output_tokens: data.usage.output_tokens,
                    estimated_cost: (data.usage.input_tokens * 0.000003) + (data.usage.output_tokens * 0.000015)
                });
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

console.log('✅ GPT Service initialized successfully'); 
