import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subject, classLevel, board, numberOfQuestions, duration } = req.body;

    console.log('🤖 AI Test Generation Request:', {
      subject,
      classLevel,
      board,
      numberOfQuestions,
      duration
    });

    // Load syllabus data
    const syllabusData = await loadSyllabusData(board || 'CBSE', classLevel);
    
    if (!syllabusData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Syllabus not found',
        message: `No syllabus found for ${board || 'CBSE'} Class ${classLevel}` 
      });
    }

    // Generate questions based on subject and class level using syllabus
    const questions = generateQuestionsFromSyllabus(subject, classLevel, numberOfQuestions, syllabusData);

    const testData = {
      success: true,
      subject: subject,
      classLevel: classLevel,
      board: board || 'CBSE',
      questions: questions,
      duration: duration,
      timestamp: new Date().toISOString()
    };

    console.log('✅ AI test generated successfully:', testData);

    return res.status(200).json(testData);

  } catch (error) {
    console.error('❌ Error generating AI test:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to generate test',
      message: error.message 
    });
  }
}

// Load syllabus data from JSON files
async function loadSyllabusData(board, classLevel) {
  try {
    const syllabusPath = path.join(process.cwd(), 'public', 'Syllabus', board, `Class_${classLevel}.json`);
    console.log('📚 Loading syllabus from:', syllabusPath);
    
    if (!fs.existsSync(syllabusPath)) {
      console.warn('⚠️ Syllabus file not found:', syllabusPath);
      return null;
    }
    
    const syllabusContent = fs.readFileSync(syllabusPath, 'utf8');
    const syllabusData = JSON.parse(syllabusContent);
    
    console.log('✅ Syllabus loaded successfully:', syllabusData);
    return syllabusData;
    
  } catch (error) {
    console.error('❌ Error loading syllabus:', error);
    return null;
  }
}

// Generate questions from syllabus data
function generateQuestionsFromSyllabus(subject, classLevel, numberOfQuestions, syllabusData) {
  const questions = [];
  const level = parseInt(classLevel) || 2;
  
  // Get subject topics from syllabus
  const subjectTopics = getSubjectTopics(subject, syllabusData);
  
  if (!subjectTopics || subjectTopics.length === 0) {
    console.warn('⚠️ No topics found for subject:', subject);
    // Fallback to generic questions
    return generateQuestionsForSubject(subject, classLevel, numberOfQuestions);
  }
  
  for (let i = 0; i < numberOfQuestions; i++) {
    // Select a random topic from the syllabus
    const randomTopic = subjectTopics[Math.floor(Math.random() * subjectTopics.length)];
    
    // Generate question based on the topic
    const question = generateQuestionFromTopic(subject, level, randomTopic);
    
    questions.push({
      id: `q_${Date.now()}_${i}`,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      subject: subject,
      classLevel: level,
      topic: randomTopic
    });
  }
  
  return questions;
}

// Get topics for a specific subject from syllabus
function getSubjectTopics(subject, syllabusData) {
  if (!syllabusData || !syllabusData.subjects) {
    return [];
  }
  
  const subjectKey = Object.keys(syllabusData.subjects).find(key => 
    key.toLowerCase() === subject.toLowerCase() ||
    key.toLowerCase().includes(subject.toLowerCase()) ||
    subject.toLowerCase().includes(key.toLowerCase())
  );
  
  if (!subjectKey) {
    return [];
  }
  
  const subjectData = syllabusData.subjects[subjectKey];
  
  // Handle different subject data structures
  if (Array.isArray(subjectData)) {
    return subjectData;
  } else if (typeof subjectData === 'object') {
    // For subjects like English with multiple books
    const topics = [];
    Object.values(subjectData).forEach(bookTopics => {
      if (Array.isArray(bookTopics)) {
        topics.push(...bookTopics);
      }
    });
    return topics;
  }
  
  return [];
}

