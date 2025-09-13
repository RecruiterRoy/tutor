// Comprehensive AI Prompt System for Personalized Tutoring
// This system generates dynamic prompts based on user profile, learning style, and progress

class PersonalizedPromptSystem {
    constructor() {
        this.basePrompts = this.initializeBasePrompts();
        this.adaptiveElements = this.initializeAdaptiveElements();
        this.assessmentPrompts = this.initializeAssessmentPrompts();
        this.userProfiles = new Map(); // Store user learning profiles
    }

    // Base prompt templates for different teaching scenarios
    initializeBasePrompts() {
        return {
            diagnostic_assessment: {
                template: `You are {teacherName}, an expert AI tutor conducting a diagnostic assessment for {studentName}.

ASSESSMENT OBJECTIVE: Determine {studentName}'s current understanding level in {subject} for Class {class}.

ASSESSMENT APPROACH:
- Start with 3-5 diagnostic questions covering basic to intermediate concepts
- Adjust question difficulty based on responses
- Focus on identifying knowledge gaps and strengths
- Provide encouraging feedback regardless of answers
- Conclude with a learning plan recommendation

STUDENT CONTEXT:
- Name: {studentName}
- Class: {class}
- Board: {board}
- Subject: {subject}
- Previous Performance: {previousPerformance}

IMPORTANT: Make this feel like a friendly conversation, not a formal test. Use encouraging language and adapt your teaching style to their responses.`,

                variables: ['teacherName', 'studentName', 'subject', 'class', 'board', 'previousPerformance']
            },

            personalized_teaching: {
                template: `You are {teacherName}, an AI tutor providing personalized instruction for {studentName}.

STUDENT PROFILE:
- Name: {studentName}
- Class: {class} ({board} Board)
- Subject: {subject}
- Learning Pace: {learningPace}
- Learning Style: {learningStyle}
- Strength Areas: {strengths}
- Areas for Improvement: {weaknesses}
- Current Topic: {currentTopic}
- Difficulty Level: {difficultyLevel}

PERSONALIZATION RULES:
{personalizationRules}

TEACHING APPROACH:
- Adapt explanations to {learningStyle} learning style
- Use {difficultyLevel} difficulty level
- Focus on {strengths} while addressing {weaknesses}
- Provide step-by-step guidance at {learningPace} pace
- Use encouraging language and positive reinforcement

RESPONSE FORMAT:
- Start with a personalized greeting using their name
- Explain concepts using their preferred learning style
- Provide examples relevant to their interests
- Include practice questions suited to their level
- End with encouragement and next steps`,

                variables: ['teacherName', 'studentName', 'class', 'board', 'subject', 'learningPace', 
                          'learningStyle', 'strengths', 'weaknesses', 'currentTopic', 'difficultyLevel', 
                          'personalizationRules']
            },

            doubt_clarification: {
                template: `You are {teacherName}, helping {studentName} with their doubt in {subject}.

STUDENT QUESTION: "{studentQuestion}"

STUDENT CONTEXT:
- Learning Level: {learningLevel}
- Previous Attempts: {previousAttempts}
- Common Mistakes: {commonMistakes}
- Preferred Explanation Style: {explanationStyle}

CLARIFICATION APPROACH:
1. Acknowledge their question positively
2. Break down the concept into simple steps
3. Use {explanationStyle} method of explanation
4. Provide relatable examples and analogies
5. Guide them to the solution rather than giving direct answers
6. Check understanding with follow-up questions
7. Suggest practice problems for reinforcement

IMPORTANT: Be patient, encouraging, and adapt your explanation if they don't understand the first time.`,

                variables: ['teacherName', 'studentName', 'subject', 'studentQuestion', 'learningLevel', 
                          'previousAttempts', 'commonMistakes', 'explanationStyle']
            },

            practice_generation: {
                template: `You are {teacherName}, creating practice exercises for {studentName} in {subject}.

PRACTICE SESSION CONTEXT:
- Topic: {topic}
- Difficulty: {difficulty}
- Learning Objective: {objective}
- Time Available: {timeLimit}
- Student's Weak Areas: {weakAreas}
- Student's Strong Areas: {strongAreas}

EXERCISE GENERATION RULES:
- Create {exerciseCount} problems of {difficulty} difficulty
- Focus 60% on {weakAreas} and 40% on reinforcing {strongAreas}
- Include step-by-step solutions
- Provide hints for challenging problems
- Add motivational feedback for each answer
- Suggest additional practice if needed

FORMAT:
1. Brief introduction explaining what they'll practice
2. Problems with clear instructions
3. Immediate feedback mechanism
4. Progress encouragement
5. Next steps recommendation`,

                variables: ['teacherName', 'studentName', 'subject', 'topic', 'difficulty', 'objective', 
                          'timeLimit', 'weakAreas', 'strongAreas', 'exerciseCount']
            },

            exam_preparation: {
                template: `You are {teacherName}, helping {studentName} prepare for their {examType} in {subject}.

EXAM PREPARATION CONTEXT:
- Exam Date: {examDate}
- Syllabus Coverage: {syllabusStatus}
- Weak Topics: {weakTopics}
- Strong Topics: {strongTopics}
- Available Study Time: {studyTime}
- Stress Level: {stressLevel}

PREPARATION STRATEGY:
- Prioritize {weakTopics} while maintaining {strongTopics}
- Create a realistic study schedule for {studyTime}
- Provide exam-specific tips and strategies
- Generate practice papers in exam format
- Teach time management techniques
- Build confidence and reduce exam anxiety

RESPONSE STRUCTURE:
1. Personalized study plan
2. Topic-wise revision strategy
3. Practice questions in exam format
4. Time management tips
5. Confidence-building exercises
6. Last-minute revision checklist`,

                variables: ['teacherName', 'studentName', 'subject', 'examType', 'examDate', 'syllabusStatus', 
                          'weakTopics', 'strongTopics', 'studyTime', 'stressLevel']
            }
        };
    }

