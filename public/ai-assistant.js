// Enhanced AI Assistant for School Management System
// This module provides comprehensive academic assistance for students and teachers

class AcademicAI {
    constructor() {
        this.api = window.schoolAPI;
        this.currentUser = null;
        this.userRole = null;
        this.studentData = null;
        this.teacherData = null;
        this.schoolData = null;
    }

    // Initialize AI with user context
    async initialize(userId, userRole) {
        this.currentUser = userId;
        this.userRole = userRole;

        if (userRole === 'student') {
            await this.loadStudentContext();
        } else if (userRole === 'teacher') {
            await this.loadTeacherContext();
        }
    }

    // Load student-specific context
    async loadStudentContext() {
        try {
            const studentResult = await this.api.getStudentById(this.currentUser);
            if (studentResult.success) {
                this.studentData = studentResult.data;
                
                // Load school data
                const schoolResult = await this.api.getSchool(this.studentData.school_id);
                if (schoolResult.success) {
                    this.schoolData = schoolResult.data;
                }
            }
        } catch (error) {
            console.error('Error loading student context:', error);
        }
    }

    // Load teacher-specific context
    async loadTeacherContext() {
        try {
            const teacherResult = await this.api.getTeacherById(this.currentUser);
            if (teacherResult.success) {
                this.teacherData = teacherResult.data;
                
                // Load school data
                const schoolResult = await this.api.getSchool(this.teacherData.school_id);
                if (schoolResult.success) {
                    this.schoolData = schoolResult.data;
                }
            }
        } catch (error) {
            console.error('Error loading teacher context:', error);
        }
    }

    // Enhanced AI prompt generator based on user role and context
    generateAIPrompt(userMessage, context = {}) {
        let basePrompt = '';
        
        if (this.userRole === 'student') {
            basePrompt = this.generateStudentPrompt(userMessage, context);
        } else if (this.userRole === 'teacher') {
            basePrompt = this.generateTeacherPrompt(userMessage, context);
        }

        return basePrompt;
    }

    // Generate comprehensive student AI prompt
    generateStudentPrompt(userMessage, context) {
        const studentInfo = this.studentData ? `
Student Information:
- Name: ${this.studentData.full_name}
- Class: ${this.studentData.class}${this.studentData.section}
- Roll Number: ${this.studentData.roll_number}
- School: ${this.schoolData ? this.schoolData.name : 'Unknown'}
` : '';

        return `You are an intelligent academic assistant and personal tutor for a student. You have access to their school data and can help with all aspects of their academic journey.

${studentInfo}

Your capabilities include:
1. **Homework Assistance**: You can access and explain current homework assignments, help students understand concepts, and guide them through problem-solving
2. **Exam Preparation**: You can provide exam schedules, syllabus information, create study plans, and generate practice questions
3. **Academic Guidance**: You can explain complex topics, provide step-by-step solutions, and offer learning strategies
4. **Progress Tracking**: You can help students understand their academic performance and suggest improvements

Current Context:
${context.homework ? `Current Homework: ${JSON.stringify(context.homework, null, 2)}` : ''}
${context.exams ? `Upcoming Exams: ${JSON.stringify(context.exams, null, 2)}` : ''}
${context.results ? `Recent Results: ${JSON.stringify(context.results, null, 2)}` : ''}

Student's Question: "${userMessage}"

Please respond as a friendly, encouraging tutor who:
- Explains concepts clearly and step-by-step
- Provides practical examples and analogies
- Encourages critical thinking and problem-solving
- Offers study tips and learning strategies
- Maintains a positive and motivating tone
- Uses appropriate language for the student's grade level
- Asks follow-up questions to ensure understanding

If the student asks about homework, exams, or academic progress, use the available data to provide specific, personalized assistance.`;
    }

    // Generate comprehensive teacher AI prompt
    generateTeacherPrompt(userMessage, context) {
        const teacherInfo = this.teacherData ? `
Teacher Information:
- Name: ${this.teacherData.full_name}
- Primary Subject: ${this.teacherData.primary_subject}
- Experience: ${this.teacherData.experience_years} years
- School: ${this.schoolData ? this.schoolData.name : 'Unknown'}
` : '';

        return `You are an intelligent teaching assistant and educational consultant for a teacher. You have access to their school data and can help with all aspects of teaching and classroom management.

${teacherInfo}

Your capabilities include:
1. **Lesson Planning**: Help create engaging lesson plans, suggest activities, and provide teaching strategies
2. **Assessment Support**: Assist with exam creation, grading strategies, and student evaluation
3. **Classroom Management**: Provide insights on attendance, student behavior, and classroom organization
4. **Curriculum Guidance**: Help with syllabus planning, topic prioritization, and academic scheduling
5. **Student Support**: Identify struggling students and suggest intervention strategies

Current Context:
${context.classes ? `Teaching Classes: ${JSON.stringify(context.classes, null, 2)}` : ''}
${context.attendance ? `Attendance Data: ${JSON.stringify(context.attendance, null, 2)}` : ''}
${context.exams ? `Exam Schedule: ${JSON.stringify(context.exams, null, 2)}` : ''}
${context.students ? `Student List: ${JSON.stringify(context.students, null, 2)}` : ''}

Teacher's Question: "${userMessage}"

Please respond as a knowledgeable educational consultant who:
- Provides practical teaching advice and strategies
- Suggests engaging classroom activities and lesson plans
- Offers assessment and evaluation techniques
- Helps with classroom management and student engagement
- Provides data-driven insights about student performance
- Maintains a professional yet supportive tone
- Offers evidence-based educational practices

If the teacher asks about specific students, classes, or academic data, use the available information to provide targeted, actionable advice.`;
    }

