/**
 * Dynamic Context Manager
 * Manages intelligent chat history context based on conversation relevance
 */
class DynamicContextManager {
    constructor() {
        this.baseHistorySize = 5; // Starting with 5 messages
        this.currentHistorySize = 5;
        this.maxHistorySize = 20; // Maximum messages to send
        this.continuationCount = 0; // Track consecutive "yes" responses
        this.discontinuationCount = 0; // Track consecutive "no" responses
        this.resetThreshold = 2; // Reset after 2 "no" responses
        this.conversationContext = {
            isRelevant: null,
            lastAnalysis: null,
            topicContinuity: true
        };
        
        console.log('🧠 Dynamic Context Manager initialized');
    }

    /**
     * Analyze if current message is relevant to conversation history
     * @param {string} currentMessage - The current user message
     * @param {Array} chatHistory - Full chat history array
     * @returns {Object} Analysis result with relevance and suggested context size
     */
    async analyzeConversationRelevance(currentMessage, chatHistory) {
        if (!currentMessage || !chatHistory || chatHistory.length === 0) {
            return {
                isRelevant: false,
                confidence: 0,
                suggestedContextSize: this.baseHistorySize,
                reasoning: 'No previous conversation to analyze'
            };
        }

        try {
            // Get recent context for analysis
            const recentHistory = this.getRecentHistory(chatHistory);
            
            // Perform relevance analysis
            const analysisResult = await this.performRelevanceAnalysis(currentMessage, recentHistory);
            
            // Update continuation tracking
            this.updateContinuationTracking(analysisResult.isRelevant);
            
            // Calculate new context size
            const newContextSize = this.calculateNewContextSize(analysisResult.isRelevant);
            
            const result = {
                ...analysisResult,
                suggestedContextSize: newContextSize,
                continuationCount: this.continuationCount,
                discontinuationCount: this.discontinuationCount,
                currentHistorySize: this.currentHistorySize
            };

            console.log('🔍 Conversation relevance analysis:', result);
            return result;

        } catch (error) {
            console.error('❌ Error analyzing conversation relevance:', error);
            return {
                isRelevant: false,
                confidence: 0,
                suggestedContextSize: this.baseHistorySize,
                reasoning: 'Analysis failed, using base context size',
                error: error.message
            };
        }
    }

