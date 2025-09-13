// Learning Outcomes and Engagement Metrics Tracking System
// Monitors and analyzes key metrics for learning effectiveness and student engagement

class LearningOutcomesMetrics {
    constructor() {
        this.metricsConfig = this.initializeMetricsConfig();
        this.trackingCategories = this.initializeTrackingCategories();
        this.benchmarks = this.initializeBenchmarks();
        this.alertThresholds = this.initializeAlertThresholds();
        this.userMetrics = new Map();
        this.aggregatedMetrics = {};
        this.realTimeMetrics = {};
        
        this.initializeTracking();
    }

    // Initialize metrics configuration
    initializeMetricsConfig() {
        return {
            // Learning Outcome Metrics
            learning_outcomes: {
                knowledge_retention: {
                    description: 'How well students retain learned concepts over time',
                    measurement: 'percentage_correct_after_delay',
                    frequency: 'weekly',
                    weight: 0.25,
                    calculation: 'correct_recall / total_concepts_taught'
                },
                skill_mastery: {
                    description: 'Level of mastery achieved in specific skills',
                    measurement: 'mastery_level_progression',
                    frequency: 'per_assessment',
                    weight: 0.25,
                    calculation: 'advanced_proficiency / total_skills_assessed'
                },
                concept_understanding: {
                    description: 'Depth of understanding of key concepts',
                    measurement: 'explanation_quality_score',
                    frequency: 'per_interaction',
                    weight: 0.2,
                    calculation: 'conceptual_responses / total_responses'
                },
                application_ability: {
                    description: 'Ability to apply knowledge to new situations',
                    measurement: 'transfer_learning_success',
                    frequency: 'monthly',
                    weight: 0.15,
                    calculation: 'successful_applications / application_opportunities'
                },
                problem_solving_improvement: {
                    description: 'Growth in problem-solving capabilities',
                    measurement: 'problem_complexity_progression',
                    frequency: 'monthly',
                    weight: 0.15,
                    calculation: 'current_problem_level - initial_problem_level'
                }
            },

            // Engagement Metrics
            engagement_metrics: {
                session_duration: {
                    description: 'Time spent actively learning',
                    measurement: 'active_minutes_per_session',
                    frequency: 'per_session',
                    weight: 0.2,
                    benchmark: '15-25 minutes optimal'
                },
                interaction_frequency: {
                    description: 'How often students interact with the system',
                    measurement: 'interactions_per_minute',
                    frequency: 'real_time',
                    weight: 0.15,
                    benchmark: '2-4 interactions per minute'
                },
                question_asking_rate: {
                    description: 'Frequency of student-initiated questions',
                    measurement: 'questions_per_session',
                    frequency: 'per_session',
                    weight: 0.15,
                    benchmark: '3-5 questions per session'
                },
                challenge_acceptance: {
                    description: 'Willingness to attempt challenging problems',
                    measurement: 'difficult_problems_attempted',
                    frequency: 'per_session',
                    weight: 0.2,
                    benchmark: '70% acceptance rate'
                },
                persistence_level: {
                    description: 'How long students persist with difficult problems',
                    measurement: 'attempts_before_seeking_help',
                    frequency: 'per_problem',
                    weight: 0.15,
                    benchmark: '2-3 attempts before help'
                },
                return_rate: {
                    description: 'Frequency of return visits',
                    measurement: 'sessions_per_week',
                    frequency: 'weekly',
                    weight: 0.15,
                    benchmark: '3-5 sessions per week'
                }
            },

            // Performance Metrics
            performance_metrics: {
                accuracy_rate: {
                    description: 'Percentage of correct responses',
                    measurement: 'correct_answers / total_answers',
                    frequency: 'real_time',
                    weight: 0.3,
                    target: '75-85% optimal range'
                },
                response_time: {
                    description: 'Time taken to respond to questions',
                    measurement: 'average_response_time_seconds',
                    frequency: 'per_interaction',
                    weight: 0.2,
                    benchmark: 'decreasing over time indicates fluency'
                },
                error_pattern_improvement: {
                    description: 'Reduction in recurring mistakes',
                    measurement: 'unique_error_types_over_time',
                    frequency: 'weekly',
                    weight: 0.25,
                    target: 'decreasing trend'
                },
                difficulty_progression: {
                    description: 'Advancement through difficulty levels',
                    measurement: 'difficulty_level_changes',
                    frequency: 'monthly',
                    weight: 0.25,
                    target: 'steady upward progression'
                }
            }
        };
    }