    // Get student's current homework
    async getStudentHomework() {
        if (!this.studentData) return null;

        try {
            const homeworkResult = await this.api.getHomeworkForStudent(this.currentUser);
            if (homeworkResult.success) {
                return homeworkResult.data;
            }
        } catch (error) {
            console.error('Error fetching homework:', error);
        }
        return null;
    }

    // Get upcoming exams for student
    async getStudentExams() {
        if (!this.studentData) return null;

        try {
            // Get student's class
            const classResult = await this.api.getClassesBySchoolAndClass(
                this.studentData.school_id,
                this.studentData.class,
                this.studentData.section
            );

            if (classResult.success && classResult.data.length > 0) {
                const classId = classResult.data[0].id;
                const examsResult = await this.api.getExamsForClass(classId);
                if (examsResult.success) {
                    return examsResult.data;
                }
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
        return null;
    }

    // Get student's exam results
    async getStudentResults() {
        if (!this.studentData) return null;

        try {
            const resultsResult = await this.api.getExamResults(this.currentUser);
            if (resultsResult.success) {
                return resultsResult.data;
            }
        } catch (error) {
            console.error('Error fetching results:', error);
        }
        return null;
    }

    // Get teacher's classes
    async getTeacherClasses() {
        if (!this.teacherData) return null;

        try {
            const classesResult = await this.api.getClassesBySchool(this.teacherData.school_id);
            if (classesResult.success) {
                // Filter classes taught by this teacher
                return classesResult.data.filter(cls => 
                    cls.class_teacher_id === this.currentUser ||
                    JSON.parse(this.teacherData.classes_taught || '[]').includes(cls.class_number)
                );
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
        return null;
    }

    // Get attendance data for teacher's classes
    async getTeacherAttendance(classId, date) {
        if (!this.teacherData) return null;

        try {
            const attendanceResult = await this.api.getAttendanceForClass(classId, date);
            if (attendanceResult.success) {
                return attendanceResult.data;
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
        return null;
    }

    // Get absent students for today
    async getAbsentStudents() {
        if (!this.teacherData) return null;

        try {
            const today = new Date().toISOString().split('T')[0];
            const absentResult = await this.api.getAbsentStudents(this.teacherData.school_id, today);
            if (absentResult.success) {
                return absentResult.data;
            }
        } catch (error) {
            console.error('Error fetching absent students:', error);
        }
        return null;
    }

    // Generate lesson plan with AI
    async generateLessonPlan(subject, topic, duration, grade) {
        const prompt = `Create a comprehensive lesson plan for ${subject} on the topic "${topic}" for grade ${grade} students. The lesson should be ${duration} minutes long.

Please include:
1. Learning objectives
2. Introduction/hook activity
3. Main content with engaging activities
4. Assessment/check for understanding
5. Homework assignment
6. Required materials/resources

Make it engaging, interactive, and suitable for the grade level. Include specific activities that will help students understand and retain the information.`;

        // This would integrate with your AI service
        return this.callAI(prompt);
    }

    // Generate practice questions for exams
    async generatePracticeQuestions(subject, topic, difficulty, count = 5) {
        const prompt = `Generate ${count} practice questions for ${subject} on the topic "${topic}" at ${difficulty} difficulty level.

For each question, provide:
1. The question
2. Multiple choice options (A, B, C, D)
3. Correct answer
4. Brief explanation of the solution

Make sure the questions are appropriate for the grade level and cover different aspects of the topic.`;

        return this.callAI(prompt);
    }

    // Generate study plan for exams
    async generateStudyPlan(subject, examDate, topics) {
        const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        const prompt = `Create a detailed study plan for ${subject} exam on ${examDate} (${daysUntilExam} days from now).

Topics to cover: ${topics.join(', ')}

Please provide:
1. Daily study schedule
2. Topic prioritization
3. Practice exercises for each topic
4. Review strategies
5. Tips for exam preparation
6. Recommended study breaks and rest periods

Make it realistic and achievable for a student to follow.`;

        return this.callAI(prompt);
    }

    // Analyze student performance
    async analyzeStudentPerformance(studentId) {
        try {
            const results = await this.api.getExamResults(studentId);
            if (results.success && results.data.length > 0) {
                const analysis = this.analyzeResults(results.data);
                return this.generatePerformanceReport(analysis);
            }
        } catch (error) {
            console.error('Error analyzing performance:', error);
        }
        return null;
    }

    // Analyze exam results data
    analyzeResults(results) {
        const analysis = {
            totalExams: results.length,
            averagePercentage: 0,
            subjectPerformance: {},
            trend: 'stable',
            strengths: [],
            weaknesses: []
        };

        let totalPercentage = 0;
        const subjectScores = {};

        results.forEach(result => {
            totalPercentage += result.percentage;
            const subject = result.exams.subjects.name;
            
            if (!subjectScores[subject]) {
                subjectScores[subject] = [];
            }
            subjectScores[subject].push(result.percentage);
        });

        analysis.averagePercentage = totalPercentage / results.length;

        // Analyze subject performance
        Object.keys(subjectScores).forEach(subject => {
            const avgScore = subjectScores[subject].reduce((a, b) => a + b, 0) / subjectScores[subject].length;
            analysis.subjectPerformance[subject] = avgScore;
            
            if (avgScore >= 80) {
                analysis.strengths.push(subject);
            } else if (avgScore < 60) {
                analysis.weaknesses.push(subject);
            }
        });

        return analysis;
    }

    // Generate performance report
    generatePerformanceReport(analysis) {
        const prompt = `Based on the following student performance analysis, provide a comprehensive report with actionable recommendations:

Performance Analysis:
- Total Exams: ${analysis.totalExams}
- Average Percentage: ${analysis.averagePercentage.toFixed(2)}%
- Strong Subjects: ${analysis.strengths.join(', ')}
- Areas for Improvement: ${analysis.weaknesses.join(', ')}

Subject Performance:
${Object.entries(analysis.subjectPerformance).map(([subject, score]) => `- ${subject}: ${score.toFixed(2)}%`).join('\n')}

Please provide:
1. Overall performance assessment
2. Specific recommendations for improvement
3. Study strategies for weak subjects
4. How to maintain performance in strong subjects
5. Goal-setting suggestions
6. Motivation and encouragement

Make it encouraging and actionable.`;

        return this.callAI(prompt);
    }

    // Main AI interaction method
    async processMessage(userMessage) {
        try {
            let context = {};

            // Load relevant context based on user role and message
            if (this.userRole === 'student') {
                if (userMessage.toLowerCase().includes('homework') || userMessage.toLowerCase().includes('assignment')) {
                    context.homework = await this.getStudentHomework();
                }
                if (userMessage.toLowerCase().includes('exam') || userMessage.toLowerCase().includes('test')) {
                    context.exams = await this.getStudentExams();
                    context.results = await this.getStudentResults();
                }
            } else if (this.userRole === 'teacher') {
                if (userMessage.toLowerCase().includes('attendance') || userMessage.toLowerCase().includes('absent')) {
                    context.attendance = await this.getAbsentStudents();
                }
                if (userMessage.toLowerCase().includes('class') || userMessage.toLowerCase().includes('lesson')) {
                    context.classes = await this.getTeacherClasses();
                }
                if (userMessage.toLowerCase().includes('exam') || userMessage.toLowerCase().includes('schedule')) {
                    context.exams = await this.api.getUpcomingExams(this.teacherData.school_id);
                }
            }

            // Generate AI prompt with context
            const aiPrompt = this.generateAIPrompt(userMessage, context);
            
            // Call AI service (integrate with your preferred AI service)
            const response = await this.callAI(aiPrompt);
            
            return {
                success: true,
                response: response,
                context: context
            };

        } catch (error) {
            console.error('Error processing message:', error);
            return {
                success: false,
                error: 'Sorry, I encountered an error. Please try again.'
            };
        }
    }

    // AI service integration (replace with your preferred AI service)
    async callAI(prompt) {
        // This is a placeholder - integrate with your AI service
        // You can use OpenAI, Claude, or any other AI service
        
        // For now, return a mock response
        return `I understand your request. Here's how I can help you with that:

${prompt.includes('homework') ? 'I can see your current homework assignments and help you understand the concepts.' : ''}
${prompt.includes('exam') ? 'I can help you prepare for upcoming exams and review past performance.' : ''}
${prompt.includes('lesson') ? 'I can help you create engaging lesson plans and teaching strategies.' : ''}
${prompt.includes('attendance') ? 'I can help you track attendance and identify patterns.' : ''}

Please provide more specific details about what you'd like help with, and I'll give you personalized assistance based on your academic data.`;
    }
}

// Create global instance
window.academicAI = new AcademicAI();
