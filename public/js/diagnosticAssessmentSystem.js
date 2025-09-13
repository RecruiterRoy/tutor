// Diagnostic Assessment and Quiz Generation System
// Provides adaptive assessments to evaluate student knowledge and generate personalized quizzes

class DiagnosticAssessmentSystem {
    constructor() {
        this.assessmentTypes = this.initializeAssessmentTypes();
        this.questionBanks = this.initializeQuestionBanks();
        this.assessmentStrategies = this.initializeAssessmentStrategies();
        this.adaptiveAlgorithms = this.initializeAdaptiveAlgorithms();
        this.feedbackTemplates = this.initializeFeedbackTemplates();
        this.assessmentHistory = new Map();
    }

    // Initialize different types of assessments
    initializeAssessmentTypes() {
        return {
            diagnostic: {
                purpose: 'Identify knowledge gaps and strengths',
                duration: '15-20 minutes',
                questionCount: 10-15,
                adaptiveLevel: 'high',
                feedbackType: 'detailed_analysis'
            },
            formative: {
                purpose: 'Monitor ongoing learning progress',
                duration: '5-10 minutes',
                questionCount: 5-8,
                adaptiveLevel: 'medium',
                feedbackType: 'immediate_guidance'
            },
            summative: {
                purpose: 'Evaluate learning achievement',
                duration: '20-30 minutes',
                questionCount: 15-25,
                adaptiveLevel: 'low',
                feedbackType: 'comprehensive_review'
            },
            practice: {
                purpose: 'Reinforce learning through repetition',
                duration: '10-15 minutes',
                questionCount: 8-12,
                adaptiveLevel: 'high',
                feedbackType: 'hint_based'
            },
            mock_exam: {
                purpose: 'Simulate actual exam conditions',
                duration: '45-60 minutes',
                questionCount: 25-40,
                adaptiveLevel: 'none',
                feedbackType: 'performance_summary'
            }
        };
    }

    // Initialize question banks by subject and difficulty
    initializeQuestionBanks() {
        return {
            Math: {
                'class1': {
                    'Number Recognition': {
                        beginner: [
                            {
                                type: 'multiple_choice',
                                question: 'Which number comes after 5?',
                                options: ['4', '6', '3', '8'],
                                correct: 1,
                                explanation: 'When counting, 6 comes right after 5.',
                                skills: ['counting', 'number_sequence']
                            },
                            {
                                type: 'fill_blank',
                                question: 'Fill in the missing number: 1, 2, _, 4',
                                correct: '3',
                                explanation: 'The missing number in the sequence is 3.',
                                skills: ['counting', 'pattern_recognition']
                            }
                        ],
                        intermediate: [
                            {
                                type: 'multiple_choice',
                                question: 'What is the biggest number: 7, 3, 9, 5?',
                                options: ['7', '3', '9', '5'],
                                correct: 2,
                                explanation: '9 is the largest among these numbers.',
                                skills: ['number_comparison', 'ordering']
                            }
                        ]
                    },
                    'Basic Addition': {
                        beginner: [
                            {
                                type: 'multiple_choice',
                                question: 'What is 2 + 3?',
                                options: ['4', '5', '6', '7'],
                                correct: 1,
                                explanation: 'When you add 2 and 3, you get 5.',
                                skills: ['addition', 'basic_arithmetic']
                            }
                        ]
                    },
                    'Basic Subtraction': {
                        beginner: [
                            {
                                type: 'multiple_choice',
                                question: 'What is 5 - 2?',
                                options: ['2', '3', '4', '7'],
                                correct: 1,
                                explanation: 'When you subtract 2 from 5, you get 3.',
                                skills: ['subtraction', 'basic_arithmetic']
                            }
                        ]
                    }
                },
                'class2': {
                    'Number Recognition': {
                        beginner: [
                            {
                                type: 'multiple_choice',
                                question: 'Which number comes after 15?',
                                options: ['14', '16', '13', '18'],
                                correct: 1,
                                explanation: 'When counting, 16 comes right after 15.',
                                skills: ['counting', 'number_sequence']
                            }
                        ]
                    },
                    'Basic Addition': {
                        beginner: [
                            {
                                type: 'multiple_choice',
                                question: 'What is 12 + 8?',
                                options: ['19', '20', '21', '22'],
                                correct: 1,
                                explanation: 'When you add 12 and 8, you get 20.',
                                skills: ['addition', 'two_digit_arithmetic']
                            }
                        ]
                    },
                    'Basic Subtraction': {
                        beginner: [
                            {
                                type: 'multiple_choice',
                                question: 'What is 15 - 7?',
                                options: ['7', '8', '9', '10'],
                                correct: 1,
                                explanation: 'When you subtract 7 from 15, you get 8.',
                                skills: ['subtraction', 'two_digit_arithmetic']
                            }
                        ]
                    }
                },
                'class6': {
                    'Integers': {
                        beginner: [
                            {
                                type: 'multiple_choice',
                                question: 'Which of these is a negative integer?',
                                options: ['5', '0', '-3', '2.5'],
                                correct: 2,
                                explanation: '-3 is negative because it is less than zero.',
                                skills: ['integer_identification', 'negative_numbers']
                            }
                        ],
                        intermediate: [
                            {
                                type: 'calculation',
                                question: 'Calculate: (-5) + 8',
                                correct: 3,
                                explanation: 'Start at -5, move 8 steps right to get 3.',
                                skills: ['integer_addition', 'number_line']
                            }
                        ]
                    }
                }
            },
            Science: {
                'class6': {
                    'Living and Non-living': {
                        beginner: [
                            {
                                type: 'true_false',
                                question: 'Plants are living things.',
                                correct: true,
                                explanation: 'Plants are living because they grow, reproduce, and respond to their environment.',
                                skills: ['classification', 'life_characteristics']
                            }
                        ]
                    }
                }
            },
            English: {
                'class1': {
                    'Letter Recognition': {
                        beginner: [
                            {
                                type: 'multiple_choice',
                                question: 'Which letter comes after B?',
                                options: ['A', 'C', 'D', 'E'],
                                correct: 1,
                                explanation: 'In the alphabet, C comes after B.',
                                skills: ['alphabet_sequence', 'letter_recognition']
                            }
                        ]
                    }
                }
            }
        };
    }

