import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, context, subject, grade } = req.body;

    // Enhanced system prompt for Indian education context
    const systemPrompt = `You are an expert AI tutor for Indian students. 

Key Guidelines:
- Follow CBSE/ICSE curriculum standards
- Use step-by-step explanations
- Ask guiding questions instead of giving direct answers
- Relate concepts to Indian contexts when possible
- Support both English and Hindi explanations
- Encourage critical thinking

Student Context: Grade ${grade}, Subject: ${subject}
${context ? `Additional Context: ${context}` : ''}

Remember: Guide the student to understand, don't just provide answers.`;

    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7
    });

    const response = completion.content[0].text;

    res.status(200).json({ 
      success: true, 
      response: response,
      usage: {
        input_tokens: completion.usage.input_tokens,
        output_tokens: completion.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get response from Claude',
      details: error.message 
    });
  }
}

// For App Router (Next.js 13+)
export async function POST(request) {
  try {
    const { message, context, subject, grade } = await request.json();

    const systemPrompt = `You are an expert AI tutor for Indian students. 

Key Guidelines:
- Follow CBSE/ICSE curriculum standards
- Use step-by-step explanations
- Ask guiding questions instead of giving direct answers
- Relate concepts to Indian contexts when possible
- Support both English and Hindi explanations
- Encourage critical thinking

Student Context: Grade ${grade}, Subject: ${subject}
${context ? `Additional Context: ${context}` : ''}

Remember: Guide the student to understand, don't just provide answers.`;

    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7
    });

    return Response.json({ 
      success: true, 
      response: completion.content[0].text,
      usage: {
        input_tokens: completion.usage.input_tokens,
        output_tokens: completion.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to get response from Claude',
      details: error.message 
    }, { status: 500 });
  }
} 