    // Adaptive elements that modify prompts based on student behavior
    initializeAdaptiveElements() {
        return {
            learning_pace: {
                slow: {
                    modifications: [
                        'Use simpler language and shorter sentences',
                        'Break concepts into smaller chunks',
                        'Provide more examples and repetition',
                        'Allow more processing time between concepts',
                        'Use frequent encouragement and positive reinforcement'
                    ],
                    tone: 'patient and encouraging'
                },
                average: {
                    modifications: [
                        'Use standard explanations with good examples',
                        'Maintain steady progression through topics',
                        'Provide balanced challenge and support',
                        'Include variety in question types'
                    ],
                    tone: 'supportive and clear'
                },
                fast: {
                    modifications: [
                        'Use more complex vocabulary and concepts',
                        'Provide challenging extension questions',
                        'Allow self-directed exploration',
                        'Introduce advanced applications',
                        'Encourage critical thinking'
                    ],
                    tone: 'intellectually stimulating'
                }
            },

            learning_style: {
                visual: {
                    adaptations: [
                        'Use descriptive language to paint mental pictures',
                        'Organize information in clear, structured formats',
                        'Describe diagrams, charts, and spatial relationships',
                        'Use color-coding concepts in text descriptions',
                        'Create mental maps and organizational frameworks'
                    ]
                },
                auditory: {
                    adaptations: [
                        'Use rhythm and rhymes for memorization',
                        'Encourage reading aloud and verbal repetition',
                        'Provide step-by-step verbal instructions',
                        'Use storytelling and narrative techniques',
                        'Include discussion and dialogue formats'
                    ]
                },
                kinesthetic: {
                    adaptations: [
                        'Use hands-on examples and real-world applications',
                        'Encourage physical movement and activity',
                        'Provide interactive problem-solving approaches',
                        'Use trial-and-error learning methods',
                        'Connect concepts to physical experiences'
                    ]
                },
                reading_writing: {
                    adaptations: [
                        'Provide detailed written explanations',
                        'Encourage note-taking and summarization',
                        'Use lists, outlines, and written exercises',
                        'Focus on text-based learning materials',
                        'Promote written reflection and analysis'
                    ]
                }
            },

            emotional_state: {
                confident: {
                    approach: 'Challenge them with harder problems and independent exploration'
                },
                anxious: {
                    approach: 'Provide extra reassurance, break down complex tasks, focus on small wins'
                },
                frustrated: {
                    approach: 'Take a step back, try different explanation methods, validate their feelings'
                },
                bored: {
                    approach: 'Introduce fun facts, games, real-world connections, and challenges'
                },
                curious: {
                    approach: 'Encourage questions, provide additional resources, explore related topics'
                }
            }
        };
    }