    // Initialize assessment strategies
    initializeAssessmentStrategies() {
        return {
            adaptive_branching: {
                description: 'Adjust difficulty based on previous answers',
                implementation: {
                    correct_answer: 'increase_difficulty',
                    incorrect_answer: 'decrease_difficulty_or_provide_support',
                    consecutive_correct: 'skip_similar_level_questions',
                    consecutive_incorrect: 'provide_foundational_review'
                }
            },
            knowledge_tracing: {
                description: 'Track mastery of specific skills over time',
                parameters: {
                    initial_knowledge: 0.5,
                    learning_rate: 0.3,
                    forgetting_rate: 0.1,
                    guessing_probability: 0.25
                }
            },
            zone_of_proximal_development: {
                description: 'Target questions in the optimal challenge zone',
                calculation: 'current_ability + (challenge_factor * learning_potential)'
            }
        };
    }

    // Initialize adaptive algorithms
    initializeAdaptiveAlgorithms() {
        return {
            item_response_theory: {
                parameters: ['difficulty', 'discrimination', 'guessing'],
                ability_estimation: 'maximum_likelihood'
            },
            computerized_adaptive_testing: {
                stopping_criteria: ['standard_error_threshold', 'maximum_items', 'minimum_items'],
                item_selection: 'maximum_information'
            },
            bayesian_knowledge_tracing: {
                parameters: ['prior_knowledge', 'learning_probability', 'slip_probability', 'guess_probability'],
                update_rule: 'bayes_theorem'
            }
        };
    }

    // Initialize feedback templates
    initializeFeedbackTemplates() {
        return {
            immediate: {
                correct: [
                    'Excellent! You got it right.',
                    'Perfect! Well done.',
                    'Great job! That\'s correct.',
                    'Wonderful! You understand this concept well.'
                ],
                incorrect: [
                    'Not quite right. Let\'s try a different approach.',
                    'Close, but not exactly. Here\'s a hint:',
                    'That\'s a good attempt. Let me help you understand:',
                    'I can see your thinking. Here\'s what to consider:'
                ]
            },
            detailed: {
                correct: [
                    'Excellent work! You demonstrated {skill} very well. This shows you understand {concept}.',
                    'Perfect! Your approach using {method} was exactly right for this type of problem.',
                    'Outstanding! You\'ve mastered this {topic} concept. Ready for the next challenge?'
                ],
                incorrect: [
                    'I can see you tried {approach}, which shows good thinking. However, for {concept}, we need to {correct_method}.',
                    'That\'s a common mistake with {topic}. The key thing to remember is {key_point}. Let\'s practice this.',
                    'Your answer suggests you might need to review {prerequisite}. Let\'s work on that together.'
                ]
            },
            encouraging: [
                'Keep going! Every mistake is a learning opportunity.',
                'You\'re making great progress. Learning takes time.',
                'Don\'t worry about getting it wrong. That\'s how we learn!',
                'I\'m proud of your effort. Let\'s keep working together.'
            ]
        };
    }

