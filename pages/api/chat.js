import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const UPGRADED_MODEL = 'gpt-4o';
const KNOWLEDGE_TIMEOUT_MS = 5000;

// Function to determine if we need to use upgraded model
function shouldUseUpgradedModel(userMessage, messages) {
  const message = userMessage.toLowerCase();
  const allMessages = messages.map(m => m.content.toLowerCase()).join(' ');
  
  // Keywords that indicate need for current knowledge
  const currentKnowledgeKeywords = [
    'current', 'latest', 'recent', 'now', 'today', '2024', '2025',
    'president', 'prime minister', 'minister', 'government',
    'election', 'result', 'news', 'update', 'latest news',
    'current affairs', 'recent events', 'what happened',
    'wrong', 'incorrect', 'not right', 'outdated', 'old information',
    'that\'s wrong', 'that is wrong', 'you are wrong', 'you\'re wrong'
  ];
  
  // Check if message contains current knowledge keywords
  const hasCurrentKnowledgeRequest = currentKnowledgeKeywords.some(keyword => 
    message.includes(keyword) || allMessages.includes(keyword)
  );
  
  // Check if user is correcting information
  const isCorrectingInfo = /(wrong|incorrect|not right|outdated|old)/.test(message);
  
  return hasCurrentKnowledgeRequest || isCorrectingInfo;
}

