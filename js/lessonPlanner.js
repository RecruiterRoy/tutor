class LessonPlanner {
    constructor(studentProfile, finalExamDate = '2024-04-15') {
        this.studentProfile = studentProfile;
        this.finalExamDate = new Date(finalExamDate);
        this.currentDate = new Date();
        this.syllabusByClass = this.initializeSyllabus();
        
        // Define learning phases
        this.phases = {
            learning: { 
                start: this.currentDate,
                end: new Date('2024-02-29'), 
                focus: 'concept_coverage',
                target_completion: 100
            },
            revision: { 
                start: new Date('2024-03-01'), 
                end: this.finalExamDate,
                focus: 'practice_tests',
                target_completion: 100
            }
        };
        
        this.midTermExams = [];
        this.monthlyReminders = [];
        this.dailyPlans = new Map();
    }

    initializeSyllabus() {
        return {
            "class_8": {
                "mathematics": {
                    "chapters": [
                        { name: "Rational Numbers", weeks: 2, importance: "high" },
                        { name: "Linear Equations in One Variable", weeks: 2, importance: "high" },
                        { name: "Understanding Quadrilaterals", weeks: 2, importance: "medium" },
                        { name: "Practical Geometry", weeks: 1.5, importance: "medium" },
                        { name: "Data Handling", weeks: 2, importance: "high" },
                        { name: "Squares and Square Roots", weeks: 2, importance: "high" },
                        { name: "Cubes and Cube Roots", weeks: 1.5, importance: "medium" },
                        { name: "Comparing Quantities", weeks: 2, importance: "high" },
                        { name: "Algebraic Expressions", weeks: 2, importance: "high" },
                        { name: "Visualizing Solid Shapes", weeks: 1, importance: "low" },
                        { name: "Mensuration", weeks: 2, importance: "high" },
                        { name: "Exponents and Powers", weeks: 1.5, importance: "medium" },
                        { name: "Direct and Inverse Proportions", weeks: 1.5, importance: "medium" },
                        { name: "Factorization", weeks: 2, importance: "high" },
                        { name: "Introduction to Graphs", weeks: 1, importance: "medium" }
                    ],
                    "vedic_integration": {
                        "Rational Numbers": ["ekadhikena", "nikhilam"],
                        "Squares and Square Roots": ["ekadhikena", "duplex"],
                        "Cubes and Cube Roots": ["duplex"],
                        "Algebraic Expressions": ["urdhva_tiryak"],
                        "Factorization": ["paravartya"]
                    }
                },
                "science": {
                    "chapters": [
                        { name: "Crop Production and Management", weeks: 2, importance: "medium" },
                        { name: "Microorganisms", weeks: 2, importance: "high" },
                        { name: "Synthetic Fibres and Plastics", weeks: 1.5, importance: "medium" },
                        { name: "Materials: Metals and Non-metals", weeks: 2, importance: "high" },
                        { name: "Coal and Petroleum", weeks: 1.5, importance: "medium" },
                        { name: "Combustion and Flame", weeks: 2, importance: "high" },
                        { name: "Conservation of Plants and Animals", weeks: 2, importance: "high" },
                        { name: "Cell Structure and Functions", weeks: 2, importance: "high" },
                        { name: "Reproduction in Animals", weeks: 2, importance: "medium" },
                        { name: "Reaching the Age of Adolescence", weeks: 1.5, importance: "medium" },
                        { name: "Force and Pressure", weeks: 2, importance: "high" },
                        { name: "Friction", weeks: 1.5, importance: "medium" },
                        { name: "Sound", weeks: 2, importance: "high" },
                        { name: "Chemical Effects of Electric Current", weeks: 1.5, importance: "medium" },
                        { name: "Some Natural Phenomena", weeks: 1, importance: "low" },
                        { name: "Light", weeks: 2, importance: "high" },
                        { name: "Stars and Solar System", weeks: 1, importance: "medium" },
                        { name: "Pollution of Air and Water", weeks: 1.5, importance: "medium" }
                    ]
                },
                "english": {
                    "chapters": [
                        { name: "The Best Christmas Present in the World", weeks: 1, importance: "medium", stories: ["christmas_spirit"] },
                        { name: "The Tsunami", weeks: 1, importance: "high", stories: ["courage_stories"] },
                        { name: "Glimpses of the Past", weeks: 1, importance: "medium", stories: ["historical_tales"] },
                        { name: "Bepin Choudhury's Lapse of Memory", weeks: 1, importance: "medium", stories: ["memory_stories"] },
                        { name: "The Summit Within", weeks: 1, importance: "high", stories: ["mountain_climbing", "determination"] },
                        { name: "This is Jody's Fawn", weeks: 1, importance: "medium", stories: ["animal_stories"] },
                        { name: "A Visit to Cambridge", weeks: 1, importance: "medium", stories: ["inspiration_stories"] },
                        { name: "A Short Monsoon Diary", weeks: 1, importance: "low", stories: ["nature_stories"] },
                        { name: "The Great Stone Face", weeks: 1, importance: "high", stories: ["character_building"] },
                        { name: "Jalebis", weeks: 1, importance: "medium", stories: ["childhood_stories"] }
                    ]
                },
                "hindi": {
                    "chapters": [
                        { name: "ध्वनि", weeks: 1, importance: "high", stories: ["sound_stories"] },
                        { name: "लाख की चूड़ियाँ", weeks: 1, importance: "medium", stories: ["tradition_stories"] },
                        { name: "बस की यात्रा", weeks: 1, importance: "medium", stories: ["journey_stories"] },
                        { name: "दीवानों की हस्ती", weeks: 1, importance: "medium", stories: ["poetry_stories"] },
                        { name: "चिट्ठियों की अनूठी दुनिया", weeks: 1, importance: "medium", stories: ["communication_stories"] },
                        { name: "भगवान के डाकिए", weeks: 1, importance: "high", stories: ["nature_as_messenger"] },
                        { name: "क्या निराश हुआ जाए", weeks: 1, importance: "high", stories: ["hope_stories"] },
                        { name: "यह सबसे कठिन समय नहीं", weeks: 1, importance: "high", stories: ["resilience_stories"] }
                    ]
                }
            }
        };
    }

    generateMonthlyPlan() {
        const months = this.getMonthsBetween(this.currentDate, this.phases.learning.end);
        const studentClass = this.studentProfile.class || 'class_8';
        const subjects = this.syllabusByClass[studentClass];
        
        const plan = {
            overview: {
                total_weeks: this.getWeeksBetween(this.currentDate, this.phases.learning.end),
                revision_weeks: this.getWeeksBetween(this.phases.revision.start, this.finalExamDate),
                subjects: Object.keys(subjects)
            },
            monthly_breakdown: {},
            catch_up_strategy: this.generateCatchUpStrategy(),
            progress_tracking: {}
        };

        months.forEach(month => {
            plan.monthly_breakdown[month] = this.generateMonthPlan(month, subjects);
        });

        return plan;
    }

    generateCatchUpStrategy() {
        const currentMonth = this.currentDate.getMonth() + 1;
        const missedMonths = Math.max(0, currentMonth - 4); // Assuming academic year starts in April
        
        return {
            missed_months: missedMonths,
            intensity_multiplier: missedMonths > 0 ? 1.3 : 1.0,
            catch_up_hours: missedMonths * 15, // Extra hours needed
            strategy: missedMonths > 0 ? 
                "Accelerated learning with focus on high-importance chapters" : 
                "Regular pace with comprehensive coverage",
            recommendations: this.getCatchUpRecommendations(missedMonths)
        };
    }

    getCatchUpRecommendations(missedMonths) {
        if (missedMonths === 0) {
            return ["Follow regular lesson plan", "Focus on understanding concepts deeply"];
        } else if (missedMonths <= 2) {
            return [
                "Prioritize high-importance chapters",
                "Use Vedic math for faster calculation",
                "Increase daily study time by 30 minutes",
                "Focus on previous year questions"
            ];
        } else {
            return [
                "Intensive catch-up mode activated",
                "Study high-importance chapters only initially",
                "Use Vedic math extensively",
                "Take help from teacher for difficult topics",
                "Practice previous 3 years' questions",
                "Consider weekend extra sessions"
            ];
        }
    }

    getDailyTeachingPlan(date) {
        const dateKey = date.toISOString().split('T')[0];
        
        if (this.dailyPlans.has(dateKey)) {
            return this.dailyPlans.get(dateKey);
        }

        const dayPlan = this.generateDayPlan(date);
        this.dailyPlans.set(dateKey, dayPlan);
        return dayPlan;
    }

    generateDayPlan(date) {
        const weekNumber = this.getWeekNumber(date);
        const dayOfWeek = date.getDay();
        const subjects = this.getSubjectsForDay(dayOfWeek);
        
        const plan = {
            date: date.toISOString().split('T')[0],
            week_number: weekNumber,
            phase: this.getCurrentPhase(date),
            subjects: []
        };

        subjects.forEach(subject => {
            const subjectPlan = {
                subject: subject,
                chapter: this.getCurrentChapter(subject, weekNumber),
                topics: this.getTopicsForDay(subject, weekNumber, dayOfWeek),
                vedic_tricks: this.getVedicTricks(subject),
                stories: this.getRelevantStories(subject),
                homework: this.generateHomework(subject, weekNumber),
                assessment: this.getAssessmentType(subject, weekNumber)
            };
            plan.subjects.push(subjectPlan);
        });

        return plan;
    }

    addMidTermExam(examDate, subjects, syllabus) {
        const exam = {
            date: new Date(examDate),
            subjects: subjects,
            syllabus: syllabus,
            preparation_weeks: 2,
            id: Date.now()
        };

        this.midTermExams.push(exam);
        this.adaptForMidTerm(exam);
        
        return {
            success: true,
            message: `Midterm exam added for ${examDate}. Lesson plan adapted.`,
            exam_id: exam.id,
            preparation_plan: this.generateMidTermPlan(exam)
        };
    }

    adaptForMidTerm(exam) {
        const prepStartDate = new Date(exam.date);
        prepStartDate.setDate(prepStartDate.getDate() - (exam.preparation_weeks * 7));
        
        // Adjust daily plans for midterm preparation
        for (let d = new Date(prepStartDate); d <= exam.date; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            const existingPlan = this.dailyPlans.get(dateKey) || this.generateDayPlan(new Date(d));
            
            // Modify plan to focus on midterm syllabus
            existingPlan.midterm_focus = {
                exam_id: exam.id,
                subjects: exam.subjects,
                preparation_mode: true
            };
            
            this.dailyPlans.set(dateKey, existingPlan);
        }
    }

    getProgressUpdate() {
        const today = new Date();
        const totalDays = this.getDaysBetween(this.currentDate, this.finalExamDate);
        const daysPassed = this.getDaysBetween(this.currentDate, today);
        const progressPercentage = Math.min(100, (daysPassed / totalDays) * 100);

        const phaseProgress = this.getPhaseProgress(today);
        const subjectProgress = this.getSubjectProgress();

        return {
            overall_progress: Math.round(progressPercentage),
            days_remaining: totalDays - daysPassed,
            current_phase: this.getCurrentPhase(today),
            phase_progress: phaseProgress,
            subject_progress: subjectProgress,
            recommendations: this.getProgressRecommendations(progressPercentage, phaseProgress),
            next_milestone: this.getNextMilestone(today),
            should_show_reminder: this.shouldShowMonthlyReminder(today)
        };
    }

    shouldShowMonthlyReminder(date) {
        const dayOfMonth = date.getDate();
        const lastReminder = localStorage.getItem('lastLessonPlanReminder');
        const currentMonth = `${date.getFullYear()}-${date.getMonth()}`;
        
        return dayOfMonth === 1 || (dayOfMonth <= 7 && lastReminder !== currentMonth);
    }

    getProgressRecommendations(overallProgress, phaseProgress) {
        const recommendations = [];
        
        if (overallProgress < 50 && phaseProgress.learning < 60) {
            recommendations.push("📚 Focus on completing high-priority chapters first");
            recommendations.push("⚡ Consider using more Vedic math tricks to speed up");
        }
        
        if (phaseProgress.learning > 90 && this.getCurrentPhase(new Date()) === 'learning') {
            recommendations.push("🎯 Great progress! Start preparing for revision phase");
            recommendations.push("📝 Begin solving previous year questions");
        }
        
        if (this.midTermExams.length > 0) {
            const nextMidterm = this.getNextMidterm();
            if (nextMidterm) {
                recommendations.push(`🎓 Midterm exam on ${nextMidterm.date.toDateString()}`);
            }
        }
        
        return recommendations;
    }

    // Utility methods
    getMonthsBetween(start, end) {
        const months = [];
        const current = new Date(start);
        
        while (current <= end) {
            months.push(`${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`);
            current.setMonth(current.getMonth() + 1);
        }
        
        return months;
    }

    getWeeksBetween(start, end) {
        return Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000));
    }

    getDaysBetween(start, end) {
        return Math.ceil((end - start) / (24 * 60 * 60 * 1000));
    }

    getCurrentPhase(date) {
        if (date <= this.phases.learning.end) {
            return 'learning';
        } else {
            return 'revision';
        }
    }

    getSubjectsForDay(dayOfWeek) {
        const schedules = {
            1: ['mathematics', 'science'], // Monday
            2: ['english', 'hindi'], // Tuesday
            3: ['mathematics', 'science'], // Wednesday
            4: ['english', 'social_studies'], // Thursday
            5: ['mathematics', 'science'], // Friday
            6: ['review', 'practice'], // Saturday
            0: ['rest', 'light_reading'] // Sunday
        };
        
        return schedules[dayOfWeek] || ['mathematics'];
    }

    getVedicTricks(subject) {
        const tricks = {
            'mathematics': ['ekadhikena', 'nikhilam', 'urdhva_tiryak'],
            'science': ['calculation_shortcuts'],
            'default': []
        };
        
        return tricks[subject] || tricks.default;
    }

    getRelevantStories(subject) {
        const storyMappings = {
            'mathematics': ['krishna_mathematics', 'abhimanyu_chakravyuh'],
            'science': ['govardhan_physics', 'crow_pitcher'],
            'english': ['panchatantra_stories', 'moral_tales'],
            'hindi': ['ramayana_stories', 'mahabharata_stories'],
            'default': ['eklavya_dedication']
        };
        
        return storyMappings[subject] || storyMappings.default;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LessonPlanner;
} else {
    window.LessonPlanner = LessonPlanner;
} 