    // Generate diagnostic assessment for a student
    async generateDiagnosticAssessment(studentProfile, subject, topics = null) {
        try {
            const assessment = {
                id: this.generateAssessmentId(),
                type: 'diagnostic',
                student: studentProfile,
                subject: subject,
                topics: topics || this.getDefaultTopicsForClass(subject, studentProfile.class),
                questions: [],
                metadata: {
                    created: new Date(),
                    adaptiveLevel: 'high',
                    estimatedDuration: 15
                }
            };

            // Select initial questions based on student's class and estimated ability
            const initialQuestions = await this.selectInitialQuestions(studentProfile, subject, topics);
            assessment.questions = initialQuestions;

            // Store assessment
            this.assessmentHistory.set(assessment.id, {
                ...assessment,
                responses: [],
                currentQuestionIndex: 0,
                abilityEstimate: 0.5,
                knowledgeState: {}
            });

            return assessment;

        } catch (error) {
            console.error('Error generating diagnostic assessment:', error);
            throw error;
        }
    }

    // Select initial questions for assessment
    async selectInitialQuestions(studentProfile, subject, topics) {
        const questions = [];
        let questionBank = this.questionBanks[subject]?.[studentProfile.class];
        
        // If no specific question bank exists, create generic questions
        if (!questionBank) {
            console.warn(`No question bank found for ${subject} class ${studentProfile.class}, generating generic questions`);
            questionBank = this.createGenericQuestionBank(subject, studentProfile.class);
        }

        // Start with medium difficulty questions for each topic
        for (const topic of topics) {
            const topicQuestions = questionBank[topic];
            if (topicQuestions) {
                // Select one question from each difficulty level for comprehensive assessment
                const difficulties = ['beginner', 'intermediate'];
                for (const difficulty of difficulties) {
                    const questionsAtLevel = topicQuestions[difficulty];
                    if (questionsAtLevel && questionsAtLevel.length > 0) {
                        const randomQuestion = questionsAtLevel[Math.floor(Math.random() * questionsAtLevel.length)];
                        questions.push({
                            ...randomQuestion,
                            topic: topic,
                            difficulty: difficulty,
                            id: this.generateQuestionId()
                        });
                    }
                }
            } else {
                // Generate a generic question for this topic
                const genericQuestion = this.generateGenericQuestionForTopic(topic, 'beginner');
                if (genericQuestion) {
                    questions.push({
                        ...genericQuestion,
                        topic: topic,
                        difficulty: 'beginner',
                        id: this.generateQuestionId()
                    });
                }
            }
        }

        // If we don't have enough questions, add generic ones
        if (questions.length < 5) {
            const additionalQuestions = this.generateGenericQuestions(studentProfile, subject, topics);
            questions.push(...additionalQuestions.slice(0, 5 - questions.length));
        }

        // Shuffle questions for variety
        return this.shuffleArray(questions).slice(0, 10);
    }

