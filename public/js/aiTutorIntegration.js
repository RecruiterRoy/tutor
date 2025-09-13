// AI Tutor Integration System
// Integrates all AI tutor enhancement systems with the existing codebase

class AITutorIntegration {
    constructor() {
        this.systems = {};
        this.isInitialized = false;
        this.integrationConfig = this.initializeIntegrationConfig();
        
        // Wait for all systems to be loaded before initializing
        this.waitForSystemsAndInitialize();
    }

    // Configuration for system integration
    initializeIntegrationConfig() {
        return {
            requiredSystems: [
                'learningObjectives',
                'personalizedPromptSystem', 
                'adaptiveLearningEngine',
                'diagnosticAssessmentSystem',
                'userInteractionTracker',
                'learningOutcomesMetrics'
            ],
            integrationPoints: {
                gptService: 'Enhance AI responses with personalized prompts',
                dashboard: 'Add assessment and progress features',
                userProfile: 'Integrate learning analytics',
                chat: 'Implement adaptive responses'
            }
        };
    }

    // Wait for all systems to load and then initialize
    async waitForSystemsAndInitialize() {
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds total
        
        const checkSystems = () => {
            attempts++;
            console.log(`🔧 Checking AI Tutor systems (attempt ${attempts}/${maxAttempts})...`);
            
            const systemsStatus = {};
            const allLoaded = this.integrationConfig.requiredSystems.every(system => {
                const isLoaded = window[system] && typeof window[system] === 'object';
                systemsStatus[system] = isLoaded;
                return isLoaded;
            });
            
            console.log('🔧 Systems status:', systemsStatus);
            
            if (allLoaded) {
                console.log('✅ All AI Tutor systems loaded, initializing integration...');
                this.initializeIntegration();
            } else if (attempts >= maxAttempts) {
                console.error('❌ Failed to load all AI Tutor systems after maximum attempts');
                const missingSystems = Object.keys(systemsStatus).filter(s => !systemsStatus[s]);
                console.error('Missing systems:', missingSystems);
                console.log('🔧 Available systems:', Object.keys(systemsStatus).filter(s => systemsStatus[s]));
                
                // Initialize with available systems if we have at least half
                const availableCount = Object.keys(systemsStatus).filter(s => systemsStatus[s]).length;
                if (availableCount >= this.integrationConfig.requiredSystems.length / 2) {
                    console.log('🔧 Proceeding with partial initialization...');
                    this.initializeIntegration(true);
                } else {
                    console.error('❌ Too few systems available, skipping initialization');
                    // Still mark as initialized to prevent infinite loops
                    this.isInitialized = false;
                }
            } else {
                setTimeout(checkSystems, 500); // Check again in 500ms
            }
        };
        
        checkSystems();
    }

    // Initialize the integration
    initializeIntegration(partialInit = false) {
        try {
            console.log('🔗 Starting AI Tutor Integration...');
            
            // Store references to all systems (with null checks)
            this.systems = {
                learningObjectives: window.learningObjectives || null,
                personalizedPrompts: window.personalizedPromptSystem || null,
                adaptiveLearning: window.adaptiveLearningEngine || null,
                diagnosticAssessment: window.diagnosticAssessmentSystem || null,
                interactionTracker: window.userInteractionTracker || null,
                outcomesMetrics: window.learningOutcomesMetrics || null
            };

            // Log which systems are available
            Object.keys(this.systems).forEach(key => {
                const status = this.systems[key] ? '✅' : '❌';
                console.log(`${status} ${key}: ${this.systems[key] ? 'Available' : 'Missing'}`);
            });

            // Integrate with existing systems (only if available)
            if (window.gptService) {
                this.integrateWithGPTService();
            }
            
            this.integrateWithDashboard();
            this.integrateWithUserProfile();
            
            if (this.systems.interactionTracker) {
                this.setupCrossSystemCommunication();
            }
            
            this.setupEnhancedFeatures();

            this.isInitialized = true;
            const initType = partialInit ? '(partial)' : '';
            console.log(`✅ AI Tutor Integration completed successfully ${initType}`);
            
            // Notify other systems
            window.dispatchEvent(new CustomEvent('aiTutorIntegrationReady', {
                detail: { systems: this.systems, partialInit }
            }));
            
        } catch (error) {
            console.error('❌ AI Tutor Integration failed:', error);
            console.error('Error details:', error.stack);
        }
    }

