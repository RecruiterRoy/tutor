// Adaptive Learning Engine
// Implements machine learning algorithms to track student progress and adapt lessons

class AdaptiveLearningEngine {
    constructor() {
        this.userLearningData = new Map();
        this.difficultyLevels = this.initializeDifficultyLevels();
        this.adaptationStrategies = this.initializeAdaptationStrategies();
        this.performanceMetrics = this.initializePerformanceMetrics();
        this.learningPathways = this.initializeLearningPathways();
    }

    // Initialize difficulty levels for content adaptation
    initializeDifficultyLevels() {
        return {
            beginner: {
                level: 1,
                characteristics: {
                    vocabularyComplexity: 'simple',
                    conceptDepth: 'surface',
                    problemSteps: 2-3,
                    examplesNeeded: 3-4,
                    practiceProblems: 5-7,
                    hintsAvailable: true,
                    timeAllowed: 'extended'
                },
                adaptationTriggers: {
                    successRate: '< 60%',
                    timeSpent: '> 150% average',
                    helpRequests: '> 3 per problem'
                }
            },
            intermediate: {
                level: 2,
                characteristics: {
                    vocabularyComplexity: 'moderate',
                    conceptDepth: 'detailed',
                    problemSteps: 3-5,
                    examplesNeeded: 2-3,
                    practiceProblems: 4-6,
                    hintsAvailable: true,
                    timeAllowed: 'standard'
                },
                adaptationTriggers: {
                    successRate: '60-85%',
                    timeSpent: '80-120% average',
                    helpRequests: '1-2 per problem'
                }
            },
            advanced: {
                level: 3,
                characteristics: {
                    vocabularyComplexity: 'complex',
                    conceptDepth: 'comprehensive',
                    problemSteps: 5-8,
                    examplesNeeded: 1-2,
                    practiceProblems: 3-5,
                    hintsAvailable: false,
                    timeAllowed: 'reduced'
                },
                adaptationTriggers: {
                    successRate: '> 85%',
                    timeSpent: '< 80% average',
                    helpRequests: '< 1 per problem'
                }
            },
            expert: {
                level: 4,
                characteristics: {
                    vocabularyComplexity: 'expert',
                    conceptDepth: 'mastery',
                    problemSteps: '8+',
                    examplesNeeded: 1,
                    practiceProblems: 2-3,
                    hintsAvailable: false,
                    timeAllowed: 'challenge'
                },
                adaptationTriggers: {
                    successRate: '> 95%',
                    timeSpent: '< 60% average',
                    helpRequests: '0 per problem'
                }
            }
        };
    }

    // Initialize adaptation strategies
    initializeAdaptationStrategies() {
        return {
            content_adaptation: {
                difficulty_increase: {
                    triggers: ['high_success_rate', 'fast_completion', 'low_help_requests'],
                    actions: [
                        'Increase problem complexity',
                        'Reduce scaffolding',
                        'Add time constraints',
                        'Introduce new concepts',
                        'Provide challenging extensions'
                    ]
                },
                difficulty_decrease: {
                    triggers: ['low_success_rate', 'slow_completion', 'frequent_help_requests'],
                    actions: [
                        'Simplify language',
                        'Break down concepts',
                        'Add more examples',
                        'Provide additional scaffolding',
                        'Review prerequisite concepts'
                    ]
                },
                style_adaptation: {
                    triggers: ['learning_style_mismatch', 'low_engagement'],
                    actions: [
                        'Switch explanation method',
                        'Change content format',
                        'Adjust interaction style',
                        'Modify practice types',
                        'Add multimedia elements'
                    ]
                }
            },
            
            pacing_adaptation: {
                accelerate: {
                    triggers: ['mastery_achieved', 'student_boredom', 'advanced_questions'],
                    actions: [
                        'Skip basic review',
                        'Introduce advanced topics',
                        'Increase lesson pace',
                        'Provide enrichment activities'
                    ]
                },
                decelerate: {
                    triggers: ['concept_confusion', 'multiple_errors', 'stress_indicators'],
                    actions: [
                        'Add review sessions',
                        'Slow down explanations',
                        'Increase practice time',
                        'Provide emotional support'
                    ]
                }
            },

            motivation_adaptation: {
                increase_confidence: {
                    triggers: ['low_confidence', 'fear_of_mistakes', 'avoidance_behavior'],
                    actions: [
                        'Start with easier problems',
                        'Celebrate small wins',
                        'Provide encouraging feedback',
                        'Share success stories',
                        'Use positive reinforcement'
                    ]
                },
                maintain_challenge: {
                    triggers: ['high_confidence', 'seeking_challenge', 'completion_focus'],
                    actions: [
                        'Introduce complex problems',
                        'Set stretch goals',
                        'Provide competition elements',
                        'Offer leadership opportunities'
                    ]
                }
            }
        };
    }