    // Generate generic questions when specific ones aren't available
    generateGenericQuestions(studentProfile, subject, topics) {
        const genericQuestions = [
            {
                type: 'multiple_choice',
                question: `What is your current level of understanding in ${subject}?`,
                options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
                correct: 1,
                explanation: 'This helps us understand your starting point.',
                skills: ['self_assessment']
            },
            {
                type: 'multiple_choice',
                question: `How comfortable are you with ${subject} concepts?`,
                options: ['Not comfortable', 'Somewhat comfortable', 'Very comfortable', 'Expert level'],
                correct: 1,
                explanation: 'Your comfort level helps us personalize your learning.',
                skills: ['confidence_assessment']
            },
            {
                type: 'multiple_choice',
                question: `What type of explanations help you learn best?`,
                options: ['Step-by-step written', 'Visual diagrams', 'Verbal explanations', 'Practice problems'],
                correct: 0,
                explanation: 'Understanding your learning style helps us teach better.',
                skills: ['learning_style_assessment']
            },
            {
                type: 'true_false',
                question: `Do you enjoy learning ${subject}?`,
                correct: true,
                explanation: 'Your interest level affects how we approach teaching.',
                skills: ['motivation_assessment']
            },
            {
                type: 'fill_blank',
                question: `I learn best when lessons are _____ (easy/medium/challenging)`,
                correct: 'medium',
                explanation: 'The right difficulty level keeps you engaged and learning.',
                skills: ['difficulty_preference']
            }
        ];

        return genericQuestions.map(q => ({
            ...q,
            topic: topics[0] || 'General',
            id: this.generateQuestionId()
        }));
    }

    // Generate a generic question for a specific topic
    generateGenericQuestionForTopic(topic, difficulty) {
        const genericQuestionTemplates = {
            'Basic Learning': {
                type: 'multiple_choice',
                question: `How would you rate your understanding of ${topic}?`,
                options: ['Poor', 'Fair', 'Good', 'Excellent'],
                correct: 2,
                explanation: 'This helps us understand your current level.',
                skills: ['topic_assessment']
            },
            'Simple Concepts': {
                type: 'true_false',
                question: `Are you familiar with the basic concepts of ${topic}?`,
                correct: true,
                explanation: 'Knowing your familiarity helps us start at the right level.',
                skills: ['familiarity_assessment']
            }
        };

        // Try to find a specific template, or use a default
        const template = genericQuestionTemplates[topic] || {
            type: 'multiple_choice',
            question: `What is your experience with ${topic}?`,
            options: ['No experience', 'Some experience', 'Good experience', 'Expert'],
            correct: 1,
            explanation: 'This helps us understand your background.',
            skills: ['experience_assessment']
        };

        return template;
    }

    // Process student response and adapt assessment
    async processResponse(assessmentId, questionId, response) {
        const assessment = this.assessmentHistory.get(assessmentId);
        if (!assessment) {
            throw new Error('Assessment not found');
        }

        const currentQuestion = assessment.questions.find(q => q.id === questionId);
        if (!currentQuestion) {
            throw new Error('Question not found');
        }

        // Evaluate response
        const evaluation = this.evaluateResponse(currentQuestion, response);
        
        // Record response
        assessment.responses.push({
            questionId: questionId,
            response: response,
            correct: evaluation.correct,
            timeSpent: evaluation.timeSpent || 30,
            timestamp: new Date()
        });

        // Update ability estimate
        assessment.abilityEstimate = this.updateAbilityEstimate(
            assessment.abilityEstimate,
            evaluation.correct,
            currentQuestion.difficulty
        );

        // Update knowledge state
        this.updateKnowledgeState(assessment, currentQuestion, evaluation.correct);

        // Generate feedback
        const feedback = this.generateFeedback(currentQuestion, evaluation);

        // Determine next question (adaptive)
        let nextQuestion = null;
        if (assessment.responses.length < 10) { // Continue until 10 questions
            nextQuestion = await this.selectNextAdaptiveQuestion(assessment);
            if (nextQuestion) {
                assessment.questions.push(nextQuestion);
            }
        }

        // Update assessment
        this.assessmentHistory.set(assessmentId, assessment);

        return {
            feedback: feedback,
            nextQuestion: nextQuestion,
            progress: {
                completed: assessment.responses.length,
                total: assessment.questions.length,
                abilityEstimate: assessment.abilityEstimate
            },
            isComplete: !nextQuestion
        };
    }

    // Evaluate student response
    evaluateResponse(question, response) {
        let correct = false;
        let partialCredit = 0;

        switch (question.type) {
            case 'multiple_choice':
                correct = parseInt(response) === question.correct;
                break;
            case 'true_false':
                correct = (response === 'true') === question.correct;
                break;
            case 'fill_blank':
                const normalizedResponse = response.toString().toLowerCase().trim();
                const normalizedCorrect = question.correct.toString().toLowerCase().trim();
                correct = normalizedResponse === normalizedCorrect;
                break;
            case 'calculation':
                const numericResponse = parseFloat(response);
                const numericCorrect = parseFloat(question.correct);
                correct = Math.abs(numericResponse - numericCorrect) < 0.01;
                break;
            case 'short_answer':
                // For short answers, use keyword matching or similarity
                correct = this.evaluateShortAnswer(response, question.correct);
                break;
        }

        return {
            correct: correct,
            partialCredit: partialCredit,
            confidence: correct ? 0.9 : 0.1
        };
    }

