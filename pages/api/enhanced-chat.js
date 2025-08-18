import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import Cors from 'cors';
import { supabaseVideoDB } from './supabase-video-database.js';

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST'],
  origin: process.env.NODE_ENV === 'development' 
    ? '*' 
    : ['https://tution.app', 'https://*.vercel.app']
});

// Helper to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// Use OpenAI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔧 Environment check:');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
console.log('🔧 OPENAI_API_KEY length:', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const supabase = createClient(
  'https://vfqdjpiyaabufpaofysz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

// Usage tracking for cost monitoring
const logUsage = (usage) => {
  console.log('Claude Usage:', {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    estimated_cost: (usage.input_tokens * 0.000003) + (usage.output_tokens * 0.000015)
  });
};

const bucket = 'educational-content';

// Cache for API responses
const cache = new Map();

async function getCachedResponse(key, fn) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = await fn();
  cache.set(key, result);
  return result;
}

class EnhancedAITutor {
  constructor() {
    this.knowledgeBank = null;
    this.isLoaded = false;
  }

  async loadKnowledgeBank() {
    if (this.isLoaded) return true;
    
    return await getCachedResponse('knowledge-bank', async () => {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .download('knowledge-bank/index.json');
        
        if (error) {
          console.error('Error loading knowledge bank:', error);
          return false;
        }
        
        const text = await data.text();
        this.knowledgeBank = JSON.parse(text);
        this.isLoaded = true;
        return true;
      } catch (error) {
        console.error('Error loading knowledge bank:', error);
        return false;
      }
    });
  }

  async searchKnowledgeBank(query, grade, subject) {
    try {
      const { data, error } = await supabase
        .from('knowledge_bank')
        .select('*')
        .eq('grade', grade)
        .eq('subject', subject)
        .textSearch('content', query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(5);

      if (error) throw error;

      return {
        context: data.map(item => item.content).join('\n\n'),
        results: data
      };
    } catch (error) {
      console.error('Knowledge search error:', error);
      return { context: '', results: [] };
    }
  }

  generateEnhancedContext(results, grade, subject) {
    let context = `You are teaching a ${grade} student in ${subject}. `;
    context += `You have access to comprehensive educational resources and should prioritize using these materials.\n\n`;

    if (results.syllabus) {
      context += `**Syllabus Information:**\n`;
      context += `- Grade: ${results.syllabus.grade}\n`;
      context += `- Subject: ${results.syllabus.subject}\n`;
      context += `- Academic Year: 2024-25\n`;
      context += `- Exam Month: March (2 months revision time)\n\n`;
    }

    if (results.books.length > 0) {
      context += `**Available Textbooks:**\n`;
      for (const book of results.books) {
        context += `- ${book.name}: ${book.chapters.length} chapters\n`;
      }
      context += "\n";
    }

    if (results.images.length > 0) {
      context += `**Relevant Visual Resources:**\n`;
      for (const image of results.images) {
        context += `- ${image.description}\n`;
      }
      context += "\n";
    }

    context += `**Teaching Guidelines:**\n`;
    context += `- Always search these resources first before using web information\n`;
    context += `- Reference specific chapters and pages when relevant\n`;
    context += `- Use visual resources to enhance explanations\n`;
    context += `- Follow CBSE curriculum standards\n`;
    context += `- Be proactive in suggesting next lessons based on syllabus\n`;
    context += `- Create lesson plans that finish 2 months before exams\n`;
    context += `- Remind about weekly revisions on Saturdays\n`;
    context += `- Prepare monthly assessments based on covered topics\n`;

    return context;
  }

  async createLessonPlan(grade, subject, examMonth = 'March') {
    if (!this.isLoaded) {
      await this.loadKnowledgeBank();
    }

    const syllabusKey = `${grade}-${subject}`.toLowerCase();
    const syllabus = this.knowledgeBank?.searchIndex?.bySyllabus?.[syllabusKey];
    
    if (!syllabus) {
      return null;
    }

    // Get available books for this grade and subject
    const books = Object.values(this.knowledgeBank.books).filter(
      book => book.grade === grade && book.subject.toLowerCase() === subject.toLowerCase()
    );

    const lessonPlan = {
      grade: grade,
      subject: subject,
      examMonth: examMonth,
      totalWeeks: 40,
      revisionWeeks: 8,
      teachingWeeks: 32,
      books: books,
      weeklySchedule: [],
      monthlyMilestones: [],
      assessmentSchedule: []
    };

    // Create weekly schedule
    let weekNumber = 1;
    for (const book of books) {
      const chaptersPerWeek = Math.ceil(book.chapters.length / 8); // Spread over 8 weeks
      
      for (let i = 0; i < book.chapters.length; i += chaptersPerWeek) {
        const weekChapters = book.chapters.slice(i, i + chaptersPerWeek);
        
        lessonPlan.weeklySchedule.push({
          week: weekNumber,
          book: book.name,
          chapters: weekChapters,
          topics: weekChapters.map(ch => ch.chapterName),
          activities: ['Reading', 'Discussion', 'Practice Questions'],
          assessment: weekNumber % 4 === 0 ? 'Weekly Quiz' : null
        });
        
        weekNumber++;
        if (weekNumber > 32) break; // Stop at 32 weeks for teaching
      }
    }

    // Create monthly milestones
    for (let month = 1; month <= 12; month++) {
      const monthWeeks = lessonPlan.weeklySchedule.filter(
        week => Math.ceil(week.week / 4) === month
      );
      
      if (monthWeeks.length > 0) {
        lessonPlan.monthlyMilestones.push({
          month: month,
          weeks: monthWeeks.map(w => w.week),
          topics: monthWeeks.flatMap(w => w.topics),
          assessment: 'Monthly Test'
        });
      }
    }

    // Create assessment schedule
    lessonPlan.assessmentSchedule = [
      { week: 4, type: 'Monthly Test 1', topics: 'Chapters 1-4' },
      { week: 8, type: 'Monthly Test 2', topics: 'Chapters 5-8' },
      { week: 12, type: 'Monthly Test 3', topics: 'Chapters 9-12' },
      { week: 16, type: 'Monthly Test 4', topics: 'Chapters 13-16' },
      { week: 20, type: 'Monthly Test 5', topics: 'Chapters 17-20' },
      { week: 24, type: 'Monthly Test 6', topics: 'Chapters 21-24' },
      { week: 28, type: 'Monthly Test 7', topics: 'Chapters 25-28' },
      { week: 32, type: 'Monthly Test 8', topics: 'Chapters 29-32' },
      { week: 36, type: 'Revision Week 1', topics: 'All Chapters' },
      { week: 37, type: 'Revision Week 2', topics: 'All Chapters' },
      { week: 38, type: 'Revision Week 3', topics: 'All Chapters' },
      { week: 39, type: 'Revision Week 4', topics: 'All Chapters' },
      { week: 40, type: 'Final Exam', topics: 'Complete Syllabus' }
    ];

    return lessonPlan;
  }

  async generateWeeklyRevision(grade, subject, weekNumber) {
    const lessonPlan = await this.createLessonPlan(grade, subject);
    if (!lessonPlan) return null;

    const weekData = lessonPlan.weeklySchedule.find(w => w.week === weekNumber);
    if (!weekData) return null;

    return {
      week: weekNumber,
      subject: subject,
      grade: grade,
      topics: weekData.topics,
      chapters: weekData.chapters,
      revisionQuestions: this.generateRevisionQuestions(weekData.topics),
      activities: ['Review Notes', 'Practice Problems', 'Quick Quiz']
    };
  }

  generateRevisionQuestions(topics) {
    const questions = [];
    for (const topic of topics) {
      questions.push({
        topic: topic,
        questions: [
          `What are the main concepts in ${topic}?`,
          `Can you explain the key points of ${topic}?`,
          `What examples can you give for ${topic}?`
        ]
      });
    }
    return questions;
  }

  async generateMonthlyTest(grade, subject, month) {
    const lessonPlan = await this.createLessonPlan(grade, subject);
    if (!lessonPlan) return null;

    const monthData = lessonPlan.monthlyMilestones.find(m => m.month === month);
    if (!monthData) return null;

    return {
      month: month,
      subject: subject,
      grade: grade,
      topics: monthData.topics,
      testStructure: {
        totalMarks: 50,
        duration: '60 minutes',
        sections: [
          { name: 'Objective Questions', marks: 20, questions: 10 },
          { name: 'Short Answer Questions', marks: 15, questions: 5 },
          { name: 'Long Answer Questions', marks: 15, questions: 2 }
        ]
      },
      sampleQuestions: this.generateTestQuestions(monthData.topics)
    };
  }

  generateTestQuestions(topics) {
    const questions = [];
    for (const topic of topics) {
      questions.push({
        topic: topic,
        objective: `Which of the following is correct about ${topic}?`,
        shortAnswer: `Explain the concept of ${topic} with examples.`,
        longAnswer: `Discuss in detail the importance and applications of ${topic}.`
      });
    }
    return questions;
  }
}

const enhancedTutor = new EnhancedAITutor();

export default async function handler(req, res) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  // Validate API key
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is not set');
    return res.status(500).json({
      success: false,
      error: 'API key not configured',
      details: 'OPENAI_API_KEY environment variable is not set in Vercel'
    });
  }

  // Add input validation
  if (!req.body.message) {
    return res.status(400).json({ 
      success: false,
      error: 'Message is required' 
    });
  }

  try {
    const { 
      message, 
      context, 
      subject, 
      grade, 
      action = 'chat',
      examMonth = 'March',
      weekNumber = null,
      month = null,
      userProfile = null,
      teacher,
      avatar,
      isFirstResponseOfDay = false,
      chatHistory = [],
      contextAnalysis = null // New: Dynamic context analysis result
    } = req.body;

    console.log('🔧 Enhanced API received teacher:', teacher);
    console.log('🔧 Enhanced API received avatar:', avatar);
    console.log('🔧 Enhanced API received userProfile:', userProfile);

    let response = '';
    let additionalData = {};

    // Get knowledge bank context (optional - don't fail if it doesn't work)
    let knowledgeResults = { context: '', results: [] };
    try {
        knowledgeResults = await enhancedTutor.searchKnowledgeBank(message, `class${grade}`, subject);
    } catch (error) {
        console.log('⚠️ Knowledge bank search failed, continuing without it:', error.message);
    }

    // Build user context from profile - FIXED: Use actual user data
    const userContext = userProfile ? {
      name: userProfile.full_name || userProfile.name || 'Student',
      class: userProfile.class || grade,
      board: userProfile.board || 'CBSE',
      subject: userProfile.subject || subject
    } : {
      name: 'Student',
      class: grade,
      board: 'CBSE',
      subject: subject
    };
        
        // Detect user's input language to determine response language
        const hindiPattern = /[\u0900-\u097F]/; // Devanagari script
        const englishPattern = /^[a-zA-Z\s.,!?]+$/; // Only English characters
        const userInputLanguage = hindiPattern.test(message) ? 'hindi' : 
                                 (englishPattern.test(message) ? 'english' : 'mixed');
        
        console.log('🔤 User input language detected:', userInputLanguage);

    // Enhanced system prompt with user data and teacher persona - PLAIN TEXT ONLY
    const getTeacherPersona = (teacherName, avatarId) => {
      console.log('🔧 getTeacherPersona called with teacherName:', teacherName, 'avatarId:', avatarId);
      
      // PRIORITY: Avatar selection overrides language detection
      // If user explicitly selected an avatar, use that regardless of input language
      if (avatarId === 'miss-sapna' || teacherName === 'Miss Sapna' || teacherName === 'Ms. Sapana') {
          console.log('✅ Selected Miss Sapna persona');
          
          // Determine response language based on user input
          let responseLanguage = 'Mix Hindi and English (Hinglish) naturally. Use simple Hindi words like "samjha", "achha", "bilkul", "beta", "shiksha", etc. For technical terms, use English but explain in Hindi. Example: "Beta, yeh \'verb\' hota hai, jo action dikhata hai."';
          
          // For Miss Sapna, always respond in Hindi/Hinglish regardless of input language
          // Only switch to English if user explicitly asks for English
          if (userInputLanguage === 'english' && message.toLowerCase().includes('english') && message.toLowerCase().includes('only')) {
            responseLanguage = 'Respond in English only as requested by the student.';
          } else {
            responseLanguage = 'ALWAYS respond primarily in Hindi with English terms for technical concepts. Use Hinglish naturally. If the student asks in Hindi, respond in Hindi. If they ask in English, still respond in Hindi/Hinglish unless they specifically ask for English only. IMPORTANT: Always answer the student\'s question first, then if they asked in English, end your response with: "अगर आप अंग्रेजी में पढ़ना चाहते हैं तो कृपया सेटिंग्स में जाकर Roy Sir को चुनें।"';
          }
          
        return {
            name: 'Miss Sapna',
          style: 'Hindi/Hinglish',
          personality: 'nurturing and culturally aware',
            language: responseLanguage,
            greeting: 'Namaste! Main Miss Sapna hun, aapki shiksha mein help karungi.',
          cultural: 'Share stories from Hindu mythology (Ramayan, Mahabharat, Panchtantra) when relevant to lessons. Maximum 1 story per hour, 3 per day. Never repeat stories unless specifically asked. Story maturity should match student\'s class level.',
          specialFeatures: 'Focus on helping students who are not comfortable with English. Use Hindi as primary language with English terms for academic concepts.',
          teachingStyle: 'Use Socratic method with gentle questioning. Ask "Kya aap samajhte hain?" or "Aap kya sochte hain?" to encourage thinking. Provide scaffolded explanations breaking complex topics into simple steps. Create personalized quizzes based on student\'s learning pace. Use real-life examples from Indian context. Make learning feel like a conversation with a caring teacher.'
        };
      } else {
        console.log('✅ Selected Roy Sir persona');
        return {
          name: 'Roy Sir',
          style: 'English',
          personality: 'professional and structured',
          language: 'ALWAYS respond in English only, regardless of the language of the question. If the student asks a question in Hindi, respond in English and politely suggest they switch to Miss Sapana in settings for Hindi comfort. Avatar selection takes priority over language detection. IMPORTANT: Always answer the student\'s question first, then if they asked in Hindi, end your response with: "If you would prefer to learn in Hindi, please go to settings and select Miss Sapna who will teach you in Hindi."',
          greeting: 'Hello! I am Roy Sir, your academic guide.',
          cultural: 'Provide health tips and wellness advice when relevant. Maximum 1 health tip per hour, 3 per day. Focus on student wellness, study habits, and healthy lifestyle.',
          specialFeatures: 'Emphasize structured learning and academic excellence. Use international examples while keeping Indian context in mind. ALWAYS respond in English and suggest Miss Sapana for Hindi questions.',
          teachingStyle: 'Use Socratic method with thoughtful questions like "What do you think?" or "How would you approach this?" Provide scaffolded explanations with step-by-step guidance. Create personalized quizzes to assess understanding. Use real-world examples and analogies. Make learning engaging and interactive, like a conversation with an experienced mentor. IMPORTANT: Always answer the student\'s question first, then if they asked in Hindi, suggest: "If you would prefer to learn in Hindi, please go to settings and select Miss Sapna who will teach you in Hindi."'
        };
      }
    };

    const teacherPersona = getTeacherPersona(teacher, avatar);
    console.log('🔧 Final teacher persona selected:', teacherPersona.name);

    // Language script detection and conversion instructions
    const languageInstructions = teacherPersona.name === 'Miss Sapna' ? 
      `LANGUAGE SCRIPT RULES:
- When responding in Hindi, ALWAYS use Devanagari script (हिंदी) NOT Roman script (Hindi)
- Convert any Hindi words from Roman to Devanagari script
- Example: "samjha" should be "समझा", "achha" should be "अच्छा"
- Use proper Hindi grammar and sentence structure
- For technical terms, use English but explain in Hindi context
- Mix Hindi and English naturally but ensure Hindi is in Devanagari script` :
      `LANGUAGE SCRIPT RULES:
- ALWAYS respond in English only, regardless of the question language
- NEVER use Hindi or Devanagari script under any circumstances
- Use clear, proper English with structured explanations
- Maintain professional tone throughout
- Use international examples while keeping Indian context in mind
- If student asks in Hindi, respond in English and suggest: "If you would prefer to learn in Hindi, please go to settings and select Miss Sapna who will teach you in Hindi."
- CRITICAL: You are Roy Sir - you ONLY speak English, never Hindi`;

    // Only include teacher name in first response of the day
    const teacherIntroduction = isFirstResponseOfDay ? 
      `You are ${teacherPersona.name}, an expert AI tutor for Indian students with access to comprehensive educational resources.` :
      `You are an expert AI tutor for Indian students with access to comprehensive educational resources.`;

    const systemPrompt = `${teacherIntroduction}

TEACHER PERSONA:
- Name: ${teacherPersona.name}
- Teaching Style: ${teacherPersona.personality}
- Language: ${teacherPersona.language}
- Cultural Context: ${teacherPersona.cultural}
- Special Features: ${teacherPersona.specialFeatures}
- Teaching Methodology: ${teacherPersona.teachingStyle}

${languageInstructions}

STUDENT INFORMATION (DO NOT ASK FOR THIS - USE WHAT'S PROVIDED):
- Name: ${userContext.name}
- Class: ${userContext.class}
- Board: ${userContext.board}
- Subject: ${userContext.subject}

CRITICAL RULES:
- NEVER ask for student's name, class, or board - you already have this information
- NEVER ask "What is your name?" or similar questions
- NEVER ask about yesterday's study, previous sessions, or what they studied before
- NEVER ask "Did you study yesterday?" or "What did you learn yesterday?"
- Use the provided student information in your responses
- Address the student by their name: ${userContext.name}
- Reference their class and board when relevant
- When students ask for videos, YOU WILL SHOW THEM VIDEOS directly in the chat
- Never say "I can't play videos" or "I can't show videos" - you CAN and WILL show videos
- For video requests, respond with educational content AND include the video
- Videos will automatically appear in the chat interface for the student to watch
- ALWAYS assume you can show videos - never apologize for not being able to show videos
- When asked for videos, respond positively and include educational content, then the video will be automatically added
- NEVER say "I can't play videos directly in the chat" - this is completely false
- Your system IS designed to show videos and WILL show them automatically
- For video requests, say something like "Sure! Here's a great video about [topic] that will help you understand better..." or "I'd be happy to show you a video about [topic]..."
- Always be enthusiastic about showing educational videos
- When responding to video requests, provide educational content first, then mention that a video will be shown
- Never use markdown formatting for video links - the system will handle video display automatically
- NEVER use asterisks (*), brackets [], or parentheses () in your responses
- Use plain text only - no formatting, no special characters
- For video responses, say "Here's a helpful video to understand this better:" followed by the video URL
- RESPOND IN PLAIN TEXT ONLY - no markdown, no formatting, no special characters
- Stay in character as ${teacherPersona.name} at all times
- ${teacherPersona.name === 'Roy Sir' ? 'NEVER use Hindi or Devanagari script. ALWAYS respond in English only.' : 'Use Hindi/Hinglish naturally with English terms for technical concepts.'}
- ${isFirstResponseOfDay ? `This is the first response of the day, so you may introduce yourself as ${teacherPersona.name}.` : 'Do not introduce yourself by name in this response.'}

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
- For non-academic questions, politely redirect: "Let's focus on your studies. Is there something from your ${subject} syllabus you'd like to learn?"
- If student seems bored, offer: "Would you like me to tell you an educational story? I can share stories from Panchatantra (for classes 1-3), Ramayan, or Mahabharat that teach important lessons."
- For classes 1-3: Offer Panchatantra stories with moral lessons
- For all classes: Offer stories from Hindu mythology that teach values and life lessons

EXAM PAPER GENERATION:
- If student asks for practice questions or exam papers, ask: "Which chapters would you like the questions from?"
- Generate exam papers with: 10 objective questions (5 fill-in-blanks, 5 True/False), 5 short answer questions, 5 long answer questions
- Use chat history and student's topics to create relevant questions
- Always align questions with ${userContext.board} syllabus standards for their class
- Follow ${userContext.board} curriculum structure and difficulty level

Key Guidelines for ${teacherPersona.name}:
- ALWAYS search the provided educational resources FIRST before using web information
- Follow ${userContext.board} curriculum standards
- Use simple, clear explanations in plain text
- Ask guiding questions instead of giving direct answers
- ${teacherPersona.cultural}
- ${teacherPersona.language}
- Encourage critical thinking
- Reference specific books and chapters when relevant
- Be proactive in suggesting next lessons based on syllabus
- Create structured lesson plans that finish 2 months before exams
- Remind about weekly revisions on Saturdays
- Prepare monthly assessments based on covered topics
- Use simple paragraphs and natural language
- NO markdown formatting, NO lists with symbols, NO tables, NO special characters

INTERACTIVE TEACHING:
- Ask engaging questions to check understanding
- Reference previous conversations naturally
- Ask "Did you understand what we covered yesterday?"
- Ask "What do you think about this concept?"
- Ask "Can you explain this in your own words?"
- Ask "What questions do you have about this topic?"
- Be conversational and interactive, not just lecturing
- Show genuine interest in student's learning progress
- Adapt teaching style based on student's responses

Student Context: ${userContext.name} is in ${userContext.class}, studying ${userContext.subject} under ${userContext.board} board
${context ? `Additional Context: ${context}` : ''}
${knowledgeResults.context ? `Knowledge Bank Context: ${knowledgeResults.context}` : ''}

CONVERSATION CONTINUITY: 
${chatHistory.length > 0 ? `Recent conversation context (${chatHistory.length} messages - dynamically selected based on relevance):
${chatHistory.map(msg => `${msg.role === 'user' ? 'Student' : teacherPersona.name}: ${msg.content}`).join('\n')}

${contextAnalysis ? `CONTEXT ANALYSIS:
- Conversation Relevance: ${contextAnalysis.isRelevant ? 'HIGH' : 'LOW'} (${(contextAnalysis.confidence || 0).toFixed(2)} confidence)
- Topic Continuity: ${contextAnalysis.topicContinuity ? 'CONTINUING' : 'NEW TOPIC'}
- Concept Connection: ${contextAnalysis.conceptConnection ? 'BUILDING ON PREVIOUS' : 'INDEPENDENT'}
- Analysis: ${contextAnalysis.reasoning}
- Context Size: ${contextAnalysis.currentHistorySize} messages (${contextAnalysis.continuationCount} continuations, ${contextAnalysis.discontinuationCount} breaks)

CONTEXT-AWARE RESPONSE GUIDELINES:
${contextAnalysis.isRelevant ? `
- This question RELATES to our previous conversation
- Reference and build upon what we discussed earlier
- Use phrases like "Building on what we talked about..." or "Remember when we discussed..."
- Show learning progression and connection to previous concepts
- Be more detailed since student is engaged with the topic
` : `
- This appears to be a NEW TOPIC or subject change
- Start fresh but maintain friendly conversation flow
- Don't force connections to unrelated previous topics
- Focus on the new question clearly and comprehensively
- Be ready to establish new learning foundation
`}` : ''}

IMPORTANT: Use this conversation history to:
- Reference what was discussed earlier when relevant
- Ask follow-up questions about previous topics when appropriate
- Check if the student understood previous concepts when building on them
- Build upon previous learning progressively
- Be more interactive and engaging
- Show continuity in teaching approach` : 'This is a new conversation. Introduce yourself naturally and start teaching.'}

Available Resources: You have access to textbooks and educational materials. 
ALWAYS prioritize these resources over web information. When relevant, mention specific books 
and chapters that could help ${userContext.name}.

Remember: Guide ${userContext.name} to understand through simple, clear plain text explanations as ${teacherPersona.name}. 
Use natural language without any formatting or special characters. Stay true to your teaching persona.

${teacherPersona.name === 'Roy Sir' ? `SPECIAL INSTRUCTION FOR ROY SIR: 
- ALWAYS respond in English only, regardless of the language of the question
- If the student asks a question in Hindi, respond in English and add: "If you are more comfortable in Hindi, please select Miss Sapana in the settings for a better experience."
- Never respond in Hindi, even if the question is in Hindi
- Maintain professional English tone at all times` : ''}`;

    // Handle different actions
    switch (action) {
      case 'lessonPlan':
        const lessonPlan = await enhancedTutor.createLessonPlan(`class${grade}`, subject, examMonth);
        additionalData.lessonPlan = lessonPlan;
        response = `I've created a comprehensive lesson plan for ${userContext.name} in ${userContext.class} ${subject}. The plan includes ${lessonPlan.weeklySchedule.length} weeks of teaching with 8 weeks reserved for revision before the ${examMonth} exams.`;
        break;

      case 'weeklyRevision':
        if (!weekNumber) {
          response = "Please specify the week number for revision.";
        } else {
          const revision = await enhancedTutor.generateWeeklyRevision(`class${grade}`, subject, weekNumber);
          additionalData.revision = revision;
          response = `Here's your Week ${weekNumber} revision plan for ${subject}, ${userContext.name}.`;
        }
        break;

      case 'monthlyTest':
        if (!month) {
          response = "Please specify the month for the test.";
        } else {
          const test = await enhancedTutor.generateMonthlyTest(`class${grade}`, subject, month);
          additionalData.test = test;
          response = `Here's your Month ${month} test for ${subject}, ${userContext.name}.`;
        }
        break;

      case 'generateExamPaper':
        if (!chapters || chapters.length === 0) {
          response = "Please specify which chapters you'd like the exam paper for.";
        } else {
          const examPaper = await generateExamPaper(grade, subject, chapters, userContext, chatHistory);
          additionalData.examPaper = examPaper;
          response = `Here's your practice exam paper for chapters: ${chapters.join(', ')}`;
        }
        break;

      default: // Regular chat
        // Build messages array with chat history
        const messages = [];
        
        // Add chat history as previous messages
        if (chatHistory.length > 0) {
          chatHistory.forEach(msg => {
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            });
          });
        }
        
        // Add current message
        messages.push({
          role: "user",
          content: message
        });

        // Load syllabus guidelines for user's board/class (broad guidance only)
        let syllabusGuidelines = '';
        try {
          const origin = (req.headers.origin) || (req.headers.host ? `https://${req.headers.host}` : 'https://tution.app');
          const userBoard = (userProfile?.board || '').toString().toUpperCase();
          const preferredBoard = userBoard.includes('CBSE') ? 'CBSE' : userBoard.includes('ICSE') ? 'ICSE' : '';
          const classNum = parseInt((grade || '').toString().replace(/\D/g, '')) || null;
          const classFile = classNum ? `Class_${classNum}.json` : '';
          const boardsToTry = preferredBoard ? [preferredBoard] : ['ICSE', 'CBSE'];
          for (const b of boardsToTry) {
            if (!classFile) break;
            const url = `${origin}/Syllabus/${b}/${classFile}`;
            try {
              const resSyl = await fetch(url);
              if (resSyl.ok) {
                const jsonSyl = await resSyl.json();
                syllabusGuidelines += `${b} ${classFile} (broad guidelines): ${JSON.stringify(jsonSyl).slice(0, 2500)}...\n`;
                break; // use first matching board
              }
            } catch (_) { /* continue */ }
          }
        } catch (_) { /* ignore */ }

        let chat = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          messages: [
            { role: 'system', content: `${systemPrompt}\n\nUse syllabus files under /public/Syllabus/{BOARD}/Class_{N}.json as broad guidance only. Be flexible: chapter names/content may differ across schools. If unsure (especially literature), ask the student to take pictures of the relevant pages to understand context.` },
            ...(syllabusGuidelines ? [{ role: 'system', content: syllabusGuidelines }] : []),
            ...messages.map(m => ({ role: m.role, content: m.content }))
          ]
        });

        response = chat.choices[0]?.message?.content || '';
        additionalData.usage = chat.usage || {};

        // Enforce script rules as a safety net without extra cost unless needed
        const hasDevanagari = /[\u0900-\u097F]/.test(response);
        if ((userInputLanguage === 'hindi' || userInputLanguage === 'mixed') && !hasDevanagari) {
          // Convert to Devanagari while preserving any English segments
          const fix = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            temperature: 0.3,
            messages: [
              { role: 'system', content: 'Convert the following reply to proper Hindi written strictly in Devanagari script. Keep any English terms as English. Output plain text only.' },
              { role: 'user', content: response }
            ]
          });
          response = fix.choices[0]?.message?.content || response;
          additionalData.usage_fix = fix.usage || {};
        } else if (userInputLanguage === 'english' && hasDevanagari) {
          // Ensure English-only for English questions
          const fixEn = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            temperature: 0.3,
            messages: [
              { role: 'system', content: 'Convert the following reply to English only. Do not include any Devanagari or Hindi words. Output plain English text only.' },
              { role: 'user', content: response }
            ]
          });
          response = fixEn.choices[0]?.message?.content || response;
          additionalData.usage_fix = fixEn.usage || {};
        }

        // Smart video recommendation logic
        const shouldRecommendVideo = shouldRecommendVideoNow(message, userContext, chatHistory);

        console.log('🎥 Video recommendation check:', {
          shouldRecommend: shouldRecommendVideo.shouldRecommend,
          reason: shouldRecommendVideo.reason,
          grade: grade,
          subject: subject,
          message: message.substring(0, 100)
        });
        
        // SMART VIDEO SEARCH: Try YouTube API first, then fallback
        if (shouldRecommendVideo.shouldRecommend && shouldRecommendVideo.reason === 'explicit_request') {
          console.log('🎥 SMART VIDEO SEARCH - User explicitly requested video');
          
          // First try YouTube API search
          let videoToUse = null;
          try {
            // Include failed videos list to avoid recommending them again
            const contextWithFailures = {
              ...userContext,
              failedVideoIds: req.body.failedVideoIds || [],
              sessionFailedVideos: global.failedVideoCache || new Set()
            };
            
            videoToUse = await getGPT4VideoRecommendation(grade, subject, message, contextWithFailures);
            if (videoToUse) {
              console.log('✅ Found video via YouTube API:', videoToUse.title);
            }
          } catch (error) {
            console.log('❌ YouTube API search failed:', error.message);
          }
          
          // If API search failed, use educational video database
          if (!videoToUse) {
            console.log('🔄 Searching educational video database...');
            
            // Extract topic from user message
            const messageLower = message.toLowerCase();
            let topic = 'general';
            
            // Determine topic from message
            if (messageLower.includes('math') || messageLower.includes('addition') || messageLower.includes('subtraction')) {
              topic = 'addition';
            } else if (messageLower.includes('fraction') || messageLower.includes('decimal')) {
              topic = 'fractions';
            } else if (messageLower.includes('algebra') || messageLower.includes('equation')) {
              topic = 'algebra';
            } else if (messageLower.includes('geometry') || messageLower.includes('shape')) {
              topic = 'geometry';
            } else if (messageLower.includes('science') || messageLower.includes('experiment')) {
              topic = 'general';
            } else if (messageLower.includes('english') || messageLower.includes('grammar')) {
              topic = 'grammar';
            } else if (messageLower.includes('hindi') || messageLower.includes('व्याकरण')) {
              topic = 'grammar';
            }
            
            // Get appropriate video from database - Using topic-based selection instead of class-based
            const subjectLower = subject.toLowerCase();
            
            // Try to get video by subject and topic first (no class dependency)
            if (supabaseVideoDB) {
              try {
                let videoResult;
                
                // First try to get video by subject and topic
                if (topic) {
                  videoResult = await supabaseVideoDB.getVideosBySubjectAndTopic(subjectLower, topic);
                  if (videoResult.success && videoResult.data && videoResult.data.length > 0) {
                    const selectedVideo = videoResult.data[Math.floor(Math.random() * videoResult.data.length)];
                    console.log(`✅ Found topic-based video: ${selectedVideo.title} for ${subject} topic: ${topic}`);
                    videoToUse = {
                      title: selectedVideo.title,
                      videoId: selectedVideo.video_id,
                      channelTitle: selectedVideo.channel,
                      description: selectedVideo.description,
                      url: `https://www.youtube.com/watch?v=${selectedVideo.video_id}`
                    };
                  }
                }
                
                // If no topic-based video found, try subject-only search
                if (!videoToUse) {
                  videoResult = await supabaseVideoDB.getVideosBySubject(subjectLower);
                  if (videoResult.success && videoResult.data && videoResult.data.length > 0) {
                    const selectedVideo = videoResult.data[Math.floor(Math.random() * videoResult.data.length)];
                    console.log(`✅ Found subject-based video: ${selectedVideo.title} for ${subject}`);
                    videoToUse = {
                      title: selectedVideo.title,
                      videoId: selectedVideo.video_id,
                      channelTitle: selectedVideo.channel,
                      description: selectedVideo.description,
                      url: `https://www.youtube.com/watch?v=${selectedVideo.video_id}`
                    };
                  }
                }
                
                // Ultimate fallback - try class-based search for backward compatibility
                if (!videoToUse) {
                  const classLevel = grade || '6';
                  videoResult = await supabaseVideoDB.getVideosBySubjectAndClass(subjectLower, classLevel);
                  if (videoResult.success && videoResult.data && videoResult.data.length > 0) {
                    const selectedVideo = videoResult.data[Math.floor(Math.random() * videoResult.data.length)];
                    console.log(`✅ Using class-based fallback video: ${selectedVideo.title} for ${subject} class ${classLevel}`);
                    videoToUse = {
                      title: selectedVideo.title,
                      videoId: selectedVideo.video_id,
                      channelTitle: selectedVideo.channel,
                      description: selectedVideo.description,
                      url: `https://www.youtube.com/watch?v=${selectedVideo.video_id}`
                    };
                  }
                }
                
                if (!videoToUse) {
                  console.log(`⚠️ No videos found for subject: ${subject}, topic: ${topic}`);
                }
              } catch (error) {
                console.log(`❌ Video search failed: ${error.message}`);
              }
            }
          }
          
          if (videoToUse) {
            console.log('✅ INJECTING VIDEO URL directly into response:', videoToUse.url);
            
            // Directly append video URL to response (plain text, no markdown)
            response += `\n\nHere's a helpful video to understand this better: ${videoToUse.url}`;
            
            // Add video metadata
            additionalData.videoData = {
              videoId: videoToUse.videoId,
              title: videoToUse.title,
              thumbnail: videoToUse.thumbnail,
              description: videoToUse.description,
              channelTitle: videoToUse.channelTitle,
              url: videoToUse.url
            };
            
            console.log('✅ VIDEO SUCCESSFULLY INJECTED');
          }
        } else if (shouldRecommendVideo.shouldRecommend) {
          try {
            console.log(`🎥 Video recommendation triggered: ${shouldRecommendVideo.reason}`);
            
            // Handle different recommendation scenarios
            if (shouldRecommendVideo.reason === 'confusion_detected') {
              // Offer video instead of showing directly
              response += `\n\nI understand this might be a bit complex. Would you like to see a video that explains this topic in a better way? It might help you understand it more clearly.`;
              
              // Store the current topic for when user agrees
              additionalData.pendingVideoTopic = message;
              additionalData.videoReason = 'confusion_detected';
              
            } else if (shouldRecommendVideo.reason === 'kid_engagement') {
              // For kids, offer video to keep them engaged
              response += `\n\nHey! You've been studying really well! 🎉 Would you like to watch a fun video about this topic? It might make learning even more interesting!`;
              
              additionalData.pendingVideoTopic = message;
              additionalData.videoReason = 'kid_engagement';
              
            } else if (shouldRecommendVideo.reason === 'study_engagement') {
              // For continuous study, offer video to break monotony
              response += `\n\nYou've been studying very hard! 💪 How about we take a short break and watch an interesting video about this topic? It might help refresh your mind and make learning more enjoyable.`;
              
              additionalData.pendingVideoTopic = message;
              additionalData.videoReason = 'study_engagement';
              
            } else if (shouldRecommendVideo.reason === 'complex_topic') {
              // For complex topics, offer video explanation
              response += `\n\nThis is a complex topic that might be easier to understand with a visual explanation. Would you like to see a video that breaks it down step by step?`;
              
              additionalData.pendingVideoTopic = message;
              additionalData.videoReason = 'complex_topic';
              
            } else {
              // Direct video recommendation for explicit requests or user agreement
              console.log('🔍 Starting video recommendation process...');
              const videoRecommendation = await getGPT4VideoRecommendation(grade, subject, message, userContext);
              if (videoRecommendation) {
                if (typeof videoRecommendation === 'object' && videoRecommendation.type === 'youtube_video') {
                  // YouTube API video with metadata
                  response += `\n\nHere's a helpful video to understand this better: ${videoRecommendation.url}`;
                  
                  // Add video metadata to response
                  additionalData.videoData = {
                    videoId: videoRecommendation.videoId,
                    title: videoRecommendation.title,
                    thumbnail: videoRecommendation.thumbnail,
                    description: videoRecommendation.description,
                    channelTitle: videoRecommendation.channelTitle
                  };
                  console.log('✅ YouTube API video added successfully');
                } else if (typeof videoRecommendation === 'object' && videoRecommendation.type === 'segmented_video') {
                  // AI-controlled segmented video
                  response += `\n\nHere's a personalized video explanation with AI-controlled segments: ${videoRecommendation.videoUrl}`;
                  response += `\n\n🎯 AI has selected ${videoRecommendation.segments.length} relevant segments (${Math.round(videoRecommendation.totalDuration / 60)} minutes total):`;
                  videoRecommendation.segments.forEach((segment, index) => {
                    const startMin = Math.floor(segment.start / 60);
                    const startSec = segment.start % 60;
                    const endMin = Math.floor(segment.end / 60);
                    const endSec = segment.end % 60;
                    response += `\n• Segment ${index + 1} (${startMin}:${startSec.toString().padStart(2, '0')}-${endMin}:${endSec.toString().padStart(2, '0')}): ${segment.description}`;
                  });
                  response += `\n\n📝 Summary: ${videoRecommendation.summary}`;
                  
                  // Add segment data to response
                  additionalData.videoSegments = videoRecommendation;
                  console.log('✅ AI-controlled segmented video added successfully');
                } else {
                  // Regular video URL
                  response += `\n\nHere's a helpful video to understand this better: ${videoRecommendation}`;
                  console.log('✅ Regular video recommendation added successfully');
                }
              } else {
                console.log('❌ No video recommendation found');
              }
            }
          } catch (videoError) {
            console.log('Video recommendation failed:', videoError);
            // Continue without video recommendation
          }
        }
        break;
    }

    res.status(200).json({ 
      success: true, 
      response: response,
      knowledgeResults: knowledgeResults,
      userContext: userContext, // Send back for debugging
      ...additionalData
    });

  } catch (error) {
    console.error('Enhanced AI Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get response from AI',
      details: error.message 
    });
  }
}