// Generate question from a specific topic
function generateQuestionFromTopic(subject, level, topic) {
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('math') || subjectLower.includes('mathematics')) {
    return generateMathQuestionFromTopic(level, topic);
  } else if (subjectLower.includes('science')) {
    return generateScienceQuestionFromTopic(level, topic);
  } else if (subjectLower.includes('english')) {
    return generateEnglishQuestionFromTopic(level, topic);
  } else if (subjectLower.includes('hindi')) {
    return generateHindiQuestionFromTopic(level, topic);
  } else if (subjectLower.includes('evs') || subjectLower.includes('environmental')) {
    return generateEVSQuestionFromTopic(level, topic);
  } else {
    // Default to general question
    return generateGeneralQuestionFromTopic(level, topic);
  }
}

// Generate math question from topic
function generateMathQuestionFromTopic(level, topic) {
  const mathQuestions = [
    {
      question: `What is the main concept in "${topic}"?`,
      options: ['Addition', 'Subtraction', 'Multiplication', 'Division'],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `"${topic}" is an important topic in mathematics for Class ${level}.`
    },
    {
      question: `Which operation is most commonly used in "${topic}"?`,
      options: ['Counting', 'Adding', 'Subtracting', 'Multiplying'],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `"${topic}" helps students understand mathematical operations.`
    }
  ];
  
  return mathQuestions[Math.floor(Math.random() * mathQuestions.length)];
}

// Generate science question from topic
function generateScienceQuestionFromTopic(level, topic) {
  const scienceQuestions = [
    {
      question: `What do we learn about in "${topic}"?`,
      options: ['Plants', 'Animals', 'Environment', 'All of the above'],
      correctAnswer: 3,
      explanation: `"${topic}" teaches us about the natural world around us.`
    },
    {
      question: `Why is "${topic}" important to study?`,
      options: ['It helps us understand nature', 'It teaches us about life', 'It shows us how things work', 'All of the above'],
      correctAnswer: 3,
      explanation: `"${topic}" is an important part of science education.`
    }
  ];
  
  return scienceQuestions[Math.floor(Math.random() * scienceQuestions.length)];
}

// Generate English question from topic
function generateEnglishQuestionFromTopic(level, topic) {
  const englishQuestions = [
    {
      question: `What is the main theme of "${topic}"?`,
      options: ['Friendship', 'Adventure', 'Learning', 'Fun'],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `"${topic}" is a wonderful story that teaches us important lessons.`
    },
    {
      question: `What can we learn from "${topic}"?`,
      options: ['New words', 'Good values', 'Reading skills', 'All of the above'],
      correctAnswer: 3,
      explanation: `"${topic}" helps us improve our English language skills.`
    }
  ];
  
  return englishQuestions[Math.floor(Math.random() * englishQuestions.length)];
}

// Generate Hindi question from topic
function generateHindiQuestionFromTopic(level, topic) {
  const hindiQuestions = [
    {
      question: `"${topic}" में क्या सीखते हैं?`,
      options: ['नए शब्द', 'अच्छे मूल्य', 'हिंदी भाषा', 'सभी'],
      correctAnswer: 3,
      explanation: `"${topic}" हमें हिंदी भाषा में बेहतर बनाता है।`
    },
    {
      question: `"${topic}" का मुख्य उद्देश्य क्या है?`,
      options: ['पढ़ना सिखाना', 'लिखना सिखाना', 'बोलना सिखाना', 'सभी'],
      correctAnswer: 3,
      explanation: `"${topic}" हिंदी भाषा सीखने में मदद करता है।`
    }
  ];
  
  return hindiQuestions[Math.floor(Math.random() * hindiQuestions.length)];
}

// Generate EVS question from topic
function generateEVSQuestionFromTopic(level, topic) {
  const evsQuestions = [
    {
      question: `What does "${topic}" teach us about?`,
      options: ['Our environment', 'Plants and animals', 'Health and safety', 'All of the above'],
      correctAnswer: 3,
      explanation: `"${topic}" helps us understand our environment better.`
    },
    {
      question: `Why is it important to learn about "${topic}"?`,
      options: ['To protect nature', 'To stay healthy', 'To be safe', 'All of the above'],
      correctAnswer: 3,
      explanation: `"${topic}" teaches us important life skills.`
    }
  ];
  
  return evsQuestions[Math.floor(Math.random() * evsQuestions.length)];
}