    // Initialize tracking categories
    initializeTrackingCategories() {
        return {
            real_time: {
                description: 'Metrics tracked in real-time during interactions',
                metrics: ['accuracy_rate', 'interaction_frequency', 'response_time'],
                update_frequency: 'immediate',
                storage: 'memory_buffer'
            },
            session_based: {
                description: 'Metrics calculated at the end of each session',
                metrics: ['session_duration', 'question_asking_rate', 'challenge_acceptance'],
                update_frequency: 'end_of_session',
                storage: 'session_storage'
            },
            periodic: {
                description: 'Metrics calculated over longer time periods',
                metrics: ['knowledge_retention', 'skill_mastery', 'return_rate'],
                update_frequency: 'weekly_monthly',
                storage: 'database'
            },
            longitudinal: {
                description: 'Long-term trend analysis',
                metrics: ['problem_solving_improvement', 'difficulty_progression'],
                update_frequency: 'monthly',
                storage: 'analytics_database'
            }
        };
    }

    // Initialize performance benchmarks
    initializeBenchmarks() {
        return {
            excellent: {
                learning_outcomes: { min: 0.85, description: 'Outstanding performance' },
                engagement: { min: 0.8, description: 'Highly engaged learner' },
                performance: { min: 0.85, description: 'Exceptional accuracy and speed' }
            },
            good: {
                learning_outcomes: { min: 0.7, description: 'Good learning progress' },
                engagement: { min: 0.65, description: 'Well engaged' },
                performance: { min: 0.7, description: 'Good performance' }
            },
            average: {
                learning_outcomes: { min: 0.55, description: 'Satisfactory progress' },
                engagement: { min: 0.5, description: 'Average engagement' },
                performance: { min: 0.55, description: 'Satisfactory performance' }
            },
            needs_improvement: {
                learning_outcomes: { min: 0.0, description: 'Requires additional support' },
                engagement: { min: 0.0, description: 'Low engagement' },
                performance: { min: 0.0, description: 'Needs improvement' }
            }
        };
    }

    // Initialize alert thresholds
    initializeAlertThresholds() {
        return {
            critical: {
                accuracy_drop: 0.3, // 30% drop in accuracy
                engagement_drop: 0.4, // 40% drop in engagement
                session_abandonment: 0.5, // 50% of sessions abandoned
                help_seeking_spike: 3.0 // 3x increase in help requests
            },
            warning: {
                accuracy_drop: 0.2, // 20% drop in accuracy
                engagement_drop: 0.25, // 25% drop in engagement
                session_length_decrease: 0.3, // 30% decrease in session length
                error_rate_increase: 0.4 // 40% increase in errors
            },
            opportunity: {
                high_performance: 0.9, // 90% accuracy consistently
                fast_completion: 0.7, // 30% faster than average
                high_engagement: 0.85, // 85% engagement score
                challenge_readiness: 0.8 // 80% success on current level
            }
        };
    }

    // Initialize tracking system
    initializeTracking() {
        this.startRealTimeTracking();
        this.setupSessionTracking();
        this.setupPeriodicAnalysis();
        this.setupAlertSystem();
        
        console.log('📈 Learning Outcomes Metrics system initialized');
    }

