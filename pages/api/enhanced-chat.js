import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import Cors from 'cors';

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
      chatHistory = []
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
      
      // Check avatar first, then teacher name
              if (avatarId === 'miss-sapna' || teacherName === 'Miss Sapna' || teacherName === 'Ms. Sapana') {
          console.log('✅ Selected Miss Sapna persona');
          
          // Determine response language based on user input
          let responseLanguage = 'Mix Hindi and English (Hinglish) naturally. Use simple Hindi words like "samjha", "achha", "bilkul", "beta", "shiksha", etc. For technical terms, use English but explain in Hindi. Example: "Beta, yeh \'verb\' hota hai, jo action dikhata hai."';
          
          if (userInputLanguage === 'english') {
            responseLanguage = 'Respond in English only. Use clear, simple English explanations. If the student asks in English, respond in English.';
          } else if (userInputLanguage === 'hindi') {
            responseLanguage = 'Respond primarily in Hindi with English terms for technical concepts. Use Hinglish naturally.';
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
          language: 'ALWAYS respond in English only, regardless of the language of the question. If the student asks a question in Hindi, respond in English and politely suggest they switch to Miss Sapana in settings for Hindi comfort.',
          greeting: 'Hello! I am Roy Sir, your academic guide.',
          cultural: 'Provide health tips and wellness advice when relevant. Maximum 1 health tip per hour, 3 per day. Focus on student wellness, study habits, and healthy lifestyle.',
          specialFeatures: 'Emphasize structured learning and academic excellence. Use international examples while keeping Indian context in mind. ALWAYS respond in English and suggest Miss Sapana for Hindi questions.',
          teachingStyle: 'Use Socratic method with thoughtful questions like "What do you think?" or "How would you approach this?" Provide scaffolded explanations with step-by-step guidance. Create personalized quizzes to assess understanding. Use real-world examples and analogies. Make learning engaging and interactive, like a conversation with an experienced mentor. If student asks in Hindi, respond in English and suggest: "If you are more comfortable in Hindi, please select Miss Sapana in the settings for a better experience."'
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
- Use clear, proper English with structured explanations
- Maintain professional tone throughout
- Use international examples while keeping Indian context in mind
- If student asks in Hindi, respond in English and suggest: "If you are more comfortable in Hindi, please select Miss Sapana in the settings for a better experience."`;

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
- Use the provided student information in your responses
- Address the student by their name: ${userContext.name}
- Reference their class and board when relevant
- NEVER mention images, pictures, or visual resources
- RESPOND IN PLAIN TEXT ONLY - no markdown, no formatting, no special characters
- Stay in character as ${teacherPersona.name} at all times
- ${isFirstResponseOfDay ? `This is the first response of the day, so you may introduce yourself as ${teacherPersona.name}.` : 'Do not introduce yourself by name in this response.'}

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
${chatHistory.length > 0 ? `Recent conversation context (use this to maintain continuity and be more interactive):
${chatHistory.map(msg => `${msg.role === 'user' ? 'Student' : teacherPersona.name}: ${msg.content}`).join('\n')}

IMPORTANT: Use this conversation history to:
- Reference what was discussed earlier
- Ask follow-up questions about previous topics
- Check if the student understood previous concepts
- Build upon previous learning
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