// Generate general question from topic
function generateGeneralQuestionFromTopic(level, topic) {
  const generalQuestions = [
    {
      question: `What is the main purpose of studying "${topic}"?`,
      options: ['To learn new things', 'To improve skills', 'To gain knowledge', 'All of the above'],
      correctAnswer: 3,
      explanation: `"${topic}" is an important topic that helps us learn and grow.`
    },
    {
      question: `What can we achieve by learning about "${topic}"?`,
      options: ['Better understanding', 'New skills', 'Knowledge', 'All of the above'],
      correctAnswer: 3,
      explanation: `"${topic}" is a valuable topic for students.`
    }
  ];
  
  return generalQuestions[Math.floor(Math.random() * generalQuestions.length)];
}

function generateQuestionsForSubject(subject, classLevel, numberOfQuestions) {
  const questions = [];
  const level = parseInt(classLevel) || 2;

  for (let i = 0; i < numberOfQuestions; i++) {
    let question;

    switch (subject.toLowerCase()) {
      case 'mathematics':
      case 'math':
        question = generateMathQuestion(level);
        break;
      case 'science':
        question = generateScienceQuestion(level);
        break;
      case 'english':
        question = generateEnglishQuestion(level);
        break;
      case 'hindi':
        question = generateHindiQuestion(level);
        break;
      case 'evs':
      case 'environmental studies':
        question = generateEVSQuestion(level);
        break;
      case 'general':
        // Random subject for general questions
        const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'EVS'];
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        question = generateQuestionsForSubject(randomSubject, level, 1)[0];
        break;
      default:
        // Default to math if subject not recognized
        question = generateMathQuestion(level);
    }

    questions.push({
      id: `q_${Date.now()}_${i}`,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      subject: subject,
      classLevel: level
    });
  }

  return questions;
}

function generateMathQuestion(level) {
  if (level <= 3) {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer, question;
    if (operation === '+') {
      answer = a + b;
      question = `What is ${a} + ${b}?`;
    } else {
      answer = Math.max(a, b) - Math.min(a, b);
      question = `What is ${Math.max(a, b)} - ${Math.min(a, b)}?`;
    }

    return {
      question: question,
      options: [
        answer.toString(),
        (answer + 1).toString(),
        (answer - 1).toString(),
        (answer + 2).toString()
      ],
      correctAnswer: 0,
      explanation: `The correct answer is ${answer}. This is basic ${operation === '+' ? 'addition' : 'subtraction'} for young learners.`
    };
  } else if (level <= 5) {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const answer = a * b;

    return {
      question: `What is ${a} × ${b}?`,
      options: [
        answer.toString(),
        (answer + 1).toString(),
        (answer - 1).toString(),
        (answer + 2).toString()
      ],
      correctAnswer: 0,
      explanation: `The correct answer is ${answer}. ${a} × ${b} = ${answer}.`
    };
  } else {
    const a = Math.floor(Math.random() * 100) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const answer = Math.floor(a / b);

    return {
      question: `What is ${a} ÷ ${b}? (Round to nearest whole number)`,
      options: [
        answer.toString(),
        (answer + 1).toString(),
        (answer - 1).toString(),
        (answer + 2).toString()
      ],
      correctAnswer: 0,
      explanation: `The correct answer is ${answer}. ${a} ÷ ${b} = ${answer} (rounded).`
    };
  }
}