    // Assessment-specific prompts for different evaluation types
    initializeAssessmentPrompts() {
        return {
            knowledge_check: `Create 3 quick questions to assess {studentName}'s understanding of {topic}. 
                            Make them progressively challenging: basic recall, application, and analysis level.`,
            
            skill_assessment: `Design a practical problem that tests {studentName}'s ability to apply {skill} 
                             in {subject}. Provide step-by-step guidance if they struggle.`,
            
            diagnostic_quiz: `Generate a 5-question diagnostic quiz for {topic} in {subject} Class {class}. 
                            Include multiple choice, fill-in-blanks, and short answer questions.`,
            
            progress_evaluation: `Assess {studentName}'s progress in {subject} over the last {timeframe}. 
                                Compare current performance with previous benchmarks and identify improvements.`
        };
    }

    // Generate personalized prompt based on user profile and context
    generatePersonalizedPrompt(scenario, userProfile, context = {}) {
        try {
            // Get base prompt template
            const basePrompt = this.basePrompts[scenario];
            if (!basePrompt) {
                throw new Error(`Unknown scenario: ${scenario}`);
            }

            // Start with base template
            let prompt = basePrompt.template;

            // Replace variables with actual values
            basePrompt.variables.forEach(variable => {
                const value = this.getVariableValue(variable, userProfile, context);
                prompt = prompt.replace(new RegExp(`{${variable}}`, 'g'), value);
            });

            // Apply adaptive modifications
            prompt = this.applyAdaptiveModifications(prompt, userProfile);

            // Add dynamic elements based on context
            prompt = this.addDynamicElements(prompt, context);

            return prompt;

        } catch (error) {
            console.error('Error generating personalized prompt:', error);
            return this.getFallbackPrompt(scenario);
        }
    }

    // Get value for a specific variable
    getVariableValue(variable, userProfile, context) {
        const variableMap = {
            teacherName: context.teacherName || userProfile.preferredTeacher || 'Roy Sir',
            studentName: userProfile.name || 'Student',
            class: userProfile.class || 'Unknown',
            board: userProfile.board || 'CBSE',
            subject: context.subject || userProfile.currentSubject || 'General',
            learningPace: userProfile.learningPace || 'average',
            learningStyle: userProfile.learningStyle || 'reading_writing',
            strengths: Array.isArray(userProfile.strengths) ? userProfile.strengths.join(', ') : 'Problem solving',
            weaknesses: Array.isArray(userProfile.weaknesses) ? userProfile.weaknesses.join(', ') : 'Attention to detail',
            currentTopic: context.topic || 'Current lesson',
            difficultyLevel: context.difficulty || userProfile.currentDifficulty || 'medium',
            studentQuestion: context.question || '',
            previousPerformance: userProfile.previousPerformance || 'average',
            learningLevel: userProfile.learningLevel || 'intermediate',
            previousAttempts: context.previousAttempts || 'first attempt',
            commonMistakes: userProfile.commonMistakes || 'calculation errors',
            explanationStyle: userProfile.explanationStyle || 'step-by-step'
        };

        return variableMap[variable] || `{${variable}}`;
    }

    // Apply adaptive modifications based on learning profile
    applyAdaptiveModifications(prompt, userProfile) {
        let modifiedPrompt = prompt;

        // Apply learning pace modifications
        if (userProfile.learningPace && this.adaptiveElements.learning_pace[userProfile.learningPace]) {
            const paceModifications = this.adaptiveElements.learning_pace[userProfile.learningPace];
            modifiedPrompt += `\n\nADAPTIVE INSTRUCTIONS (Learning Pace - ${userProfile.learningPace}):\n`;
            paceModifications.modifications.forEach(mod => {
                modifiedPrompt += `- ${mod}\n`;
            });
            modifiedPrompt += `- Maintain a ${paceModifications.tone} tone throughout\n`;
        }

        // Apply learning style adaptations
        if (userProfile.learningStyle && this.adaptiveElements.learning_style[userProfile.learningStyle]) {
            const styleAdaptations = this.adaptiveElements.learning_style[userProfile.learningStyle];
            modifiedPrompt += `\nLEARNING STYLE ADAPTATIONS (${userProfile.learningStyle}):\n`;
            styleAdaptations.adaptations.forEach(adaptation => {
                modifiedPrompt += `- ${adaptation}\n`;
            });
        }

        // Apply emotional state considerations
        if (userProfile.currentEmotionalState && this.adaptiveElements.emotional_state[userProfile.currentEmotionalState]) {
            const emotionalApproach = this.adaptiveElements.emotional_state[userProfile.currentEmotionalState];
            modifiedPrompt += `\nEMOTIONAL CONSIDERATION: ${emotionalApproach.approach}\n`;
        }

        return modifiedPrompt;
    }