    // Initialize performance metrics tracking
    initializePerformanceMetrics() {
        return {
            accuracy: {
                weight: 0.3,
                calculation: 'correct_answers / total_attempts',
                benchmarks: { excellent: 0.9, good: 0.75, average: 0.6, needs_improvement: 0.4 }
            },
            speed: {
                weight: 0.2,
                calculation: 'time_taken / expected_time',
                benchmarks: { excellent: 0.7, good: 0.85, average: 1.0, needs_improvement: 1.5 }
            },
            retention: {
                weight: 0.25,
                calculation: 'correct_recall_after_time / total_concepts',
                benchmarks: { excellent: 0.85, good: 0.7, average: 0.55, needs_improvement: 0.4 }
            },
            engagement: {
                weight: 0.15,
                calculation: 'active_interaction_time / total_session_time',
                benchmarks: { excellent: 0.8, good: 0.65, average: 0.5, needs_improvement: 0.3 }
            },
            improvement_rate: {
                weight: 0.1,
                calculation: 'current_performance - previous_performance',
                benchmarks: { excellent: 0.15, good: 0.1, average: 0.05, needs_improvement: 0 }
            }
        };
    }

    // Initialize learning pathways
    initializeLearningPathways() {
        return {
            Math: {
                'class1': {
                    prerequisites: [],
                    pathway: ['Number Recognition', 'Counting', 'Basic Addition', 'Basic Subtraction', 'Shapes', 'Patterns'],
                    mastery_criteria: { accuracy: 0.8, retention: 0.7 }
                },
                'class6': {
                    prerequisites: ['Basic Arithmetic', 'Fractions'],
                    pathway: ['Integers', 'Fractions and Decimals', 'Data Handling', 'Mensuration', 'Algebra Introduction'],
                    mastery_criteria: { accuracy: 0.75, retention: 0.65 }
                },
                'class10': {
                    prerequisites: ['Algebra Basics', 'Geometry Fundamentals'],
                    pathway: ['Real Numbers', 'Polynomials', 'Linear Equations', 'Quadratic Equations', 'Coordinate Geometry', 'Trigonometry'],
                    mastery_criteria: { accuracy: 0.7, retention: 0.6 }
                }
            },
            Science: {
                'class6': {
                    prerequisites: ['Basic Observation Skills'],
                    pathway: ['Living and Non-living', 'Plant Life', 'Human Body', 'Motion and Forces', 'Light and Shadows'],
                    mastery_criteria: { accuracy: 0.75, retention: 0.6 }
                },
                'class10': {
                    prerequisites: ['Basic Scientific Method'],
                    pathway: ['Chemical Reactions', 'Life Processes', 'Light', 'Electricity', 'Heredity and Evolution'],
                    mastery_criteria: { accuracy: 0.7, retention: 0.6 }
                }
            }
        };
    }

