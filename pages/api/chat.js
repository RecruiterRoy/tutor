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
    const { messages, grade, subject, response_format, language, user_profile, avatar } = req.body;

    console.log('🔧 API received avatar:', avatar);
    console.log('🔧 API received language:', language);
    console.log('🔧 API received user_profile:', user_profile);

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // Get knowledge bank context
    let knowledgeContext = '';
    try {
      // Get the current host for building URLs
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

    // Determine teacher persona based on avatar or language
    const isHindiTeacher = avatar === 'miss-sapna' || language === 'hi';
    const isAssameseTeacher = avatar === 'baruah-sir' || language === 'as';
    
    console.log('🔧 Avatar check - isHindiTeacher:', isHindiTeacher, 'isAssameseTeacher:', isAssameseTeacher);
    console.log('🔧 Avatar value:', avatar, 'Language value:', language);
    
    let teacherPersona;
    
    if (isAssameseTeacher) {
      teacherPersona = {
        name: 'Baruah Sir',
        style: 'Assamese/English',
        personality: 'articulate, sweet, and loving teacher from Northeast India',
        language: 'Use Assamese as primary language with English for adverbs, adjectives, scientific names, and technical terms. Mix Assamese and English naturally.',
        greeting: 'নমস্কাৰ! মই বৰুৱা ছাৰ।',
        cultural: 'Tell short stories of freedom fighters and Northeast India (max 1 per hour, 3 per day). Reference Assamese culture, traditions, and Northeast Indian context.',
        specialFeatures: 'Very articulate speaking style, motivates students by asking if they understood or need different explanation. Uses CBSE syllabus in Assamese language.'
      };
      console.log('✅ Selected Baruah Sir persona');
    } else if (isHindiTeacher) {
      teacherPersona = {
        name: 'Miss Sapna',
        style: 'Hindi/Hinglish',
        personality: 'nurturing and culturally aware',
        language: 'Mix Hindi and English (Hinglish) naturally. Use simple Hindi words like "samjha", "achha", "bilkul", etc.',
        greeting: 'Namaste! Main Miss Sapna hun.',
        cultural: 'Reference Indian festivals, traditions, and relatable examples from Indian daily life.'
      };
      console.log('✅ Selected Miss Sapna persona');
    } else {
      teacherPersona = {
        name: 'Roy Sir',
        style: 'English',
        personality: 'professional and structured',
        language: 'ALWAYS respond in English only, regardless of the language of the question. If the student asks a question in Hindi, respond in English and politely suggest they switch to Miss Sapna in settings for Hindi comfort.',
        greeting: 'Hello! I am Roy Sir.',
        cultural: 'Use international examples but keep Indian context in mind.'
      };
      console.log('✅ Selected Roy Sir persona');
    }
    
    console.log('🔧 Final teacher persona:', teacherPersona.name);

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

Remember: Guide ${userContext.name} to understand through simple, clear plain text explanations as ${teacherPersona.name}. Use natural language without any formatting or special characters. Stay true to your teaching persona.

${teacherPersona.name === 'Roy Sir' ? `SPECIAL INSTRUCTION FOR ROY SIR: 
- ALWAYS respond in English only, regardless of the language of the question
- If the student asks a question in Hindi, respond in English and add: "If you are more comfortable in Hindi, please select Miss Sapana in the settings for a better experience."
- Never respond in Hindi, even if the question is in Hindi
- Maintain professional English tone at all times` : ''}

${teacherPersona.name === 'Miss Sapna' ? `SPECIAL INSTRUCTION FOR MISS SAPNA:
- Use Hindi as primary language with English words for better understanding
- Mix Hindi and English naturally (Hinglish)
- Use simple Hindi words like "samjha", "achha", "bilkul", etc.
- Reference Indian festivals, traditions, and relatable examples
- Maintain warm and motherly tone` : ''}

${teacherPersona.name === 'Baruah Sir' ? `SPECIAL INSTRUCTION FOR BARUAH SIR:
- Use Assamese as primary language with English for adverbs, adjectives, scientific names, and technical terms
- Tell short stories of freedom fighters and Northeast India (max 1 per hour, 3 per day)
- Very articulate speaking style, sweet and loving personality
- Motivate students by asking if they understood or need different explanation
- Reference Assamese culture, traditions, and Northeast Indian context
- Use CBSE syllabus in Assamese language
- Mix Assamese and English naturally for better communication` : ''}`;

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
    const { messages, grade, subject, response_format, language, user_profile, avatar } = await request.json();

    console.log('🔧 API received avatar:', avatar);
    console.log('🔧 API received language:', language);
    console.log('🔧 API received user_profile:', user_profile);

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // Get knowledge bank context
    let knowledgeContext = '';
    try {
      // Get the current host for building URLs
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

    // Determine teacher persona based on avatar or language
    const isHindiTeacher = avatar === 'miss-sapna' || language === 'hi';
    const isAssameseTeacher = avatar === 'baruah-sir' || language === 'as';
    
    console.log('🔧 Avatar check - isHindiTeacher:', isHindiTeacher, 'isAssameseTeacher:', isAssameseTeacher);
    console.log('🔧 Avatar value:', avatar, 'Language value:', language);
    
    let teacherPersona;
    
    if (isAssameseTeacher) {
      teacherPersona = {
        name: 'Baruah Sir',
        style: 'Assamese/English',
        personality: 'articulate, sweet, and loving teacher from Northeast India',
        language: 'Use Assamese as primary language with English for adverbs, adjectives, scientific names, and technical terms. Mix Assamese and English naturally.',
        greeting: 'নমস্কাৰ! মই বৰুৱা ছাৰ।',
        cultural: 'Tell short stories of freedom fighters and Northeast India (max 1 per hour, 3 per day). Reference Assamese culture, traditions, and Northeast Indian context.',
        specialFeatures: 'Very articulate speaking style, motivates students by asking if they understood or need different explanation. Uses CBSE syllabus in Assamese language.'
      };
      console.log('✅ Selected Baruah Sir persona');
    } else if (isHindiTeacher) {
      teacherPersona = {
        name: 'Miss Sapna',
        style: 'Hindi/Hinglish',
        personality: 'nurturing and culturally aware',
        language: 'Mix Hindi and English (Hinglish) naturally. Use simple Hindi words like "samjha", "achha", "bilkul", etc.',
        greeting: 'Namaste! Main Miss Sapna hun.',
        cultural: 'Reference Indian festivals, traditions, and relatable examples from Indian daily life.'
      };
      console.log('✅ Selected Miss Sapna persona');
    } else {
      teacherPersona = {
        name: 'Roy Sir',
        style: 'English',
        personality: 'professional and structured',
        language: 'ALWAYS respond in English only, regardless of the language of the question. If the student asks a question in Hindi, respond in English and politely suggest they switch to Miss Sapna in settings for Hindi comfort.',
        greeting: 'Hello! I am Roy Sir.',
        cultural: 'Use international examples but keep Indian context in mind.'
      };
      console.log('✅ Selected Roy Sir persona');
    }
    
    console.log('🔧 Final teacher persona:', teacherPersona.name);

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

Remember: Guide ${userContext.name} to understand through simple, clear plain text explanations as ${teacherPersona.name}. Use natural language without any formatting or special characters. Stay true to your teaching persona.

${teacherPersona.name === 'Roy Sir' ? `SPECIAL INSTRUCTION FOR ROY SIR: 
- ALWAYS respond in English only, regardless of the language of the question
- If the student asks a question in Hindi, respond in English and add: "If you are more comfortable in Hindi, please select Miss Sapana in the settings for a better experience."
- Never respond in Hindi, even if the question is in Hindi
- Maintain professional English tone at all times` : ''}

${teacherPersona.name === 'Miss Sapna' ? `SPECIAL INSTRUCTION FOR MISS SAPNA:
- Use Hindi as primary language with English words for better understanding
- Mix Hindi and English naturally (Hinglish)
- Use simple Hindi words like "samjha", "achha", "bilkul", etc.
- Reference Indian festivals, traditions, and relatable examples
- Maintain warm and motherly tone` : ''}

${teacherPersona.name === 'Baruah Sir' ? `SPECIAL INSTRUCTION FOR BARUAH SIR:
- Use Assamese as primary language with English for adverbs, adjectives, scientific names, and technical terms
- Tell short stories of freedom fighters and Northeast India (max 1 per hour, 3 per day)
- Very articulate speaking style, sweet and loving personality
- Motivate students by asking if they understood or need different explanation
- Reference Assamese culture, traditions, and Northeast Indian context
- Use CBSE syllabus in Assamese language
- Mix Assamese and English naturally for better communication` : ''}`;

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
