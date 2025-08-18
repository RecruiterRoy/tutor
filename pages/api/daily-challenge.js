// Daily Challenge API
// Handles quiz questions, points calculation, and streaks

export default async function handler(req, res) {
    // Allow both GET and POST methods
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { action, user_id, answer } = req.method === 'POST' ? req.body : req.query;

    try {
        // If no action specified, default to get_challenge
        const actionToExecute = action || 'get_challenge';
        
        switch (actionToExecute) {
            case 'get_challenge':
                return await getDailyChallenge(req, res);
            case 'submit_answer':
                return await submitAnswer(req, res);
            case 'get_stats':
                return await getChallengeStats(req, res);
            default:
                return res.status(400).json({ success: false, error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Daily challenge error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// Get today's challenge question
async function getDailyChallenge(req, res) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Sample questions for different subjects
        const questions = [
            {
                question: "What is the capital of India?",
                answer: "new delhi",
                subject: "geography",
                points: 10
            },
            {
                question: "What is 15 + 27?",
                answer: "42",
                subject: "mathematics", 
                points: 10
            },
            {
                question: "What is the chemical symbol for gold?",
                answer: "au",
                subject: "science",
                points: 10
            },
            {
                question: "Who wrote the Indian National Anthem?",
                answer: "rabindranath tagore",
                subject: "history",
                points: 10
            },
            {
                question: "What is the largest planet in our solar system?",
                answer: "jupiter",
                subject: "science",
                points: 10
            }
        ];

        // Use date to select consistent question for the day
        const dayIndex = new Date(today).getDate() % questions.length;
        const todayQuestion = questions[dayIndex];

        console.log('📝 Daily challenge requested for:', today, 'Question:', todayQuestion.question);

        return res.status(200).json({
            success: true,
            data: {
                question: todayQuestion.question,
                subject: todayQuestion.subject,
                points: todayQuestion.points,
                date: today
            }
        });
    } catch (error) {
        console.error('❌ Error in getDailyChallenge:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to get daily challenge',
            details: error.message 
        });
    }
}

// Submit answer and calculate points
async function submitAnswer(req, res) {
    const { user_id, answer } = req.body;
    
    if (!user_id || !answer) {
        return res.status(400).json({ success: false, error: 'Missing user_id or answer' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get today's question
    const questions = [
        { answer: "new delhi", points: 10 },
        { answer: "42", points: 10 },
        { answer: "au", points: 10 },
        { answer: "rabindranath tagore", points: 10 },
        { answer: "jupiter", points: 10 }
    ];
    
    const dayIndex = new Date(today).getDate() % questions.length;
    const correctAnswer = questions[dayIndex].answer;
    const maxPoints = questions[dayIndex].points;

    // Check if answer is correct (case insensitive)
    const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    // Calculate points (partial credit for close answers)
    let pointsEarned = 0;
    if (isCorrect) {
        pointsEarned = maxPoints;
    } else {
        // Check for partial matches
        const userWords = answer.toLowerCase().split(' ');
        const correctWords = correctAnswer.toLowerCase().split(' ');
        const matchingWords = userWords.filter(word => correctWords.includes(word));
        
        if (matchingWords.length > 0) {
            pointsEarned = Math.floor((matchingWords.length / correctWords.length) * maxPoints);
        }
    }

    // Update user stats (simplified - in real app, save to database)
    const userStats = {
        total_points: pointsEarned,
        current_streak: isCorrect ? 1 : 0,
        total_correct: isCorrect ? 1 : 0,
        total_attempted: 1
    };

    return res.status(200).json({
        success: true,
        data: {
            isCorrect,
            pointsEarned,
            correctAnswer,
            userStats,
            message: isCorrect ? "Excellent! +10 points!" : `Good try! The correct answer was: ${correctAnswer}`
        }
    });
}

// Get user challenge statistics
async function getChallengeStats(req, res) {
    const { user_id } = req.body;
    
    if (!user_id) {
        return res.status(400).json({ success: false, error: 'Missing user_id' });
    }

    // Mock stats (in real app, fetch from database)
    const stats = {
        total_points: 0,
        current_streak: 0,
        total_correct: 0,
        total_attempted: 0,
        india_rank: 0,
        city_rank: 0
    };

    return res.status(200).json({
        success: true,
        data: stats
    });
}