    // Track student interaction and performance
    trackInteraction(userId, interactionData) {
        if (!this.userLearningData.has(userId)) {
            this.userLearningData.set(userId, this.createNewUserProfile());
        }

        const userData = this.userLearningData.get(userId);
        
        // Update interaction history
        userData.interactions.push({
            timestamp: new Date(),
            ...interactionData
        });

        // Update performance metrics
        this.updatePerformanceMetrics(userData, interactionData);

        // Check for adaptation triggers
        const adaptations = this.checkAdaptationTriggers(userData);

        // Apply adaptations if needed
        if (adaptations.length > 0) {
            this.applyAdaptations(userData, adaptations);
        }

        // Save updated data
        this.userLearningData.set(userId, userData);

        return {
            adaptations: adaptations,
            currentLevel: userData.currentDifficultyLevel,
            recommendations: this.generateRecommendations(userData)
        };
    }

    // Create new user learning profile
    createNewUserProfile() {
        return {
            currentDifficultyLevel: 'intermediate',
            learningStyle: 'unknown',
            performanceHistory: [],
            interactions: [],
            strengths: [],
            weaknesses: [],
            currentMetrics: {
                accuracy: 0.5,
                speed: 1.0,
                retention: 0.5,
                engagement: 0.5,
                improvement_rate: 0
            },
            adaptationHistory: [],
            masteryLevels: {},
            preferredPacing: 'standard'
        };
    }

    // Update performance metrics based on interaction
    updatePerformanceMetrics(userData, interactionData) {
        const metrics = userData.currentMetrics;

        // Update accuracy
        if (interactionData.isCorrect !== undefined) {
            const recentAccuracy = this.calculateRecentAccuracy(userData.interactions.slice(-10));
            metrics.accuracy = (metrics.accuracy * 0.7) + (recentAccuracy * 0.3);
        }

        // Update speed
        if (interactionData.timeSpent && interactionData.expectedTime) {
            const speedRatio = interactionData.expectedTime / interactionData.timeSpent;
            metrics.speed = (metrics.speed * 0.7) + (speedRatio * 0.3);
        }

        // Update engagement
        if (interactionData.sessionTime && interactionData.activeTime) {
            const engagementRatio = interactionData.activeTime / interactionData.sessionTime;
            metrics.engagement = (metrics.engagement * 0.8) + (engagementRatio * 0.2);
        }

        // Calculate improvement rate
        if (userData.performanceHistory.length > 0) {
            const previousPerformance = userData.performanceHistory[userData.performanceHistory.length - 1];
            const currentPerformance = this.calculateOverallPerformance(metrics);
            metrics.improvement_rate = currentPerformance - previousPerformance.overall;
        }

        // Store performance snapshot
        userData.performanceHistory.push({
            timestamp: new Date(),
            ...metrics,
            overall: this.calculateOverallPerformance(metrics)
        });
    }

    // Calculate recent accuracy from interactions
    calculateRecentAccuracy(recentInteractions) {
        const answered = recentInteractions.filter(i => i.isCorrect !== undefined);
        if (answered.length === 0) return 0.5;
        
        const correct = answered.filter(i => i.isCorrect).length;
        return correct / answered.length;
    }

    // Calculate overall performance score
    calculateOverallPerformance(metrics) {
        const weights = this.performanceMetrics;
        let totalScore = 0;
        let totalWeight = 0;

        Object.keys(weights).forEach(metric => {
            if (metrics[metric] !== undefined) {
                totalScore += metrics[metric] * weights[metric].weight;
                totalWeight += weights[metric].weight;
            }
        });

        return totalWeight > 0 ? totalScore / totalWeight : 0.5;
    }