    // Integrate with GPT Service for enhanced responses
    integrateWithGPTService() {
        if (!window.gptService) return;
        
        console.log('🔗 Integrating with GPT Service...');
        
        // Enhance sendMessage with personalized prompts
        const originalSendMessage = window.gptService.sendMessage.bind(window.gptService);
        
        window.gptService.sendMessage = async (message, options = {}) => {
            try {
                // Check if we're in assessment mode
                if (window.currentAssessmentQuestion) {
                    return await this.handleAssessmentAnswer(message);
                }

                // Get user profile for personalization
                const userProfile = this.getUserProfile();
                
                // Track interaction start
                if (this.systems.interactionTracker) {
                    const interactionId = this.systems.interactionTracker.generateInteractionId();
                    this.systems.interactionTracker.logInteraction('ai_request_start', {
                        id: interactionId,
                        message: message,
                        timestamp: new Date()
                    });
                }

                // Get adaptive parameters
                let adaptiveParams = {};
                if (this.systems.adaptiveLearning) {
                    adaptiveParams = this.systems.adaptiveLearning.getAdaptiveParameters(
                        userProfile.id,
                        userProfile.currentSubject || 'General',
                        options.topic || 'General'
                    );
                }

                // Generate personalized prompt
                let enhancedOptions = options;
                if (this.systems.personalizedPrompts) {
                    const context = {
                        ...options,
                        teacherName: this.getCurrentTeacherName(),
                        subject: userProfile.currentSubject || 'General',
                        topic: options.topic,
                        difficulty: adaptiveParams.difficultyLevel,
                        ...adaptiveParams.personalizations
                    };

                    const enhancedPrompt = this.systems.personalizedPrompts.generatePersonalizedPrompt(
                        options.scenario || 'personalized_teaching',
                        userProfile,
                        context
                    );

                    enhancedOptions = {
                        ...options,
                        systemPrompt: enhancedPrompt,
                        adaptiveLevel: adaptiveParams.difficultyLevel
                    };
                }

                // Call original function with enhanced prompt (avoid recursion)
                const response = await originalSendMessage(message, enhancedOptions);

                // Track interaction completion
                if (this.systems.interactionTracker) {
                    this.systems.interactionTracker.logInteraction('ai_response_received', {
                        response: response,
                        adaptiveLevel: adaptiveParams.difficultyLevel,
                        timestamp: new Date()
                    });
                }

                // Update adaptive learning engine
                if (this.systems.adaptiveLearning) {
                    this.systems.adaptiveLearning.trackInteraction(userProfile.id, {
                        type: 'ai_interaction',
                        message: message,
                        response: response,
                        difficulty: adaptiveParams.difficultyLevel,
                        subject: userProfile.currentSubject,
                        isCorrect: undefined // To be determined by follow-up
                    });
                }

                return response;

            } catch (error) {
                console.error('Error in enhanced sendMessage:', error);
                // Fallback to original function
                return await originalSendMessage(message, options);
            }
        };

        console.log('✅ GPT Service integration completed');
    }

    // Handle assessment answers
    async handleAssessmentAnswer(userAnswer) {
        try {
            const assessmentInfo = window.currentAssessmentQuestion;
            if (!assessmentInfo) return 'Please start an assessment first.';

            console.log('🔧 Processing assessment answer:', userAnswer);

            // Convert answer based on question type
            let processedAnswer = userAnswer.trim().toLowerCase();
            
            if (assessmentInfo.question.type === 'multiple_choice') {
                // Convert letter to index
                const letterToIndex = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
                processedAnswer = letterToIndex[processedAnswer] !== undefined ? 
                    letterToIndex[processedAnswer] : processedAnswer;
            } else if (assessmentInfo.question.type === 'true_false') {
                // Convert A/B to true/false
                if (processedAnswer === 'a') processedAnswer = 'true';
                if (processedAnswer === 'b') processedAnswer = 'false';
            }

            // Submit answer to assessment system
            const result = await this.systems.diagnosticAssessment.processResponse(
                assessmentInfo.assessmentId,
                assessmentInfo.questionId,
                processedAnswer
            );

            console.log('✅ Assessment response processed:', result);

            // Clear current question
            window.currentAssessmentQuestion = null;

            // Prepare response
            let response = result.feedback.immediate;
            if (result.feedback.explanation) {
                response += `\n\n${result.feedback.explanation}`;
            }

            // Handle next question or completion
            if (result.nextQuestion) {
                response += '\n\n---\n\nHere\'s the next question:';
                
                // Display next question after a short delay
                setTimeout(() => {
                    this.displayQuestionInChat(result.nextQuestion, assessmentInfo.assessmentId);
                }, 2000);
            } else if (result.isComplete) {
                response += '\n\n🎉 Assessment completed! Let me analyze your results...';
                
                // Complete assessment after a short delay
                setTimeout(() => {
                    this.completeAssessment(assessmentInfo.assessmentId);
                }, 2000);
            }

            return response;

        } catch (error) {
            console.error('❌ Error handling assessment answer:', error);
            window.currentAssessmentQuestion = null;
            return 'Sorry, there was an error processing your answer. Please try starting the assessment again.';
        }
    }

    // Integrate with Dashboard for enhanced features
    integrateWithDashboard() {
        console.log('🔗 Integrating with Dashboard...');
        
        // Start continuous assessment for all students
        this.initializeContinuousAssessment();
        
        // Add progress tracking displays
        this.addProgressTrackingDisplays();
        
        // Add personalization controls
        this.addPersonalizationControls();
        
        console.log('✅ Dashboard integration completed');
    }

    // Initialize continuous assessment system
    initializeContinuousAssessment() {
        console.log('🔄 Initializing continuous assessment system...');
        
        this.continuousAssessment = {
            isActive: true,
            assessmentData: {},
            interactionCount: 0,
            lastAssessmentTime: Date.now(),
            assessmentQuestions: [],
            currentPhase: 'observation' // observation, assessment, teaching
        };

        // Start assessment data collection immediately
        this.startAssessmentDataCollection();
        
        console.log('✅ Continuous assessment system initialized');
    }

