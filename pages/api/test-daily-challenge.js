// Test Daily Challenge API
// Simple endpoint to test if the daily challenge system works

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        
        const testQuestion = {
            question: "What is 2 + 2?",
            answer: "4",
            subject: "mathematics",
            points: 10
        };

        console.log('🧪 Test daily challenge requested');

        return res.status(200).json({
            success: true,
            message: 'Daily challenge API is working!',
            data: {
                question: testQuestion.question,
                subject: testQuestion.subject,
                points: testQuestion.points,
                date: today,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Test API error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Test API failed',
            details: error.message 
        });
    }
}
