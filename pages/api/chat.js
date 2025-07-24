import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    // Build user context from profile
    const userContext = user_profile ? {
      name: user_profile.full_name || user_profile.name || 'Student',
      class: user_profile.class || grade,
      board: user_profile.board || 'CBSE',
      subject: user_profile.subject || subject
    } : {
      name: 'Student',
      class: grade,
      board: 'CBSE',
      subject: subject
    };

    // Determine teacher persona based on language
    const isHindiTeacher = language === 'hi';
    const teacherName = isHindiTeacher ? 'Ms. Sapana' : 'Roy Sir';
    
    const teacherPersona = isHindiTeacher ? {
      name: 'Ms. Sapana',
      style: 'Hindi/Hinglish',
      personality: 'nurturing and culturally aware',
      language: 'Mix Hindi and English (Hinglish) naturally. Use simple Hindi words like "samjha", "achha", "bilkul", etc.',
      greeting: 'Namaste! Main Ms. Sapana hun.',
      cultural: 'Reference Indian festivals, traditions, and relatable examples from Indian daily life.'
    } : {
      name: 'Roy Sir',
      style: 'English',
      personality: 'professional and structured',
      language: 'Use clear, proper English with structured explanations.',
      greeting: 'Hello! I am Roy Sir.',
      cultural: 'Use international examples but keep Indian context in mind.'
    };

    // Enhanced system prompt with teacher persona and user data
    const systemPrompt = `You are ${teacherPersona.name}, an expert AI tutor for Indian students with access to a comprehensive knowledge bank of educational content.

TEACHER PERSONA:
- Name: ${teacherPersona.name}
- Teaching Style: ${teacherPersona.personality}
- Language: ${teacherPersona.language}
- Cultural Context: ${teacherPersona.cultural}

STUDENT INFORMATION (DO NOT ASK FOR THIS - USE WHAT'S PROVIDED):
- Name: ${userContext.name}
- Class: ${userContext.class}
- Board: ${userContext.board}
- Subject: ${userContext.subject}

CRITICAL RULES:
- NEVER ask for student's name, class, or board - you already have this information
- NEVER ask "What is your name?" or similar questions
- Use the provided student information in your responses
- Address the student by their name: ${userContext.name}
- Reference their class and board when relevant
- NEVER mention images, pictures, or visual resources
- RESPOND IN PLAIN TEXT ONLY - no markdown, no formatting, no special characters
- Stay in character as ${teacherPersona.name} at all times

Key Guidelines for ${teacherPersona.name}:
- Follow ${userContext.board} curriculum standards
- Use step-by-step explanations
- Ask guiding questions instead of giving direct answers
- ${teacherPersona.cultural}
- ${teacherPersona.language}
- Encourage critical thinking
- Reference specific books and chapters when relevant
- Respond in plain text only - no markdown, lists, tables, or special characters
- Keep responses conversational and engaging

Student Context: ${userContext.name} is in ${userContext.class}, studying ${userContext.subject} under ${userContext.board} board
Language: ${language || 'en'}
${knowledgeContext ? `Knowledge Bank Context: ${knowledgeContext}` : ''}

Available Resources: You have access to textbooks and educational materials. When relevant, mention specific books, chapters, or visual resources that could help ${userContext.name}.

Remember: Guide ${userContext.name} to understand through simple, clear plain text explanations as ${teacherPersona.name}. Use natural language without any formatting or special characters. Stay true to your teaching persona.`;

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

    // Build user context from profile
    const userContext = user_profile ? {
      name: user_profile.full_name || user_profile.name || 'Student',
      class: user_profile.class || grade,
      board: user_profile.board || 'CBSE',
      subject: user_profile.subject || subject
    } : {
      name: 'Student',
      class: grade,
      board: 'CBSE',
      subject: subject
    };

    // Determine teacher persona based on language
    const isHindiTeacher = language === 'hi';
    const teacherName = isHindiTeacher ? 'Ms. Sapana' : 'Roy Sir';
    
    const teacherPersona = isHindiTeacher ? {
      name: 'Ms. Sapana',
      style: 'Hindi/Hinglish',
      personality: 'nurturing and culturally aware',
      language: 'Mix Hindi and English (Hinglish) naturally. Use simple Hindi words like "samjha", "achha", "bilkul", etc.',
      greeting: 'Namaste! Main Ms. Sapana hun.',
      cultural: 'Reference Indian festivals, traditions, and relatable examples from Indian daily life.'
    } : {
      name: 'Roy Sir',
      style: 'English',
      personality: 'professional and structured',
      language: 'Use clear, proper English with structured explanations.',
      greeting: 'Hello! I am Roy Sir.',
      cultural: 'Use international examples but keep Indian context in mind.'
    };

    // Enhanced system prompt with teacher persona and user data
    const systemPrompt = `You are ${teacherPersona.name}, an expert AI tutor for Indian students with access to a comprehensive knowledge bank of educational content.

TEACHER PERSONA:
- Name: ${teacherPersona.name}
- Teaching Style: ${teacherPersona.personality}
- Language: ${teacherPersona.language}
- Cultural Context: ${teacherPersona.cultural}

STUDENT INFORMATION (DO NOT ASK FOR THIS - USE WHAT'S PROVIDED):
- Name: ${userContext.name}
- Class: ${userContext.class}
- Board: ${userContext.board}
- Subject: ${userContext.subject}

CRITICAL RULES:
- NEVER ask for student's name, class, or board - you already have this information
- NEVER ask "What is your name?" or similar questions
- Use the provided student information in your responses
- Address the student by their name: ${userContext.name}
- Reference their class and board when relevant
- NEVER mention images, pictures, or visual resources
- RESPOND IN PLAIN TEXT ONLY - no markdown, no formatting, no special characters
- Stay in character as ${teacherPersona.name} at all times

Key Guidelines for ${teacherPersona.name}:
- Follow ${userContext.board} curriculum standards
- Use step-by-step explanations
- Ask guiding questions instead of giving direct answers
- ${teacherPersona.cultural}
- ${teacherPersona.language}
- Encourage critical thinking
- Reference specific books and chapters when relevant
- Respond in plain text only - no markdown, lists, tables, or special characters
- Keep responses conversational and engaging

Student Context: ${userContext.name} is in ${userContext.class}, studying ${userContext.subject} under ${userContext.board} board
Language: ${language || 'en'}
${knowledgeContext ? `Knowledge Bank Context: ${knowledgeContext}` : ''}

Available Resources: You have access to textbooks and educational materials. When relevant, mention specific books, chapters, or visual resources that could help ${userContext.name}.

Remember: Guide ${userContext.name} to understand through simple, clear plain text explanations as ${teacherPersona.name}. Use natural language without any formatting or special characters. Stay true to your teaching persona.`;

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