// Function to check user's daily GPT-4o usage limit
async function checkUserUpgradedModelLimit(userId) {
  if (!userId) return false; // No user ID, can't track
  
  try {
    // For now, we'll use a simple approach - you can implement Supabase tracking later
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `gpt4o_usage_${userId}_${today}`;
    
    // Check if we have usage data for today
    const usageData = process.env[key] || '0';
    const todayUsage = parseInt(usageData);
    
    if (todayUsage >= 5) {
      console.log(`⚠️ User ${userId} has reached daily GPT-4o limit (5 requests)`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('⚠️ Error checking user GPT-4o limit:', error);
    return false; // Default to false if there's an error
  }
}

// Function to increment user's GPT-4o usage
async function incrementUserUpgradedModelUsage(userId) {
  if (!userId) return;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `gpt4o_usage_${userId}_${today}`;
    
    const currentUsage = parseInt(process.env[key] || '0');
    process.env[key] = (currentUsage + 1).toString();
    
    console.log(`📊 User ${userId} GPT-4o usage: ${currentUsage + 1}/5 today`);
  } catch (error) {
    console.warn('⚠️ Error incrementing user GPT-4o usage:', error);
  }
}

// ---------- Shared Core Logic ----------
async function processChatRequest({ messages, grade, subject, response_format, language, user_profile, avatar, host }) {
  // 1️⃣ Input Validation
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('No messages provided');
  }

  const lastUserMessage = messages[messages.length - 1]?.content?.trim() || '';
  if (!lastUserMessage) {
    throw new Error('Last message is empty');
  }

  // Check if we need to upgrade to GPT-4o for current knowledge
  const needsUpgradedModel = shouldUseUpgradedModel(lastUserMessage, messages);
  
  // Check user's daily GPT-4o usage limit
  const canUseUpgradedModel = await checkUserUpgradedModelLimit(user_profile?.id);

  // 2️⃣ Fetch Knowledge Bank Context (with timeout)
  let knowledgeContext = '';
  try {
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), KNOWLEDGE_TIMEOUT_MS);

    const knowledgeResponse = await fetch(`${protocol}://${host}/api/knowledge-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: lastUserMessage, grade: `class${grade}`, subject }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (knowledgeResponse.ok) {
      const knowledgeData = await knowledgeResponse.json();
      knowledgeContext = knowledgeData?.results?.context || '';
    }
  } catch (error) {
    console.warn('📌 Knowledge search skipped:', error.message);
  }

  // 3️⃣ Build User Context
  const userContext = {
    name: user_profile?.full_name || user_profile?.name || 'Student',
    class: user_profile?.class || grade,
    board: user_profile?.board || 'CBSE',
    subject: user_profile?.subject || subject
  };

  // 4️⃣ Teacher Persona Selection
  const isHindiTeacher = avatar === 'miss-sapna';

  let teacherPersona;
  if (isHindiTeacher) {
    teacherPersona = {
      name: 'Miss Sapna',
      personality: 'nurturing and culturally aware',
             language: 'ALWAYS respond primarily in Hindi with English terms for technical concepts. Use Hinglish naturally. If the student asks in Hindi, respond in Hindi. If they ask in English, still respond in Hindi/Hinglish unless they specifically ask for English only. IMPORTANT: Always answer the student\'s question first, then if they asked in English, end your response with: "अगर आप अंग्रेजी में पढ़ना चाहते हैं तो कृपया सेटिंग्स में जाकर Roy Sir को चुनें।"',
      cultural: 'Reference Indian festivals, traditions, and cultural context when relevant.',
    };
  } else {
    teacherPersona = {
      name: 'Roy Sir',
      personality: 'professional and structured',
             language: 'ALWAYS respond in English only, regardless of the language of the question. If the student asks a question in Hindi, respond in English and politely suggest they switch to Miss Sapana in settings for Hindi comfort. NEVER respond in Hindi or Devanagari script. IMPORTANT: Always answer the student\'s question first, then if they asked in Hindi, end your response with: "If you would prefer to learn in Hindi, please go to settings and select Miss Sapna who will teach you in Hindi."',
      cultural: 'Use international examples while keeping Indian context in mind.',
    };
  }

  // 5️⃣ System Prompt Assembly
  let systemPrompt = `You are ${teacherPersona.name}, an expert AI tutor for Indian students.

CRITICAL LANGUAGE RULES:
${teacherPersona.language}

AVATAR-SPECIFIC RULES:
- You are ${teacherPersona.name}
- ${teacherPersona.name === 'Roy Sir' ? 'NEVER use Hindi or Devanagari script. ALWAYS respond in English only.' : 'Use Hindi/Hinglish naturally with English terms for technical concepts.'}
- Stay in character as ${teacherPersona.name} at all times
- Do not mention that you are an AI - act as a real teacher

CHAT HISTORY ANALYSIS RULES:
- ALWAYS analyze the conversation history before responding to understand context and continuity
- Check if the current question relates to previous topics discussed in this session
- If the question builds on a previous concept, acknowledge the connection: "Building on what we discussed about [previous topic]..."
- If the question is completely new, start fresh but maintain conversational flow
- Reference previous explanations when relevant: "Remember when we talked about [concept]? This is similar because..."
- If student asks for clarification on something discussed earlier, refer back to the previous explanation
- Identify learning progression: if moving from basic to advanced concepts, acknowledge the progression
- If student seems confused about a topic discussed earlier, offer to review or explain differently
- Maintain subject continuity: if switching subjects mid-conversation, acknowledge the change
- Use previous examples or analogies mentioned in the conversation when helpful for current explanation

ACADEMIC FOCUS RULES:
- ONLY answer academic questions related to the student's class and subjects
- For non-academic questions, politely redirect: "Let's focus on your studies. Is there something from your ${userContext.subject} syllabus you'd like to learn?"
- If student seems bored, offer: "Would you like me to tell you an educational story? I can share stories from Panchatantra (for classes 1-3), Ramayan, or Mahabharat that teach important lessons."
- For classes 1-3: Offer Panchatantra stories with moral lessons
- For all classes: Offer stories from Hindu mythology that teach values and life lessons

EXAM PAPER GENERATION:
- If student asks for practice questions or exam papers, ask: "Which chapters would you like the questions from?"
- Generate exam papers with: 10 objective questions (5 fill-in-blanks, 5 True/False), 5 short answer questions, 5 long answer questions
- Use chat history and student's topics to create relevant questions
- Always align questions with ${userContext.board} syllabus standards for their class
- Follow ${userContext.board} curriculum structure and difficulty level

Cultural Context: ${teacherPersona.cultural}

Student: ${userContext.name}, Class ${userContext.class}, Board ${userContext.board}, Subject ${userContext.subject}
${knowledgeContext ? `\nKnowledge Bank Context:\n${knowledgeContext}` : ''}`;

  // 6️⃣ Determine which model to use
  const selectedModel = (needsUpgradedModel && canUseUpgradedModel) ? UPGRADED_MODEL : DEFAULT_MODEL;
  
  // Add model info to system prompt
  const modelInfo = selectedModel === UPGRADED_MODEL ? 
    '\n\nIMPORTANT: You are using GPT-4o for current knowledge. Provide the most up-to-date information available.' :
    '\n\nNOTE: You are using GPT-3.5-turbo. For questions about current events or recent information, suggest asking again with keywords like "current" or "latest".';
  
  const finalSystemPrompt = systemPrompt + modelInfo;
  
  console.log(`🤖 Using model: ${selectedModel} (needs upgrade: ${needsUpgradedModel}, can use: ${canUseUpgradedModel})`);
  
  // 7️⃣ Call OpenAI API
  const chat = await openai.chat.completions.create({
    model: selectedModel,
    temperature: 0.7,
    messages: [
      { role: 'system', content: finalSystemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ],
    ...(response_format ? { response_format } : {})
  });
  
  // 8️⃣ Track GPT-4o usage if used
  if (selectedModel === UPGRADED_MODEL) {
    await incrementUserUpgradedModelUsage(user_profile?.id);
  }

  return {
    success: true,
    response: chat.choices[0]?.message?.content || '',
    usage: chat.usage || {}
  };
}

// ---------- Pages Router (pages/api/chat.js) ----------
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const result = await processChatRequest({ ...req.body, host: req.headers.host || 'tution.app' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// ---------- App Router (app/api/chat/route.js) ----------
export async function POST(request) {
  try {
    const body = await request.json();
    const host = request.headers.get('host') || 'tution.app';
    const result = await processChatRequest({ ...body, host });
    return Response.json(result);
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