    // Start continuous assessment data collection
    startAssessmentDataCollection() {
        const userProfile = this.getUserProfile();
        
        // Initialize assessment tracking for this user
        this.continuousAssessment.assessmentData[userProfile.id] = {
            userId: userProfile.id,
            startTime: new Date(),
            interactions: [],
            knowledgeAreas: {},
            learningStyle: 'unknown',
            difficultyProgression: [],
            socraticData: {
                questionsAsked: [],
                conceptsExplored: [],
                teachingMoments: []
            }
        };

        // Hook into message sending to collect assessment data
        this.setupContinuousAssessmentHooks();
        
        console.log('🔄 Assessment data collection started for user:', userProfile.id);
    }

    // Setup hooks for continuous assessment
    setupContinuousAssessmentHooks() {
        // Hook into GPT service to capture all interactions
        if (window.gptService && !window.gptService._assessmentHooked) {
            const originalSendMessage = window.gptService.sendMessage.bind(window.gptService);
            
            window.gptService.sendMessage = async (...args) => {
                const userMessage = args[0];
                const startTime = Date.now();
                
                // Capture interaction data before sending
                this.captureInteractionData('user_message', { message: userMessage, timestamp: new Date() });
                
                try {
                    const response = await originalSendMessage(...args);
                    const responseTime = Date.now() - startTime;
                    
                    // Capture AI response data
                    this.captureInteractionData('ai_response', { 
                        userMessage: userMessage,
                        aiResponse: response, 
                        responseTime: responseTime,
                        timestamp: new Date()
                    });
                    
                    // Analyze for Socratic teaching opportunities
                    this.analyzeSocraticOpportunity(userMessage, response);
                    
                    // Save to Supabase periodically
                    this.saveAssessmentDataToSupabase();
                    
                    return response;
                } catch (error) {
                    this.captureInteractionData('error', { error: error.message, timestamp: new Date() });
                    throw error;
                }
            };
            
            window.gptService._assessmentHooked = true;
            console.log('✅ Continuous assessment hooks installed');
        }
    }

    // Capture interaction data for continuous assessment
    captureInteractionData(type, data) {
        const userProfile = this.getUserProfile();
        const userAssessment = this.continuousAssessment.assessmentData[userProfile.id];
        
        if (!userAssessment) return;
        
        userAssessment.interactions.push({
            type: type,
            data: data,
            timestamp: new Date(),
            sessionInfo: {
                subject: window.currentSubject || 'General',
                class: userProfile.class,
                board: userProfile.board
            }
        });
        
        // Analyze learning patterns every 5 interactions
        if (userAssessment.interactions.length % 5 === 0) {
            this.analyzeLearningPatterns(userProfile.id);
        }
        
        console.log(`📊 Captured ${type} for assessment:`, data);
    }

    // Analyze Socratic teaching opportunities
    analyzeSocraticOpportunity(userMessage, aiResponse) {
        const userProfile = this.getUserProfile();
        const userAssessment = this.continuousAssessment.assessmentData[userProfile.id];
        
        if (!userAssessment) return;
        
        // Identify if this was a teaching moment
        const isQuestion = userMessage.includes('?');
        const isExplanationRequest = /explain|how|why|what/i.test(userMessage);
        const containsAnswer = aiResponse.length > 100; // Substantial response
        
        if (isQuestion || isExplanationRequest || containsAnswer) {
            userAssessment.socraticData.teachingMoments.push({
                userQuery: userMessage,
                teachingResponse: aiResponse,
                concepts: this.extractConcepts(userMessage, aiResponse),
                difficulty: this.assessDifficulty(userMessage),
                timestamp: new Date()
            });
            
            console.log('🎓 Socratic teaching moment identified and recorded');
        }
    }

    // Extract concepts from conversation
    extractConcepts(userMessage, aiResponse) {
        const text = (userMessage + ' ' + aiResponse).toLowerCase();
        const concepts = [];
        
        // Math concepts
        const mathTerms = ['algebra', 'geometry', 'calculus', 'equation', 'fraction', 'integer', 'polynomial'];
        mathTerms.forEach(term => {
            if (text.includes(term)) concepts.push({ subject: 'Math', concept: term });
        });
        
        // Science concepts
        const scienceTerms = ['physics', 'chemistry', 'biology', 'atom', 'molecule', 'force', 'energy'];
        scienceTerms.forEach(term => {
            if (text.includes(term)) concepts.push({ subject: 'Science', concept: term });
        });
        
        // English concepts
        const englishTerms = ['grammar', 'sentence', 'verb', 'noun', 'adjective', 'literature'];
        englishTerms.forEach(term => {
            if (text.includes(term)) concepts.push({ subject: 'English', concept: term });
        });
        
        return concepts;
    }

    // Assess difficulty level of question
    assessDifficulty(message) {
        const basicWords = ['what', 'is', 'simple', 'basic'];
        const intermediateWords = ['how', 'explain', 'because', 'reason'];
        const advancedWords = ['analyze', 'evaluate', 'compare', 'synthesize'];
        
        const text = message.toLowerCase();
        let difficulty = 'basic';
        
        if (advancedWords.some(word => text.includes(word))) {
            difficulty = 'advanced';
        } else if (intermediateWords.some(word => text.includes(word))) {
            difficulty = 'intermediate';
        }
        
        return difficulty;
    }

