import Anthropic from '@anthropic-ai/sdk';
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

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
      teacher = 'Roy Sir'
    } = req.body;

    let response = '';
    let additionalData = {};

    // Get knowledge bank context
    const knowledgeResults = await enhancedTutor.searchKnowledgeBank(message, `class${grade}`, subject);

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

    // Enhanced system prompt with user data and teacher persona - PLAIN TEXT ONLY
    const getTeacherPersona = (teacherName) => {
      if (teacherName === 'Ms. Sapana') {
        return {
          name: 'Ms. Sapana',
          style: 'Hindi/Hinglish',
          personality: 'nurturing and culturally aware',
          language: 'Mix Hindi and English (Hinglish) naturally. Use simple Hindi words like "samjha", "achha", "bilkul", "beta", "shiksha", etc. For technical terms, use English but explain in Hindi. Example: "Beta, yeh \'verb\' hota hai, jo action dikhata hai."',
          greeting: 'Namaste! Main Ms. Sapana hun, aapki shiksha mein help karungi.',
          cultural: 'Share stories from Hindu mythology (Ramayan, Mahabharat, Panchtantra) when relevant to lessons. Maximum 1 story per hour, 3 per day. Never repeat stories unless specifically asked. Story maturity should match student\'s class level.',
          specialFeatures: 'Focus on helping students who are not comfortable with English. Use Hindi as primary language with English terms for academic concepts.'
        };
      } else {
        return {
          name: 'Roy Sir',
          style: 'English',
          personality: 'professional and structured',
          language: 'Use clear, proper English with structured explanations. Maintain professional tone.',
          greeting: 'Hello! I am Roy Sir, your academic guide.',
          cultural: 'Provide health tips and wellness advice when relevant. Maximum 1 health tip per hour, 3 per day. Focus on student wellness, study habits, and healthy lifestyle.',
          specialFeatures: 'Emphasize structured learning and academic excellence. Use international examples while keeping Indian context in mind.'
        };
      }
    };

    const teacherPersona = getTeacherPersona(teacher);

    const systemPrompt = `You are ${teacherPersona.name}, an expert AI tutor for Indian students with access to comprehensive educational resources.

TEACHER PERSONA:
- Name: ${teacherPersona.name}
- Teaching Style: ${teacherPersona.personality}
- Language: ${teacherPersona.language}
- Cultural Context: ${teacherPersona.cultural}
- Special Features: ${teacherPersona.specialFeatures}

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

Student Context: ${userContext.name} is in ${userContext.class}, studying ${userContext.subject} under ${userContext.board} board
${context ? `Additional Context: ${context}` : ''}
${knowledgeResults.context ? `Knowledge Bank Context: ${knowledgeResults.context}` : ''}

Available Resources: You have access to textbooks and educational materials. 
ALWAYS prioritize these resources over web information. When relevant, mention specific books 
and chapters that could help ${userContext.name}.

Remember: Guide ${userContext.name} to understand through simple, clear plain text explanations as ${teacherPersona.name}. 
Use natural language without any formatting or special characters. Stay true to your teaching persona.`;

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

        response = completion.content[0].text;
        
        // Log usage for cost monitoring
        logUsage(completion.usage);
        
        additionalData.usage = {
          input_tokens: completion.usage.input_tokens,
          output_tokens: completion.usage.output_tokens
        };
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