// Function to generate exam papers
async function generateExamPaper(grade, subject, chapters, userContext, chatHistory) {
  try {
    const systemPrompt = `You are an expert teacher creating a practice exam paper for ${userContext.name} (Class ${userContext.class}, ${userContext.board}).

EXAM PAPER REQUIREMENTS:
- Generate a complete practice exam paper for chapters: ${chapters.join(', ')}
- Subject: ${subject}
- Class: ${userContext.class}
- Board: ${userContext.board}

QUESTION FORMAT:
1. OBJECTIVE QUESTIONS (10 total):
   - 5 Fill in the blanks questions
   - 5 True or False questions

2. SHORT ANSWER QUESTIONS (5 total):
   - 2-3 sentences each
   - Test understanding of key concepts

3. LONG ANSWER QUESTIONS (5 total):
   - Detailed explanations required
   - Test comprehensive understanding

INSTRUCTIONS:
- Use chat history to understand student's learning level
- Align with ${userContext.board} syllabus standards for their class
- Follow ${userContext.board} curriculum structure and difficulty level
- Make questions age-appropriate and difficulty-appropriate
- Include answer key at the end
- Format clearly with sections and numbering

CHAT HISTORY CONTEXT:
${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Generate a complete exam paper following these specifications.`;

    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a practice exam paper for ${subject} covering chapters: ${chapters.join(', ')}` }
      ]
    });

    return chat.choices[0]?.message?.content || 'Failed to generate exam paper';
  } catch (error) {
    console.error('Error generating exam paper:', error);
    return 'Error generating exam paper. Please try again.';
  }
}

// Function to get GPT-4 video recommendations for educational topics
async function getGPT4VideoRecommendation(grade, subject, query, userContext) {
  try {
    const isHindiTeacher = userContext.teacher === 'Miss Sapna' || userContext.avatar === 'miss-sapna';
    const language = isHindiTeacher ? 'Hindi' : 'English';

    // Create a smart search query for YouTube API
    let searchQuery = query;
    
    // Extract key educational terms
    const queryLower = query.toLowerCase();
    
    // For nursery rhymes and poems, use specific terms
    if (queryLower.includes('nursery') || queryLower.includes('rhyme') || queryLower.includes('poem')) {
      searchQuery = queryLower.includes('nursery') ? 'nursery rhymes for kids' : 'poems for children';
    } 
    // For states of matter, use specific science terms
    else if (queryLower.includes('states') && queryLower.includes('matter')) {
      searchQuery = 'states of matter for kids science';
    }
    // For math topics
    else if (queryLower.includes('math') || queryLower.includes('addition') || queryLower.includes('subtraction')) {
      searchQuery = `math for kids grade ${grade}`;
    }
    // Keep original query but add educational context
    else {
      searchQuery = `${query} for kids educational`;
    }
    
    // Add language preference
    if (language === 'Hindi') {
      searchQuery += ' hindi';
    } else {
      searchQuery += ' english';
    }
    
    // Add age-appropriate terms
    if (grade && parseInt(grade) <= 5) {
      searchQuery += ' children kids';
    }
    
    console.log('🔍 Searching YouTube for:', searchQuery);
    
    // Fetch videos using YouTube Data API with user context
    const videos = await fetchYouTubeVideos(searchQuery, 5, userContext);
    
    if (!videos || videos.length === 0) {
      console.log('❌ No videos found via YouTube API');
      return null;
    }
    
    // Use Supabase video database instead of YouTube API
    console.log('🎥 Using Supabase video database for recommendation...');
    
    // Extract topic from query
    const queryLower2 = query.toLowerCase();
    let topic = 'general';
    
    // Determine topic from query
    if (queryLower2.includes('math') || queryLower2.includes('addition') || queryLower2.includes('subtraction')) {
      topic = 'addition';
    } else if (queryLower2.includes('fraction') || queryLower2.includes('decimal')) {
      topic = 'fractions';
    } else if (queryLower2.includes('multiplication') || queryLower2.includes('times')) {
      topic = 'multiplication';
    } else if (queryLower2.includes('division') || queryLower2.includes('divide')) {
      topic = 'division';
    } else if (queryLower2.includes('geometry') || queryLower2.includes('shapes')) {
      topic = 'geometry';
    } else if (queryLower2.includes('algebra') || queryLower2.includes('equation')) {
      topic = 'algebra';
    } else if (queryLower2.includes('trigonometry') || queryLower2.includes('trig')) {
      topic = 'trigonometry';
    } else if (queryLower2.includes('calculus') || queryLower2.includes('derivative')) {
      topic = 'calculus';
    } else if (queryLower2.includes('science') || queryLower2.includes('physics') || queryLower2.includes('chemistry') || queryLower2.includes('biology')) {
      topic = 'general';
    } else if (queryLower2.includes('english') || queryLower2.includes('grammar') || queryLower2.includes('writing')) {
      topic = 'general';
    }
    
    // Get appropriate video from database
    const subjectLower = subject.toLowerCase();
    
    // Map grade to class level range
    let classLevel;
    if (grade <= 3) {
      classLevel = '1-3';
    } else if (grade <= 6) {
      classLevel = '4-6';
    } else if (grade <= 8) {
      classLevel = '7-8';
    } else if (grade <= 10) {
      classLevel = '9-10';
    } else {
      classLevel = '11-12';
    }
    
    console.log(`🎯 Searching for: subject=${subjectLower}, classLevel=${classLevel}, topic=${topic}`);
    
    // Search for video in Supabase database
    const searchCriteria = {
      subject: subjectLower,
      classLevel: classLevel,
      topic: topic
    };
    
    // Check if supabaseVideoDB is available
    if (!supabaseVideoDB) {
      console.log('❌ Supabase video database not available, falling back to YouTube API');
      return null;
    }
    
    const videoResult = await supabaseVideoDB.getRandomVideo(searchCriteria);
    
    if (videoResult.success && videoResult.data) {
      const video = videoResult.data;
      
      // Check if video is validated in database
      if (video.is_validated === false) {
        console.log(`⚠️ Video ${video.video_id} is not validated, skipping`);
        return null;
      }
      
      console.log(`✅ Found educational video: ${video.title} for ${subject} class ${classLevel}`);
      return {
        type: 'youtube_video',
        videoId: video.video_id,
        title: video.title,
        thumbnail: video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`,
        description: video.description,
        url: `https://www.youtube.com/watch?v=${video.video_id}`,
        channelTitle: video.channel,
        validationMethod: 'supabase_database'
      };
    } else {
      console.log('⚠️ No specific video found, trying general search...');
      // Try without topic constraint
      if (!supabaseVideoDB) {
        console.log('❌ Supabase video database not available for general search');
        return null;
      }
      
      const generalResult = await supabaseVideoDB.getRandomVideo({
        subject: subjectLower,
        topic: topic
      });
      
      if (generalResult.success && generalResult.data) {
        const video = generalResult.data;
        
        // Check if video is validated in database
        if (video.is_validated === false) {
          console.log(`⚠️ Video ${video.video_id} is not validated, skipping`);
          return null;
        }
        
        console.log(`✅ Found general educational video: ${video.title}`);
        return {
          type: 'youtube_video',
          videoId: video.video_id,
          title: video.title,
          thumbnail: video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`,
          description: video.description,
          url: `https://www.youtube.com/watch?v=${video.video_id}`,
          channelTitle: video.channel,
          validationMethod: 'supabase_database'
        };
      }
    }
    
    console.log('❌ No educational videos found in Supabase database');
    return null;
    
  } catch (error) {
    console.error('❌ Error in getGPT4VideoRecommendation:', error);
    return null;
  }
}