    // Evaluate short answer responses
    evaluateShortAnswer(response, correctAnswer) {
        const responseWords = response.toLowerCase().split(/\s+/);
        const correctWords = correctAnswer.toLowerCase().split(/\s+/);
        
        const matchingWords = responseWords.filter(word => 
            correctWords.some(correctWord => 
                correctWord.includes(word) || word.includes(correctWord)
            )
        );

        return matchingWords.length >= Math.ceil(correctWords.length * 0.7);
    }

    // Update ability estimate using simple IRT model
    updateAbilityEstimate(currentEstimate, correct, difficulty) {
        const difficultyValue = { beginner: -1, intermediate: 0, advanced: 1 }[difficulty] || 0;
        const learningRate = 0.3;
        
        if (correct) {
            return Math.min(currentEstimate + learningRate * (1 - currentEstimate), 1);
        } else {
            return Math.max(currentEstimate - learningRate * currentEstimate, 0);
        }
    }

    // Update knowledge state for specific skills
    updateKnowledgeState(assessment, question, correct) {
        if (!assessment.knowledgeState) {
            assessment.knowledgeState = {};
        }

        question.skills.forEach(skill => {
            if (!assessment.knowledgeState[skill]) {
                assessment.knowledgeState[skill] = {
                    mastery: 0.5,
                    attempts: 0,
                    correct: 0
                };
            }

            const skillState = assessment.knowledgeState[skill];
            skillState.attempts++;
            if (correct) {
                skillState.correct++;
            }

            // Update mastery using Bayesian Knowledge Tracing
            const correctRate = skillState.correct / skillState.attempts;
            const priorWeight = 0.3;
            skillState.mastery = (priorWeight * skillState.mastery) + ((1 - priorWeight) * correctRate);
        });
    }

    // Generate feedback for student response
    generateFeedback(question, evaluation) {
        const feedbackType = evaluation.correct ? 'correct' : 'incorrect';
        const templates = this.feedbackTemplates.immediate[feedbackType];
        const template = templates[Math.floor(Math.random() * templates.length)];

        let feedback = {
            immediate: template,
            explanation: question.explanation,
            correct: evaluation.correct,
            encouragement: null
        };

        // Add encouragement for struggling students
        if (!evaluation.correct) {
            const encouragements = this.feedbackTemplates.encouraging;
            feedback.encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        }

        return feedback;
    }

    // Select next adaptive question
    async selectNextAdaptiveQuestion(assessment) {
        const studentProfile = assessment.student;
        const subject = assessment.subject;
        const abilityEstimate = assessment.abilityEstimate;
        
        // Determine optimal difficulty based on ability
        let targetDifficulty;
        if (abilityEstimate < 0.3) {
            targetDifficulty = 'beginner';
        } else if (abilityEstimate < 0.7) {
            targetDifficulty = 'intermediate';
        } else {
            targetDifficulty = 'advanced';
        }

        // Find topics that need more assessment
        const weakTopics = this.identifyWeakTopics(assessment);
        const questionBank = this.questionBanks[subject]?.[studentProfile.class];

        if (!questionBank) return null;

        // Select question from weak topics first, then from target difficulty
        for (const topic of weakTopics) {
            const topicQuestions = questionBank[topic]?.[targetDifficulty];
            if (topicQuestions && topicQuestions.length > 0) {
                // Avoid repeating questions
                const usedQuestions = assessment.questions.map(q => q.question);
                const availableQuestions = topicQuestions.filter(q => !usedQuestions.includes(q.question));
                
                if (availableQuestions.length > 0) {
                    const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
                    return {
                        ...selectedQuestion,
                        topic: topic,
                        difficulty: targetDifficulty,
                        id: this.generateQuestionId()
                    };
                }
            }
        }

        return null;
    }

