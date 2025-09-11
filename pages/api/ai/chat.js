const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, subject, classLevel, board } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Create a context-aware prompt for the AI teacher
        const systemPrompt = `You are Roy Sir, a friendly and knowledgeable AI teacher for ${classLevel || 'Class 2'} students following the ${board || 'CBSE'} curriculum. 

Your teaching style:
- Be encouraging and supportive
- Use simple, age-appropriate language
- Provide clear explanations with examples
- Ask follow-up questions to check understanding
- Use emojis occasionally to make learning fun
- If the student asks about a specific subject (${subject || 'general'}), focus on that subject
- Always maintain a positive and patient tone

Current context:
- Student's class: ${classLevel || 'Class 2'}
- Board: ${board || 'CBSE'}
- Subject focus: ${subject || 'General'}

Respond as Roy Sir would, keeping answers concise but helpful.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 300,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;

        res.status(200).json({
            success: true,
            response: aiResponse,
            teacher: 'Roy Sir'
        });

    } catch (error) {
        console.error('❌ AI Chat API Error:', error);
        
        // Fallback response
        const fallbackResponses = [
            "I'm here to help you learn! Can you tell me more about what you'd like to know?",
            "That's a great question! Let me help you understand this better.",
            "I'm Roy Sir, your AI teacher. How can I assist you with your studies today?",
            "Learning is fun! What subject would you like to explore together?"
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        res.status(200).json({
            success: true,
            response: randomResponse,
            teacher: 'Roy Sir'
        });
    }
}