    // Check for adaptation triggers
    checkAdaptationTriggers(userData) {
        const adaptations = [];
        const metrics = userData.currentMetrics;
        const currentLevel = userData.currentDifficultyLevel;

        // Check difficulty level adaptations
        const levelData = this.difficultyLevels[currentLevel];
        
        // Check if should increase difficulty
        if (metrics.accuracy > 0.85 && metrics.speed > 1.2 && metrics.improvement_rate > 0.1) {
            if (currentLevel !== 'expert') {
                adaptations.push({
                    type: 'difficulty_increase',
                    reason: 'High performance indicates readiness for increased challenge',
                    currentLevel: currentLevel,
                    targetLevel: this.getNextDifficultyLevel(currentLevel)
                });
            }
        }

        // Check if should decrease difficulty
        if (metrics.accuracy < 0.6 && (metrics.speed < 0.7 || metrics.engagement < 0.4)) {
            if (currentLevel !== 'beginner') {
                adaptations.push({
                    type: 'difficulty_decrease',
                    reason: 'Performance indicates need for additional support',
                    currentLevel: currentLevel,
                    targetLevel: this.getPreviousDifficultyLevel(currentLevel)
                });
            }
        }

        // Check for learning style adaptations
        if (metrics.engagement < 0.4 && userData.interactions.length > 5) {
            adaptations.push({
                type: 'style_adaptation',
                reason: 'Low engagement suggests learning style mismatch',
                suggestions: this.suggestLearningStyleAdaptations(userData)
            });
        }

        // Check for pacing adaptations
        if (metrics.speed > 1.5 && metrics.accuracy > 0.8) {
            adaptations.push({
                type: 'pace_acceleration',
                reason: 'Fast and accurate performance suggests readiness for accelerated pace'
            });
        } else if (metrics.speed < 0.6 && metrics.accuracy < 0.7) {
            adaptations.push({
                type: 'pace_deceleration',
                reason: 'Slow and inaccurate performance suggests need for slower pace'
            });
        }

        return adaptations;
    }

    // Apply adaptations to user profile
    applyAdaptations(userData, adaptations) {
        adaptations.forEach(adaptation => {
            userData.adaptationHistory.push({
                timestamp: new Date(),
                adaptation: adaptation
            });

            switch (adaptation.type) {
                case 'difficulty_increase':
                    userData.currentDifficultyLevel = adaptation.targetLevel;
                    break;
                case 'difficulty_decrease':
                    userData.currentDifficultyLevel = adaptation.targetLevel;
                    break;
                case 'style_adaptation':
                    userData.learningStyle = adaptation.suggestions.primaryStyle;
                    break;
                case 'pace_acceleration':
                    userData.preferredPacing = 'fast';
                    break;
                case 'pace_deceleration':
                    userData.preferredPacing = 'slow';
                    break;
            }
        });
    }

    // Get next difficulty level
    getNextDifficultyLevel(currentLevel) {
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentLevel;
    }

    // Get previous difficulty level
    getPreviousDifficultyLevel(currentLevel) {
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex > 0 ? levels[currentIndex - 1] : currentLevel;
    }

    // Suggest learning style adaptations
    suggestLearningStyleAdaptations(userData) {
        // Analyze interaction patterns to suggest learning style
        const interactions = userData.interactions;
        
        // Simple heuristics for learning style detection
        const textInteractions = interactions.filter(i => i.type === 'text').length;
        const audioInteractions = interactions.filter(i => i.type === 'audio').length;
        const practiceInteractions = interactions.filter(i => i.type === 'practice').length;

        let primaryStyle = 'reading_writing';
        if (audioInteractions > textInteractions) {
            primaryStyle = 'auditory';
        } else if (practiceInteractions > textInteractions) {
            primaryStyle = 'kinesthetic';
        }

        return {
            primaryStyle: primaryStyle,
            confidence: 0.7,
            recommendations: this.getLearningStyleRecommendations(primaryStyle)
        };
    }

    // Get learning style recommendations
    getLearningStyleRecommendations(style) {
        const recommendations = {
            visual: [
                'Use more descriptive text and organized layouts',
                'Provide structured information hierarchies',
                'Include spatial relationship descriptions'
            ],
            auditory: [
                'Use more conversational explanations',
                'Include rhythm and repetition in teaching',
                'Encourage verbal problem-solving'
            ],
            kinesthetic: [
                'Provide hands-on examples and real-world applications',
                'Include interactive problem-solving approaches',
                'Use trial-and-error learning methods'
            ],
            reading_writing: [
                'Provide detailed written explanations',
                'Encourage note-taking and summarization',
                'Use text-based exercises and analysis'
            ]
        };

        return recommendations[style] || recommendations.reading_writing;
    }