    // Analyze learning patterns from accumulated data
    analyzeLearningPatterns(userId) {
        const userAssessment = this.continuousAssessment.assessmentData[userId];
        if (!userAssessment || userAssessment.interactions.length < 5) return;
        
        const recentInteractions = userAssessment.interactions.slice(-10);
        
        // Analyze response times to gauge difficulty
        const responseTimes = recentInteractions
            .filter(i => i.type === 'ai_response')
            .map(i => i.data.responseTime);
        
        const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        
        // Analyze question complexity progression
        const questionDifficulties = recentInteractions
            .filter(i => i.type === 'user_message')
            .map(i => this.assessDifficulty(i.data.message));
        
        // Update learning profile
        userAssessment.learningStyle = this.detectLearningStyle(recentInteractions);
        userAssessment.difficultyProgression.push({
            timestamp: new Date(),
            averageResponseTime: avgResponseTime,
            difficultyLevels: questionDifficulties,
            conceptsCovered: this.getRecentConcepts(recentInteractions)
        });
        
        console.log('📈 Learning patterns analyzed for user:', userId);
    }

    // Detect learning style from interaction patterns
    detectLearningStyle(interactions) {
        const questionTypes = interactions
            .filter(i => i.type === 'user_message')
            .map(i => i.data.message.toLowerCase());
        
        let visualCount = 0;
        let auditoryCount = 0;
        let kinestheticCount = 0;
        
        questionTypes.forEach(q => {
            if (/show|see|picture|diagram|visual/.test(q)) visualCount++;
            if (/tell|say|hear|sound|explain/.test(q)) auditoryCount++;
            if (/do|try|practice|example|hands/.test(q)) kinestheticCount++;
        });
        
        if (visualCount > auditoryCount && visualCount > kinestheticCount) return 'visual';
        if (auditoryCount > kinestheticCount) return 'auditory';
        return 'kinesthetic';
    }

    // Get recent concepts covered
    getRecentConcepts(interactions) {
        const concepts = [];
        interactions.forEach(i => {
            if (i.type === 'ai_response') {
                const extracted = this.extractConcepts(i.data.userMessage, i.data.aiResponse);
                concepts.push(...extracted);
            }
        });
        return concepts;
    }

    // Save assessment data to Supabase
    async saveAssessmentDataToSupabase() {
        if (!window.supabaseClient) return;
        
        try {
            const userProfile = this.getUserProfile();
            const userAssessment = this.continuousAssessment.assessmentData[userProfile.id];
            
            if (!userAssessment || userAssessment.interactions.length === 0) return;
            
            // Save only if we have significant new data (every 5 interactions)
            if (userAssessment.interactions.length % 5 !== 0) return;
            
            const assessmentRecord = {
                user_id: userProfile.id,
                assessment_type: 'continuous',
                session_start: userAssessment.startTime,
                interactions_count: userAssessment.interactions.length,
                learning_style: userAssessment.learningStyle,
                knowledge_areas: userAssessment.knowledgeAreas,
                socratic_data: userAssessment.socraticData,
                difficulty_progression: userAssessment.difficultyProgression,
                subject: window.currentSubject || 'General',
                class: userProfile.class,
                board: userProfile.board,
                updated_at: new Date()
            };
            
            // Insert or update assessment record
            const { data, error } = await window.supabaseClient
                .from('continuous_assessments')
                .upsert(assessmentRecord, { onConflict: 'user_id,session_start' });
            
            if (error) {
                console.error('❌ Error saving assessment data:', error);
            } else {
                console.log('✅ Assessment data saved to Supabase');
            }
            
        } catch (error) {
            console.error('❌ Error in saveAssessmentDataToSupabase:', error);
        }
    }

