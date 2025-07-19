class TeacherBehavior {
    constructor(persona, lessonPlanner) {
        this.persona = persona;
        this.lessonPlanner = lessonPlanner;
        this.sessionTimer = 0;
        this.storyCount = 0;
        this.lastStoryTime = 0;
        this.currentEmotion = 'neutral';
        this.sessionStartTime = Date.now();
        this.conversationHistory = [];
        this.vedicTricksShown = new Set();
        this.dailyStoriesShown = new Set();
        this.currentSubject = null;
        this.performanceMetrics = {
            correct_answers: 0,
            total_questions: 0,
            confusion_indicators: 0,
            engagement_level: 5 // 1-10 scale
        };
    }

    getResponse(input, context = {}) {
        this.updateSessionTimer();
        this.analyzeInput(input);
        
        const response = this.generateResponse(input, context);
        this.updateConversationHistory(input, response);
        
        return {
            message: response.message,
            emotion: response.emotion,
            actions: response.actions,
            vedic_tip: response.vedic_tip,
            story: response.story,
            progress_update: response.progress_update
        };
    }

    generateResponse(input, context) {
        const responseData = {
            message: '',
            emotion: 'neutral',
            actions: [],
            vedic_tip: null,
            story: null,
            progress_update: null
        };

        // Determine response type based on input analysis
        const inputType = this.classifyInput(input);
        
        switch (inputType) {
            case 'math_question':
                responseData = this.handleMathQuestion(input, context);
                break;
            case 'concept_confusion':
                responseData = this.handleConceptConfusion(input, context);
                break;
            case 'progress_inquiry':
                responseData = this.handleProgressInquiry(input, context);
                break;
            case 'general_question':
                responseData = this.handleGeneralQuestion(input, context);
                break;
            case 'story_request':
                responseData = this.handleStoryRequest(input, context);
                break;
            default:
                responseData = this.handleDefault(input, context);
        }

        // Check for story time (after sufficient teaching time)
        if (this.checkForStoryTime() && !responseData.story) {
            responseData.story = this.selectAppropriateStory(context.currentSubject);
        }

        // Check for Vedic math opportunities
        if (this.shouldShowVedicTrick(input) && !responseData.vedic_tip) {
            responseData.vedic_tip = this.getRelevantVedicTrick(input);
        }

        // Update emotion based on performance
        responseData.emotion = this.determineEmotion();

        // Get lesson progress if available
        if (this.lessonPlanner && Math.random() < 0.3) { // 30% chance
            responseData.progress_update = this.lessonPlanner.getProgressUpdate();
        }

        return responseData;
    }

    handleMathQuestion(input, context) {
        const response = {
            message: '',
            emotion: 'focused',
            actions: ['show_solution_steps'],
            vedic_tip: null,
            story: null,
            progress_update: null
        };

        // Generate solution with persona-specific approach
        const solution = this.generateMathSolution(input);
        
        if (this.persona.name === 'Roy Sir') {
            response.message = `Let me solve this step by step. ${solution.explanation}`;
            
            // Roy Sir is more likely to show Vedic tricks
            if (Math.random() < 0.7 && this.shouldShowVedicTrick(input)) {
                response.vedic_tip = this.getRelevantVedicTrick(input);
                if (response.vedic_tip) {
                    response.message += ` Here's a Vedic math trick that can make this faster!`;
                }
            }
        } else {
            response.message = `Chalo beta, ise step by step karte hain. ${solution.explanation}`;
            
            // Miss Sapna shows Vedic tricks less frequently but more encouragingly
            if (Math.random() < 0.4 && this.shouldShowVedicTrick(input)) {
                response.vedic_tip = this.getRelevantVedicTrick(input);
                if (response.vedic_tip) {
                    response.message += " Dekho, kitna easy ho gaya ye Vedic trick se!";
                }
            }
        }

        this.performanceMetrics.total_questions++;
        
        return response;
    }

    handleStoryRequest(input, context) {
        const response = {
            message: '',
            emotion: 'storytelling',
            actions: ['start_story_mode'],
            vedic_tip: null,
            story: null,
            progress_update: null
        };

        // Get appropriate story
        const story = this.selectAppropriateStory(context.currentSubject);
        
        if (story) {
            if (this.persona.name === 'Roy Sir') {
                response.message = "Let me share an inspiring story that connects to what we're learning.";
            } else {
                response.message = "Chalo beta, ek interesting story sunate hain jo hamare lesson se related hai.";
            }
            response.story = story;
            this.storyCount++;
            this.lastStoryTime = this.sessionTimer;
        } else {
            response.message = this.persona.name === 'Roy Sir' 
                ? "I'd love to share a story, but let's focus on your studies first."
                : "Story sunane ka mann hai, lekin pehle thoda aur padh lete hain.";
        }

        return response;
    }

    handleConceptConfusion(input, context) {
        this.performanceMetrics.confusion_indicators++;
        const response = {
            message: '',
            emotion: 'patient',
            actions: ['simplify_explanation', 'show_examples'],
            vedic_tip: null,
            story: null,
            progress_update: null
        };

        const behavior = this.persona.behavior_triggers?.confusion || 'patient_explanation';
        
        if (this.persona.name === 'Roy Sir') {
            if (behavior === 'step_by_step_explanation') {
                response.message = "I can see this is challenging. Let me break it down into smaller, easier steps for you.";
                response.actions.push('step_by_step_mode');
            }
        } else {
            if (behavior === 'patient_explanation') {
                response.message = "Koi baat nahi beta, confusion normal hai. Hum slowly-slowly samjhayenge. Don't worry!";
                response.emotion = 'encouraging';
            }
        }

        // Offer a related story to make concept clearer
        if (Math.random() < 0.6) {
            const story = this.selectStoryForConcept(context.currentSubject);
            if (story) {
                response.story = story;
                response.message += this.persona.name === 'Roy Sir' 
                    ? " Let me tell you a story that might help clarify this concept."
                    : " Ek story se samjhaata hun, phir clear ho jayega.";
            }
        }

        return response;
    }

    handleProgressInquiry(input, context) {
        const progressData = this.lessonPlanner?.getProgressUpdate() || this.generateFallbackProgress();
        const response = {
            message: this.generateProgressMessage(progressData),
            emotion: 'informative',
            actions: ['show_progress_chart'],
            vedic_tip: null,
            story: null,
            progress_update: progressData
        };

        return response;
    }

    generateProgressMessage(progressData) {
        const persona = this.persona.name;
        let message = '';

        if (persona === 'Roy Sir') {
            message = `You've completed ${progressData.overall_progress || 25}% of your syllabus. `;
            message += `${progressData.days_remaining || 120} days remaining for your final exam. `;
            
            if (progressData.overall_progress < 50) {
                message += "We need to pick up the pace. Let's focus on high-priority topics.";
            } else if (progressData.overall_progress > 80) {
                message += "Excellent progress! Now let's polish your skills with advanced problems.";
            } else {
                message += "Good steady progress. Keep maintaining this momentum.";
            }
        } else {
            message = `Beta, tumne ${progressData.overall_progress || 25}% syllabus complete kar liya hai! `;
            message += `Final exam ke liye ${progressData.days_remaining || 120} days aur bache hain. `;
            
            if (progressData.overall_progress < 50) {
                message += "Thoda speed badhana padega, but don't worry, hum saath mein karenge!";
            } else if (progressData.overall_progress > 80) {
                message += "Waah! Tumne toh kamaal kar diya! Ab bas polish karna hai.";
            } else {
                message += "Very good progress hai tumhara! Keep it up!";
            }
        }

        return message;
    }

    checkForStoryTime() {
        const timeSinceStart = (Date.now() - this.sessionStartTime) / (1000 * 60); // minutes
        const timeSinceLastStory = this.sessionTimer - this.lastStoryTime;
        const storyTriggerTime = this.persona.story_trigger_minutes || 30;
        const maxStoriesPerDay = this.persona.daily_story_limit || 2;
        
        return (
            timeSinceStart >= storyTriggerTime &&
            timeSinceLastStory >= storyTriggerTime &&
            this.storyCount < maxStoriesPerDay &&
            this.performanceMetrics.engagement_level > 3
        );
    }

    selectAppropriateStory(currentSubject = null) {
        if (typeof window.storyDB === 'undefined') {
            return this.getFallbackStory();
        }

        // Get stories relevant to current subject or general learning
        let stories = [];
        
        if (currentSubject) {
            stories = window.storyDB.getStoriesBySubject(currentSubject);
        }
        
        // If no subject-specific stories, get general learning stories
        if (stories.length === 0) {
            stories = window.storyDB.getStoriesByMoral('learning');
        }
        
        // If still no stories, get any appropriate story
        if (stories.length === 0) {
            const randomStory = window.storyDB.getRandomStory({
                duration_max: 5,
                age_group: '10-16'
            });
            if (randomStory) stories = [randomStory];
        }
        
        // Filter out already shown stories
        const availableStories = stories.filter(story => !this.dailyStoriesShown.has(story.id));
        
        if (availableStories.length === 0) {
            return null;
        }

        const selectedStory = availableStories[Math.floor(Math.random() * availableStories.length)];
        this.dailyStoriesShown.add(selectedStory.id);

        return {
            ...selectedStory,
            introduction: this.getStoryIntroduction(selectedStory),
            moral_connection: this.connectMoralToLesson(selectedStory)
        };
    }

    selectStoryForConcept(subject) {
        if (typeof window.storyDB === 'undefined') {
            return null;
        }

        // Get stories that help explain concepts
        const conceptStories = {
            'mathematics': ['krishna_mathematics', 'abhimanyu_chakravyuh'],
            'science': ['crow_pitcher', 'govardhan_physics'],
            'physics': ['govardhan_physics', 'hanuman_courage'],
            'english': ['monkey_crocodile', 'lion_mouse']
        };

        const storyIds = conceptStories[subject] || [];
        const availableStoryIds = storyIds.filter(id => !this.dailyStoriesShown.has(id));
        
        if (availableStoryIds.length === 0) return null;
        
        const selectedId = availableStoryIds[Math.floor(Math.random() * availableStoryIds.length)];
        const story = window.storyDB.getStory(selectedId);
        
        if (story) {
            this.dailyStoriesShown.add(selectedId);
            return {
                ...story,
                introduction: this.getStoryIntroduction(story),
                moral_connection: this.connectMoralToLesson(story)
            };
        }
        
        return null;
    }

    getStoryIntroduction(story) {
        const introductions = {
            'Roy Sir': [
                `You've been working diligently for ${Math.floor(this.sessionTimer)} minutes. Here's an inspiring story: `,
                `This reminds me of a great story about ${story.title.toLowerCase()}: `,
                `Let me share a story that connects to what we're learning: `
            ],
            'Miss Sapna': [
                `Beta, tumne ${Math.floor(this.sessionTimer)} minutes achha kaam kiya hai. Ek beautiful story sunao? `,
                `Ye topic mujhe ek lovely story yaad dila raha hai: `,
                `Chalo ek interesting kahani suntey hain jo hamare lesson se connected hai: `
            ]
        };

        const templates = introductions[this.persona.name] || introductions['Roy Sir'];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    connectMoralToLesson(story) {
        const connections = {
            'mathematics': `Just like in this story, mathematics requires patience, strategy, and creative thinking.`,
            'science': `This story shows us how observation and logical thinking help us understand the world, just like in science.`,
            'english': `Stories like this help us improve our language skills and understand human nature.`,
            'general': `The lesson from this story applies to all our learning - ${story.moral}`
        };
        
        return connections[this.currentSubject] || connections['general'];
    }

    shouldShowVedicTrick(input) {
        // Check if this is a math problem that can benefit from Vedic tricks
        const mathKeywords = ['multiply', 'square', 'divide', 'calculate', '+', '-', '*', '/', '^', '×', '²'];
        const hasMathContent = mathKeywords.some(keyword => 
            input.toLowerCase().includes(keyword)
        );

        const trickFrequency = this.persona.vedic_math_frequency || 'medium';
        const probabilityMap = {
            'high': 0.8,
            'medium': 0.5,
            'low': 0.2
        };

        return hasMathContent && Math.random() < probabilityMap[trickFrequency];
    }

    getRelevantVedicTrick(input) {
        // Use the actual Vedic math database
        if (typeof window.vedicMathDB === 'undefined') {
            return this.getFallbackVedicTrick(input);
        }
        
        // Find applicable tricks using the database
        const applicableTricks = window.vedicMathDB.findApplicableTricks(input);
        
        if (applicableTricks.length > 0) {
            const selectedTrick = applicableTricks[0];
            const trickId = `${selectedTrick.category}_${selectedTrick.name}`;
            
            // Don't repeat the same trick in one session
            if (this.vedicTricksShown.has(trickId)) {
                return null;
            }
            
            this.vedicTricksShown.add(trickId);
            
            return {
                name: selectedTrick.trick.name,
                explanation: selectedTrick.trick.description,
                example: selectedTrick.trick.examples[0]?.solution || '',
                formula: selectedTrick.trick.formula,
                reason: selectedTrick.reason,
                steps: selectedTrick.trick.examples[0]?.steps || []
            };
        }
        
        // Fallback for common patterns
        if (input.includes('×') || input.includes('multiply')) {
            const trick = window.vedicMathDB.getTrick('multiplication', 'urdhva_tiryak');
            if (trick && !this.vedicTricksShown.has('multiplication_urdhva_tiryak')) {
                this.vedicTricksShown.add('multiplication_urdhva_tiryak');
                return {
                    name: trick.name,
                    explanation: trick.description,
                    example: trick.examples[0]?.solution || '',
                    formula: trick.formula,
                    reason: 'General multiplication using Vedic method',
                    steps: trick.examples[0]?.steps || []
                };
            }
        }
        
        if (input.includes('²') || input.includes('square')) {
            const trick = window.vedicMathDB.getTrick('multiplication', 'ekadhikena');
            if (trick && !this.vedicTricksShown.has('multiplication_ekadhikena')) {
                this.vedicTricksShown.add('multiplication_ekadhikena');
                return {
                    name: trick.name,
                    explanation: trick.description,
                    example: trick.examples[0]?.solution || '',
                    formula: trick.formula,
                    reason: 'Square calculation using Vedic method',
                    steps: trick.examples[0]?.steps || []
                };
            }
        }

        return null;
    }

    getFallbackVedicTrick(input) {
        const tricks = {
            'multiplication': {
                name: 'Urdhva Tiryakbyham',
                explanation: 'Cross multiplication method for faster calculation',
                example: '23 × 45 = 1035 (using cross multiplication)',
                formula: 'Vertically and crosswise multiplication',
                reason: 'General multiplication technique',
                steps: ['Multiply vertically', 'Multiply crosswise', 'Add results', 'Carry over']
            },
            'squares': {
                name: 'Ekadhikena Purvena',
                explanation: 'For numbers ending in 5: (ab5)² = a(a+1)25',
                example: '25² = 2×3=6, so 625',
                formula: 'One more than previous',
                reason: 'Quick squares for numbers ending in 5',
                steps: ['Take first digits', 'Multiply by (first + 1)', 'Append 25']
            }
        };

        if (input.includes('×') || input.includes('multiply')) {
            return tricks.multiplication;
        } else if (input.includes('²') || input.includes('square')) {
            return tricks.squares;
        }

        return null;
    }

    getFallbackStory() {
        return {
            id: 'fallback_story',
            title: 'The Determined Student',
            moral: 'Persistence and hard work always pay off',
            story: 'There once was a student who faced many challenges in learning. But with determination and the help of a good teacher, the student overcame all obstacles and achieved great success.',
            introduction: 'Let me share a quick inspiring story with you: ',
            moral_connection: 'Just like this student, you too can overcome any learning challenge with persistence.'
        };
    }

    generateFallbackProgress() {
        return {
            overall_progress: Math.floor(Math.random() * 60) + 20, // 20-80%
            days_remaining: Math.floor(Math.random() * 100) + 50, // 50-150 days
            current_phase: 'learning',
            recommendations: ['Keep practicing daily', 'Focus on understanding concepts', 'Ask questions when confused']
        };
    }

    determineEmotion() {
        const performance = this.performanceMetrics.correct_answers / 
                          Math.max(1, this.performanceMetrics.total_questions);
        
        if (performance > 0.8) {
            return 'proud';
        } else if (performance > 0.6) {
            return 'encouraging';
        } else if (this.performanceMetrics.confusion_indicators > 3) {
            return 'patient';
        } else {
            return 'neutral';
        }
    }

    updateSessionTimer() {
        this.sessionTimer = (Date.now() - this.sessionStartTime) / (1000 * 60); // minutes
    }

    analyzeInput(input) {
        // Simple sentiment and intent analysis
        const confusionWords = ['confused', 'don\'t understand', 'difficult', 'hard', 'help'];
        const positiveWords = ['yes', 'got it', 'understand', 'clear', 'thanks'];
        
        if (confusionWords.some(word => input.toLowerCase().includes(word))) {
            this.performanceMetrics.engagement_level = Math.max(1, this.performanceMetrics.engagement_level - 1);
        } else if (positiveWords.some(word => input.toLowerCase().includes(word))) {
            this.performanceMetrics.engagement_level = Math.min(10, this.performanceMetrics.engagement_level + 1);
        }
    }

    classifyInput(input) {
        const mathKeywords = ['solve', 'calculate', 'find', 'what is', '+', '-', '*', '/', '×', '²'];
        const confusionKeywords = ['confused', 'don\'t understand', 'explain', 'help'];
        const progressKeywords = ['progress', 'how much', 'completed', 'left', 'exam'];
        const storyKeywords = ['story', 'tell me', 'kahani', 'moral'];
        
        if (mathKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
            return 'math_question';
        } else if (confusionKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
            return 'concept_confusion';
        } else if (progressKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
            return 'progress_inquiry';
        } else if (storyKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
            return 'story_request';
        } else {
            return 'general_question';
        }
    }

    handleGeneralQuestion(input, context) {
        const response = {
            message: '',
            emotion: 'helpful',
            actions: ['provide_information'],
            vedic_tip: null,
            story: null,
            progress_update: null
        };

        if (this.persona.name === 'Roy Sir') {
            response.message = "That's an interesting question. Let me help you understand this topic better.";
        } else {
            response.message = "Achha question hai beta! Main aapko detail mein samjhati hun.";
        }

        return response;
    }

    handleDefault(input, context) {
        return this.handleGeneralQuestion(input, context);
    }

    generateMathSolution(input) {
        // This would integrate with actual math solving engine
        return {
            explanation: "Here's how we can approach this problem step by step.",
            steps: ["Identify what we need to find", "Apply the appropriate formula", "Calculate step by step"],
            answer: "The solution will be calculated based on the specific problem."
        };
    }

    updateConversationHistory(input, response) {
        this.conversationHistory.push({
            timestamp: Date.now(),
            input: input,
            response: response.message,
            emotion: response.emotion,
            session_time: this.sessionTimer,
            vedic_tip: response.vedic_tip ? response.vedic_tip.name : null,
            story: response.story ? response.story.title : null
        });

        // Keep only last 20 interactions for memory management
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    // Methods for integration with dashboard
    setCurrentSubject(subject) {
        this.currentSubject = subject;
    }

    recordCorrectAnswer() {
        this.performanceMetrics.correct_answers++;
        this.performanceMetrics.total_questions++;
        this.performanceMetrics.engagement_level = Math.min(10, this.performanceMetrics.engagement_level + 1);
    }

    recordIncorrectAnswer() {
        this.performanceMetrics.total_questions++;
        this.performanceMetrics.engagement_level = Math.max(1, this.performanceMetrics.engagement_level - 0.5);
    }

    getSessionSummary() {
        return {
            session_duration: Math.floor(this.sessionTimer),
            stories_told: this.storyCount,
            vedic_tricks_shown: this.vedicTricksShown.size,
            performance: {
                accuracy: this.performanceMetrics.correct_answers / Math.max(1, this.performanceMetrics.total_questions),
                engagement: this.performanceMetrics.engagement_level,
                questions_answered: this.performanceMetrics.total_questions
            },
            current_emotion: this.currentEmotion,
            subjects_covered: this.currentSubject ? [this.currentSubject] : [],
            daily_stories_shown: Array.from(this.dailyStoriesShown),
            vedic_tricks_used: Array.from(this.vedicTricksShown)
        };
    }

    // Reset daily counters (should be called at start of new day)
    resetDailyCounters() {
        this.dailyStoriesShown.clear();
        this.vedicTricksShown.clear();
        this.storyCount = 0;
        this.lastStoryTime = 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeacherBehavior;
} else {
    window.TeacherBehavior = TeacherBehavior;
} 