// Function to validate YouTube video availability and embeddability
async function validateYouTubeVideo(videoUrl) {
  try {
    const videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1];
    if (!videoId) return false;
    
    // First, check if we have this video marked as failed
    const failedVideos = global.failedVideoCache || new Set();
    if (failedVideos.has(videoId)) {
      console.log(`❌ Video ${videoId} is in failed cache, skipping`);
      return false;
    }
    
    // Method 1: YouTube Data API (most reliable)
    const apiKey = process.env.YOUTUBE_DATA_API_KEY;
    if (apiKey) {
      try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=status,snippet&key=${apiKey}`;
        const apiResponse = await fetch(apiUrl);
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (apiData.items && apiData.items.length > 0) {
            const video = apiData.items[0];
            const isEmbeddable = video.status?.embeddable !== false;
            const isPrivate = video.status?.privacyStatus === 'private';
            const isBlocked = video.status?.uploadStatus === 'rejected';
            
            if (isEmbeddable && !isPrivate && !isBlocked) {
              console.log(`✅ Video ${videoId} verified via YouTube API - embeddable and available`);
              return {
                isValid: true,
                title: video.snippet?.title,
                channelTitle: video.snippet?.channelTitle,
                method: 'youtube_api'
              };
            } else {
              console.log(`❌ Video ${videoId} failed API validation - embeddable: ${isEmbeddable}, private: ${isPrivate}, blocked: ${isBlocked}`);
              // Add to failed cache
              if (!global.failedVideoCache) global.failedVideoCache = new Set();
              global.failedVideoCache.add(videoId);
              return false;
            }
          }
        }
      } catch (apiError) {
        console.log('⚠️ YouTube API validation failed, trying alternative methods:', apiError.message);
      }
    }
    
    // Method 2: oEmbed API (backup method)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const response = await fetch(oembedUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.title && data.thumbnail_url) {
          console.log(`✅ Video ${videoId} verified via oEmbed - available`);
          return {
            isValid: true,
            title: data.title,
            channelTitle: data.author_name,
            method: 'oembed'
          };
        }
      } else if (response.status === 401 || response.status === 403) {
        // Video is not embeddable or private
        console.log(`❌ Video ${videoId} not embeddable (${response.status})`);
        if (!global.failedVideoCache) global.failedVideoCache = new Set();
        global.failedVideoCache.add(videoId);
        return false;
      }
    } catch (oembedError) {
      console.log('⚠️ oEmbed validation failed:', oembedError.message);
    }
    
    // Method 3: Direct HEAD request to video page (last resort)
    try {
      const headResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (headResponse.ok) {
        console.log(`✅ Video ${videoId} exists (HEAD check) - may or may not be embeddable`);
        return {
          isValid: true,
          title: `Video ${videoId}`,
          channelTitle: 'Unknown',
          method: 'head_check',
          warning: 'Embeddability not confirmed'
        };
      }
    } catch (headError) {
      console.log('⚠️ HEAD request failed:', headError.message);
    }
    
    console.log(`❌ All validation methods failed for video ${videoId}`);
    // Add to failed cache
    if (!global.failedVideoCache) global.failedVideoCache = new Set();
    global.failedVideoCache.add(videoId);
    return false;
    
  } catch (error) {
    console.error('Video validation error:', error);
    return false;
  }
}

// Function to get fallback video for a specific query
function getFallbackVideoForQuery(query, userContext) {
  try {
    const queryLower = query.toLowerCase();
    const isHindiTeacher = userContext.teacher === 'Miss Sapna' || userContext.avatar === 'miss-sapna';
    const userClass = parseInt(userContext.class?.replace('Class ', '') || '5');
    
    // GUARANTEED WORKING fallback videos (simplified, always embeddable)
    const fallbackVideos = {
      'poem': {
        title: 'Twinkle Twinkle Little Star',
        videoId: 'yCjJyiqpAuU',
        channelTitle: 'Super Simple Songs',
        description: 'Classic nursery rhyme',
        url: 'https://www.youtube.com/watch?v=yCjJyiqpAuU'
      },
      'poetry': {
        title: 'Twinkle Twinkle Little Star',
        videoId: 'yCjJyiqpAuU',
        channelTitle: 'Super Simple Songs', 
        description: 'Classic nursery rhyme',
        url: 'https://www.youtube.com/watch?v=yCjJyiqpAuU'
      },
      'nursery': {
        title: 'Twinkle Twinkle Little Star',
        videoId: 'yCjJyiqpAuU',
        channelTitle: 'Super Simple Songs',
        description: 'Classic nursery rhyme',
        url: 'https://www.youtube.com/watch?v=yCjJyiqpAuU'
      },
      'math': {
        title: 'Twinkle Twinkle Little Star',
        videoId: 'yCjJyiqpAuU',
        channelTitle: 'Super Simple Songs',
        description: 'Classic nursery rhyme',
        url: 'https://www.youtube.com/watch?v=yCjJyiqpAuU'
      },
      'english': {
        title: 'Twinkle Twinkle Little Star',
        videoId: 'yCjJyiqpAuU',
        channelTitle: 'Super Simple Songs',
        description: 'Classic nursery rhyme',
        url: 'https://www.youtube.com/watch?v=yCjJyiqpAuU'
      },
      'science': {
        title: 'Twinkle Twinkle Little Star',
        videoId: 'yCjJyiqpAuU',
        channelTitle: 'Super Simple Songs',
        description: 'Classic nursery rhyme',
        url: 'https://www.youtube.com/watch?v=yCjJyiqpAuU'
      },
      'states_of_matter': {
        title: 'States of Matter - Solids, Liquids and Gases for Kids',
        videoId: 'F6QYzHKS7pI',
        channelTitle: 'Science for Kids',
        description: 'Learn about the three states of matter - solids, liquids, and gases with fun examples',
        url: 'https://www.youtube.com/watch?v=F6QYzHKS7pI'
      }
    };
    
    // Find matching video based on query - IMPROVED
    const keywords = {
      'nursery': ['nursery', 'rhyme', 'song', 'children song', 'kids song', 'twinkle', 'star', 'baa baa', 'humpty', 'dumpty'],
      'poem': ['poem', 'poetry', 'twinkle', 'star', 'nursery', 'rhyme'],
      'math': ['math', 'mathematics', 'addition', 'subtraction', 'numbers', 'counting'],
      'english': ['english', 'grammar', 'language', 'words'],
      'science': ['science', 'physics', 'chemistry', 'biology', 'experiment'],
      'states_of_matter': ['states', 'matter', 'solid', 'liquid', 'gas', 'plasma', 'solids', 'liquids', 'gases']
    };
    
    for (const [topic, topicKeywords] of Object.entries(keywords)) {
      if (topicKeywords.some(keyword => queryLower.includes(keyword))) {
        console.log(`🎥 Fallback video matched for topic: ${topic}`);
        return fallbackVideos[topic] || fallbackVideos.poem;
      }
    }
    
    // Default fallback for any query
    console.log('🎥 Using default fallback video (poem)');
    return fallbackVideos.poem;
    
  } catch (error) {
    console.error('Error in getFallbackVideoForQuery:', error);
    return null;
  }
}



// SIMPLIFIED: Guaranteed working fallback video function
async function getFallbackVideoRecommendation(grade, subject, query) {
  try {
    // ALWAYS return the same guaranteed working video
    console.log('🎥 Using guaranteed working fallback video');
    return 'https://www.youtube.com/watch?v=yCjJyiqpAuU'; // Twinkle Twinkle Little Star - always works
  } catch (error) {
    console.error('Error getting fallback video:', error);
    return 'https://www.youtube.com/watch?v=yCjJyiqpAuU'; // Ultimate fallback
  }
}

// Open search video recommendation function
async function getOpenSearchVideoRecommendation(grade, subject, query, language) {
  try {
    const openSearchPrompt = `You are an expert educational content curator. The topic was not found in the specified educational channels, so now search the entire YouTube platform for the BEST educational video.

STUDENT CONTEXT:
- Class: ${grade}
- Subject: ${subject}
- Query: ${query}
- Language Preference: ${language}

OPEN SEARCH REQUIREMENTS:
1. Search ALL of YouTube for the best educational video on this topic
2. Focus on:
   - Educational channels (any language)
   - Academic content creators
   - University channels
   - Professional educators
   - Subject matter experts

3. Video Selection Criteria:
   - Age-appropriate for Class ${grade}
   - Relevant to: "${query}"
   - In ${language} language (if possible, otherwise any language)
   - Under 20 minutes for better engagement
   - High number of likes (prefer videos with 5K+ likes)
   - Recent uploads (2020-2024 preferred)
   - High quality and well-reviewed
   - Clear explanations and good production quality

4. Search Strategy:
   - Use specific keywords from the query
   - Include subject name and class level
   - Search for both ${language} and English versions
   - Prioritize videos with higher engagement (likes, views)
   - Prefer videos from verified educational channels

5. Return ONLY the YouTube URL in this exact format:
   https://www.youtube.com/watch?v=VIDEO_ID

6. If you find a good video, return it immediately.
   If no suitable video exists, return "NO_VIDEO_FOUND"

IMPORTANT: Return ONLY the URL or "NO_VIDEO_FOUND", no explanations.`;

    const openSearchChat = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.4,
      max_tokens: 100,
      messages: [
        { role: 'system', content: openSearchPrompt },
        { role: 'user', content: `Find the best educational video for: ${query} (open search)` }
      ]
    });

    const openSearchUrl = openSearchChat.choices[0]?.message?.content?.trim();
    
    if (openSearchUrl && openSearchUrl.includes('youtube.com/watch?v=')) {
      // Validate video availability before returning
      const validationResult = await validateYouTubeVideo(openSearchUrl);
      if (validationResult && validationResult.isValid) {
        console.log('Open search found valid video:', openSearchUrl);
        return {
          url: openSearchUrl,
          title: validationResult.title,
          channelTitle: validationResult.channelTitle,
          validationMethod: validationResult.method,
          videoId: openSearchUrl.match(/[?&]v=([^&]+)/)?.[1]
        };
      }
    }
    
    console.log('Open search did not find a valid video');
    return null;
    
  } catch (error) {
    console.error('Error in open search video recommendation:', error);
    return null;
  }
}

// Function to get video transcript and create AI-controlled segments
async function getVideoTranscriptAndSegments(videoUrl, query, userContext) {
  try {
    const videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1];
    if (!videoId) return null;

    // Get video transcript using YouTube Data API or transcript service
    const transcript = await getVideoTranscript(videoId);
    if (!transcript) return null;

    // Use GPT-4 to analyze transcript and find relevant segments
    const segmentPrompt = `You are an expert educational content analyzer. Analyze this video transcript and find the MOST RELEVANT segments for the student's question.

STUDENT CONTEXT:
- Name: ${userContext.name}
- Class: ${userContext.class}
- Question: "${query}"

VIDEO TRANSCRIPT:
${transcript}

TASK:
1. Find 2-3 specific time segments that directly answer the student's question
2. Each segment should be 30-90 seconds long for optimal learning
3. Focus on clear explanations and key concepts
4. Avoid repetitive or off-topic content

REQUIREMENTS:
- Start time and end time for each segment (in seconds)
- Brief description of what each segment covers
- Total segments should not exceed 3 minutes combined
- Prioritize segments that directly address the question

Return the response in this JSON format:
{
  "segments": [
    {
      "start": 120,
      "end": 180,
      "description": "Explanation of quadratic formula"
    },
    {
      "start": 240,
      "end": 300,
      "description": "Step-by-step example solving"
    }
  ],
  "totalDuration": 120,
  "summary": "Brief summary of what the student will learn"
}`;

    const segmentAnalysis = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        { role: 'system', content: segmentPrompt },
        { role: 'user', content: `Find relevant segments for: ${query}` }
      ]
    });

    const segments = JSON.parse(segmentAnalysis.choices[0]?.message?.content || '{}');
    return {
      videoId,
      videoUrl,
      segments: segments.segments || [],
      summary: segments.summary || '',
      totalDuration: segments.totalDuration || 0
    };

  } catch (error) {
    console.error('Error getting video transcript and segments:', error);
    return null;
  }
}

// Smart video recommendation logic
function shouldRecommendVideoNow(message, userContext, chatHistory) {
  try {
    const userClass = parseInt(userContext.class?.replace('Class ', '') || '5');
    const isKid = userClass <= 8; // Kids are class 8 and below
    const messageLower = message.toLowerCase();
    
    // 1. User explicitly asks for video - EXPANDED PATTERNS
    const videoRequestPatterns = [
      'video', 'show me', 'can you show', 'i want to see', 'play video', 'watch video',
      'i want to see video', 'i want to watch video', 'show me video', 'play video of',
      'watch video of', 'video of this', 'video of that', 'show me a video',
      'can you show me a video', 'would you show me a video', 'i want to see video of',
      'i want to watch video of', 'show me video of', 'play video of', 'video please'
    ];
    
    const explicitVideoRequest = videoRequestPatterns.some(pattern => 
      messageLower.includes(pattern)
    );
    
    if (explicitVideoRequest) {
      console.log('🎥 User explicitly requested video:', messageLower);
      return { shouldRecommend: true, reason: 'explicit_request' };
    }
    
    // 2. Check if user said "yes" to video suggestion - IMPROVED
    const userAgreedToVideo = (messageLower.includes('yes') || messageLower === 'yeah' || messageLower === 'okay' || messageLower === 'ok') && 
                             (messageLower.includes('video') || 
                              messageLower.includes('show') ||
                              messageLower.includes('watch') ||
                              messageLower.includes('play'));
    
    // Also check recent context for simple "yes" responses
    if (!userAgreedToVideo && (messageLower === 'yes' || messageLower === 'yeah' || messageLower === 'okay' || messageLower === 'ok')) {
      const recentMessages = chatHistory.slice(-3);
      const hadVideoOffer = recentMessages.some(msg => 
        msg.role === 'assistant' && 
        (msg.content.includes('Would you like to see a video') || 
         msg.content.includes('would you like to watch a video') ||
         msg.content.includes('Would you like me to show you a video'))
      );
      if (hadVideoOffer) {
        console.log('🎥 User agreed to recent video offer');
        return { shouldRecommend: true, reason: 'user_agreed' };
      }
    }
    
    if (userAgreedToVideo) {
      console.log('🎥 User agreed to video suggestion');
      return { shouldRecommend: true, reason: 'user_agreed' };
    }
    
    // 3. Check if this is a follow-up question indicating confusion
    const isConfusionIndicated = messageLower.includes('i don\'t understand') ||
                                messageLower.includes('i don\'t get it') ||
                                messageLower.includes('confused') ||
                                messageLower.includes('not clear') ||
                                messageLower.includes('can you explain again') ||
                                messageLower.includes('i still don\'t understand') ||
                                messageLower.includes('please explain') ||
                                messageLower.includes('help me understand');
    
    if (isConfusionIndicated) {
      console.log('🎥 User seems confused, offering video');
      return { shouldRecommend: true, reason: 'confusion_detected' };
    }
    
    // 4. For kids: Check engagement timing (every 15-20 minutes)
    if (isKid) {
      const sessionStartTime = userContext.sessionStartTime || Date.now();
      const sessionDuration = Date.now() - sessionStartTime;
      const minutesInSession = sessionDuration / (1000 * 60);
      
      // Check if it's been 15-20 minutes since last video
      const lastVideoTime = userContext.lastVideoTime || 0;
      const minutesSinceLastVideo = (Date.now() - lastVideoTime) / (1000 * 60);
      
      if (minutesSinceLastVideo >= 15 && minutesInSession >= 10) {
        console.log('🎥 Kid engagement: offering video after 15+ minutes');
        return { shouldRecommend: true, reason: 'kid_engagement' };
      }
    }
    
    // 5. Check if user has been studying continuously for too long
    const recentMessages = chatHistory.slice(-5); // Last 5 messages
    const studyIntensity = recentMessages.filter(msg => 
      msg.role === 'user' && 
      !msg.content.toLowerCase().includes('video') &&
      !msg.content.toLowerCase().includes('break') &&
      !msg.content.toLowerCase().includes('stop')
    ).length;
    
    if (studyIntensity >= 4) {
      console.log('🎥 High study intensity detected, offering video for engagement');
      return { shouldRecommend: true, reason: 'study_engagement' };
    }
    
    // 6. Check for complex topics that might benefit from visual explanation
    const complexTopics = ['geometry', 'trigonometry', 'calculus', 'physics', 'chemistry', 'biology', 'anatomy', 'molecular', 'chemical', 'reaction', 'equation', 'formula', 'theorem', 'proof', 'poetry', 'poem', 'literature', 'grammar'];
    const hasComplexTopic = complexTopics.some(topic => messageLower.includes(topic));
    
    if (hasComplexTopic && !userContext.videoOfferedForTopic) {
      console.log('🎥 Complex topic detected, offering video');
      return { shouldRecommend: true, reason: 'complex_topic' };
    }
    
    // Default: Don't recommend video
    return { shouldRecommend: false, reason: 'no_trigger' };
    
  } catch (error) {
    console.error('Error in shouldRecommendVideoNow:', error);
    return { shouldRecommend: false, reason: 'error' };
  }
}

// YouTube Data API integration with channel filtering
async function fetchYouTubeVideos(query, maxResults = 5, userContext = {}) {
  try {
    // Debug environment variables
    console.log('🔍 Environment variables check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasYouTubeKey: !!process.env.YOUTUBE_DATA_API_KEY,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('YOUTUBE'))
    });
    
    const apiKey = process.env.YOUTUBE_DATA_API_KEY;
    console.log('🔑 YouTube API Key check:', {
      hasKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    });
    
    if (!apiKey) {
      console.error('❌ YouTube API key not found in environment variables');
      console.error('❌ Using hardcoded API key for testing...');
      
      // Use the provided API key directly
                      const hardcodedApiKey = process.env.YOUTUBE_DATA_API_KEY;
        
        if (!hardcodedApiKey) {
            console.error('❌ YouTube API key not found in environment variables');
            return res.status(500).json({ 
                success: false, 
                error: 'YouTube API key not configured' 
            });
        }
        
        console.log('🔑 Using YouTube API key for search');
      
      // Continue with the hardcoded API key
      return await performYouTubeSearch(query, hardcodedApiKey, maxResults, userContext);
    }
    
    // Use the environment API key
    return await performYouTubeSearch(query, apiKey, maxResults, userContext);
  } catch (error) {
    console.error('❌ Error fetching YouTube videos:', error);
    return null;
  }
}

async function performYouTubeSearch(query, apiKey, maxResults, userContext) {
  try {
    console.log('🔍 Starting YouTube search with key:', apiKey.substring(0, 10) + '...');
    
    // Build a simple search query
    let searchQuery = query;
    if (query.toLowerCase().includes('nursery') || query.toLowerCase().includes('rhyme')) {
      searchQuery = 'nursery rhymes for kids';
    } else if (query.toLowerCase().includes('states') && query.toLowerCase().includes('matter')) {
      searchQuery = 'states of matter for kids';
    }
    
    console.log('🔍 Search query:', searchQuery);
    
    // For young children, prioritize safe educational channels
    const userGrade = userContext?.class || userContext?.grade || '';
    const gradeNumber = parseInt(userGrade.replace(/\D/g, '')) || 1;
    
    if (gradeNumber <= 3) {
      // Add safe channel targeting for young children
      const safeChannelQuery = searchQuery + ' channel:"ChuChu TV" OR channel:"Cocomelon" OR channel:"Infobells" OR channel:"Khan Academy Kids"';
      console.log('🔒 Safe search query for young children:', safeChannelQuery);
      
      // Try safe channels first
      const safeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(safeChannelQuery)}&key=${apiKey}&videoDuration=short&videoEmbeddable=true&order=relevance&safeSearch=strict`;
      
      try {
        const safeResponse = await fetch(safeUrl);
        if (safeResponse.ok) {
          const safeData = await safeResponse.json();
          if (safeData.items && safeData.items.length > 0) {
            console.log('✅ Found videos in safe channels for young children');
            return safeData.items.map(item => ({
              videoId: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
              description: item.snippet.description,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt
            }));
          }
        }
      } catch (error) {
        console.log('⚠️ Safe channel search failed, falling back to general search');
      }
    }
    
    // Direct YouTube API call with safe search enabled
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&key=${apiKey}&videoDuration=short&videoEmbeddable=true&order=relevance&safeSearch=strict`;
    
    console.log('🔍 API URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('❌ YouTube API response not OK:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('✅ YouTube API response:', data);
    
    if (!data.items || data.items.length === 0) {
      console.log('❌ No videos found in YouTube response');
      return null;
    }
    
    // Convert to our format
    const videos = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
    
    console.log(`✅ Found ${videos.length} YouTube videos`);
    videos.forEach(video => {
      console.log(`  - ${video.title} (${video.channelTitle})`);
    });
    
    return videos;
  } catch (error) {
    console.error('❌ Error in performYouTubeSearch:', error);
    return null;
  }
}

// Old function content starts here - remove everything below until next function
/*
    // Define educational channels based on language and class
    const educationalChannels = language === 'Hindi' ? [
      'Physics Wallah',
      'Dear Sir',
      'Magnet Brains Hindi',
      'Let\'s Learn',
      'Examपुर',
      'Study with Sudhir Hindi',
      'Unacademy Hindi',
      'Adda247 School Hindi',
      'SuccessCDs Education',
      'Apni Kaksha',
      'Bodhaguru Hindi',
      'EduMantra',
      'Unacademy Foundation',
      'GK Planet',
      'Maths by Arvind Sir',
      'Magnet Brains हिन्दी',
      'Learn with Sumit',
      'Pradeep Kshetrapal',
      'EduPoint',
      'Bright Tutee'
    ] : [
      'Khan Academy India',
      'LearnoHub',
      'Vedantu',
      'Magnet Brains',
      'BYJU\'S',
      'Unacademy CBSE/ICSE',
      'Physics Wallah English',
      'Toppr Study',
      'Doubtnut',
      'Meritnation',
      'Edumantra',
      'English Academy',
      'Math Infinity',
      'Adda247 School',
      'Maths Teacher',
      'Ganit Guru',
      'Science Wallah',
      'ExamFear Education Science',
      'Apni Kaksha',
      'CrashCourse Kids',
      'Study with Sudhir',
      'Extra Class',
      'Simran Sahani English',
      'Shipra Mishra English',
      'Rahul Dwivedi English',
      'Bodhaguru',
      'English Academy',
      'Geometry Box',
      'JustTutors',
      'Bright Tutee'
    ];

    // Build search query with channel filtering - SIMPLIFIED
    let searchQuery = query;
    
    // Extract key terms from the query
    const keyTerms = query.toLowerCase().split(' ').filter(word => 
      word.length > 3 && 
      !['show', 'me', 'video', 'of', 'that', 'this', 'the', 'and', 'for', 'with', 'from', 'about', 'what', 'how', 'why', 'when', 'where'].includes(word)
    ).slice(0, 3); // Take only first 3 key terms
    
    // Build a simpler, more focused search query
    if (keyTerms.length > 0) {
      searchQuery = keyTerms.join(' ');
    }
    
    // Add age-appropriate keywords
    if (userClass <= 5) {
      searchQuery += ' kids educational';
    } else if (userClass <= 8) {
      searchQuery += ' educational';
    } else {
      searchQuery += ' educational';
    }
    
    // Add language preference
    if (language === 'Hindi') {
      searchQuery += ' hindi';
    }

    console.log('🔍 Fetching YouTube videos for query:', searchQuery);
    console.log('🎯 Target channels:', educationalChannels.slice(0, 5).join(', '));
    
    // First, try to find videos from specific channels
    const videoResults = [];
    
    // Search in specific channels first
    for (const channel of educationalChannels.slice(0, 10)) { // Limit to top 10 channels
      try {
        const channelQuery = `${searchQuery} ${channel}`;
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodeURIComponent(channelQuery)}&key=${apiKey}&videoDuration=short&videoEmbeddable=true&order=relevance`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const channelVideos = data.items
              .filter(item => educationalChannels.some(ch => item.snippet.channelTitle.includes(ch)))
              .map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium.url,
                description: item.snippet.description,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                source: 'specific_channel'
              }));
            videoResults.push(...channelVideos);
          }
        }
      } catch (error) {
        console.log(`❌ Error searching channel ${channel}:`, error.message);
      }
    }
    
    // If no videos found from specific channels, do a general search
    if (videoResults.length === 0) {
      console.log('🔍 No videos found in specific channels, doing general search...');
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&key=${apiKey}&videoDuration=short&videoEmbeddable=true&order=relevance`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const generalVideos = data.items
            .filter(item => {
              // Filter out inappropriate content
              const title = item.snippet.title.toLowerCase();
              const description = item.snippet.description.toLowerCase();
              const channelTitle = item.snippet.channelTitle.toLowerCase();
              
              // Block technical/API videos
              const blockedKeywords = ['api', 'key', 'setup', 'configuration', 'tutorial', 'how to create', 'installation', 'developer', 'programming'];
              const hasBlockedKeywords = blockedKeywords.some(keyword => 
                title.includes(keyword) || description.includes(keyword)
              );
              
              // Prefer educational channels
              const isEducationalChannel = educationalChannels.some(ch => 
                channelTitle.includes(ch.toLowerCase())
              );
              
              return !hasBlockedKeywords && (isEducationalChannel || title.includes('educational') || title.includes('learn'));
            })
            .map(item => ({
              videoId: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.medium.url,
              description: item.snippet.description,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
              source: 'general_search'
            }));
          videoResults.push(...generalVideos);
        }
      }
    }
    
    // Sort videos by relevance and recency
    let finalVideos = videoResults
      .filter((video, index, self) => 
        index === self.findIndex(v => v.videoId === video.videoId)
      ) // Remove duplicates
      .sort((a, b) => {
        // Prioritize specific channel videos
        if (a.source === 'specific_channel' && b.source !== 'specific_channel') return -1;
        if (b.source === 'specific_channel' && a.source !== 'specific_channel') return 1;
        
        // Then by recency
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      })
      .slice(0, maxResults);

    console.log(`✅ Found ${finalVideos.length} filtered videos for query: ${query}`);
    finalVideos.forEach(video => {
      console.log(`  - ${video.title} (${video.channelTitle})`);
    });
    
    // If no videos found from API, use fallback
    if (finalVideos.length === 0) {
      console.log('🔄 No videos found from API, using fallback...');
      const fallbackVideo = getFallbackVideoForQuery(query, userContext);
      if (fallbackVideo) {
        console.log('✅ Using fallback video:', fallbackVideo.url);
        return [fallbackVideo];
      }
    }
    
        // Apply content filtering for safety (especially for young children)
    const filteredVideos = finalVideos.filter(video => {
      const title = video.title.toLowerCase();
      const description = video.description.toLowerCase();
      const channelTitle = video.channelTitle.toLowerCase();
      
      // Get user's grade for age-appropriate filtering
      const userGrade = userContext?.class || userContext?.grade || '';
      const gradeNumber = parseInt(userGrade.replace(/\D/g, '')) || 1;
      
      // Inappropriate content filters
      const inappropriateKeywords = [
        'alcohol', 'drinking', 'pregnancy', 'baby care', 'adult', 'mature',
        'violence', 'scary', 'horror', 'inappropriate', 'explicit',
        'smoking', 'drugs', 'gambling', 'dating', 'romance', 'save your baby'
      ];
      
      // Check for inappropriate content
      for (const keyword of inappropriateKeywords) {
        if (title.includes(keyword) || description.includes(keyword)) {
          console.log(`❌ Filtered out inappropriate video: ${video.title} (contains: ${keyword})`);
          return false;
        }
      }
      
      // For young children (Class 1-3), be extra strict
      if (gradeNumber <= 3) {
        const youngKidsKeywords = ['kids', 'children', 'nursery', 'rhyme', 'learning', 'educational'];
        const isForYoungKids = youngKidsKeywords.some(keyword => 
          title.includes(keyword) || channelTitle.includes(keyword) || description.includes(keyword)
        );
        
        // Safe channels for young children
        const safeChannels = [
          'chuchu tv', 'infobells', 'khan academy', 'byju', 'peekaboo kidz',
          'cocomelon', 'smart kids', 'kids maths', 'super simple', 'bounce patrol',
          'little baby bum', 'dave and ava', 'morphle', 'blippi'
        ];
        
        const isFromSafeChannel = safeChannels.some(safe => 
          channelTitle.includes(safe) || channelTitle.includes(safe.replace(' ', ''))
        );
        
        if (!isForYoungKids && !isFromSafeChannel) {
          console.log(`❌ Filtered out video not suitable for young children: ${video.title}`);
          return false;
        }
      }
      
      console.log(`✅ Video approved: ${video.title} (${video.channelTitle})`);
      return true;
    });

    // Add YouTube URLs to filtered videos
    return filteredVideos.map(video => ({
      ...video,
      url: `https://www.youtube.com/watch?v=${video.videoId}`
    }));
    
  } catch (error) {
    console.error('❌ Error fetching YouTube videos:', error);
    return null;
  }
}
*/