    // Add quick feedback buttons
    addQuickFeedbackButtons() {
        // Monitor for new AI messages
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList?.contains('ai-message')) {
                        this.addFeedbackButtonsToMessage(node);
                    }
                });
            });
        });

        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            observer.observe(chatMessages, { childList: true, subtree: true });
        }
    }

    // Add feedback buttons to a specific message
    addFeedbackButtonsToMessage(messageElement) {
        // Check if buttons already exist
        if (messageElement.querySelector('.feedback-buttons')) return;

        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'feedback-buttons mt-2 flex gap-2';

        const buttons = [
            { emoji: '👍', rating: 5, label: 'Helpful' },
            { emoji: '👎', rating: 2, label: 'Not helpful' },
            { emoji: '🤔', rating: 3, label: 'Confusing' },
            { emoji: '🎯', rating: 4, label: 'Good explanation' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors';
            button.innerHTML = `${btn.emoji} ${btn.label}`;
            button.onclick = () => {
                this.systems.interactionTracker.provideFeedback(btn.rating, btn.label);
                button.style.backgroundColor = '#10B981'; // Green when clicked
                button.disabled = true;
            };
            feedbackContainer.appendChild(button);
        });

        messageElement.appendChild(feedbackContainer);
    }

    // Add progress tracking displays
    addProgressTrackingDisplays() {
        // Add progress indicator to sidebar
        const sidebar = document.getElementById('sidebar') || document.getElementById('mobileSidebar');
        if (!sidebar) return;

        const progressContainer = document.createElement('div');
        progressContainer.id = 'learningProgressDisplay';
        progressContainer.className = 'p-4 bg-gray-800 rounded-lg mt-4';
        progressContainer.innerHTML = `
            <h3 class="text-white font-semibold mb-2">📈 Learning Progress</h3>
            <div id="progressContent">
                <div class="text-gray-300 text-sm">Loading progress...</div>
            </div>
        `;

        sidebar.appendChild(progressContainer);

        // Update progress display
        this.updateProgressDisplay();
        
        // Update every 30 seconds
        setInterval(() => this.updateProgressDisplay(), 30000);
    }

    // Update progress display
    updateProgressDisplay() {
        const progressContent = document.getElementById('progressContent');
        if (!progressContent) return;

        const userProfile = this.getUserProfile();
        const analytics = this.systems.adaptiveLearning.getLearningAnalytics(userProfile.id);
        
        if (analytics) {
            progressContent.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-300">Overall Performance:</span>
                        <span class="text-green-400">${(analytics.overallPerformance * 100).toFixed(0)}%</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-300">Current Level:</span>
                        <span class="text-blue-400">${analytics.currentLevel}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-300">Learning Style:</span>
                        <span class="text-purple-400">${analytics.learningStyle || 'Detecting...'}</span>
                    </div>
                </div>
            `;
        }
    }

    // Add personalization controls
    addPersonalizationControls() {
        // Add learning style selector to settings
        const settingsSection = document.getElementById('settings');
        if (!settingsSection) return;

        const personalizationPanel = document.createElement('div');
        personalizationPanel.className = 'bg-gray-800 rounded-lg p-4 mt-4';
        personalizationPanel.innerHTML = `
            <h3 class="text-white font-semibold mb-4">🎯 Learning Personalization</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Preferred Learning Style:</label>
                    <select id="learningStyleSelector" class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600">
                        <option value="auto">Auto-detect</option>
                        <option value="visual">Visual</option>
                        <option value="auditory">Auditory</option>
                        <option value="kinesthetic">Hands-on</option>
                        <option value="reading_writing">Reading/Writing</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Learning Pace:</label>
                    <select id="learningPaceSelector" class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600">
                        <option value="auto">Auto-adjust</option>
                        <option value="slow">Slow and steady</option>
                        <option value="average">Standard pace</option>
                        <option value="fast">Fast track</option>
                    </select>
                </div>
                <button id="savePersonalizationBtn" class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Save Preferences
                </button>
            </div>
        `;

        settingsSection.appendChild(personalizationPanel);

        // Add future assessment buttons structure
        this.addFutureAssessmentButtons(settingsSection);

        // Add event listeners
        document.getElementById('savePersonalizationBtn')?.addEventListener('click', () => {
            this.savePersonalizationSettings();
        });
    }

    // Save personalization settings
    savePersonalizationSettings() {
        const learningStyle = document.getElementById('learningStyleSelector')?.value;
        const learningPace = document.getElementById('learningPaceSelector')?.value;
        
        const userProfile = this.getUserProfile();
        
        // Update user profile with preferences
        this.systems.personalizedPrompts.updateUserProfile(userProfile.id, {
            learningStyle: learningStyle !== 'auto' ? learningStyle : undefined,
            learningPace: learningPace !== 'auto' ? learningPace : undefined
        });

        // Show success message
        if (window.showSuccess) {
            window.showSuccess('Personalization settings saved successfully!');
        }
    }

    // Add future assessment buttons structure (for Student Test and Assessment)
    addFutureAssessmentButtons(settingsSection) {
        const assessmentPanel = document.createElement('div');
        assessmentPanel.className = 'bg-gray-800 rounded-lg p-4 mt-4';
        assessmentPanel.innerHTML = `
            <h3 class="text-white font-semibold mb-4">📊 Assessment Tools</h3>
            <div class="space-y-3">
                <button id="studentTestBtn" class="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors" disabled>
                    🧪 Student Test
                    <div class="text-sm text-green-200 mt-1">Formal testing and evaluation (Coming Soon)</div>
                </button>
                <button id="studentAssessmentBtn" class="w-full py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors" disabled>
                    📈 Student Assessment
                    <div class="text-sm text-purple-200 mt-1">Comprehensive skill assessment (Coming Soon)</div>
                </button>
                <div class="bg-gray-700 rounded p-3 mt-4">
                    <div class="text-white text-sm mb-2">📊 Continuous Assessment Active</div>
                    <div class="text-gray-300 text-xs">
                        Your learning is being automatically assessed as you interact with the AI tutor. 
                        This helps personalize your learning experience.
                    </div>
                </div>
            </div>
        `;

        settingsSection.appendChild(assessmentPanel);
        console.log('✅ Future assessment buttons structure added');
    }

    // Start diagnostic assessment
    async startDiagnosticAssessment() {
        try {
            console.log('🔧 Starting diagnostic assessment...');
            
            // Check if systems are initialized
            if (!this.isInitialized) {
                console.error('❌ AI Tutor Integration not initialized');
                if (window.showError) {
                    window.showError('System not ready. Please wait a moment and try again.');
                }
                return;
            }

            // Check if diagnostic assessment system is available
            if (!this.systems.diagnosticAssessment) {
                console.error('❌ Diagnostic assessment system not available');
                if (window.showError) {
                    window.showError('Assessment system not loaded. Please refresh the page.');
                }
                return;
            }

            const userProfile = this.getUserProfile();
            const currentSubject = userProfile.currentSubject || 'Math';
            
            console.log('🔧 User profile:', userProfile);
            console.log('🔧 Current subject:', currentSubject);
            
            // Generate assessment
            const assessment = await this.systems.diagnosticAssessment.generateDiagnosticAssessment(
                userProfile,
                currentSubject
            );

            console.log('✅ Assessment generated:', assessment);

            // Display assessment in chat
            this.displayAssessmentInChat(assessment);
            
        } catch (error) {
            console.error('❌ Error starting assessment:', error);
            console.error('Error details:', error.stack);
            console.error('System state:', {
                isInitialized: this.isInitialized,
                systems: Object.keys(this.systems),
                diagnosticAssessment: !!this.systems.diagnosticAssessment,
                userProfile: userProfile,
                currentSubject: currentSubject
            });
            
            let errorMessage = 'Failed to start assessment. ';
            
            if (error.message.includes('No question bank found')) {
                errorMessage += 'Question bank not available for your class/subject.';
            } else if (error.message.includes('generateDiagnosticAssessment is not a function')) {
                errorMessage += 'Assessment system not properly loaded. Please refresh the page.';
            } else if (!this.isInitialized) {
                errorMessage += 'System not ready. Please wait a moment and try again.';
            } else if (!this.systems.diagnosticAssessment) {
                errorMessage += 'Assessment system not loaded. Please refresh the page.';
            } else {
                errorMessage += 'Please try again or refresh the page.';
            }
            
            console.log('🔧 Suggested fixes:');
            console.log('1. Check browser console for detailed errors');
            console.log('2. Try refreshing the page');
            console.log('3. Use window.showAITutorDebug() for system diagnostics');
            console.log('4. Use window.startAssessmentManually() to retry');
            
            if (window.showError) {
                window.showError(errorMessage);
            } else {
                alert(errorMessage);
            }
        }
    }

    // Display assessment in chat
    displayAssessmentInChat(assessment) {
        if (!window.addMessage) {
            console.error('❌ addMessage function not available');
            alert('Assessment system not properly initialized. Please refresh the page.');
            return;
        }

        try {
            window.addMessage('assistant', 
                `📊 Starting diagnostic assessment for ${assessment.subject}! This will help me understand your current level and provide better personalized instruction. Let's begin with the first question:`
            );

            // Display first question
            const firstQuestion = assessment.questions[0];
            if (firstQuestion) {
                setTimeout(() => {
                    this.displayQuestionInChat(firstQuestion, assessment.id);
                }, 1000);
            } else {
                console.error('❌ No questions in assessment');
                window.addMessage('assistant', 'Sorry, no questions available for this assessment. Please try again later.');
            }
        } catch (error) {
            console.error('❌ Error displaying assessment:', error);
            window.addMessage('assistant', 'Sorry, there was an error starting the assessment. Please try again.');
        }
    }

    // Display question in chat
    displayQuestionInChat(question, assessmentId) {
        try {
            let questionText = `❓ **Question**: ${question.question}\n\n`;

            if (question.type === 'multiple_choice') {
                questionText += '**Options:**\n';
                question.options.forEach((option, index) => {
                    questionText += `${String.fromCharCode(65 + index)}. ${option}\n`;
                });
                questionText += '\n💡 Please type the letter of your answer (A, B, C, or D):';
            } else if (question.type === 'true_false') {
                questionText += '**Options:**\nA. True\nB. False\n\n💡 Please type A for True or B for False:';
            } else {
                questionText += '\n💡 Please type your answer:';
            }

            // Store current question for processing answers
            window.currentAssessmentQuestion = {
                assessmentId: assessmentId,
                questionId: question.id,
                question: question
            };

            // Add to chat
            if (window.addMessage) {
                window.addMessage('assistant', questionText);
            }

            console.log('✅ Question displayed:', question.question);

        } catch (error) {
            console.error('❌ Error displaying question:', error);
            if (window.addMessage) {
                window.addMessage('assistant', 'Sorry, there was an error displaying the question. Please try again.');
            }
        }
    }

    // Setup assessment interactions
    setupAssessmentInteractions(assessmentId) {
        // Handle multiple choice answers
        document.querySelectorAll(`[data-assessment="${assessmentId}"] .answer-option`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const answer = e.target.dataset.answer;
                const questionElement = e.target.closest('.assessment-question');
                const questionId = questionElement.dataset.question;
                this.submitAssessmentAnswer(assessmentId, questionId, answer);
            });
        });

        // Handle text input answers
        document.querySelectorAll(`[data-assessment="${assessmentId}"] .submit-answer`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questionElement = e.target.closest('.assessment-question');
                const questionId = questionElement.dataset.question;
                const input = questionElement.querySelector('.answer-input');
                const answer = input?.value || '';
                this.submitAssessmentAnswer(assessmentId, questionId, answer);
            });
        });
    }

    // Submit assessment answer
    async submitAssessmentAnswer(assessmentId, questionId, answer) {
        try {
            const result = await this.systems.diagnosticAssessment.processResponse(
                assessmentId, 
                questionId, 
                answer
            );

            // Show feedback
            if (window.addMessage) {
                window.addMessage('assistant', result.feedback.immediate);
                
                if (result.feedback.explanation) {
                    window.addMessage('assistant', result.feedback.explanation);
                }
            }

            // Show next question or complete assessment
            if (result.nextQuestion) {
                setTimeout(() => {
                    this.displayQuestionInChat(result.nextQuestion, assessmentId);
                }, 1000);
            } else {
                // Assessment complete
                this.completeAssessment(assessmentId);
            }

        } catch (error) {
            console.error('Error submitting assessment answer:', error);
        }
    }

    // Complete assessment
    async completeAssessment(assessmentId) {
        try {
            const report = this.systems.diagnosticAssessment.generateAssessmentReport(assessmentId);
            
            if (window.addMessage) {
                window.addMessage('assistant', 
                    `🎉 Assessment completed! Here's your learning profile:
                    
                    📊 Overall Accuracy: ${(report.overview.accuracy * 100).toFixed(0)}%
                    🎯 Estimated Ability: ${report.overview.abilityEstimate.toFixed(2)}
                    
                    📈 Strong Areas: ${report.strengthAreas.join(', ')}
                    📝 Areas for Improvement: ${report.improvementAreas.join(', ')}
                    
                    Based on this assessment, I'll personalize my teaching to better match your learning style and current level!`
                );
            }

            // Update user profile with assessment results
            const userProfile = this.getUserProfile();
            this.systems.personalizedPrompts.updateUserProfile(userProfile.id, {
                assessmentResults: report,
                lastAssessment: new Date()
            });

        } catch (error) {
            console.error('Error completing assessment:', error);
        }
    }

    // Setup cross-system communication
    setupCrossSystemCommunication() {
        // Listen for system events
        window.addEventListener('userInteractionTracked', (event) => {
            // Update metrics when interactions are tracked
            this.systems.outcomesMetrics.updateRealTimeMetrics(
                event.detail.type, 
                event.detail.data
            );
        });

        window.addEventListener('adaptationSuggested', (event) => {
            // Apply adaptations when suggested
            this.applyAdaptationSuggestion(event.detail);
        });

        window.addEventListener('metricsUpdated', (event) => {
            // Update displays when metrics change
            this.updateProgressDisplay();
        });
    }

    // Setup enhanced features
    setupEnhancedFeatures() {
        // Add smart hints system
        this.setupSmartHints();
        
        // Add learning path recommendations
        this.setupLearningPathRecommendations();
        
        // Add performance alerts
        this.setupPerformanceAlerts();
    }

    // Setup smart hints system
    setupSmartHints() {
        this.lastHintTime = 0;
        this.sessionStartTime = Date.now();
        
        // Monitor for struggling indicators - only check every 5 minutes and offer hint only once per session
        setInterval(() => {
            const now = Date.now();
            const sessionDuration = now - this.sessionStartTime;
            const timeSinceLastHint = now - this.lastHintTime;
            
            // Only offer hint if:
            // 1. Session has been active for at least 5 minutes
            // 2. No hint offered in last 10 minutes
            // 3. User seems to be struggling
            if (sessionDuration > 5 * 60 * 1000 && timeSinceLastHint > 10 * 60 * 1000) {
                const userProfile = this.getUserProfile();
                const recentMetrics = this.systems.outcomesMetrics?.realTimeMetrics?.[userProfile.id];
                
                if (recentMetrics && recentMetrics.accuracyRate < 0.5 && recentMetrics.interactions > 3) {
                    this.offerSmartHint();
                    this.lastHintTime = now;
                }
            }
        }, 2 * 60 * 1000); // Check every 2 minutes
    }

    // Setup learning path recommendations
    setupLearningPathRecommendations() {
        console.log('🎯 Setting up learning path recommendations...');
        
        // Monitor user progress and suggest next topics
        setInterval(() => {
            const userProfile = this.getUserProfile();
            const currentSubject = window.currentSubject || 'General';
            
            // Simple recommendation logic
            const recommendations = this.generateRecommendations(currentSubject, userProfile);
            
            if (recommendations.length > 0) {
                this.showRecommendations(recommendations);
            }
        }, 10 * 60 * 1000); // Check every 10 minutes
    }

    // Generate recommendations based on current subject and user profile
    generateRecommendations(subject, userProfile) {
        const recommendations = [];
        
        // Basic subject-based recommendations
        const subjectTopics = {
            'Mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Calculus'],
            'Science': ['Physics', 'Chemistry', 'Biology', 'Environmental Science'],
            'English': ['Grammar', 'Literature', 'Comprehension', 'Writing Skills'],
            'History': ['Ancient History', 'Modern History', 'Geography', 'Civics']
        };
        
        const topics = subjectTopics[subject] || ['General Knowledge', 'Problem Solving', 'Critical Thinking'];
        
        // Add random topic recommendations
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        recommendations.push({
            type: 'topic',
            title: `Explore ${randomTopic}`,
            description: `Continue your learning journey with ${randomTopic}`,
            priority: 'medium'
        });
        
        return recommendations;
    }

    // Show recommendations to user
    showRecommendations(recommendations) {
        if (recommendations.length === 0) return;
        
        const recommendation = recommendations[0]; // Show first recommendation
        
        const message = `🎯 **Learning Recommendation**: ${recommendation.title}\n\n${recommendation.description}`;
        
        if (window.addMessage) {
            window.addMessage('assistant', message);
        }
    }

    // Add assessment features
    addAssessmentFeatures() {
        console.log('📝 Adding assessment features...');
        
        // Create assessment button if it doesn't exist
        const chatArea = document.querySelector('.chat-area');
        if (chatArea && !document.getElementById('assessmentButton')) {
            const assessmentButton = document.createElement('button');
            assessmentButton.id = 'assessmentButton';
            assessmentButton.className = 'bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors';
            assessmentButton.innerHTML = '📝 Take Assessment';
            assessmentButton.onclick = () => this.startAssessment();
            
            // Add to chat area
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'flex justify-center mt-4';
            buttonContainer.appendChild(assessmentButton);
            chatArea.appendChild(buttonContainer);
        }
        
        console.log('✅ Assessment features added');
    }

    // Start assessment
    startAssessment() {
        console.log('📝 Starting assessment...');
        if (window.addMessage) {
            window.addMessage('assistant', '📝 **Assessment Started**\n\nI\'ll ask you a series of questions to evaluate your understanding. Ready to begin?');
        }
    }

    // Setup performance alerts
    setupPerformanceAlerts() {
        console.log('📊 Setting up performance alerts...');
        
        // Monitor user performance and show alerts
        setInterval(() => {
            const userProfile = this.getUserProfile();
            
            // Simple performance monitoring
            if (window.userData && window.userData.accuracyRate < 0.6) {
                this.showPerformanceAlert('Your accuracy rate is below 60%. Consider reviewing previous topics.');
            }
        }, 5 * 60 * 1000); // Check every 5 minutes
    }

    // Show performance alert
    showPerformanceAlert(message) {
        if (window.addMessage) {
            window.addMessage('assistant', `⚠️ **Performance Alert**: ${message}`);
        }
    }

    // Offer smart hint with proper localization and TTS
    offerSmartHint() {
        const currentAvatar = this.getCurrentAvatarId();
        let hintMessage;
        
        if (currentAvatar === 'miss-sapna') {
            // Hindi message for Miss Sapna
            hintMessage = "💡 मुझे लगता है कि आपको यह चुनौतीपूर्ण लग रहा है। क्या आप चाहते हैं कि मैं इसे छोटे भागों में बांटूं या कोई अलग तरीके से समझाऊं?";
        } else {
            // English message for Roy Sir
            hintMessage = "💡 I notice you might be finding this challenging. Would you like me to break it down into smaller steps or provide a different explanation approach?";
        }
        
        if (window.addMessage) {
            window.addMessage('assistant', hintMessage);
            
            // Add TTS for the hint message
            setTimeout(() => {
                if (window.textToSpeech && window.textToSpeech.speak) {
                    window.textToSpeech.speak(hintMessage);
                }
            }, 500);
        }
    }

    // Get current user profile
    getUserProfile() {
        return {
            id: window.userData?.id || 'anonymous',
            name: window.userData?.name || 'Student',
            class: window.userData?.class || 'Unknown',
            board: window.userData?.board || 'CBSE',
            currentSubject: window.currentSubject || 'General'
        };
    }

    // Get current teacher name
    getCurrentTeacherName() {
        if (window.gptService && typeof window.gptService.getTeacherNameFromAvatar === 'function') {
            const avatar = window.userData?.ai_avatar || 'roy-sir';
            return window.gptService.getTeacherNameFromAvatar(avatar);
        }
        return 'Roy Sir';
    }

    // Get current avatar ID
    getCurrentAvatarId() {
        return window.userData?.ai_avatar || window.selectedAvatar || 'roy-sir';
    }

    // Integrate with user profile system
    integrateWithUserProfile() {
        console.log('🔗 Integrating with User Profile...');
        
        // Enhance user profile with learning analytics
        if (window.userData) {
            window.userData.learningAnalytics = {
                assessmentHistory: [],
                adaptiveLevel: 'intermediate',
                learningStyle: 'unknown',
                lastUpdated: new Date()
            };
        }
        
        console.log('✅ User Profile integration completed');
    }
}

// Export for global use
window.AITutorIntegration = AITutorIntegration;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔗 DOM loaded, starting AI Tutor Integration...');
    
    // Initialize immediately, but with proper error handling
    try {
        window.aiTutorIntegration = new AITutorIntegration();
        console.log('✅ AI Tutor Integration instance created');
    } catch (error) {
        console.error('❌ Failed to create AI Tutor Integration:', error);
        
        // Retry after a delay
        setTimeout(() => {
            try {
                console.log('🔄 Retrying AI Tutor Integration initialization...');
                window.aiTutorIntegration = new AITutorIntegration();
            } catch (retryError) {
                console.error('❌ Retry failed:', retryError);
            }
        }, 3000);
    }
});

console.log('🔗 AI Tutor Integration system loaded');