    // Identify topics where student is struggling
    identifyWeakTopics(assessment) {
        const topicPerformance = {};
        
        assessment.responses.forEach((response, index) => {
            const question = assessment.questions[index];
            if (!topicPerformance[question.topic]) {
                topicPerformance[question.topic] = { correct: 0, total: 0 };
            }
            topicPerformance[question.topic].total++;
            if (response.correct) {
                topicPerformance[question.topic].correct++;
            }
        });

        // Sort topics by performance (weakest first)
        return Object.keys(topicPerformance)
            .sort((a, b) => {
                const performanceA = topicPerformance[a].correct / topicPerformance[a].total;
                const performanceB = topicPerformance[b].correct / topicPerformance[b].total;
                return performanceA - performanceB;
            });
    }

    // Generate comprehensive assessment report
    generateAssessmentReport(assessmentId) {
        const assessment = this.assessmentHistory.get(assessmentId);
        if (!assessment) {
            throw new Error('Assessment not found');
        }

        const totalQuestions = assessment.responses.length;
        const correctAnswers = assessment.responses.filter(r => r.correct).length;
        const accuracy = correctAnswers / totalQuestions;

        // Analyze performance by topic
        const topicAnalysis = this.analyzeTopicPerformance(assessment);
        
        // Analyze performance by skill
        const skillAnalysis = this.analyzeSkillPerformance(assessment);

        // Generate recommendations
        const recommendations = this.generateLearningRecommendations(assessment);

        return {
            overview: {
                totalQuestions: totalQuestions,
                correctAnswers: correctAnswers,
                accuracy: accuracy,
                abilityEstimate: assessment.abilityEstimate,
                timeSpent: assessment.responses.reduce((sum, r) => sum + (r.timeSpent || 30), 0)
            },
            topicAnalysis: topicAnalysis,
            skillAnalysis: skillAnalysis,
            recommendations: recommendations,
            nextSteps: this.generateNextSteps(assessment),
            strengthAreas: this.identifyStrengths(assessment),
            improvementAreas: this.identifyWeakTopics(assessment)
        };
    }

    // Analyze performance by topic
    analyzeTopicPerformance(assessment) {
        const topicStats = {};
        
        assessment.responses.forEach((response, index) => {
            const question = assessment.questions[index];
            if (!topicStats[question.topic]) {
                topicStats[question.topic] = {
                    total: 0,
                    correct: 0,
                    averageTime: 0,
                    difficulty: []
                };
            }
            
            const stats = topicStats[question.topic];
            stats.total++;
            if (response.correct) stats.correct++;
            stats.averageTime += response.timeSpent || 30;
            stats.difficulty.push(question.difficulty);
        });

        // Calculate averages and mastery levels
        Object.keys(topicStats).forEach(topic => {
            const stats = topicStats[topic];
            stats.accuracy = stats.correct / stats.total;
            stats.averageTime = stats.averageTime / stats.total;
            stats.masteryLevel = this.calculateMasteryLevel(stats.accuracy, stats.difficulty);
        });

        return topicStats;
    }

    // Analyze performance by skill
    analyzeSkillPerformance(assessment) {
        const skillStats = {};
        
        assessment.responses.forEach((response, index) => {
            const question = assessment.questions[index];
            question.skills.forEach(skill => {
                if (!skillStats[skill]) {
                    skillStats[skill] = { total: 0, correct: 0 };
                }
                skillStats[skill].total++;
                if (response.correct) skillStats[skill].correct++;
            });
        });

        Object.keys(skillStats).forEach(skill => {
            skillStats[skill].mastery = skillStats[skill].correct / skillStats[skill].total;
        });

        return skillStats;
    }

    // Calculate mastery level
    calculateMasteryLevel(accuracy, difficultyLevels) {
        const avgDifficulty = difficultyLevels.reduce((sum, diff) => {
            const values = { beginner: 1, intermediate: 2, advanced: 3 };
            return sum + values[diff];
        }, 0) / difficultyLevels.length;

        if (accuracy >= 0.8 && avgDifficulty >= 2) return 'mastered';
        if (accuracy >= 0.7) return 'proficient';
        if (accuracy >= 0.5) return 'developing';
        return 'needs_support';
    }