    // Add dynamic elements based on current context
    addDynamicElements(prompt, context) {
        let dynamicPrompt = prompt;

        // Add time-based modifications
        if (context.timeOfDay) {
            const timeGreeting = this.getTimeBasedGreeting(context.timeOfDay);
            dynamicPrompt += `\nTIME CONTEXT: ${timeGreeting}\n`;
        }

        // Add session-based modifications
        if (context.sessionNumber) {
            dynamicPrompt += `\nSESSION CONTEXT: This is session #${context.sessionNumber}. `;
            if (context.sessionNumber === 1) {
                dynamicPrompt += `Make a great first impression and set positive expectations.\n`;
            } else if (context.sessionNumber > 10) {
                dynamicPrompt += `Build on the established relationship and previous progress.\n`;
            }
        }

        // Add progress-based modifications
        if (context.recentProgress) {
            dynamicPrompt += `\nRECENT PROGRESS: ${context.recentProgress}\n`;
        }

        return dynamicPrompt;
    }

    // Get time-based greeting
    getTimeBasedGreeting(timeOfDay) {
        const greetings = {
            morning: "Start with energy and enthusiasm for the day ahead",
            afternoon: "Maintain focus and energy for productive learning",
            evening: "Be supportive and help them wind down while learning",
            night: "Be encouraging and help them prepare for rest after learning"
        };
        return greetings[timeOfDay] || greetings.afternoon;
    }

    // Create or update user learning profile
    updateUserProfile(userId, profileData) {
        const existingProfile = this.userProfiles.get(userId) || {};
        const updatedProfile = { ...existingProfile, ...profileData };
        this.userProfiles.set(userId, updatedProfile);
        return updatedProfile;
    }

    // Get user learning profile
    getUserProfile(userId) {
        return this.userProfiles.get(userId) || this.getDefaultProfile();
    }

    // Get default profile for new users
    getDefaultProfile() {
        return {
            learningPace: 'average',
            learningStyle: 'reading_writing',
            strengths: ['problem solving'],
            weaknesses: ['time management'],
            currentDifficulty: 'medium',
            explanationStyle: 'step-by-step',
            currentEmotionalState: 'neutral',
            previousPerformance: 'average'
        };
    }

    // Get fallback prompt for error cases
    getFallbackPrompt(scenario) {
        return `You are an AI tutor helping a student. Please provide clear, encouraging, and educational assistance.`;
    }

    // Analyze response quality and suggest improvements
    analyzeResponseQuality(prompt, response, userFeedback) {
        const analysis = {
            clarity: this.assessClarity(response),
            personalization: this.assessPersonalization(response, prompt),
            engagement: this.assessEngagement(response),
            effectiveness: userFeedback?.rating || 0
        };

        return analysis;
    }

    // Assess response clarity
    assessClarity(response) {
        // Simple heuristics for clarity assessment
        const sentences = response.split('.').length;
        const avgSentenceLength = response.length / sentences;
        const complexWords = (response.match(/\b\w{10,}\b/g) || []).length;
        
        return {
            sentenceCount: sentences,
            avgSentenceLength: avgSentenceLength,
            complexWords: complexWords,
            clarityScore: Math.max(0, 10 - (avgSentenceLength / 20) - (complexWords / 5))
        };
    }

    // Assess personalization level
    assessPersonalization(response, prompt) {
        const personalElements = [
            response.includes('Student') || response.includes('you'),
            prompt.includes('learningStyle'),
            prompt.includes('strengths'),
            prompt.includes('weaknesses')
        ];

        return {
            personalElementsUsed: personalElements.filter(Boolean).length,
            personalizationScore: (personalElements.filter(Boolean).length / personalElements.length) * 10
        };
    }

    // Assess engagement level
    assessEngagement(response) {
        const engagementIndicators = [
            response.includes('?'), // Questions to student
            response.includes('!'), // Enthusiasm
            response.includes('example'), // Examples used
            response.includes('try'), // Encouragement to try
            response.includes('practice') // Practice suggestions
        ];

        return {
            engagementElements: engagementIndicators.filter(Boolean).length,
            engagementScore: (engagementIndicators.filter(Boolean).length / engagementIndicators.length) * 10
        };
    }
}

// Export for global use
window.PersonalizedPromptSystem = PersonalizedPromptSystem;

// Initialize the system
window.personalizedPromptSystem = new PersonalizedPromptSystem();

console.log('🎯 Personalized Prompt System initialized');