function generateScienceQuestion(level) {
  const questions = [
    {
      question: 'What color is the sky?',
      options: ['Blue', 'Red', 'Green', 'Yellow'],
      correctAnswer: 0,
      explanation: 'The sky appears blue due to the scattering of light by the atmosphere.'
    },
    {
      question: 'What do plants need to grow?',
      options: ['Water, sunlight, and soil', 'Only water', 'Only sunlight', 'Only soil'],
      correctAnswer: 0,
      explanation: 'Plants need water, sunlight, and soil to grow properly.'
    },
    {
      question: 'What animal says "meow"?',
      options: ['Dog', 'Cat', 'Bird', 'Fish'],
      correctAnswer: 1,
      explanation: 'Cats make the sound "meow".'
    },
    {
      question: 'What is the opposite of hot?',
      options: ['Warm', 'Cold', 'Cool', 'Freezing'],
      correctAnswer: 1,
      explanation: 'The opposite of hot is cold.'
    },
    {
      question: 'What do we use to see?',
      options: ['Ears', 'Eyes', 'Nose', 'Mouth'],
      correctAnswer: 1,
      explanation: 'We use our eyes to see.'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}

function generateEnglishQuestion(level) {
  const questions = [
    {
      question: 'What letter comes after A?',
      options: ['B', 'C', 'D', 'E'],
      correctAnswer: 0,
      explanation: 'The letter B comes after A in the English alphabet.'
    },
    {
      question: 'How do you say "hello"?',
      options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
      correctAnswer: 0,
      explanation: 'Hello is a common greeting in English.'
    },
    {
      question: 'What is the opposite of big?',
      options: ['Large', 'Small', 'Huge', 'Giant'],
      correctAnswer: 1,
      explanation: 'The opposite of big is small.'
    },
    {
      question: 'What do we use to write?',
      options: ['Pen or pencil', 'Spoon', 'Fork', 'Plate'],
      correctAnswer: 0,
      explanation: 'We use a pen or pencil to write.'
    },
    {
      question: 'How do you spell "cat"?',
      options: ['C-A-T', 'K-A-T', 'C-A-R', 'B-A-T'],
      correctAnswer: 0,
      explanation: 'Cat is spelled C-A-T.'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}

function generateHindiQuestion(level) {
  const questions = [
    {
      question: 'क का उच्चारण कैसे होता है?',
      options: ['क', 'ख', 'ग', 'घ'],
      correctAnswer: 0,
      explanation: 'क का उच्चारण "क" होता है।'
    },
    {
      question: 'हिंदी में "नमस्ते" का क्या मतलब है?',
      options: ['धन्यवाद', 'नमस्ते', 'माफ करें', 'जी हाँ'],
      correctAnswer: 1,
      explanation: 'नमस्ते का मतलब "नमस्ते" या अभिवादन होता है।'
    },
    {
      question: 'कितने स्वर होते हैं?',
      options: ['10', '11', '12', '13'],
      correctAnswer: 1,
      explanation: 'हिंदी में 11 स्वर होते हैं।'
    },
    {
      question: 'हिंदी में "पानी" क्या है?',
      options: ['भोजन', 'पानी', 'कपड़ा', 'घर'],
      correctAnswer: 1,
      explanation: 'पानी का मतलब "पानी" या जल होता है।'
    },
    {
      question: 'कौन सा दिन सप्ताह का पहला दिन है?',
      options: ['मंगलवार', 'बुधवार', 'रविवार', 'सोमवार'],
      correctAnswer: 2,
      explanation: 'रविवार सप्ताह का पहला दिन है।'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}

function generateEVSQuestion(level) {
  const questions = [
    {
      question: 'Which mode of transport flies in the sky?',
      options: ['Car', 'Train', 'Airplane', 'Ship'],
      correctAnswer: 2,
      explanation: 'Airplanes fly in the sky, making them a mode of air transport.'
    },
    {
      question: 'What is the capital of India?',
      options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
      correctAnswer: 1,
      explanation: 'New Delhi is the capital of India.'
    },
    {
      question: 'Which is the largest planet in our solar system?',
      options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 2,
      explanation: 'Jupiter is the largest planet in our solar system.'
    },
    {
      question: 'What do we call the place where we live?',
      options: ['School', 'Home', 'Park', 'Market'],
      correctAnswer: 1,
      explanation: 'We call the place where we live our home.'
    },
    {
      question: 'Which season comes after summer?',
      options: ['Spring', 'Winter', 'Monsoon', 'Autumn'],
      correctAnswer: 2,
      explanation: 'Monsoon season comes after summer in India.'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}
