import Anthropic from '@anthropic-ai/sdk';

// Check if API key is available
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if API key is configured
  if (!anthropic) {
    console.error('Anthropic API key not configured');
    return res.status(500).json({ 
      success: false, 
      error: 'AI service not configured',
      details: 'Please configure the ANTHROPIC_API_KEY environment variable in Vercel'
    });
  }

  try {
    const { messages, grade, subject, response_format, language, user_profile } = req.body;

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // Get knowledge bank context
    let knowledgeContext = '';
    try {
      const host = req.headers.host || 'tution.app';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      
      const knowledgeResponse = await fetch(`${protocol}://${host}/api/knowledge-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: lastUserMessage, 
          grade: `class${grade}`, 
          subject 
        })
      });
      
      if (knowledgeResponse.ok) {
        const knowledgeData = await knowledgeResponse.json();
        if (knowledgeData.results && knowledgeData.results.context) {
          knowledgeContext = knowledgeData.results.context;
        }
      }
    } catch (error) {
      console.log('Knowledge search failed, continuing without it:', error.message);
    }

    // Enhanced system prompt with knowledge bank integration
    const systemPrompt = `You are an expert AI tutor for Indian students with access to a comprehensive knowledge bank of educational content.

Key Guidelines:
- Follow CBSE/ICSE curriculum standards
- Use step-by-step explanations
- Ask guiding questions instead of giving direct answers
- Relate concepts to Indian contexts when possible
- Support both English and Hindi explanations
- Encourage critical thinking
- Reference specific books and chapters when relevant
- Respond in plain text only - no markdown, lists, tables, or special characters
- Keep responses conversational and engaging

Student Context: Grade ${grade}, Subject: ${subject}
Language: ${language || 'en'}
${user_profile ? `Student Profile: ${JSON.stringify(user_profile)}` : ''}
${knowledgeContext ? `Knowledge Bank Context: ${knowledgeContext}` : ''}

Available Resources: You have access to textbooks, images, and educational materials. When relevant, mention specific books, chapters, or visual resources that could help the student.

Remember: Guide the student to understand, don't just provide answers. Use the available educational resources to provide accurate, grade-appropriate information. Respond in clean, plain text that can be read aloud by text-to-speech.`;

    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages,
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
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get response from AI tutor',
      details: error.message 
    });
  }
}

// For App Router (Next.js 13+)
export async function POST(request) {
  try {
    const { messages, grade, subject, response_format, language, user_profile } = await request.json();

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // Get knowledge bank context
    let knowledgeContext = '';
    try {
      const host = request.headers.get('host') || 'tution.app';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      
      const knowledgeResponse = await fetch(`${protocol}://${host}/api/knowledge-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: lastUserMessage, 
          grade: `class${grade}`, 
          subject 
        })
      });
      
      if (knowledgeResponse.ok) {
        const knowledgeData = await knowledgeResponse.json();
        if (knowledgeData.results && knowledgeData.results.context) {
          knowledgeContext = knowledgeData.results.context;
        }
      }
    } catch (error) {
      console.log('Knowledge search failed, continuing without it:', error.message);
    }

    // Enhanced system prompt with knowledge bank integration
    const systemPrompt = `You are an expert AI tutor for Indian students with access to a comprehensive knowledge bank of educational content.

Key Guidelines:
- Follow CBSE/ICSE curriculum standards
- Use step-by-step explanations
- Ask guiding questions instead of giving direct answers
- Relate concepts to Indian contexts when possible
- Support both English and Hindi explanations
- Encourage critical thinking
- Reference specific books and chapters when relevant
- Respond in plain text only - no markdown, lists, tables, or special characters
- Keep responses conversational and engaging

Student Context: Grade ${grade}, Subject: ${subject}
Language: ${language || 'en'}
${user_profile ? `Student Profile: ${JSON.stringify(user_profile)}` : ''}
${knowledgeContext ? `Knowledge Bank Context: ${knowledgeContext}` : ''}

Available Resources: You have access to textbooks, images, and educational materials. When relevant, mention specific books, chapters, or visual resources that could help the student.

Remember: Guide the student to understand, don't just provide answers. Use the available educational resources to provide accurate, grade-appropriate information. Respond in clean, plain text that can be read aloud by text-to-speech.`;

    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages,
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
    console.error('Chat API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to get response from AI tutor',
      details: error.message 
    }, { status: 500 });
  }
} 