    // Generate learning recommendations
    generateLearningRecommendations(assessment) {
        const recommendations = [];
        const topicAnalysis = this.analyzeTopicPerformance(assessment);

        Object.keys(topicAnalysis).forEach(topic => {
            const stats = topicAnalysis[topic];
            if (stats.accuracy < 0.6) {
                recommendations.push({
                    type: 'remediation',
                    topic: topic,
                    priority: 'high',
                    suggestion: `Focus on building foundational understanding in ${topic}`,
                    activities: ['review_basics', 'guided_practice', 'concept_explanation']
                });
            } else if (stats.accuracy > 0.85) {
                recommendations.push({
                    type: 'enrichment',
                    topic: topic,
                    priority: 'medium',
                    suggestion: `Ready for advanced topics in ${topic}`,
                    activities: ['challenging_problems', 'application_exercises', 'independent_exploration']
                });
            }
        });

        return recommendations;
    }

    // Generate next steps
    generateNextSteps(assessment) {
        const accuracy = assessment.responses.filter(r => r.correct).length / assessment.responses.length;
        
        if (accuracy < 0.5) {
            return [
                'Review fundamental concepts',
                'Work with additional support',
                'Practice with guided examples',
                'Focus on building confidence'
            ];
        } else if (accuracy < 0.7) {
            return [
                'Continue practicing current level',
                'Work on identified weak areas',
                'Gradually increase difficulty',
                'Regular progress monitoring'
            ];
        } else {
            return [
                'Advance to next difficulty level',
                'Explore related topics',
                'Take on leadership roles',
                'Pursue independent projects'
            ];
        }
    }

    // Identify strength areas
    identifyStrengths(assessment) {
        const topicAnalysis = this.analyzeTopicPerformance(assessment);
        return Object.keys(topicAnalysis)
            .filter(topic => topicAnalysis[topic].accuracy >= 0.75)
            .sort((a, b) => topicAnalysis[b].accuracy - topicAnalysis[a].accuracy);
    }