    /**
     * Perform AI-powered relevance analysis
     */
    async performRelevanceAnalysis(currentMessage, recentHistory) {
        // Prepare analysis prompt
        const analysisPrompt = this.createAnalysisPrompt(currentMessage, recentHistory);
        
        try {
            // Call AI for relevance analysis
            const response = await fetch('/api/analyze-context-relevance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentMessage: currentMessage,
                    recentHistory: recentHistory,
                    analysisPrompt: analysisPrompt
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            return {
                isRelevant: data.isRelevant,
                confidence: data.confidence,
                reasoning: data.reasoning,
                topicContinuity: data.topicContinuity,
                conceptConnection: data.conceptConnection
            };

        } catch (error) {
            console.warn('⚠️ AI analysis failed, using fallback analysis:', error);
            return this.fallbackRelevanceAnalysis(currentMessage, recentHistory);
        }
    }

    /**
     * Create analysis prompt for AI
     */
    createAnalysisPrompt(currentMessage, recentHistory) {
        const historyText = recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        
        return `You are analyzing conversation relevance. Determine if the current message continues the previous conversation topic.

PREVIOUS CONVERSATION:
${historyText}

CURRENT MESSAGE:
user: ${currentMessage}

ANALYSIS CRITERIA:
1. Topic Continuity: Does the current message relate to the same subject/topic as recent messages?
2. Concept Connection: Does it build on, clarify, or extend concepts from previous discussion?
3. Learning Progression: Is it a natural next step in the learning sequence?
4. Clarification Request: Is the student asking for more explanation on a previous topic?

Respond with a JSON object:
{
    "isRelevant": true/false,
    "confidence": 0.0-1.0,
    "reasoning": "Brief explanation of why relevant or not",
    "topicContinuity": true/false,
    "conceptConnection": true/false
}

Examples:
- "Can you explain that again?" → RELEVANT (clarification request)
- "What about the next chapter?" → RELEVANT (progression)
- "Tell me about photosynthesis" after discussing math → NOT RELEVANT (topic change)
- "What is 2+2?" after complex algebra → POTENTIALLY RELEVANT (same subject, different complexity)`;
    }

    /**
     * Fallback analysis when AI is unavailable
     */
    fallbackRelevanceAnalysis(currentMessage, recentHistory) {
        const currentLower = currentMessage.toLowerCase();
        
        // Check for explicit continuation indicators
        const continuationKeywords = [
            'explain', 'clarify', 'more about', 'what about', 'how about',
            'can you', 'tell me more', 'elaborate', 'example', 'why',
            'because', 'so', 'then', 'next', 'also', 'additionally'
        ];

        // Check for topic change indicators
        const topicChangeKeywords = [
            'new topic', 'different subject', 'change to', 'now let\'s',
            'moving on', 'something else', 'another question'
        ];

        // Get recent topics/subjects mentioned
        const recentContent = recentHistory
            .map(msg => msg.content.toLowerCase())
            .join(' ');

        let relevanceScore = 0;
        
        // Check for continuation keywords
        if (continuationKeywords.some(keyword => currentLower.includes(keyword))) {
            relevanceScore += 0.3;
        }

        // Check for topic change keywords
        if (topicChangeKeywords.some(keyword => currentLower.includes(keyword))) {
            relevanceScore -= 0.5;
        }

        // Check for common words/concepts
        const currentWords = currentLower.split(' ').filter(word => word.length > 3);
        const recentWords = recentContent.split(' ').filter(word => word.length > 3);
        
        const commonWords = currentWords.filter(word => recentWords.includes(word));
        const commonWordsRatio = commonWords.length / Math.max(currentWords.length, 1);
        
        relevanceScore += commonWordsRatio * 0.4;

        // Check for question words that might indicate continuation
        if (/^(what|how|why|when|where|can|could|would|should)/.test(currentLower)) {
            relevanceScore += 0.2;
        }

        const isRelevant = relevanceScore > 0.3;
        
        return {
            isRelevant: isRelevant,
            confidence: Math.min(relevanceScore, 1.0),
            reasoning: `Fallback analysis: ${isRelevant ? 'Detected continuation patterns' : 'Detected topic change or no clear continuation'}`,
            topicContinuity: isRelevant,
            conceptConnection: commonWordsRatio > 0.2
        };
    }

    /**
     * Update continuation tracking based on relevance
     */
    updateContinuationTracking(isRelevant) {
        if (isRelevant) {
            this.continuationCount++;
            this.discontinuationCount = 0; // Reset discontinuation count
        } else {
            this.discontinuationCount++;
            this.continuationCount = 0; // Reset continuation count
        }

        console.log(`📊 Tracking: ${this.continuationCount} continuations, ${this.discontinuationCount} discontinuations`);
    }

    /**
     * Calculate new context size based on relevance and tracking
     */
    calculateNewContextSize(isRelevant) {
        if (isRelevant) {
            // Increase context size (5+1, 5+2, etc.)
            this.currentHistorySize = Math.min(
                this.baseHistorySize + this.continuationCount,
                this.maxHistorySize
            );
        } else {
            // Check if we should reset
            if (this.discontinuationCount >= this.resetThreshold) {
                console.log('🔄 Resetting context size to base after 2 discontinuations');
                this.currentHistorySize = this.baseHistorySize;
                this.continuationCount = 0;
                this.discontinuationCount = 0;
            }
            // If only 1 discontinuation, keep current size for now
        }

        return this.currentHistorySize;
    }

    /**
     * Get appropriate history based on current context size
     */
    getContextualHistory(fullHistory) {
        if (!fullHistory || fullHistory.length === 0) {
            return [];
        }

        // Get the last N messages based on current context size
        const startIndex = Math.max(0, fullHistory.length - this.currentHistorySize);
        const contextHistory = fullHistory.slice(startIndex);

        console.log(`📚 Using ${contextHistory.length} messages for context (size: ${this.currentHistorySize})`);
        return contextHistory;
    }

    /**
     * Get recent history for analysis (limited to prevent overwhelming the analysis)
     */
    getRecentHistory(fullHistory) {
        const analysisWindowSize = 8; // Use last 8 messages for analysis
        const startIndex = Math.max(0, fullHistory.length - analysisWindowSize);
        return fullHistory.slice(startIndex);
    }

    /**
     * Reset context manager to initial state
     */
    reset() {
        this.currentHistorySize = this.baseHistorySize;
        this.continuationCount = 0;
        this.discontinuationCount = 0;
        this.conversationContext = {
            isRelevant: null,
            lastAnalysis: null,
            topicContinuity: true
        };
        console.log('🔄 Dynamic Context Manager reset to initial state');
    }

    /**
     * Get current state for debugging
     */
    getState() {
        return {
            baseHistorySize: this.baseHistorySize,
            currentHistorySize: this.currentHistorySize,
            maxHistorySize: this.maxHistorySize,
            continuationCount: this.continuationCount,
            discontinuationCount: this.discontinuationCount,
            resetThreshold: this.resetThreshold,
            conversationContext: this.conversationContext
        };
    }
}

// Export for global use
window.DynamicContextManager = DynamicContextManager;
window.dynamicContextManager = new DynamicContextManager();

console.log('✅ Dynamic Context Manager loaded and ready');