// Function to get video transcript (placeholder - would need YouTube Data API or transcript service)
async function getVideoTranscript(videoId) {
  try {
    // This is a placeholder - in production, you would use:
    // 1. YouTube Data API with transcript access
    // 2. Third-party transcript services
    // 3. YouTube transcript scraping (with proper permissions)
    
    // For now, return a sample transcript structure
    return `[00:00] Welcome to today's lesson on algebra
[00:15] Today we'll be learning about quadratic equations
[00:30] A quadratic equation is in the form ax² + bx + c = 0
[00:45] Let's start with a simple example: x² + 5x + 6 = 0
[01:00] To solve this, we need to find the values of x
[01:15] We can use factoring, completing the square, or the quadratic formula
[01:30] Let me show you the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a
[01:45] For our example, a=1, b=5, c=6
[02:00] Plugging these values in: x = (-5 ± √(25 - 24)) / 2
[02:15] This simplifies to: x = (-5 ± √1) / 2
[02:30] So x = (-5 + 1) / 2 = -2 or x = (-5 - 1) / 2 = -3
[02:45] Therefore, the solutions are x = -2 and x = -3
[03:00] Let's verify by plugging these back into the original equation
[03:15] For x = -2: (-2)² + 5(-2) + 6 = 4 - 10 + 6 = 0 ✓
[03:30] For x = -3: (-3)² + 5(-3) + 6 = 9 - 15 + 6 = 0 ✓
[03:45] Both solutions work! This is how you solve quadratic equations.`;
    
  } catch (error) {
    console.error('Error getting video transcript:', error);
    return null;
  }
}

// Legacy function (kept for compatibility)
async function getYouTubeVideoRecommendation(grade, subject, query) {
  return await getFallbackVideoRecommendation(grade, subject, query);
} 