    // Generate personalized recommendations
    generateRecommendations(userData) {
        const recommendations = [];
        const metrics = userData.currentMetrics;

        // Performance-based recommendations
        if (metrics.accuracy < 0.6) {
            recommendations.push({
                type: 'improvement',
                area: 'accuracy',
                suggestion: 'Focus on understanding concepts before attempting problems',
                actionable: true
            });
        }

        if (metrics.speed < 0.7) {
            recommendations.push({
                type: 'improvement',
                area: 'speed',
                suggestion: 'Practice with timed exercises to improve problem-solving speed',
                actionable: true
            });
        }

        if (metrics.engagement < 0.5) {
            recommendations.push({
                type: 'engagement',
                area: 'motivation',
                suggestion: 'Try different types of activities to find what interests you most',
                actionable: true
            });
        }

        // Strength-based recommendations
        if (metrics.accuracy > 0.8) {
            recommendations.push({
                type: 'advancement',
                area: 'challenge',
                suggestion: 'Ready for more challenging problems in this topic',
                actionable: true
            });
        }

        return recommendations;
    }

    // Get adaptive content parameters for current user
    getAdaptiveParameters(userId, subject, topic) {
        const userData = this.userLearningData.get(userId) || this.createNewUserProfile();
        const difficultyLevel = userData.currentDifficultyLevel;
        const levelCharacteristics = this.difficultyLevels[difficultyLevel].characteristics;

        return {
            difficultyLevel: difficultyLevel,
            characteristics: levelCharacteristics,
            personalizations: {
                learningStyle: userData.learningStyle,
                preferredPacing: userData.preferredPacing,
                strengths: userData.strengths,
                weaknesses: userData.weaknesses
            },
            currentMetrics: userData.currentMetrics,
            recommendations: this.generateRecommendations(userData)
        };
    }

    // Assess mastery level for a topic
    assessMasteryLevel(userId, subject, topic) {
        const userData = this.userLearningData.get(userId);
        if (!userData) return 'not_started';

        const topicInteractions = userData.interactions.filter(i => 
            i.subject === subject && i.topic === topic
        );

        if (topicInteractions.length < 3) return 'beginning';

        const recentAccuracy = this.calculateRecentAccuracy(topicInteractions.slice(-5));
        const averageSpeed = topicInteractions.reduce((sum, i) => sum + (i.speedRatio || 1), 0) / topicInteractions.length;

        if (recentAccuracy >= 0.9 && averageSpeed >= 1.2) return 'mastered';
        if (recentAccuracy >= 0.75 && averageSpeed >= 1.0) return 'proficient';
        if (recentAccuracy >= 0.6) return 'developing';
        return 'struggling';
    }

    // Get learning analytics summary
    getLearningAnalytics(userId) {
        const userData = this.userLearningData.get(userId);
        if (!userData) return null;

        return {
            overallPerformance: this.calculateOverallPerformance(userData.currentMetrics),
            currentLevel: userData.currentDifficultyLevel,
            strengths: userData.strengths,
            areasForImprovement: userData.weaknesses,
            learningStyle: userData.learningStyle,
            recentProgress: userData.performanceHistory.slice(-5),
            adaptationsSuggested: userData.adaptationHistory.length,
            recommendations: this.generateRecommendations(userData)
        };
    }
}

// Export for global use
window.AdaptiveLearningEngine = AdaptiveLearningEngine;

// Initialize the adaptive learning engine
window.adaptiveLearningEngine = new AdaptiveLearningEngine();

console.log('🧠 Adaptive Learning Engine initialized');
