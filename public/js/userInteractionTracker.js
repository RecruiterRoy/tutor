// User Interaction Tracking and Feedback Optimization System
// Tracks all user interactions and continuously improves AI responses based on feedback

class UserInteractionTracker {
    constructor() {
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: new Date(),
            interactions: [],
            userProfile: null,
            currentContext: {}
        };
        
        this.feedbackCollection = new Map();
        this.optimizationRules = this.initializeOptimizationRules();
        this.interactionPatterns = this.initializeInteractionPatterns();
        this.qualityMetrics = this.initializeQualityMetrics();
        this.analyticsBuffer = [];
        
        this.initializeTracking();
    }

    // Initialize optimization rules for improving AI responses
    initializeOptimizationRules() {
        return {
            response_length: {
                too_long: {
                    trigger: 'response_length > 500 && user_engagement < 0.5',
                    action: 'shorten_responses',
                    improvement: 'Break long responses into smaller chunks'
                },
                too_short: {
                    trigger: 'response_length < 50 && user_satisfaction < 0.6',
                    action: 'elaborate_responses',
                    improvement: 'Provide more detailed explanations'
                }
            },
            
            explanation_clarity: {
                unclear: {
                    trigger: 'follow_up_questions > 2 && same_topic',
                    action: 'simplify_explanation',
                    improvement: 'Use simpler language and more examples'
                },
                too_basic: {
                    trigger: 'quick_understanding && advanced_questions',
                    action: 'increase_complexity',
                    improvement: 'Provide more advanced explanations'
                }
            },
            
            engagement_level: {
                low_engagement: {
                    trigger: 'session_time < 5 minutes && few_interactions',
                    action: 'increase_interactivity',
                    improvement: 'Add more questions and interactive elements'
                },
                high_dropout: {
                    trigger: 'session_abandonment > 0.3',
                    action: 'adjust_difficulty',
                    improvement: 'Match content difficulty to user level'
                }
            },
            
            personalization: {
                generic_responses: {
                    trigger: 'user_name_usage < 0.3',
                    action: 'increase_personalization',
                    improvement: 'Use student name and reference their progress'
                },
                style_mismatch: {
                    trigger: 'learning_style_effectiveness < 0.5',
                    action: 'adapt_teaching_style',
                    improvement: 'Adjust explanation method to learning style'
                }
            }
        };
    }

    // Initialize interaction pattern recognition
    initializeInteractionPatterns() {
        return {
            learning_behaviors: {
                quick_learner: {
                    patterns: ['fast_completion', 'high_accuracy', 'seeks_challenges'],
                    adaptations: ['increase_pace', 'provide_advanced_content', 'reduce_scaffolding']
                },
                methodical_learner: {
                    patterns: ['thorough_reading', 'detailed_questions', 'step_by_step_approach'],
                    adaptations: ['maintain_structure', 'provide_detailed_explanations', 'allow_processing_time']
                },
                struggling_learner: {
                    patterns: ['multiple_attempts', 'help_requests', 'long_response_times'],
                    adaptations: ['increase_support', 'simplify_content', 'provide_encouragement']
                }
            },
            
            engagement_patterns: {
                highly_engaged: {
                    indicators: ['long_sessions', 'many_questions', 'positive_feedback'],
                    optimizations: ['maintain_challenge_level', 'introduce_variety', 'encourage_exploration']
                },
                moderately_engaged: {
                    indicators: ['regular_sessions', 'standard_questions', 'neutral_feedback'],
                    optimizations: ['add_interactive_elements', 'personalize_content', 'vary_teaching_methods']
                },
                disengaged: {
                    indicators: ['short_sessions', 'few_questions', 'negative_feedback'],
                    optimizations: ['simplify_approach', 'increase_motivation', 'find_interests']
                }
            },
            
            help_seeking_patterns: {
                independent: {
                    characteristics: ['rare_help_requests', 'self_correction', 'exploration'],
                    support_level: 'minimal_guidance'
                },
                collaborative: {
                    characteristics: ['regular_help_requests', 'clarification_seeking', 'discussion'],
                    support_level: 'moderate_guidance'
                },
                dependent: {
                    characteristics: ['frequent_help_requests', 'confirmation_seeking', 'step_by_step_needs'],
                    support_level: 'high_guidance'
                }
            }
        };
    }

    // Initialize quality metrics for responses
    initializeQualityMetrics() {
        return {
            accuracy: {
                weight: 0.3,
                indicators: ['correct_information', 'factual_consistency', 'curriculum_alignment']
            },
            clarity: {
                weight: 0.25,
                indicators: ['language_simplicity', 'logical_structure', 'example_quality']
            },
            engagement: {
                weight: 0.2,
                indicators: ['student_questions', 'session_duration', 'interaction_frequency']
            },
            personalization: {
                weight: 0.15,
                indicators: ['name_usage', 'reference_to_progress', 'learning_style_match']
            },
            helpfulness: {
                weight: 0.1,
                indicators: ['problem_resolution', 'learning_progress', 'user_satisfaction']
            }
        };
    }

    // Initialize tracking system
    initializeTracking() {
        // Track page interactions
        this.trackPageInteractions();
        
        // Track AI response quality
        this.trackAIResponseQuality();
        
        // Track user engagement metrics
        this.trackEngagementMetrics();
        
        // Set up periodic data submission
        this.setupPeriodicSubmission();
        
        console.log('🔍 User Interaction Tracker initialized');
    }

    // Track all page interactions
    trackPageInteractions() {
        // Track button clicks
        document.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                this.logInteraction('button_click', {
                    buttonId: event.target.id,
                    buttonText: event.target.textContent.trim(),
                    section: this.getCurrentSection(),
                    timestamp: new Date()
                });
            }
        });

        // Track input focus and changes
        document.addEventListener('focusin', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                this.logInteraction('input_focus', {
                    inputId: event.target.id,
                    inputType: event.target.type,
                    timestamp: new Date()
                });
            }
        });

        // Track voice interactions
        if (window.micSystem) {
            const originalStartRecording = window.micSystem.startRecording;
            window.micSystem.startRecording = (...args) => {
                this.logInteraction('voice_start', {
                    mode: args[0] ? 'short_press' : 'long_press',
                    timestamp: new Date()
                });
                return originalStartRecording.apply(window.micSystem, args);
            };
        }

        // Track section navigation
        const originalShowSection = window.showSection;
        if (originalShowSection) {
            window.showSection = (section) => {
                this.logInteraction('navigation', {
                    section: section,
                    previousSection: this.getCurrentSection(),
                    timestamp: new Date()
                });
                return originalShowSection(section);
            };
        }
    }

    // Track AI response quality
    trackAIResponseQuality() {
        // Hook into GPT service if available
        if (window.gptService) {
            const originalSendMessage = window.gptService.sendMessage;
            window.gptService.sendMessage = async (...args) => {
                const startTime = Date.now();
                const userMessage = args[0];
                
                try {
                    // Call the original function directly without recursion
                    const response = await originalSendMessage.apply(window.gptService, args);
                    const responseTime = Date.now() - startTime;
                    
                    // Only analyze if this is not a recursive call
                    if (window.gptService && !window.gptService._isAnalyzing) {
                        window.gptService._isAnalyzing = true;
                        try {
                            this.analyzeAIResponse(userMessage, response, responseTime);
                        } finally {
                            window.gptService._isAnalyzing = false;
                        }
                    }
                    return response;
                } catch (error) {
                    this.logInteraction('ai_error', {
                        userMessage: userMessage,
                        error: error.message,
                        timestamp: new Date()
                    });
                    throw error;
                }
            };
        }
    }

    // Track engagement metrics
    trackEngagementMetrics() {
        // Track time spent on page
        let lastActivityTime = Date.now();
        let totalActiveTime = 0;
        
        const updateActivityTime = () => {
            const now = Date.now();
            if (now - lastActivityTime < 30000) { // 30 seconds max gap
                totalActiveTime += now - lastActivityTime;
            }
            lastActivityTime = now;
        };

        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, updateActivityTime, { passive: true });
        });

        // Track session summary periodically
        setInterval(() => {
            this.updateSessionSummary(totalActiveTime);
        }, 60000); // Every minute

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            this.logInteraction('visibility_change', {
                hidden: document.hidden,
                timestamp: new Date()
            });
        });
    }

    // Set up periodic data submission
    setupPeriodicSubmission() {
        // Submit analytics data every 5 minutes
        setInterval(() => {
            this.submitAnalyticsData();
        }, 300000);

        // Submit on page unload
        window.addEventListener('beforeunload', () => {
            this.submitAnalyticsData(true);
        });
    }

    // Log individual interaction
    logInteraction(type, data) {
        const interaction = {
            id: this.generateInteractionId(),
            type: type,
            timestamp: new Date(),
            sessionId: this.sessionData.sessionId,
            userId: window.userData?.id || 'anonymous',
            ...data
        };

        this.sessionData.interactions.push(interaction);
        this.analyticsBuffer.push(interaction);

        // Trigger real-time analysis for important interactions
        if (['ai_response', 'user_feedback', 'assessment_completion'].includes(type)) {
            this.triggerRealTimeAnalysis(interaction);
        }
    }

    // Analyze AI response quality
    analyzeAIResponse(userMessage, aiResponse, responseTime) {
        const analysis = {
            userMessage: userMessage,
            aiResponse: aiResponse,
            responseTime: responseTime,
            metrics: {},
            timestamp: new Date()
        };

        // Analyze response length
        analysis.metrics.responseLength = aiResponse.length;
        analysis.metrics.wordCount = aiResponse.split(/\s+/).length;

        // Analyze response complexity
        analysis.metrics.complexity = this.calculateResponseComplexity(aiResponse);

        // Analyze personalization
        analysis.metrics.personalization = this.analyzePersonalization(aiResponse);

        // Analyze curriculum alignment
        analysis.metrics.curriculumAlignment = this.analyzeCurriculumAlignment(userMessage, aiResponse);

        // Store for feedback collection
        this.logInteraction('ai_response_analysis', analysis);

        return analysis;
    }

    // Calculate response complexity
    calculateResponseComplexity(response) {
        const sentences = response.split(/[.!?]+/).length;
        const avgSentenceLength = response.length / sentences;
        const complexWords = (response.match(/\b\w{8,}\b/g) || []).length;
        const technicalTerms = this.countTechnicalTerms(response);

        return {
            sentences: sentences,
            avgSentenceLength: avgSentenceLength,
            complexWords: complexWords,
            technicalTerms: technicalTerms,
            complexityScore: (avgSentenceLength / 20) + (complexWords / 10) + (technicalTerms / 5)
        };
    }

    // Count technical terms in response
    countTechnicalTerms(response) {
        const technicalTerms = [
            'equation', 'variable', 'coefficient', 'polynomial', 'derivative',
            'molecule', 'compound', 'electron', 'neutron', 'photosynthesis',
            'metaphor', 'alliteration', 'protagonist', 'syntax', 'grammar'
        ];
        
        return technicalTerms.filter(term => 
            response.toLowerCase().includes(term.toLowerCase())
        ).length;
    }

    // Analyze personalization in response
    analyzePersonalization(response) {
        const userName = window.userData?.name || '';
        const hasUserName = userName && response.includes(userName);
        const hasPersonalReferences = /\b(you|your)\b/gi.test(response);
        const hasEncouragement = /\b(great|excellent|good job|well done)\b/gi.test(response);

        return {
            hasUserName: hasUserName,
            hasPersonalReferences: hasPersonalReferences,
            hasEncouragement: hasEncouragement,
            personalizationScore: (hasUserName ? 0.4 : 0) + (hasPersonalReferences ? 0.3 : 0) + (hasEncouragement ? 0.3 : 0)
        };
    }

    // Analyze curriculum alignment
    analyzeCurriculumAlignment(userMessage, aiResponse) {
        const userClass = window.userData?.class || '';
        const subject = window.currentSubject || '';
        
        // Simple heuristics for curriculum alignment
        const hasAgeAppropriateLanguage = this.checkAgeAppropriateLanguage(aiResponse, userClass);
        const hasSubjectRelevance = this.checkSubjectRelevance(aiResponse, subject);
        
        return {
            userClass: userClass,
            subject: subject,
            ageAppropriate: hasAgeAppropriateLanguage,
            subjectRelevant: hasSubjectRelevance,
            alignmentScore: (hasAgeAppropriateLanguage ? 0.5 : 0) + (hasSubjectRelevance ? 0.5 : 0)
        };
    }

    // Check if language is age appropriate
    checkAgeAppropriateLanguage(response, userClass) {
        const classNumber = parseInt(userClass.replace('class', ''));
        const complexity = this.calculateResponseComplexity(response);
        
        if (classNumber <= 3) {
            return complexity.complexityScore < 2;
        } else if (classNumber <= 6) {
            return complexity.complexityScore < 3;
        } else {
            return complexity.complexityScore < 4;
        }
    }

    // Check subject relevance
    checkSubjectRelevance(response, subject) {
        const subjectKeywords = {
            'Math': ['number', 'calculate', 'equation', 'solve', 'addition', 'multiplication'],
            'Science': ['experiment', 'observe', 'hypothesis', 'molecule', 'energy'],
            'English': ['sentence', 'paragraph', 'grammar', 'vocabulary', 'story'],
            'Hindi': ['वाक्य', 'व्याकरण', 'शब्द', 'कहानी']
        };
        
        const keywords = subjectKeywords[subject] || [];
        const foundKeywords = keywords.filter(keyword => 
            response.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return foundKeywords.length > 0;
    }

    // Collect user feedback
    collectFeedback(interactionId, feedbackType, rating, comments = '') {
        const feedback = {
            interactionId: interactionId,
            feedbackType: feedbackType, // 'helpful', 'accurate', 'clear', 'engaging'
            rating: rating, // 1-5 scale
            comments: comments,
            timestamp: new Date(),
            userId: window.userData?.id || 'anonymous'
        };

        this.feedbackCollection.set(interactionId, feedback);
        this.logInteraction('user_feedback', feedback);

        // Trigger improvement analysis
        this.analyzeAndImprove(interactionId, feedback);
    }

    // Analyze feedback and suggest improvements
    analyzeAndImprove(interactionId, feedback) {
        const interaction = this.sessionData.interactions.find(i => i.id === interactionId);
        if (!interaction || interaction.type !== 'ai_response_analysis') return;

        const improvements = [];
        
        // Analyze based on feedback
        if (feedback.rating < 3) {
            if (feedback.feedbackType === 'clear' && interaction.metrics.complexity.complexityScore > 2) {
                improvements.push({
                    issue: 'response_too_complex',
                    suggestion: 'Simplify language and break down complex concepts',
                    priority: 'high'
                });
            }
            
            if (feedback.feedbackType === 'helpful' && interaction.metrics.personalization.personalizationScore < 0.5) {
                improvements.push({
                    issue: 'insufficient_personalization',
                    suggestion: 'Increase personal references and use student name more often',
                    priority: 'medium'
                });
            }
            
            if (feedback.feedbackType === 'engaging' && interaction.responseTime > 5000) {
                improvements.push({
                    issue: 'slow_response_time',
                    suggestion: 'Optimize response generation for faster delivery',
                    priority: 'medium'
                });
            }
        }

        // Store improvements for implementation
        if (improvements.length > 0) {
            this.logInteraction('improvement_suggestions', {
                interactionId: interactionId,
                improvements: improvements,
                feedback: feedback
            });
        }
    }

    // Trigger real-time analysis
    triggerRealTimeAnalysis(interaction) {
        // Analyze patterns in real-time
        const recentInteractions = this.sessionData.interactions.slice(-10);
        const patterns = this.identifyPatterns(recentInteractions);
        
        if (patterns.length > 0) {
            this.logInteraction('pattern_detection', {
                patterns: patterns,
                triggerInteraction: interaction.id
            });
            
            // Apply immediate optimizations
            this.applyOptimizations(patterns);
        }
    }

    // Identify interaction patterns
    identifyPatterns(interactions) {
        const patterns = [];
        
        // Check for repeated questions
        const questions = interactions.filter(i => i.type === 'ai_response_analysis');
        if (questions.length >= 3) {
            const similarQuestions = this.findSimilarQuestions(questions);
            if (similarQuestions.length > 1) {
                patterns.push({
                    type: 'repeated_questions',
                    description: 'Student asking similar questions repeatedly',
                    suggestion: 'Provide more comprehensive explanations'
                });
            }
        }
        
        // Check for disengagement
        const recentEngagement = interactions.filter(i => 
            ['button_click', 'input_focus', 'navigation'].includes(i.type)
        ).length;
        
        if (recentEngagement < 2 && interactions.length > 5) {
            patterns.push({
                type: 'low_engagement',
                description: 'Student showing signs of disengagement',
                suggestion: 'Increase interactivity and vary teaching methods'
            });
        }
        
        // Check for help-seeking behavior
        const helpRequests = interactions.filter(i => 
            i.type === 'button_click' && 
            (i.buttonText.includes('help') || i.buttonText.includes('hint'))
        ).length;
        
        if (helpRequests > 3) {
            patterns.push({
                type: 'frequent_help_seeking',
                description: 'Student frequently requesting help',
                suggestion: 'Provide more scaffolding and step-by-step guidance'
            });
        }
        
        return patterns;
    }

    // Find similar questions
    findSimilarQuestions(questions) {
        const similar = [];
        for (let i = 0; i < questions.length - 1; i++) {
            for (let j = i + 1; j < questions.length; j++) {
                const similarity = this.calculateTextSimilarity(
                    questions[i].userMessage, 
                    questions[j].userMessage
                );
                if (similarity > 0.6) {
                    similar.push([questions[i], questions[j]]);
                }
            }
        }
        return similar;
    }

    // Calculate text similarity (simple implementation)
    calculateTextSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        const commonWords = words1.filter(word => words2.includes(word));
        return (commonWords.length * 2) / (words1.length + words2.length);
    }

    // Apply optimizations based on patterns
    applyOptimizations(patterns) {
        patterns.forEach(pattern => {
            switch (pattern.type) {
                case 'repeated_questions':
                    this.sessionData.currentContext.needsDetailedExplanation = true;
                    break;
                case 'low_engagement':
                    this.sessionData.currentContext.needsInteractivity = true;
                    break;
                case 'frequent_help_seeking':
                    this.sessionData.currentContext.needsScaffolding = true;
                    break;
            }
        });
        
        // Notify other systems about context changes
        if (window.personalizedPromptSystem) {
            window.personalizedPromptSystem.updateUserProfile(
                window.userData?.id || 'anonymous',
                this.sessionData.currentContext
            );
        }
    }

    // Update session summary
    updateSessionSummary(totalActiveTime) {
        this.sessionData.summary = {
            totalInteractions: this.sessionData.interactions.length,
            activeTime: totalActiveTime,
            engagementScore: this.calculateEngagementScore(),
            learningProgress: this.calculateLearningProgress(),
            satisfactionScore: this.calculateSatisfactionScore()
        };
    }

    // Calculate engagement score
    calculateEngagementScore() {
        const interactions = this.sessionData.interactions;
        const timeSpent = (Date.now() - this.sessionData.startTime.getTime()) / 1000 / 60; // minutes
        
        if (timeSpent === 0) return 0;
        
        const interactionRate = interactions.length / timeSpent;
        const varietyScore = new Set(interactions.map(i => i.type)).size / 10; // max 10 types
        
        return Math.min((interactionRate * 0.7) + (varietyScore * 0.3), 1);
    }

    // Calculate learning progress
    calculateLearningProgress() {
        const assessments = this.sessionData.interactions.filter(i => 
            i.type === 'assessment_completion'
        );
        
        if (assessments.length === 0) return 0;
        
        const averageScore = assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length;
        return averageScore / 100; // Convert to 0-1 scale
    }

    // Calculate satisfaction score
    calculateSatisfactionScore() {
        const feedbacks = Array.from(this.feedbackCollection.values());
        if (feedbacks.length === 0) return 0.5; // neutral
        
        const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
        return averageRating / 5; // Convert to 0-1 scale
    }

    // Submit analytics data
    async submitAnalyticsData(isPageUnload = false) {
        if (this.analyticsBuffer.length === 0) return;
        
        const data = {
            sessionData: this.sessionData,
            interactions: [...this.analyticsBuffer],
            feedback: Array.from(this.feedbackCollection.values()),
            timestamp: new Date()
        };
        
        try {
            // Submit to your analytics endpoint
            if (window.supabaseClient) {
                await window.supabaseClient
                    .from('user_interactions')
                    .insert(data);
            }
            
            // Clear buffer after successful submission
            this.analyticsBuffer = [];
            
            console.log('📊 Analytics data submitted successfully');
        } catch (error) {
            console.error('Error submitting analytics data:', error);
            
            // Store in localStorage as backup if submission fails
            if (!isPageUnload) {
                localStorage.setItem('pending_analytics', JSON.stringify(data));
            }
        }
    }

    // Get current section
    getCurrentSection() {
        const activeSection = document.querySelector('.content-section:not(.hidden)');
        return activeSection ? activeSection.id : 'unknown';
    }

    // Generate unique IDs
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateInteractionId() {
        return 'interaction_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Public API for collecting feedback
    provideFeedback(rating, comments = '') {
        const lastAIResponse = this.sessionData.interactions
            .filter(i => i.type === 'ai_response_analysis')
            .pop();
            
        if (lastAIResponse) {
            this.collectFeedback(lastAIResponse.id, 'general', rating, comments);
        }
    }

    // Get analytics summary
    getAnalyticsSummary() {
        return {
            sessionId: this.sessionData.sessionId,
            summary: this.sessionData.summary,
            interactionCount: this.sessionData.interactions.length,
            feedbackCount: this.feedbackCollection.size,
            optimizationsApplied: this.sessionData.interactions.filter(i => 
                i.type === 'improvement_suggestions'
            ).length
        };
    }
}

// Export for global use
window.UserInteractionTracker = UserInteractionTracker;

// Initialize the interaction tracker
window.userInteractionTracker = new UserInteractionTracker();

console.log('🔍 User Interaction Tracker initialized');
