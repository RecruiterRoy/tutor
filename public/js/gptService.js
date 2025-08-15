// gptservice.js
// Robust GPT Service for dashboard -> enhanced chat API

class GPTService {
    constructor(baseUrl = '/api/enhanced-chat') {
        this.currentGrade = null;
        this.currentSubject = null;
        this.currentTeacher = null;
        this.chatHistory = [];
        this.baseUrl = baseUrl;

        // Event hooks
        this.onMessageSent = () => {};
        this.onMessageReceived = () => {};
        this.onError = () => {};
    }

    setContext(grade, subject) {
        this.currentGrade = grade;
        this.currentSubject = subject;
        console.log(`📚 GPT Service Context Updated: Grade=${grade}, Subject=${subject}`);
    }

    setTeacher(teacherName) {
        this.currentTeacher = teacherName;
        console.log(`👩‍🏫 GPT Service Teacher Updated: ${teacherName}`);
        this.chatHistory = []; // reset context when teacher changes
    }

    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = String(str);
        return temp.innerHTML;
    }

    async sendMessage(userMessage, userProfile = null, retries = 2) {
        try {
            // Validate input
            if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
                throw new Error('Invalid or empty message');
            }

            const trimmedMessage = userMessage.trim();
            
            // Analyze conversation relevance BEFORE adding to history
            let contextualHistory = [];
            let analysisResult = null;
            
            if (window.dynamicContextManager && this.chatHistory.length > 0) {
                console.log('🧠 Analyzing conversation relevance...');
                analysisResult = await window.dynamicContextManager.analyzeConversationRelevance(
                    trimmedMessage, 
                    this.chatHistory
                );
                
                // Get contextual history based on analysis
                contextualHistory = window.dynamicContextManager.getContextualHistory(this.chatHistory);
                
                console.log(`📊 Relevance Analysis: ${analysisResult.isRelevant ? 'RELEVANT' : 'NOT RELEVANT'} (confidence: ${analysisResult.confidence})`);
                console.log(`📚 Using ${contextualHistory.length} messages for context`);
            } else {
                // Fallback to original behavior
                contextualHistory = this.chatHistory.slice(-5);
                console.log('📚 Using fallback: last 5 messages for context');
            }

            // Now add current message to history
            this.chatHistory.push({ role: 'user', content: trimmedMessage });
            this.onMessageSent(trimmedMessage);

            // Determine avatar / teacher
            const currentAvatar = userProfile?.ai_avatar || window.userData?.ai_avatar || window.selectedAvatar || 'roy-sir';
            const teacherName = this.getTeacherNameFromAvatar(currentAvatar);
            
            console.log('🔧 GPTService Avatar Debug:');
            console.log('  - userProfile?.ai_avatar:', userProfile?.ai_avatar);
            console.log('  - window.userData?.ai_avatar:', window.userData?.ai_avatar);
            console.log('  - window.selectedAvatar:', window.selectedAvatar);
            console.log('  - Final currentAvatar:', currentAvatar);
            console.log('  - Teacher Name:', teacherName);

            const requestBody = {
                message: trimmedMessage,
                grade: this.currentGrade || '6',
                subject: this.currentSubject || 'General',
                teacher: teacherName,
                avatar: currentAvatar,
                chatHistory: contextualHistory,
                contextAnalysis: analysisResult, // Include analysis result for backend awareness
                userProfile: userProfile || {
                    full_name: 'Student',
                    class: this.currentGrade || '6',
                    board: 'CBSE'
                }
            };

            console.log('📤 Sending request:', requestBody);

            // Timeout controller
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', errorText);
                throw new Error(`HTTP ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📥 API Response:', data);

            if (!data.success) throw new Error(data.error || 'API processing failed');

            if (data.usage) {
                console.log('📊 Token Usage:', {
                    input_tokens: data.usage.input_tokens,
                    output_tokens: data.usage.output_tokens,
                    estimated_cost: (data.usage.input_tokens * 0.000003) + (data.usage.output_tokens * 0.000015)
                });
            }

            const safeResponse = this.sanitizeHTML(data.response);
            this.chatHistory.push({ role: 'assistant', content: safeResponse });
            this.onMessageReceived(safeResponse);

            return safeResponse;

        } catch (error) {
            console.error('💥 GPT Service Error:', error);
            this.onError(error);

            if (retries > 0) {
                console.warn(`Retrying... (${retries} retries left)`);
                return this.sendMessage(userMessage, userProfile, retries - 1);
            }

            return `⚠️ I'm having trouble connecting right now. ${error.message || 'Please try again later.'}`;
        }
    }

    async searchOnlineResources(userMessage) {
        const subject = this.detectSubject(userMessage);
        const gradeLevel = this.getGradeLevel();
        const resourceUrl = this.educationalResources?.[subject]?.[gradeLevel] || this.getGeneralResource(subject);

        return `I've consulted educational resources for ${this.currentGrade} ${subject}.
Here’s what I found:

1. Key Concept: [Brief explanation based on grade level]
2. Example: [Grade-appropriate example]
3. Practice: Try this - [Simple exercise]

For more details, visit: ${resourceUrl}

Would you like me to explain any specific part in more detail?`;
    }

    detectSubject(message) {
        if (/math|algebra|geometry|calculus/i.test(message)) return 'Math';
        if (/science|physics|chemistry|biology/i.test(message)) return 'Science';
        if (/english|grammar|writing|literature/i.test(message)) return 'English';
        return this.currentSubject || 'General';
    }

    getGradeLevel() {
        if (!this.currentGrade) return 'General';
        const gradeNum = parseInt(this.currentGrade.replace(/\D/g, ''), 10);
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

    getTeacherNameFromAvatar(avatarId) {
        switch (avatarId) {
            case 'miss-sapna':
                return 'Miss Sapna';
            case 'roy-sir':
                return 'Roy Sir';
            default:
                return 'Roy Sir';
        }
    }
}

// Initialize service globally
window.gptService = new GPTService();
console.log('✅ GPT Service initialized with enhanced stability & security');