    // Utility functions
    generateAssessmentId() {
        return 'assess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateQuestionId() {
        return 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    getDefaultTopicsForClass(subject, className) {
        // Normalize class name (handle both 'class1' and '1' formats)
        const normalizedClass = className.includes('class') ? className : `class${className}`;
        
        const defaults = {
            Math: {
                'class1': ['Number Recognition', 'Basic Addition', 'Basic Subtraction'],
                'class2': ['Number Recognition', 'Basic Addition', 'Basic Subtraction'],
                'class3': ['Number Recognition', 'Basic Addition', 'Basic Subtraction'],
                'class4': ['Number Recognition', 'Basic Addition', 'Multiplication'],
                'class5': ['Number Recognition', 'Basic Addition', 'Multiplication'],
                'class6': ['Integers', 'Fractions and Decimals', 'Data Handling'],
                'class7': ['Integers', 'Fractions and Decimals', 'Data Handling'],
                'class8': ['Integers', 'Fractions and Decimals', 'Data Handling'],
                'class9': ['Integers', 'Fractions and Decimals', 'Data Handling'],
                'class10': ['Integers', 'Fractions and Decimals', 'Data Handling']
            },
            Science: {
                'class1': ['Living and Non-living', 'Plant Life', 'Human Body'],
                'class2': ['Living and Non-living', 'Plant Life', 'Human Body'],
                'class3': ['Living and Non-living', 'Plant Life', 'Human Body'],
                'class4': ['Living and Non-living', 'Plant Life', 'Human Body'],
                'class5': ['Living and Non-living', 'Plant Life', 'Human Body'],
                'class6': ['Living and Non-living', 'Plant Life', 'Human Body'],
                'class7': ['Living and Non-living', 'Plant Life', 'Human Body'],
                'class8': ['Living and Non-living', 'Plant Life', 'Human Body'],
                'class9': ['Living and Non-living', 'Plant Life', 'Human Body'],
                'class10': ['Living and Non-living', 'Plant Life', 'Human Body']
            },
            English: {
                'class1': ['Letter Recognition', 'Simple Words', 'Basic Sentences'],
                'class2': ['Letter Recognition', 'Simple Words', 'Basic Sentences'],
                'class3': ['Letter Recognition', 'Simple Words', 'Basic Sentences'],
                'class4': ['Letter Recognition', 'Simple Words', 'Basic Sentences'],
                'class5': ['Letter Recognition', 'Simple Words', 'Basic Sentences'],
                'class6': ['Letter Recognition', 'Simple Words', 'Basic Sentences'],
                'class7': ['Letter Recognition', 'Simple Words', 'Basic Sentences'],
                'class8': ['Letter Recognition', 'Simple Words', 'Basic Sentences'],
                'class9': ['Letter Recognition', 'Simple Words', 'Basic Sentences'],
                'class10': ['Letter Recognition', 'Simple Words', 'Basic Sentences']
            },
            Hindi: {
                'class1': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य'],
                'class2': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य'],
                'class3': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य'],
                'class4': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य'],
                'class5': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य'],
                'class6': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य'],
                'class7': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य'],
                'class8': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य'],
                'class9': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य'],
                'class10': ['वर्ण पहचान', 'सरल शब्द', 'बुनियादी वाक्य']
            },
            General: {
                'class1': ['Basic Learning', 'Simple Concepts'],
                'class2': ['Basic Learning', 'Simple Concepts'],
                'class3': ['Basic Learning', 'Simple Concepts'],
                'class4': ['Basic Learning', 'Simple Concepts'],
                'class5': ['Basic Learning', 'Simple Concepts'],
                'class6': ['Basic Learning', 'Simple Concepts'],
                'class7': ['Basic Learning', 'Simple Concepts'],
                'class8': ['Basic Learning', 'Simple Concepts'],
                'class9': ['Basic Learning', 'Simple Concepts'],
                'class10': ['Basic Learning', 'Simple Concepts']
            }
        };
        
        console.log(`🔧 Getting topics for ${subject} ${normalizedClass}`);
        const topics = defaults[subject]?.[normalizedClass] || defaults['General']?.[normalizedClass] || ['Basic Learning'];
        console.log(`✅ Found topics:`, topics);
        return topics;
    }

    // Create generic question bank when specific one doesn't exist
    createGenericQuestionBank(subject, className) {
        console.log(`🔧 Creating generic question bank for ${subject} ${className}`);
        const topics = this.getDefaultTopicsForClass(subject, className);
        const questionBank = {};

        topics.forEach(topic => {
            questionBank[topic] = {
                beginner: [
                    {
                        type: 'multiple_choice',
                        question: `What is a basic concept related to ${topic}?`,
                        options: ['Basic understanding', 'Advanced concept', 'Complex theory', 'Simple idea'],
                        correct: 0,
                        explanation: `This question tests basic understanding of ${topic}.`,
                        skills: ['basic_understanding', 'concept_recognition']
                    },
                    {
                        type: 'true_false',
                        question: `${topic} is an important topic in ${subject}.`,
                        correct: true,
                        explanation: `Yes, ${topic} is indeed important for understanding ${subject}.`,
                        skills: ['topic_awareness', 'subject_knowledge']
                    }
                ],
                intermediate: [
                    {
                        type: 'fill_blank',
                        question: `Complete this statement about ${topic}: The main concept is ______.`,
                        correct: 'important',
                        explanation: `The main concept of ${topic} is important for your understanding.`,
                        skills: ['concept_application', 'knowledge_completion']
                    },
                    {
                        type: 'short_answer',
                        question: `Explain what you know about ${topic}.`,
                        correct: `${topic} is a fundamental concept in ${subject} that helps students understand basic principles.`,
                        explanation: `This tests your ability to explain concepts related to ${topic}.`,
                        skills: ['explanation_ability', 'conceptual_understanding']
                    }
                ],
                advanced: [
                    {
                        type: 'short_answer',
                        question: `How would you apply the concepts of ${topic} to solve a real-world problem?`,
                        correct: `The concepts of ${topic} can be applied by understanding the principles and using them in practical situations.`,
                        explanation: `This tests your ability to apply ${topic} concepts practically.`,
                        skills: ['application', 'problem_solving', 'critical_thinking']
                    }
                ]
            };
        });

        // Store the generated question bank for future use
        if (!this.questionBanks[subject]) {
            this.questionBanks[subject] = {};
        }
        this.questionBanks[subject][className] = questionBank;

        console.log(`✅ Generated generic question bank for ${subject} ${className} with ${topics.length} topics`);
        return questionBank;
    }
}

// Export for global use
window.DiagnosticAssessmentSystem = DiagnosticAssessmentSystem;

// Initialize the diagnostic assessment system
window.diagnosticAssessmentSystem = new DiagnosticAssessmentSystem();

console.log('📊 Diagnostic Assessment System initialized');