    // Start real-time metrics tracking
    startRealTimeTracking() {
        // Track user interactions in real-time
        if (window.userInteractionTracker) {
            const originalLogInteraction = window.userInteractionTracker.logInteraction;
            window.userInteractionTracker.logInteraction = (type, data) => {
                // Call original function
                originalLogInteraction.call(window.userInteractionTracker, type, data);
                
                // Update real-time metrics
                this.updateRealTimeMetrics(type, data);
            };
        }

        // Track AI responses for accuracy and learning outcomes
        this.trackAIResponseMetrics();
        
        // Update real-time display every 30 seconds
        setInterval(() => {
            this.updateRealTimeDisplay();
        }, 30000);
    }

    // Setup session-based tracking
    setupSessionTracking() {
        // Track session start
        this.sessionStartTime = Date.now();
        this.sessionInteractions = 0;
        this.sessionQuestions = 0;
        this.sessionChallengesAttempted = 0;
        
        // Track session end
        window.addEventListener('beforeunload', () => {
            this.finalizeSessionMetrics();
        });
        
        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSessionTracking();
            } else {
                this.resumeSessionTracking();
            }
        });
    }

    // Setup periodic analysis
    setupPeriodicAnalysis() {
        // Daily analysis
        setInterval(() => {
            this.performDailyAnalysis();
        }, 24 * 60 * 60 * 1000); // 24 hours

        // Weekly analysis
        setInterval(() => {
            this.performWeeklyAnalysis();
        }, 7 * 24 * 60 * 60 * 1000); // 7 days

        // Monthly analysis
        setInterval(() => {
            this.performMonthlyAnalysis();
        }, 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    // Setup alert system
    setupAlertSystem() {
        setInterval(() => {
            this.checkAlertThresholds();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    // Update real-time metrics
    updateRealTimeMetrics(interactionType, data) {
        const userId = window.userData?.id || 'anonymous';
        
        if (!this.realTimeMetrics[userId]) {
            this.realTimeMetrics[userId] = {
                interactions: 0,
                correctAnswers: 0,
                totalAnswers: 0,
                totalResponseTime: 0,
                sessionStart: Date.now()
            };
        }

        const userMetrics = this.realTimeMetrics[userId];

        switch (interactionType) {
            case 'ai_response_analysis':
                if (data.userMessage && data.aiResponse) {
                    userMetrics.interactions++;
                    
                    // Track response time
                    if (data.responseTime) {
                        userMetrics.totalResponseTime += data.responseTime;
                    }
                }
                break;

            case 'user_feedback':
                if (data.rating !== undefined) {
                    // Use feedback to infer correctness
                    userMetrics.totalAnswers++;
                    if (data.rating >= 4) {
                        userMetrics.correctAnswers++;
                    }
                }
                break;

            case 'assessment_completion':
                if (data.score !== undefined) {
                    userMetrics.totalAnswers++;
                    userMetrics.correctAnswers += data.score / 100;
                }
                break;
        }

        // Calculate derived metrics
        userMetrics.accuracyRate = userMetrics.totalAnswers > 0 ? 
            userMetrics.correctAnswers / userMetrics.totalAnswers : 0;
        
        userMetrics.averageResponseTime = userMetrics.interactions > 0 ? 
            userMetrics.totalResponseTime / userMetrics.interactions : 0;
        
        userMetrics.interactionRate = userMetrics.interactions / 
            ((Date.now() - userMetrics.sessionStart) / 60000); // per minute
    }

    // Pause session tracking
    pauseSessionTracking() {
        this.sessionPaused = true;
        this.sessionPauseTime = Date.now();
        console.log('📊 Session tracking paused');
    }

    // Resume session tracking
    resumeSessionTracking() {
        if (this.sessionPaused) {
            this.sessionPaused = false;
            const pauseDuration = Date.now() - this.sessionPauseTime;
            this.totalSessionTime += pauseDuration;
            console.log('📊 Session tracking resumed');
        }
    }

    // Get recent metrics
    getRecentMetrics() {
        const userId = window.userData?.id || 'anonymous';
        return this.realTimeMetrics[userId] || {
            interactions: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            accuracyRate: 0,
            averageResponseTime: 0,
            interactionRate: 0
        };
    }

    // Track AI response metrics for learning outcomes
    trackAIResponseMetrics() {
        if (window.gptService) {
            const originalSendMessage = window.gptService.sendMessage;
            window.gptService.sendMessage = async (...args) => {
                const startTime = Date.now();
                const result = await originalSendMessage.apply(window.gptService, args);
                const endTime = Date.now();

                // Only analyze if this is not a recursive call
                if (window.gptService && !window.gptService._isAnalyzingLearning) {
                    window.gptService._isAnalyzingLearning = true;
                    try {
                        this.analyzeInteractionLearningOutcome(args[0], result, endTime - startTime);
                    } finally {
                        window.gptService._isAnalyzingLearning = false;
                    }
                }

                return result;
            };
        }
    }

    // Analyze learning outcome of each interaction
    analyzeInteractionLearningOutcome(userMessage, aiResponse, responseTime) {
        const userId = window.userData?.id || 'anonymous';
        
        if (!this.userMetrics.has(userId)) {
            this.userMetrics.set(userId, this.createUserMetricsProfile());
        }

        const metrics = this.userMetrics.get(userId);

        // Analyze question complexity
        const questionComplexity = this.analyzeQuestionComplexity(userMessage);
        
        // Analyze response quality for learning
        const responseAnalysis = this.analyzeResponseForLearning(aiResponse);
        
        // Track concept understanding
        const conceptsInvolved = this.identifyConceptsInvolved(userMessage, aiResponse);
        
        // Update metrics
        metrics.interactions.push({
            timestamp: new Date(),
            questionComplexity: questionComplexity,
            responseQuality: responseAnalysis,
            concepts: conceptsInvolved,
            responseTime: responseTime
        });

        // Update aggregated metrics
        this.updateAggregatedMetrics(userId, {
            questionComplexity,
            responseAnalysis,
            conceptsInvolved,
            responseTime
        });
    }

    // Create user metrics profile
    createUserMetricsProfile() {
        return {
            userId: window.userData?.id || 'anonymous',
            startDate: new Date(),
            interactions: [],
            learningOutcomes: {
                conceptMastery: {},
                skillProgression: {},
                retentionScores: {},
                applicationSuccess: {}
            },
            engagement: {
                sessionDurations: [],
                questionFrequency: [],
                challengeAcceptance: [],
                persistenceLevels: []
            },
            performance: {
                accuracyTrend: [],
                responseTimeTrend: [],
                errorPatterns: [],
                difficultyProgression: []
            }
        };
    }

    // Analyze question complexity
    analyzeQuestionComplexity(question) {
        const indicators = {
            basic: ['what is', 'define', 'list', 'name'],
            intermediate: ['how', 'why', 'explain', 'compare'],
            advanced: ['analyze', 'evaluate', 'create', 'synthesize'],
            application: ['solve', 'calculate', 'apply', 'demonstrate']
        };

        const questionLower = question.toLowerCase();
        let complexity = 'basic';
        let score = 1;

        for (const [level, keywords] of Object.entries(indicators)) {
            if (keywords.some(keyword => questionLower.includes(keyword))) {
                complexity = level;
                score = level === 'basic' ? 1 : 
                       level === 'intermediate' ? 2 : 
                       level === 'advanced' ? 3 : 4;
                break;
            }
        }

        return { level: complexity, score: score };
    }

    // Analyze response for learning value
    analyzeResponseForLearning(response) {
        const analysis = {
            hasExplanation: /because|since|therefore|thus|so that/.test(response),
            hasExamples: /example|for instance|such as/.test(response),
            hasSteps: /first|second|next|then|finally|step/.test(response),
            hasQuestions: /\?/.test(response),
            encouragesThinking: /think about|consider|what do you think/.test(response),
            length: response.length,
            educationalValue: 0
        };

        // Calculate educational value score
        analysis.educationalValue = 
            (analysis.hasExplanation ? 0.25 : 0) +
            (analysis.hasExamples ? 0.2 : 0) +
            (analysis.hasSteps ? 0.2 : 0) +
            (analysis.hasQuestions ? 0.15 : 0) +
            (analysis.encouragesThinking ? 0.2 : 0);

        return analysis;
    }

    // Identify concepts involved in the interaction
    identifyConceptsInvolved(question, response) {
        const conceptKeywords = {
            Math: {
                'Algebra': ['equation', 'variable', 'solve', 'x', 'y'],
                'Geometry': ['triangle', 'circle', 'angle', 'area', 'perimeter'],
                'Arithmetic': ['addition', 'subtraction', 'multiplication', 'division']
            },
            Science: {
                'Physics': ['force', 'energy', 'motion', 'gravity', 'light'],
                'Chemistry': ['atom', 'molecule', 'reaction', 'element', 'compound'],
                'Biology': ['cell', 'organism', 'DNA', 'evolution', 'ecosystem']
            },
            English: {
                'Grammar': ['noun', 'verb', 'adjective', 'sentence', 'clause'],
                'Literature': ['story', 'character', 'plot', 'theme', 'metaphor']
            }
        };

        const text = (question + ' ' + response).toLowerCase();
        const concepts = [];

        Object.entries(conceptKeywords).forEach(([subject, topics]) => {
            Object.entries(topics).forEach(([topic, keywords]) => {
                const matches = keywords.filter(keyword => text.includes(keyword));
                if (matches.length > 0) {
                    concepts.push({
                        subject: subject,
                        topic: topic,
                        confidence: matches.length / keywords.length
                    });
                }
            });
        });

        return concepts;
    }

    // Update aggregated metrics
    updateAggregatedMetrics(userId, interactionData) {
        if (!this.aggregatedMetrics[userId]) {
            this.aggregatedMetrics[userId] = {
                totalInteractions: 0,
                averageComplexity: 0,
                averageEducationalValue: 0,
                conceptCoverage: {},
                learningTrend: []
            };
        }

        const metrics = this.aggregatedMetrics[userId];
        metrics.totalInteractions++;

        // Update averages
        const n = metrics.totalInteractions;
        metrics.averageComplexity = ((n - 1) * metrics.averageComplexity + interactionData.questionComplexity.score) / n;
        metrics.averageEducationalValue = ((n - 1) * metrics.averageEducationalValue + interactionData.responseAnalysis.educationalValue) / n;

        // Update concept coverage
        interactionData.conceptsInvolved.forEach(concept => {
            const key = `${concept.subject}-${concept.topic}`;
            if (!metrics.conceptCoverage[key]) {
                metrics.conceptCoverage[key] = { count: 0, totalConfidence: 0 };
            }
            metrics.conceptCoverage[key].count++;
            metrics.conceptCoverage[key].totalConfidence += concept.confidence;
        });

        // Update learning trend
        metrics.learningTrend.push({
            timestamp: new Date(),
            complexity: interactionData.questionComplexity.score,
            educationalValue: interactionData.responseAnalysis.educationalValue
        });

        // Keep only last 100 interactions for trend analysis
        if (metrics.learningTrend.length > 100) {
            metrics.learningTrend = metrics.learningTrend.slice(-100);
        }
    }

    // Perform daily analysis
    performDailyAnalysis() {
        const today = new Date().toDateString();
        const dailyMetrics = {
            date: today,
            totalUsers: this.userMetrics.size,
            totalInteractions: 0,
            averageSessionLength: 0,
            engagementScore: 0,
            learningProgress: 0
        };

        // Calculate daily aggregates
        for (const [userId, userMetrics] of this.userMetrics.entries()) {
            const todayInteractions = userMetrics.interactions.filter(i => 
                i.timestamp.toDateString() === today
            );
            dailyMetrics.totalInteractions += todayInteractions.length;
        }

        // Store daily metrics
        this.storeDailyMetrics(dailyMetrics);
    }

    // Perform weekly analysis
    performWeeklyAnalysis() {
        try {
            const weeklyMetrics = this.calculateWeeklyMetrics();
            this.generateWeeklyReport(weeklyMetrics);
            this.identifyWeeklyTrends(weeklyMetrics);
        } catch (error) {
            console.warn('⚠️ Weekly analysis failed:', error);
        }
    }

    // Perform monthly analysis
    performMonthlyAnalysis() {
        try {
            const monthlyMetrics = this.calculateMonthlyMetrics();
            this.generateMonthlyReport(monthlyMetrics);
            this.updateLongTermTrends(monthlyMetrics);
        } catch (error) {
            console.warn('⚠️ Monthly analysis failed:', error);
        }
    }

    // Calculate weekly metrics
    calculateWeeklyMetrics() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weeklyData = {
            totalUsers: this.userMetrics.size,
            totalInteractions: 0,
            averageAccuracy: 0,
            averageEngagement: 0,
            completedAssessments: 0
        };

        for (const [userId, metrics] of this.userMetrics.entries()) {
            const weeklyInteractions = metrics.interactions.filter(i => 
                i.timestamp >= weekAgo
            );
            weeklyData.totalInteractions += weeklyInteractions.length;
        }

        return weeklyData;
    }

    // Calculate monthly metrics
    calculateMonthlyMetrics() {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        
        const monthlyData = {
            totalUsers: this.userMetrics.size,
            totalInteractions: 0,
            averageAccuracy: 0,
            averageEngagement: 0,
            completedAssessments: 0,
            learningProgress: 0
        };

        let totalAccuracy = 0;
        let totalEngagement = 0;
        let userCount = 0;

        for (const [userId, metrics] of this.userMetrics.entries()) {
            const monthlyInteractions = metrics.interactions.filter(i => 
                i.timestamp >= monthAgo
            );
            
            if (monthlyInteractions.length > 0) {
                monthlyData.totalInteractions += monthlyInteractions.length;
                
                // Calculate user's monthly accuracy
                const accuracy = monthlyInteractions.reduce((sum, i) => 
                    sum + (i.responseAnalysis?.educationalValue || 0), 0) / monthlyInteractions.length;
                totalAccuracy += accuracy;
                
                // Calculate engagement based on interaction frequency
                const engagement = Math.min(monthlyInteractions.length / 50, 1); // Max 50 interactions for full engagement
                totalEngagement += engagement;
                
                userCount++;
            }
        }

        if (userCount > 0) {
            monthlyData.averageAccuracy = totalAccuracy / userCount;
            monthlyData.averageEngagement = totalEngagement / userCount;
        }

        return monthlyData;
    }

    // Generate weekly report
    generateWeeklyReport(weeklyMetrics) {
        console.log('📊 Weekly Learning Report:', weeklyMetrics);
        // Store or display weekly report
        localStorage.setItem('weekly_report', JSON.stringify({
            ...weeklyMetrics,
            generatedAt: new Date()
        }));
    }

    // Generate monthly report
    generateMonthlyReport(monthlyMetrics) {
        // console.log('📊 Monthly Learning Report:', monthlyMetrics); // Temporarily disabled to prevent spam
        // Store or display monthly report
        localStorage.setItem('monthly_report', JSON.stringify({
            ...monthlyMetrics,
            generatedAt: new Date()
        }));
    }

    // Identify weekly trends
    identifyWeeklyTrends(weeklyMetrics) {
        // Compare with previous week data
        const previousWeekData = JSON.parse(localStorage.getItem('weekly_report') || '{}');
        
        if (previousWeekData.totalInteractions) {
            const interactionTrend = weeklyMetrics.totalInteractions - previousWeekData.totalInteractions;
            console.log(`📈 Weekly interaction trend: ${interactionTrend > 0 ? '+' : ''}${interactionTrend}`);
        }
    }

    // Update long-term trends
    updateLongTermTrends(monthlyMetrics) {
        // Store monthly data for trend analysis
        const trendData = JSON.parse(localStorage.getItem('learning_trends') || '[]');
        trendData.push({
            ...monthlyMetrics,
            month: new Date().toISOString().slice(0, 7) // YYYY-MM format
        });
        
        // Keep only last 12 months
        if (trendData.length > 12) {
            trendData.splice(0, trendData.length - 12);
        }
        
        localStorage.setItem('learning_trends', JSON.stringify(trendData));
        // console.log('📈 Long-term trends updated'); // Temporarily disabled to prevent spam
    }

    // Check alert thresholds
    checkAlertThresholds() {
        const alerts = [];

        for (const [userId, metrics] of this.userMetrics.entries()) {
            const userAlerts = this.checkUserAlerts(userId, metrics);
            alerts.push(...userAlerts);
        }

        if (alerts.length > 0) {
            this.processAlerts(alerts);
        }
    }

    // Check alerts for individual user
    checkUserAlerts(userId, metrics) {
        const alerts = [];
        const recentMetrics = this.getRecentMetrics(metrics, 24); // Last 24 hours

        // Check accuracy drop
        const accuracyTrend = this.calculateAccuracyTrend(recentMetrics);
        if (accuracyTrend < -this.alertThresholds.critical.accuracy_drop) {
            alerts.push({
                type: 'critical',
                category: 'accuracy_drop',
                userId: userId,
                value: accuracyTrend,
                message: `Significant accuracy drop detected for user ${userId}`
            });
        }

        // Check engagement drop
        const engagementScore = this.calculateEngagementScore(recentMetrics);
        if (engagementScore < this.alertThresholds.warning.engagement_drop) {
            alerts.push({
                type: 'warning',
                category: 'low_engagement',
                userId: userId,
                value: engagementScore,
                message: `Low engagement detected for user ${userId}`
            });
        }

        // Check for opportunities
        if (accuracyTrend > this.alertThresholds.opportunity.high_performance) {
            alerts.push({
                type: 'opportunity',
                category: 'advancement_ready',
                userId: userId,
                value: accuracyTrend,
                message: `User ${userId} ready for advancement`
            });
        }

        return alerts;
    }

    // Process alerts
    processAlerts(alerts) {
        alerts.forEach(alert => {
            console.log(`🚨 ${alert.type.toUpperCase()}: ${alert.message}`);
            
            // Store alert in database
            this.storeAlert(alert);
            
            // Trigger automated responses for critical alerts
            if (alert.type === 'critical') {
                this.triggerAutomatedResponse(alert);
            }
        });
    }

    // Generate comprehensive learning report
    generateLearningReport(userId, timeframe = 'week') {
        const userMetrics = this.userMetrics.get(userId);
        if (!userMetrics) return null;

        const report = {
            userId: userId,
            timeframe: timeframe,
            generatedAt: new Date(),
            summary: {},
            detailedAnalysis: {},
            recommendations: [],
            achievements: [],
            areasForImprovement: []
        };

        // Calculate summary metrics
        report.summary = this.calculateSummaryMetrics(userMetrics, timeframe);
        
        // Perform detailed analysis
        report.detailedAnalysis = this.performDetailedAnalysis(userMetrics, timeframe);
        
        // Generate recommendations
        report.recommendations = this.generatePersonalizedRecommendations(userMetrics);
        
        // Identify achievements
        report.achievements = this.identifyAchievements(userMetrics);
        
        // Identify areas for improvement
        report.areasForImprovement = this.identifyImprovementAreas(userMetrics);

        return report;
    }

    // Calculate summary metrics
    calculateSummaryMetrics(userMetrics, timeframe) {
        const relevantInteractions = this.filterInteractionsByTimeframe(userMetrics.interactions, timeframe);
        
        return {
            totalInteractions: relevantInteractions.length,
            averageComplexity: relevantInteractions.reduce((sum, i) => sum + i.questionComplexity.score, 0) / relevantInteractions.length,
            learningProgress: this.calculateLearningProgress(relevantInteractions),
            engagementLevel: this.calculateEngagementLevel(relevantInteractions),
            conceptsMastered: this.countMasteredConcepts(userMetrics.learningOutcomes.conceptMastery),
            overallGrade: this.calculateOverallGrade(userMetrics)
        };
    }

    // Calculate learning progress
    calculateLearningProgress(interactions) {
        if (interactions.length < 2) return 0;

        const initial = interactions.slice(0, Math.ceil(interactions.length / 3));
        const recent = interactions.slice(-Math.ceil(interactions.length / 3));

        const initialComplexity = initial.reduce((sum, i) => sum + i.questionComplexity.score, 0) / initial.length;
        const recentComplexity = recent.reduce((sum, i) => sum + i.questionComplexity.score, 0) / recent.length;

        return (recentComplexity - initialComplexity) / 4; // Normalized to 0-1
    }

    // Calculate engagement level
    calculateEngagementLevel(interactions) {
        const factors = {
            frequency: Math.min(interactions.length / 10, 1), // Normalize to max 10 interactions
            consistency: this.calculateConsistency(interactions),
            quality: interactions.reduce((sum, i) => sum + i.responseAnalysis.educationalValue, 0) / interactions.length
        };

        return (factors.frequency * 0.4 + factors.consistency * 0.3 + factors.quality * 0.3);
    }

    // Export metrics data
    exportMetricsData(format = 'json') {
        const exportData = {
            timestamp: new Date(),
            userMetrics: Object.fromEntries(this.userMetrics),
            aggregatedMetrics: this.aggregatedMetrics,
            systemSummary: this.getSystemSummary()
        };

        switch (format) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
            case 'csv':
                return this.convertToCSV(exportData);
            default:
                return exportData;
        }
    }

    // Get system-wide summary
    getSystemSummary() {
        return {
            totalUsers: this.userMetrics.size,
            totalInteractions: Array.from(this.userMetrics.values()).reduce((sum, m) => sum + m.interactions.length, 0),
            averageEngagement: this.calculateSystemAverageEngagement(),
            topConcepts: this.getTopConcepts(),
            performanceTrends: this.getPerformanceTrends()
        };
    }

    // Utility functions
    filterInteractionsByTimeframe(interactions, timeframe) {
        const now = new Date();
        const cutoff = new Date();
        
        switch (timeframe) {
            case 'day':
                cutoff.setDate(now.getDate() - 1);
                break;
            case 'week':
                cutoff.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoff.setMonth(now.getMonth() - 1);
                break;
            default:
                return interactions;
        }
        
        return interactions.filter(i => i.timestamp >= cutoff);
    }

    storeDailyMetrics(metrics) {
        // Store in database or local storage
        const key = `daily_metrics_${metrics.date}`;
        localStorage.setItem(key, JSON.stringify(metrics));
    }

    storeAlert(alert) {
        // Store alert for later analysis
        const alerts = JSON.parse(localStorage.getItem('learning_alerts') || '[]');
        alerts.push(alert);
        localStorage.setItem('learning_alerts', JSON.stringify(alerts));
    }

    updateRealTimeDisplay() {
        // Update any real-time dashboard displays
        const event = new CustomEvent('metricsUpdated', {
            detail: this.realTimeMetrics
        });
        window.dispatchEvent(event);
    }

    finalizeSessionMetrics() {
        const sessionLength = Date.now() - this.sessionStartTime;
        // Store session metrics
        localStorage.setItem('last_session_metrics', JSON.stringify({
            duration: sessionLength,
            interactions: this.sessionInteractions,
            questions: this.sessionQuestions,
            challenges: this.sessionChallengesAttempted
        }));
    }
}

// Export for global use
window.LearningOutcomesMetrics = LearningOutcomesMetrics;

// Initialize the learning outcomes metrics system
window.learningOutcomesMetrics = new LearningOutcomesMetrics();

console.log('📈 Learning Outcomes Metrics system initialized');
