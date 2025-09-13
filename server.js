import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
// Import PDFProcessor lazily to avoid Vercel deployment issues
// import { PDFProcessor } from './utils/pdfExtractor.js';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import multer from 'multer';

dotenv.config();

// Helper function to generate unique school registration codes
function generateSchoolCode() {
    const prefix = 'SCH';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOOKS_DIR = path.join(__dirname, 'books');

const app = express();

// Force rebuild timestamp
const REBUILD_TIMESTAMP = process.env.REBUILD_TIMESTAMP || Date.now();
console.log(`Server starting with rebuild timestamp: ${REBUILD_TIMESTAMP}`);

// Initialize OpenAI lazily to avoid startup crashes
let openaiClient = null;
function getOpenAI() {
    if (!openaiClient) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient;
}

// Initialize Supabase lazily to avoid startup crashes
let supabase = null;
function getSupabase() {
    if (!supabase) {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
        }
        supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);
    }
    return supabase;
}

// Initialize PDF Processor lazily to avoid Vercel deployment issues
let pdfProcessor = null;

async function getPDFProcessor() {
    if (!pdfProcessor) {
        try {
            const PDFProcessor = (await import('./utils/pdfExtractor.js')).default;
            pdfProcessor = new PDFProcessor();
            await pdfProcessor.initialize();
        } catch (error) {
            console.warn('PDF Processor initialization failed:', error.message);
            // Create a fallback processor that doesn't use PDF parsing
            pdfProcessor = {
                findRelevantContent: () => [],
                extractPDFText: async () => null,
                processAllPDFs: async () => console.log('PDF processing not available'),
                getBooksByClassAndSubject: () => [],
                bookContent: new Map() // Add missing property
            };
        }
    }
    return pdfProcessor;
}

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Create uploads directory if it doesn't exist (only in non-serverless environments)
if (!process.env.VERCEL) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
}

// Serve static files with cache-busting headers
app.use('/js', express.static(path.join(__dirname, 'public', 'js'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));
app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));
app.use('/css', express.static(path.join(__dirname, 'public', 'css'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// API Key middleware
app.use('/api', (req, res, next) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }
  next();
});

// Rate limiting middleware (recommended)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Config API endpoint for client-side Supabase configuration
app.get('/api/config', (req, res) => {
    try {
        // Server-side can access process.env - check both regular and NEXT_PUBLIC versions
        const config = {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
        };

        // Validate environment variables
        if (!config.supabaseUrl || !config.supabaseAnonKey) {
            console.error('Missing Supabase environment variables');
            return res.status(500).json({ 
                error: 'Server configuration error',
                details: 'Missing required environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)'
            });
        }

        res.status(200).json(config);

    } catch (error) {
        console.error('Config API error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Inject NEXT_PUBLIC environment variables into HTML pages
app.use((req, res, next) => {
    // Only inject for HTML files
    if (req.path.endsWith('.html') || req.path === '/') {
        const originalSend = res.send;
        res.send = function(data) {
            if (typeof data === 'string' && data.includes('</head>')) {
                // Inject environment variables into window object
                const envScript = `
                    <script>
                        window.NEXT_PUBLIC_SUPABASE_URL = '${process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''}';
                        window.NEXT_PUBLIC_SUPABASE_ANON_KEY = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''}';
                    </script>
                `;
                data = data.replace('</head>', envScript + '</head>');
            }
            return originalSend.call(this, data);
        };
    }
    next();
});

// Root health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Tutor.AI server is running',
        timestamp: new Date().toISOString()
    });
});

// PDF Handler integration
let pdfHandler = null;

async function getPDFHandler() {
    if (!pdfHandler) {
        try {
            const { default: handler } = await import('./lib/pdfHandler.js');
            pdfHandler = handler;
        } catch (error) {
            console.warn('PDF Handler initialization failed:', error.message);
            pdfHandler = {
                getStatus: () => ({ available: false, timestamp: new Date().toISOString() }),
                parsePDFBuffer: () => { throw new Error('PDF parsing not available'); },
                parsePDFFile: () => { throw new Error('PDF parsing not available'); }
            };
        }
    }
    return pdfHandler;
}

// PDF Status API
app.get('/api/pdf/status', async (req, res) => {
    try {
        const handler = await getPDFHandler();
        const status = handler.getStatus();
        
        res.status(200).json({
            service: 'PDF Handler',
            status: status.available ? 'available' : 'unavailable',
            timestamp: status.timestamp,
            environment: process.env.NODE_ENV || 'development',
            platform: process.platform,
            nodeVersion: process.version,
            capabilities: {
                pdfParsing: status.available,
                fileUpload: true,
                textProcessing: true
            }
        });
    } catch (error) {
        res.status(500).json({
            service: 'PDF Handler',
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// PDF Parse API
app.post('/api/pdf/parse', async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { buffer, filePath, text } = req.body;

        // Check if PDF handler is available
        const handler = await getPDFHandler();
        const status = handler.getStatus();
        if (!status.available) {
            return res.status(503).json({
                error: 'PDF parsing unavailable',
                message: 'PDF parsing service is not available in this environment',
                fallback: 'Please try uploading a text file instead'
            });
        }

        let result;

        if (buffer) {
            // Parse from buffer (uploaded file)
            const bufferData = Buffer.from(buffer, 'base64');
            result = await handler.parsePDFBuffer(bufferData);
        } else if (filePath) {
            // Parse from file path (server-side file)
            result = await handler.parsePDFFile(filePath);
        } else if (text) {
            // Fallback: just return the text as-is
            result = { text, numPages: 1, source: 'text-input' };
        } else {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Please provide buffer, filePath, or text'
            });
        }

        // Return parsed result
        res.status(200).json({
            success: true,
            data: {
                text: result.text,
                numPages: result.numPages,
                wordCount: result.text.split(/\s+/).length,
                charCount: result.text.length,
                processed: true,
                timestamp: new Date().toISOString()
            },
            metadata: {
                info: result.info,
                version: result.version
            }
        });

    } catch (error) {
        console.error('PDF parsing API error:', error);
        
        res.status(500).json({
            error: 'PDF parsing failed',
            message: error.message,
            fallback: 'Please try uploading a text file or try again later',
            timestamp: new Date().toISOString()
        });
    }
});

// API Routes (must come before static file serving)
app.get('/api/supabase-config', (req, res) => {
    try {
        // Check if environment variables are set
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            return res.status(500).json({
                error: 'Supabase configuration not available',
                message: 'Server environment variables not configured'
            });
        }
        
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_ANON_KEY
    });
    } catch (error) {
        console.error('Error serving Supabase config:', error);
        res.status(500).json({
            error: 'Failed to load configuration',
            message: error.message
        });
    }
});

// Claude Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, messages, grade, subject, language, userProfile } = req.body;

    // Handle both single message and messages array formats
    let messageArray = [];
    if (message) {
      // Single message format from frontend
      messageArray = [{ role: 'user', content: message }];
    } else if (messages && Array.isArray(messages)) {
      // Messages array format
      messageArray = messages;
    } else {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Filter out any messages with null/undefined/empty content
    const filteredMessages = messageArray.filter(msg =>
      msg.content && typeof msg.content === 'string' && msg.content.trim() !== ''
    );

    // Get relevant book content for context
    let bookContext = '';
    if (grade && subject) {
      try {
        const pdfProc = await getPDFProcessor();
        const relevantContent = pdfProc.findRelevantContent(
          filteredMessages[filteredMessages.length - 1]?.content || '', 
          subject, 
          grade
        );
        if (relevantContent.length > 0) {
          bookContext = `\n\nRelevant textbook content:\n${relevantContent.join('\n\n')}`;
        }
      } catch (error) {
        console.warn('Failed to get book context:', error.message);
        // Continue without book context
      }
    }

    // Build user context from profile
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

    // Enhanced system prompt for Indian education context - PLAIN TEXT ONLY
    const systemPrompt = `You are an expert AI tutor for Indian students. 

STUDENT INFORMATION (CRITICAL - DO NOT ASK FOR THIS):
- Student Name: ${userContext.name}
- Class: ${userContext.class}
- Board: ${userContext.board}
- Subject: ${userContext.subject}

ABSOLUTE RULES - NEVER VIOLATE:
1. NEVER ask for the student's name - you already know it's ${userContext.name}
2. NEVER ask "What is your name?" or "May I know your name?" or similar questions
3. NEVER ask for class, board, or any personal information
4. ALWAYS address the student as "${userContext.name}" in your responses
5. Use the provided information without asking for it
6. NEVER mention images, pictures, or visual resources
7. RESPOND IN PLAIN TEXT ONLY - no markdown, no formatting, no special characters

CHAT HISTORY ANALYSIS RULES:
8. ALWAYS analyze the conversation history before responding to understand context and continuity
9. Check if the current question relates to previous topics discussed in this session
10. If the question builds on a previous concept, acknowledge the connection: "Building on what we discussed about [previous topic]..."
11. If the question is completely new, start fresh but maintain conversational flow
12. Reference previous explanations when relevant: "Remember when we talked about [concept]? This is similar because..."
13. If student asks for clarification on something discussed earlier, refer back to the previous explanation
14. Identify learning progression: if moving from basic to advanced concepts, acknowledge the progression
15. If student seems confused about a topic discussed earlier, offer to review or explain differently
16. Maintain subject continuity: if switching subjects mid-conversation, acknowledge the change
17. Use previous examples or analogies mentioned in the conversation when helpful for current explanation

Always explain concepts clearly and simply, using:
- Simple, clear plain text explanations
- Natural language without formatting
- Regular paragraphs and sentences
- NO markdown formatting, NO lists with symbols, NO tables, NO special characters
- Just plain, readable text

Student Context: ${userContext.name} is in ${userContext.class}, studying ${userContext.subject} under ${userContext.board} board
${bookContext}

Remember: Guide ${userContext.name} to understand through simple, clear plain text explanations. 
Use natural language without any formatting or special characters.`;

    // Convert messages to Claude format
    const claudeMessages = filteredMessages.map(msg => ({
      role: msg.role === 'system' ? 'user' : msg.role,
      content: msg.content
    }));

    const ai = getOpenAI();
    const chat = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        ...claudeMessages.map(m => ({ role: m.role, content: m.content }))
      ]
    });

    const response = chat.choices[0]?.message?.content || '';

    res.json({
      success: true,
      reply: response,
      status: "success",
      usage: {
        input_tokens: chat.usage?.input_tokens || 0,
        output_tokens: chat.usage?.output_tokens || 0
      }
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    res.status(500).json({
      error: 'Failed to get response from Claude',
      details: error.message 
    });
  }
});

// NEW: API endpoint to list books from filesystem
app.get('/api/fs/books', (req, res) => {
    try {
        const { grade, subject } = req.query;
        const allFiles = [];
        const ncertPath = path.join(BOOKS_DIR, 'ncert');

        function traverseDir(dir) {
            if (!fs.existsSync(dir)) return;
            
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    traverseDir(fullPath);
                } else if (file.endsWith('.pdf')) {
                    const relativePath = path.relative(BOOKS_DIR, fullPath);
                    
                    // Filter by grade if specified
                    if (grade) {
                        const pathParts = relativePath.split('/');
                        const hasGrade = pathParts.some(part => 
                            part.toLowerCase().includes('class') && 
                            part.toLowerCase().includes(grade.toString())
                        );
                        if (!hasGrade) return;
                    }
                    
                    // Filter by subject if specified
                    if (subject) {
                        const pathParts = relativePath.split('/');
                        const hasSubject = pathParts.some(part => 
                            part.toLowerCase().includes(subject.toLowerCase())
                        );
                        if (!hasSubject) return;
                    }
                    
                    allFiles.push({
                        id: relativePath.replace(/\\/g, '/'), // Use forward slashes for IDs
                        name: path.basename(file, '.pdf').replace(/_/g, ' '),
                        path: relativePath
                    });
                }
            });
        }

            traverseDir(ncertPath);
        
        res.json(allFiles);
    } catch (error) {
        console.error('Failed to load books from filesystem:', error);
        res.status(500).json({ error: 'Failed to load books' });
    }
});

// NEW: API endpoint to list files in a book directory
app.get('/api/books/:path(*)', (req, res) => {
    try {
        const bookPath = decodeURIComponent(req.params.path);
        const fullPath = path.join(__dirname, bookPath);
        
        // Security check - ensure path is within project directory
        if (!fullPath.startsWith(__dirname)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Directory not found' });
        }
        
        const files = fs.readdirSync(fullPath);
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
        
        res.json(pdfFiles);
    } catch (error) {
        console.error('Error listing book files:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

// NEW: API endpoint to serve a specific book file
app.get('/api/fs/books/:id(*)', (req, res) => {
    const filePath = path.join(BOOKS_DIR, req.params.id);
    if (fs.existsSync(filePath) && filePath.startsWith(BOOKS_DIR)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Book not found');
    }
});

// Get available books
app.get('/api/books', async (req, res) => {
    try {
        const pdfProc = await getPDFProcessor();
        const books = Array.from(pdfProc.bookContent.entries()).map(([fileName, content]) => ({
            fileName,
            subject: content.subject,
            grade: content.grade,
            chunkCount: content.chunks.length
        }));
        
        res.json({ books });
    } catch (error) {
        console.error('Error getting books:', error);
        res.status(500).json({ error: 'Failed to get books' });
    }
});

// Search books
app.post('/api/search', async (req, res) => {
    try {
        const { query, subject, grade } = req.body;
        const pdfProc = await getPDFProcessor();
        const relevantContent = pdfProc.findRelevantContent(query, subject, grade);
        
        res.json({ content: relevantContent });
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ error: 'Failed to search books' });
    }
});

// Get processed book content for GPT context
app.get('/api/processed-books', async (req, res) => {
    try {
        const { grade, subject } = req.query;
        let books = [];
        
        const pdfProc = await getPDFProcessor();
        
        if (grade && subject) {
            books = pdfProc.getBooksByClassAndSubject(grade, subject);
        } else if (grade) {
            books = pdfProc.getBooksByClassAndSubject(grade);
        } else {
            // Return all books
            for (const [filePath, content] of pdfProc.bookContent) {
                books.push({
                    filePath,
                    bookName: content.bookName,
                    subject: content.subject,
                    grade: content.grade,
                    chunkCount: content.chunks.length
                });
            }
        }
        
        res.json({ books, total: books.length });
    } catch (error) {
        console.error('Error getting processed books:', error);
        res.status(500).json({ error: 'Failed to get processed books' });
    }
});

// User preferences
app.post('/api/preferences', async (req, res) => {
    try {
        const { userId, preferences } = req.body;
        
        const { error } = await getSupabase()
            .from('user_preferences')
            .upsert({
                user_id: userId,
                preference_key: 'user_preferences',
                preference_value: preferences
            });
        
        if (error) throw error;
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});

// Study sessions
app.post('/api/study-session', async (req, res) => {
    try {
        const { userId, topic, subject, duration } = req.body;
        
        const { error } = await getSupabase()
            .from('study_sessions')
            .insert({
                user_id: userId,
                topic,
                subject,
                duration
            });
        
        if (error) throw error;
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving study session:', error);
        res.status(500).json({ error: 'Failed to save study session' });
    }
});

// Get avatars
app.get('/api/avatars', (req, res) => {
    res.json({ avatars: regionalAvatars });
});

// Regional avatars data
const regionalAvatars = [
    // North India
    { id: 'punjabi-male', name: 'Punjabi Male', region: 'Punjab', gender: 'male', image: '👨‍🦱' },
    { id: 'punjabi-female', name: 'Punjabi Female', region: 'Punjab', gender: 'female', image: '👩‍🦱' },
    { id: 'haryanvi-male', name: 'Haryanvi Male', region: 'Haryana', gender: 'male', image: '👨‍🦲' },
    { id: 'haryanvi-female', name: 'Haryanvi Female', region: 'Haryana', gender: 'female', image: '👩‍🦲' },
    
    // South India
    { id: 'tamil-male', name: 'Tamil Male', region: 'Tamil Nadu', gender: 'male', image: '👨‍🦳' },
    { id: 'tamil-female', name: 'Tamil Female', region: 'Tamil Nadu', gender: 'female', image: '👩‍🦳' },
    { id: 'telugu-male', name: 'Telugu Male', region: 'Andhra Pradesh', gender: 'male', image: '👨‍🦱' },
    { id: 'telugu-female', name: 'Telugu Female', region: 'Andhra Pradesh', gender: 'female', image: '👩‍🦱' },
    { id: 'kannada-male', name: 'Kannada Male', region: 'Karnataka', gender: 'male', image: '👨‍🦲' },
    { id: 'kannada-female', name: 'Kannada Female', region: 'Karnataka', gender: 'female', image: '👩‍🦲' },
    { id: 'malayali-male', name: 'Malayali Male', region: 'Kerala', gender: 'male', image: '👨‍🦳' },
    { id: 'malayali-female', name: 'Malayali Female', region: 'Kerala', gender: 'female', image: '👩‍🦳' },
    
    // East India
    { id: 'bengali-male', name: 'Bengali Male', region: 'West Bengal', gender: 'male', image: '👨‍🦱' },
    { id: 'bengali-female', name: 'Bengali Female', region: 'West Bengal', gender: 'female', image: '👩‍🦱' },
    { id: 'odia-male', name: 'Odia Male', region: 'Odisha', gender: 'male', image: '👨‍🦲' },
    { id: 'odia-female', name: 'Odia Female', region: 'Odisha', gender: 'female', image: '👩‍🦲' },
    
    // West India
    { id: 'gujarati-male', name: 'Gujarati Male', region: 'Gujarat', gender: 'male', image: '👨‍🦳' },
    { id: 'gujarati-female', name: 'Gujarati Female', region: 'Gujarat', gender: 'female', image: '👩‍🦳' },
    { id: 'marathi-male', name: 'Marathi Male', region: 'Maharashtra', gender: 'male', image: '��‍🦱' },
    { id: 'marathi-female', name: 'Marathi Female', region: 'Maharashtra', gender: 'female', image: '👩‍🦱' },
    
    // Central India
    { id: 'madhyapradesh-male', name: 'Madhya Pradesh Male', region: 'Madhya Pradesh', gender: 'male', image: '👨‍🦲' },
    { id: 'madhyapradesh-female', name: 'Madhya Pradesh Female', region: 'Madhya Pradesh', gender: 'female', image: '👩‍🦲' },
    
    // Northeast India
    { id: 'assamese-male', name: 'Assamese Male', region: 'Assam', gender: 'male', image: '👨‍🦳' },
    { id: 'assamese-female', name: 'Assamese Female', region: 'Assam', gender: 'female', image: '👩‍🦳' },
    { id: 'manipuri-male', name: 'Manipuri Male', region: 'Manipur', gender: 'male', image: '👨‍🦱' },
    { id: 'manipuri-female', name: 'Manipuri Female', region: 'Manipur', gender: 'female', image: '👩‍🦱' },
    
    // Kashmir
    { id: 'kashmiri-male', name: 'Kashmiri Male', region: 'Kashmir', gender: 'male', image: '👨‍🦲' },
    { id: 'kashmiri-female', name: 'Kashmiri Female', region: 'Kashmir', gender: 'female', image: '👩‍🦲' }
];

// Enhanced Chat API endpoint
app.post('/api/enhanced-chat', async (req, res) => {
    try {
        const { message, subject, grade, action, examMonth, weekNumber, month } = req.body;
        
        // Check if required environment variables are set
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ 
                error: 'OpenAI API key not configured',
                details: 'OPENAI_API_KEY environment variable is required'
            });
        }
        
        // Import the enhanced chat handler dynamically
        const enhancedChatHandler = await import('./pages/api/enhanced-chat.js');
        
        // Call the handler with the request and response
        await enhancedChatHandler.default(req, res);
        
    } catch (error) {
        console.error('Enhanced chat API error:', error);
        res.status(500).json({ 
            error: 'Enhanced chat service unavailable',
            details: error.message 
        });
    }
});

// Claude Chat API endpoint
app.post('/api/chat-claude', async (req, res) => {
    try {
        // Import the Claude chat handler dynamically
        const claudeChatHandler = await import('./pages/api/chat-claude.js');
        
        // Call the handler with the request and response
        await claudeChatHandler.default(req, res);
        
    } catch (error) {
        console.error('Claude chat API error:', error);
        res.status(500).json({ 
            error: 'Claude chat service unavailable',
            details: error.message 
        });
    }
});

// Daily Challenge API endpoint
app.get('/api/daily-challenge', async (req, res) => {
    try {
        // Import the daily challenge handler dynamically
        const dailyChallengeHandler = await import('./pages/api/daily-challenge.js');
        
        // Call the handler with the request and response
        await dailyChallengeHandler.default(req, res);
        
    } catch (error) {
        console.error('Daily challenge API error:', error);
        res.status(500).json({ 
            error: 'Daily challenge service unavailable',
            details: error.message 
        });
    }
});

app.post('/api/daily-challenge', async (req, res) => {
    try {
        // Import the daily challenge handler dynamically
        const dailyChallengeHandler = await import('./pages/api/daily-challenge.js');
        
        // Call the handler with the request and response
        await dailyChallengeHandler.default(req, res);
        
    } catch (error) {
        console.error('Daily challenge API error:', error);
        res.status(500).json({ 
            error: 'Daily challenge service unavailable',
            details: error.message 
        });
    }
});

// Static file serving for specific directories only

// Serve extracted images statically
app.use('/extracted_images', express.static(path.join(__dirname, 'extracted_images')));

// Serve public/js directory
app.use('/public/js', express.static(path.join(__dirname, 'public', 'js')));

// Test endpoint for config.js
app.get('/test-config', (req, res) => {
    const configPath = path.join(__dirname, 'public', 'js', 'config.js');
    if (fs.existsSync(configPath)) {
        res.json({ 
            status: 'Config file exists',
            path: configPath,
            size: fs.statSync(configPath).size
        });
    } else {
        res.status(404).json({ 
            status: 'Config file not found',
            path: configPath
        });
    }
});

// Book images API
app.get('/api/book-images', (req, res) => {
  const { file, page, keyword } = req.query;
  const indexPath = path.join(__dirname, 'extracted_images', 'index.json');
  if (!fs.existsSync(indexPath)) return res.json({ images: [] });
  
  try {
    const allImages = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    let results = allImages;
    if (file) results = results.filter(img => img.file.includes(file));
    if (page) results = results.filter(img => img.page == page);
    // For now, keyword just matches file name; can be improved with OCR later
    if (keyword) results = results.filter(img => img.file.toLowerCase().includes(keyword.toLowerCase()));
    res.json({ images: results });
  } catch (error) {
    console.error('Error reading image index:', error);
    res.json({ images: [] });
  }
});

// HTML Page routes (must come AFTER static file serving to avoid conflicts)
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        // Add cache-busting headers
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.sendFile(indexPath);
    } else {
        res.status(404).send('index.html not found');
    }
});

app.get('/dashboard', (req, res) => {
    const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
    if (fs.existsSync(dashboardPath)) {
        res.sendFile(dashboardPath);
    } else {
        res.status(404).send('dashboard.html not found');
    }
});

app.get('/login', (req, res) => {
    const loginPath = path.join(__dirname, 'public', 'login.html');
    if (fs.existsSync(loginPath)) {
        // Add cache-busting headers
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.sendFile(loginPath);
    } else {
        res.status(404).send('login.html not found');
    }
});

app.get('/register', (req, res) => {
    const registerPath = path.join(__dirname, 'public', 'register.html');
    if (fs.existsSync(registerPath)) {
        // Add cache-busting headers
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.sendFile(registerPath);
    } else {
        res.status(404).send('register.html not found');
    }
});

app.get('/admin', (req, res) => {
    const adminPath = path.join(__dirname, 'public', 'admin.html');
    if (fs.existsSync(adminPath)) {
        res.sendFile(adminPath);
    } else {
        res.status(404).send('admin.html not found');
    }
});

// Batch Video Processor API Endpoints
app.post('/api/batch-video-processor', async (req, res) => {
    try {
        const { action, subject, classLevel, targetCount } = req.body;
        
        console.log('🚀 Batch Video Processor API called:', action);
        
        // Import the batch video fetcher functions
        const { 
            processAllBatches, 
            processSpecificBatch, 
            getBatchProgress, 
            getDatabaseStats,
            SUBJECT_COMBINATIONS 
        } = await import('./pages/api/batch-video-fetcher.js');
        
        switch (action) {
            case 'start_all_batches':
                console.log('🎯 Starting all batch processing...');
                
                // Start the process in background (non-blocking)
                processAllBatches().then(result => {
                    console.log('✅ All batches completed:', result);
                }).catch(error => {
                    console.error('❌ All batches failed:', error);
                });
                
                return res.status(200).json({
                    success: true,
                    message: 'Batch processing started in background',
                    totalCombinations: SUBJECT_COMBINATIONS.length,
                    combinations: SUBJECT_COMBINATIONS
                });

            case 'process_specific':
                if (!subject) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Missing subject' 
                    });
                }
                
                console.log(`🎯 Processing specific batch: ${subject}`);
                const result = await processSpecificBatch(subject, targetCount || 100);
                
                return res.status(200).json({
                    success: true,
                    data: result
                });

            case 'get_progress':
                const progress = getBatchProgress();
                return res.status(200).json({
                    success: true,
                    data: progress
                });

            case 'get_stats':
                const stats = await getDatabaseStats();
                return res.status(200).json({
                    success: true,
                    data: stats
                });

                            case 'get_combinations':
                    return res.status(200).json({
                        success: true,
                        data: {
                            total: SUBJECT_COMBINATIONS.length,
                            combinations: SUBJECT_COMBINATIONS,
                            totalTargetVideos: SUBJECT_COMBINATIONS.reduce((sum, combo) => sum + combo.targetCount, 0)
                        }
                    });

            case 'test_youtube_api':
                try {
                    // Test YouTube API with a simple search
                    const { fetchEducationalVideos } = await import('./pages/api/youtube-video-fetcher.js');
                    const testVideos = await fetchEducationalVideos('english', 'general', 5);
                    
                    return res.status(200).json({
                        success: true,
                        apiStatus: 'Working',
                        videoCount: testVideos.length,
                        sampleVideos: testVideos.slice(0, 3).map(v => ({ title: v.title, subject: v.subject }))
                    });
                } catch (error) {
                    return res.status(200).json({
                        success: false,
                        error: error.message,
                        apiStatus: 'Failed'
                    });
                }

            case 'debug_youtube':
                try {
                    // Debug YouTube API by testing each channel individually
                    const { google } = await import('googleapis');
                    const API_KEY = process.env.YOUTUBE_DATA_API_KEY;
                    
                    if (!API_KEY) {
                        console.error('❌ YouTube API key not found in environment variables');
                        return res.status(500).json({ 
                            success: false, 
                            error: 'YouTube API key not configured' 
                        });
                    }
                    
                    const youtube = google.youtube({
                        version: 'v3',
                        auth: API_KEY
                    });
                    
                    // Test channels
                    const testChannels = {
                        'ChuChuTVNurseryRhymes': 'UCpOtjdJfn2E6R7ZYqCmbS2w',
                        'Infobells': 'UC7sRIUah9kYkuIy9aV3tGoA',
                        'KhanAcademyKids': 'UC4a-Gbdw7vOaccHmFo40b9g'
                    };
                    
                    const channelResults = [];
                    let totalVideos = 0;
                    
                    for (const [channelName, channelId] of Object.entries(testChannels)) {
                        try {
                            const response = await youtube.search.list({
                                part: 'snippet',
                                channelId: channelId,
                                order: 'date',
                                maxResults: 10,
                                type: 'video'
                            });
                            
                            const videoCount = response.data.items.length;
                            channelResults.push({
                                channel: channelName,
                                videoCount: videoCount,
                                status: 'Success'
                            });
                            totalVideos += videoCount;
                            
                        } catch (error) {
                            channelResults.push({
                                channel: channelName,
                                videoCount: 0,
                                status: 'Failed',
                                error: error.message
                            });
                        }
                    }
                    
                    return res.status(200).json({
                        success: true,
                        apiKeyValid: true,
                        channelsTested: Object.keys(testChannels).length,
                        totalVideos: totalVideos,
                        channelResults: channelResults
                    });
                    
                } catch (error) {
                    return res.status(200).json({
                        success: false,
                        error: error.message,
                        apiKeyValid: false
                    });
                }

            case 'check_table':
                try {
                    // Check if videos table exists and get row count
                    const { SupabaseVideoDatabase } = await import('./pages/api/supabase-video-database.js');
                    const db = new SupabaseVideoDatabase();
                    
                    // Try to get stats to check if table exists
                    const stats = await db.getStats();
                    
                    if (stats.success) {
                        return res.status(200).json({
                            success: true,
                            tableExists: true,
                            tableName: 'videos',
                            rowCount: stats.data.totalVideos || 0
                        });
                    } else {
                        return res.status(200).json({
                            success: false,
                            tableExists: false,
                            tableName: 'videos',
                            error: stats.error
                        });
                    }
                    
                } catch (error) {
                    return res.status(200).json({
                        success: false,
                        tableExists: false,
                        tableName: 'videos',
                        error: error.message
                    });
                }

            case 'add_video_url_column':
                try {
                    // Add video_url column to the videos table
                    const { SupabaseVideoDatabase } = await import('./pages/api/supabase-video-database.js');
                    const db = new SupabaseVideoDatabase();
                    
                    // Execute SQL to add the column
                    const { error: alterError } = await db.supabase
                        .rpc('exec_sql', { 
                            sql: 'ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_url TEXT;' 
                        });
                    
                    if (alterError) {
                        // Try alternative approach
                        const { error: directError } = await db.supabase
                            .from('videos')
                            .select('video_id')
                            .limit(1);
                        
                        if (directError && directError.message.includes('video_url')) {
                            return res.status(200).json({
                                success: false,
                                error: 'Column video_url does not exist. Please add it manually in Supabase dashboard.'
                            });
                        }
                    }
                    
                    return res.status(200).json({
                        success: true,
                        columnAdded: true,
                        message: 'video_url column added successfully'
                    });
                    
                } catch (error) {
                    return res.status(200).json({
                        success: false,
                        error: error.message
                    });
                }

            case 'fix_video_url':
                try {
                    // Update existing videos to add video_url
                    const { SupabaseVideoDatabase } = await import('./pages/api/supabase-video-database.js');
                    const db = new SupabaseVideoDatabase();
                    
                    // Update existing videos to add video_url
                    const { data: videos, error: fetchError } = await db.supabase
                        .from('videos')
                        .select('video_id')
                        .is('video_url', null);
                    
                    if (fetchError) {
                        return res.status(200).json({
                            success: false,
                            error: fetchError.message
                        });
                    }
                    
                    let updatedCount = 0;
                    if (videos && videos.length > 0) {
                        for (const video of videos) {
                            const { error: updateError } = await db.supabase
                                .from('videos')
                                .update({ 
                                    video_url: `https://www.youtube.com/watch?v=${video.video_id}` 
                                })
                                .eq('video_id', video.video_id);
                            
                            if (!updateError) {
                                updatedCount++;
                            }
                        }
                    }
                    
                    return res.status(200).json({
                        success: true,
                        columnAdded: true,
                        videosUpdated: updatedCount,
                        message: `Updated ${updatedCount} videos with YouTube URLs`
                    });
                    
                } catch (error) {
                    return res.status(200).json({
                        success: false,
                        error: error.message
                    });
                }

            default:
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid action. Use: start_all_batches, process_specific, get_progress, get_stats, get_combinations, test_youtube_api, debug_youtube, or check_table' 
                });
        }
        
    } catch (error) {
        console.error('❌ Error in batch video processor:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// School Management API Endpoints
app.use('/api/school-management', async (req, res) => {
    try {
        // CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Initialize Supabase with service role key for admin operations
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
        );

        const { action, data } = req.body;

        switch (action) {
            case 'create_school':
                try {
                    const { school, admin } = data;
                    
                    // Generate unique school registration code
                    const schoolCode = generateSchoolCode();
                    
                    // Insert school first
                    const { data: schoolData, error: schoolError } = await supabaseAdmin
                        .from('schools')
                        .insert([{
                            name: school.name,
                            school_type: school.type,
                            board: school.board,
                            established_year: school.established_year,
                            total_students: school.total_students,
                            total_teachers: school.total_teachers,
                            address_line1: school.address_line1,
                            address_line2: school.address_line2,
                            city: school.city,
                            state: school.state,
                            pin_code: school.pin_code,
                            country: school.country,
                            registration_code: schoolCode,
                            status: 'pending'
                        }])
                        .select()
                        .single();
                    
                    if (schoolError) throw schoolError;
                    
                    // Insert admin
                    const { data: adminData, error: adminError } = await supabaseAdmin
                        .from('school_admins')
                        .insert([{
                            school_id: schoolData.id,
                            name: admin.name,
                            email: admin.email,
                            phone: admin.phone,
                            password_hash: admin.password, // In production, hash this
                            status: 'pending'
                        }])
                        .select()
                        .single();
                    
                    if (adminError) throw adminError;
                    
                    return res.json({ 
                        success: true, 
                        data: { 
                            school: schoolData, 
                            admin: adminData,
                            registration_code: schoolCode 
                        } 
                    });
                } catch (error) {
                    console.error('Error creating school:', error);
                    return res.status(500).json({ success: false, error: error.message });
                }

            case 'create_teacher':
                try {
                    // First validate school code
                    const { data: schoolData, error: schoolError } = await supabaseAdmin
                        .from('schools')
                        .select('id, name, city, state, board')
                        .eq('registration_code', data.schoolCode)
                        .eq('status', 'approved')
                        .single();
                    
                    if (schoolError || !schoolData) {
                        return res.status(400).json({ 
                            success: false, 
                            error: 'Invalid or unapproved school registration code' 
                        });
                    }
                    
                    // Create teacher with school_id
                    const teacherData = {
                        school_id: schoolData.id,
                        first_name: data.firstName,
                        last_name: data.lastName,
                        email: data.email,
                        phone: data.phone,
                        subject: data.subject,
                        qualification: data.qualification,
                        status: 'pending'
                    };
                    
                    const { data: newTeacher, error: teacherError } = await supabaseAdmin
                        .from('teachers')
                        .insert([teacherData])
                        .select()
                        .single();
                    
                    if (teacherError) throw teacherError;
                    return res.json({ success: true, data: newTeacher });
                } catch (error) {
                    console.error('Error creating teacher:', error);
                    return res.status(500).json({ success: false, error: error.message });
                }

            case 'create_student':
                try {
                    // First validate school code
                    const { data: schoolData, error: schoolError } = await supabaseAdmin
                        .from('schools')
                        .select('id, name, city, state, board')
                        .eq('registration_code', data.schoolCode)
                        .eq('status', 'approved')
                        .single();
                    
                    if (schoolError || !schoolData) {
                        return res.status(400).json({ 
                            success: false, 
                            error: 'Invalid or unapproved school registration code' 
                        });
                    }
                    
                    // Create student with school_id
                    const studentData = {
                        school_id: schoolData.id,
                        first_name: data.firstName,
                        last_name: data.lastName,
                        email: data.email,
                        phone: data.phone,
                        dob: data.dob,
                        gender: data.gender,
                        class: data.class,
                        section: data.section,
                        roll_number: data.rollNumber,
                        parent_name: data.parentName,
                        parent_phone: data.parentPhone,
                        status: 'pending'
                    };
                    
                    const { data: newStudent, error: studentError } = await supabaseAdmin
                        .from('students')
                        .insert([studentData])
                        .select()
                        .single();
                    
                    if (studentError) throw studentError;
                    return res.json({ success: true, data: newStudent });
                } catch (error) {
                    console.error('Error creating student:', error);
                    return res.status(500).json({ success: false, error: error.message });
                }

            case 'approve_teacher':
                const { data: approvedTeacher, error: approveTeacherError } = await supabaseAdmin
                    .from('teachers')
                    .update({ status: 'approved' })
                    .eq('id', data.teacher_id)
                    .select()
                    .single();
                
                if (approveTeacherError) throw approveTeacherError;
                return res.json({ success: true, data: approvedTeacher });

            case 'approve_student':
                const { data: approvedStudent, error: approveStudentError } = await supabaseAdmin
                    .from('students')
                    .update({ status: 'approved' })
                    .eq('id', data.student_id)
                    .select()
                    .single();
                
                if (approveStudentError) throw approveStudentError;
                return res.json({ success: true, data: approvedStudent });

            case 'get_school_data':
                const { data: schoolInfo, error: schoolInfoError } = await supabaseAdmin
                    .from('schools')
                    .select('*')
                    .eq('id', data.school_id)
                    .single();
                
                if (schoolInfoError) throw schoolInfoError;
                return res.json({ success: true, data: schoolInfo });

            case 'validate_school_code':
                try {
                    const { data: schoolData, error: schoolError } = await supabaseAdmin
                        .from('schools')
                        .select('id, name, city, state, board, status')
                        .eq('registration_code', data.school_code)
                        .single();
                    
                    if (schoolError || !schoolData) {
                        return res.status(400).json({ 
                            success: false, 
                            error: 'Invalid school registration code' 
                        });
                    }
                    
                    if (schoolData.status !== 'approved') {
                        return res.status(400).json({ 
                            success: false, 
                            error: 'School is not yet approved. Please contact the school administrator.' 
                        });
                    }
                    
                    return res.json({ 
                        success: true, 
                        data: {
                            id: schoolData.id,
                            name: schoolData.name,
                            city: schoolData.city,
                            state: schoolData.state,
                            board: schoolData.board
                        }
                    });
                } catch (error) {
                    console.error('Error validating school code:', error);
                    return res.status(500).json({ success: false, error: error.message });
                }

            case 'get_teachers':
                const { data: teachers, error: teachersError } = await supabaseAdmin
                    .from('teachers')
                    .select('*')
                    .eq('school_id', data.school_id);
                
                if (teachersError) throw teachersError;
                return res.json({ success: true, data: teachers });

            case 'get_students':
                const { data: students, error: studentsError } = await supabaseAdmin
                    .from('students')
                    .select('*')
                    .eq('school_id', data.school_id);
                
                if (studentsError) throw studentsError;
                return res.json({ success: true, data: students });

            case 'create_homework':
                const { data: homeworkData, error: homeworkError } = await supabaseAdmin
                    .from('homework')
                    .insert([data])
                    .select()
                    .single();
                
                if (homeworkError) throw homeworkError;
                return res.json({ success: true, data: homeworkData });

            case 'get_homework':
                const { data: homework, error: homeworkGetError } = await supabaseAdmin
                    .from('homework')
                    .select('*')
                    .eq('class_id', data.class_id)
                    .order('created_at', { ascending: false });
                
                if (homeworkGetError) throw homeworkGetError;
                return res.json({ success: true, data: homework });

            case 'submit_homework':
                const { data: submissionData, error: submissionError } = await supabaseAdmin
                    .from('homework_submissions')
                    .insert([data])
                    .select()
                    .single();
                
                if (submissionError) throw submissionError;
                return res.json({ success: true, data: submissionData });

            case 'get_school_dashboard_stats':
                const schoolId = data.school_id;
                
                // Get counts for dashboard
                const [teachersCount, studentsCount, classesCount, pendingApprovals] = await Promise.all([
                    supabaseAdmin.from('teachers').select('id', { count: 'exact' }).eq('school_id', schoolId),
                    supabaseAdmin.from('students').select('id', { count: 'exact' }).eq('school_id', schoolId),
                    supabaseAdmin.from('classes').select('id', { count: 'exact' }).eq('school_id', schoolId),
                    supabaseAdmin.from('teachers').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('status', 'pending')
                ]);
                
                const pendingStudents = await supabaseAdmin
                    .from('students')
                    .select('id', { count: 'exact' })
                    .eq('school_id', schoolId)
                    .eq('status', 'pending');
                
                return res.json({
                    success: true,
                    data: {
                        total_teachers: teachersCount.count || 0,
                        total_students: studentsCount.count || 0,
                        total_classes: classesCount.count || 0,
                        pending_teachers: pendingApprovals.count || 0,
                        pending_students: pendingStudents.count || 0
                    }
                });

            case 'get_classes':
                const { data: classes, error: classesError } = await supabaseAdmin
                    .from('classes')
                    .select(`
                        *,
                        class_teacher:teachers(name, email, phone),
                        total_students
                    `)
                    .eq('school_id', data.school_id)
                    .order('class_name', { ascending: true });
                
                if (classesError) throw classesError;
                return res.json({ success: true, data: classes });

            case 'create_class':
                const { data: classData, error: classError } = await supabaseAdmin
                    .from('classes')
                    .insert([data])
                    .select()
                    .single();
                
                if (classError) throw classError;
                return res.json({ success: true, data: classData });

            case 'get_attendance':
                const { data: attendance, error: attendanceError } = await supabaseAdmin
                    .from('attendance')
                    .select(`
                        *,
                        student:students(name, roll_number),
                        class:classes(class_name, section)
                    `)
                    .eq('class_id', data.class_id)
                    .eq('date', data.date);
                
                if (attendanceError) throw attendanceError;
                return res.json({ success: true, data: attendance });

            case 'mark_attendance':
                const { data: attendanceData, error: attendanceMarkError } = await supabaseAdmin
                    .from('attendance')
                    .upsert(data.attendance_records, { 
                        onConflict: 'class_id,student_id,date' 
                    })
                    .select();
                
                if (attendanceMarkError) throw attendanceMarkError;
                return res.json({ success: true, data: attendanceData });

            case 'get_exams':
                const { data: exams, error: examsError } = await supabaseAdmin
                    .from('exams')
                    .select(`
                        *,
                        class:classes(class_name, section),
                        subject:subjects(name)
                    `)
                    .eq('school_id', data.school_id)
                    .order('exam_date', { ascending: true });
                
                if (examsError) throw examsError;
                return res.json({ success: true, data: exams });

            case 'create_exam':
                const { data: examData, error: examError } = await supabaseAdmin
                    .from('exams')
                    .insert([data])
                    .select()
                    .single();
                
                if (examError) throw examError;
                return res.json({ success: true, data: examData });

            case 'get_exam_results':
                const { data: examResults, error: examResultsError } = await supabaseAdmin
                    .from('exam_results')
                    .select(`
                        *,
                        student:students(name, roll_number),
                        exam:exams(exam_name, total_marks)
                    `)
                    .eq('exam_id', data.exam_id);
                
                if (examResultsError) throw examResultsError;
                return res.json({ success: true, data: examResults });

            case 'submit_exam_results':
                const { data: resultsData, error: resultsError } = await supabaseAdmin
                    .from('exam_results')
                    .upsert(data.results, { 
                        onConflict: 'exam_id,student_id' 
                    })
                    .select();
                
                if (resultsError) throw resultsError;
                return res.json({ success: true, data: resultsData });

            case 'get_fees':
                const { data: fees, error: feesError } = await supabaseAdmin
                    .from('fees')
                    .select(`
                        *,
                        class:classes(class_name, section)
                    `)
                    .eq('school_id', data.school_id);
                
                if (feesError) throw feesError;
                return res.json({ success: true, data: fees });

            case 'get_fee_payments':
                const { data: feePayments, error: feePaymentsError } = await supabaseAdmin
                    .from('fee_payments')
                    .select(`
                        *,
                        student:students(name, roll_number),
                        fee:fees(fee_type, amount)
                    `)
                    .eq('fee_id', data.fee_id);
                
                if (feePaymentsError) throw feePaymentsError;
                return res.json({ success: true, data: feePayments });

            case 'get_holidays_events':
                const { data: holidaysEvents, error: holidaysError } = await supabaseAdmin
                    .from('holidays_events')
                    .select('*')
                    .eq('school_id', data.school_id)
                    .order('start_date', { ascending: true });
                
                if (holidaysError) throw holidaysError;
                return res.json({ success: true, data: holidaysEvents });

            case 'create_holiday_event':
                const { data: holidayData, error: holidayError } = await supabaseAdmin
                    .from('holidays_events')
                    .insert([data])
                    .select()
                    .single();
                
                if (holidayError) throw holidayError;
                return res.json({ success: true, data: holidayData });

            case 'send_notification':
                const { data: notificationData, error: notificationError } = await supabaseAdmin
                    .from('notifications')
                    .insert([data])
                    .select()
                    .single();
                
                if (notificationError) throw notificationError;
                return res.json({ success: true, data: notificationData });

            case 'ai_chat':
                // Mock AI response for now - replace with actual AI service
                const aiResponse = {
                    message: `AI Assistant: I'm here to help with your ${data.context || 'academic'} questions. This is a mock response - replace with actual AI integration.`,
                    timestamp: new Date().toISOString()
                };
                return res.json({ success: true, data: aiResponse });

            default:
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid action' 
                });
        }
        
    } catch (error) {
        console.error('School Management API Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Specific route for dashboard.html
app.get('/dashboard.html', (req, res) => {
    const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
    if (fs.existsSync(dashboardPath)) {
        res.sendFile(dashboardPath);
    } else {
        res.status(404).send('Dashboard not found');
    }
});

// Catch all route for SPA - must be LAST
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For all other routes, serve index.html (SPA behavior)
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application not found');
    }
});

// Load books on startup (only in development)
async function loadBooks() {
    try {
        const pdfProc = await getPDFProcessor();
        
        // Check if processed_books.json exists before trying to load it
        const processedBooksPath = './processed_books.json';
        if (fs.existsSync(processedBooksPath)) {
            await pdfProc.loadFromFile(processedBooksPath);
            console.log(`Loaded ${pdfProc.bookContent.size} books from file`);
        } else {
            console.log('No processed_books.json found, skipping book loading');
        }
        
        // Initialize with empty book content if none loaded
        if (!pdfProc.bookContent || pdfProc.bookContent.size === 0) {
            pdfProc.bookContent = new Map();
            console.log('Initialized empty book content');
        }
        
        // PDF processing temporarily disabled to prevent errors - will fix later
        // Only process PDFs if we have a books directory and no existing content
        /*
        if (pdfProc.bookContent.size === 0 && fs.existsSync('./books')) {
            console.log('Processing PDFs from books directory...');
            await pdfProc.processAllPDFs('./books');
            await pdfProc.saveToFile('./processed_books.json');
            console.log(`Processed and saved ${pdfProc.bookContent.size} books`);
        }
        */
        
        console.log(`Total books loaded: ${pdfProc.bookContent.size}`);
    } catch (error) {
        console.error('Error loading books:', error);
        console.log('Continuing without book data...');
        // Don't fail the server startup for book loading issues
    }
}

// Syllabus-based Test Generation API
app.post('/api/ai/generate-test', async (req, res) => {
    try {
        const { subject, classLevel, board, numberOfQuestions, duration } = req.body;
        
        // Load syllabus data
        const syllabusPath = `public/Syllabus/${board}/Class_${classLevel}.json`;
        let syllabusData;
        try {
            // Use async file reading for serverless compatibility
            const fileContent = await fs.promises.readFile(syllabusPath, 'utf8');
            syllabusData = JSON.parse(fileContent);
        } catch (error) {
            console.error('❌ Error parsing syllabus JSON:', error);
            console.error('📁 File path:', syllabusPath);
            throw new Error(`Invalid JSON in syllabus file: ${error.message}`);
        }
        
        const subjectData = syllabusData.subjects[subject];
        if (!subjectData) {
            return res.status(400).json({ success: false, error: 'Subject not found in syllabus' });
        }
        
        // Create syllabus context for AI
        const syllabusContext = JSON.stringify(subjectData, null, 2);
        
        const prompt = `Generate ${numberOfQuestions} multiple choice questions for ${subject} class ${classLevel} ${board} students.
        
        Syllabus context:
        ${syllabusContext}
        
        Requirements:
        1. Questions should be based on the syllabus topics
        2. Each question should have 4 options (A, B, C, D)
        3. Include the correct answer
        4. Questions should be appropriate for class ${classLevel} level
        5. Mix different types of questions (conceptual, application, analysis)
        
        Format each question as JSON object with: question, options (array), correctAnswer (0-3), explanation
        
        Return only valid JSON array of questions.`;
        
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an expert educational content creator. Generate only valid JSON." },
                { role: "user", content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });
        
        const questionsText = completion.choices[0].message.content;
        const questions = JSON.parse(questionsText);
        
        res.json({ 
            success: true, 
            questions: questions,
            duration: duration,
            subject: subject,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test Generation Error:', error);
        res.status(500).json({ success: false, error: 'Test generation failed' });
    }
});

// Azure OCR API endpoint
app.post('/api/ocr', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file provided' });
        }

        const azureEndpoint = process.env.AZURE_VISION_ENDPOINT;
        const azureKey = process.env.AZURE_VISION_KEY;

        if (!azureEndpoint || !azureKey) {
            console.error('Azure Vision credentials not found in environment variables');
            return res.status(500).json({ success: false, error: 'OCR service not configured' });
        }

        // Read the image file
        const imageBuffer = await fs.promises.readFile(req.file.path);
        const base64Image = imageBuffer.toString('base64');

        // Prepare the request to Azure Vision API
        const requestBody = {
            requests: [
                {
                    image: {
                        content: base64Image
                    },
                    features: [
                        {
                            type: "TEXT_DETECTION",
                            maxResults: 1
                        }
                    ]
                }
            ]
        };

        // Make request to Azure Vision API
        const response = await fetch(`${azureEndpoint}/vision/v3.2/read/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': azureKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Azure Vision API error: ${response.status} ${response.statusText}`);
        }

        // Get the operation location for polling
        const operationLocation = response.headers.get('Operation-Location');
        
        // Poll for results
        let result;
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const resultResponse = await fetch(operationLocation, {
                headers: {
                    'Ocp-Apim-Subscription-Key': azureKey
                }
            });
            
            result = await resultResponse.json();
            
            if (result.status === 'succeeded') {
                break;
            }
        }

        // Extract text from the result
        let extractedText = '';
        if (result.analyzeResult && result.analyzeResult.readResults) {
            for (const page of result.analyzeResult.readResults) {
                for (const line of page.lines) {
                    extractedText += line.text + ' ';
                }
            }
        }

        // Clean up the uploaded file
        await fs.promises.unlink(req.file.path);

        if (extractedText.trim()) {
            res.json({ 
                success: true, 
                text: extractedText.trim(),
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({ 
                success: false, 
                error: 'No text found in the image',
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('OCR Error:', error);
        
        // Clean up the uploaded file if it exists
        if (req.file && req.file.path) {
            try {
                await fs.promises.unlink(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
        
        res.status(500).json({ 
            success: false, 
            error: 'OCR processing failed',
            details: error.message
        });
    }
});

// Enhanced Leaderboard endpoint with India Top 3 and City Top 3
app.post('/api/students/leaderboard', async (req, res) => {
    try {
        const { type, city } = req.body;
        const supabase = getSupabase();
        
        console.log('🏆 Fetching leaderboard data, type:', type, 'city:', city);
        
        let leaderboardData = {};
        
        // Get India Top 3 (Global)
        const { data: indiaTop3, error: indiaError } = await supabase
            .from('students')
            .select('id, name, class, city, monthly_total_points, monthly_quiz_points, monthly_assessment_points')
            .order('monthly_total_points', { ascending: false })
            .limit(3);
        
        if (indiaError) {
            console.error('❌ Error fetching India top 3:', indiaError);
        } else {
            leaderboardData.indiaTop3 = indiaTop3 || [];
            console.log('🇮🇳 India Top 3 fetched:', indiaTop3?.length || 0);
        }
        
        // Get City Top 3 (if city is specified)
        if (city && city !== 'all') {
            const { data: cityTop3, error: cityError } = await supabase
                .from('students')
                .select('id, name, class, city, monthly_total_points, monthly_quiz_points, monthly_assessment_points')
                .eq('city', city)
                .order('monthly_total_points', { ascending: false })
                .limit(3);
            
            if (cityError) {
                console.error('❌ Error fetching city top 3:', cityError);
            } else {
                leaderboardData.cityTop3 = cityTop3 || [];
                console.log(`🏙️ ${city} Top 3 fetched:`, cityTop3?.length || 0);
            }
        }
        
        // Get Class Top 3 (if type is 'class')
        if (type === 'class') {
            const { data: classTop3, error: classError } = await supabase
                .from('students')
                .select('id, name, class, city, monthly_total_points, monthly_quiz_points, monthly_assessment_points')
                .order('monthly_total_points', { ascending: false })
                .limit(3);
            
            if (classError) {
                console.error('❌ Error fetching class top 3:', classError);
            } else {
                leaderboardData.classTop3 = classTop3 || [];
                console.log('📚 Class Top 3 fetched:', classTop3?.length || 0);
            }
        }
        
        // Add ranks and avatars
        Object.keys(leaderboardData).forEach(key => {
            if (leaderboardData[key]) {
                leaderboardData[key].forEach((user, index) => {
                    user.rank = index + 1;
                    user.avatar = user.name.charAt(0).toUpperCase();
                    user.points = user.monthly_total_points || 0;
                });
            }
        });
        
        console.log(`✅ Leaderboard data fetched successfully`);
        res.json(leaderboardData);
        
    } catch (error) {
        console.error('❌ Leaderboard error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Profile API endpoints
app.get('/api/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.split(' ')[1];
        const supabase = getSupabase();
        
        // Verify the token and get user info
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Get user profile from students table
        const { data: profile, error: profileError } = await supabase
            .from('students')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return res.status(500).json({ error: 'Failed to fetch profile' });
        }
        
        res.json(profile);
        
    } catch (error) {
        console.error('Profile API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.split(' ')[1];
        const supabase = getSupabase();
        
        // Verify the token and get user info
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const profileData = req.body;
        
        // Update user profile in students table
        const { data, error } = await supabase
            .from('students')
            .update(profileData)
            .eq('id', user.id)
            .select()
            .single();
        
        if (error) {
            console.error('Profile update error:', error);
            return res.status(500).json({ error: 'Failed to update profile' });
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('Profile update API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Subjects API endpoint
app.get('/api/subjects', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.split(' ')[1];
        const supabase = getSupabase();
        
        // Verify the token and get user info
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Get user's subjects from students table
        const { data: profile, error: profileError } = await supabase
            .from('students')
            .select('subjects')
            .eq('id', user.id)
            .single();
        
        if (profileError) {
            console.error('Subjects fetch error:', profileError);
            return res.status(500).json({ error: 'Failed to fetch subjects' });
        }
        
        // Return subjects array or default subjects
        const subjects = profile?.subjects || ['Mathematics', 'Science', 'English', 'Hindi', 'EVS'];
        res.json(subjects);
        
    } catch (error) {
        console.error('Subjects API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Videos API endpoint
app.get('/api/videos', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.split(' ')[1];
        const supabase = getSupabase();
        
        // Verify the token and get user info
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Get user's class to filter videos
        const { data: profile, error: profileError } = await supabase
            .from('students')
            .select('class')
            .eq('id', user.id)
            .single();
        
        if (profileError) {
            console.error('Profile fetch error for videos:', profileError);
            return res.status(500).json({ error: 'Failed to fetch user profile' });
        }
        
        // Fetch videos for the user's class
        const { data: videos, error: videosError } = await supabase
            .from('videos')
            .select('*')
            .eq('class', profile.class)
            .order('created_at', { ascending: false });
        
        if (videosError) {
            console.error('Videos fetch error:', videosError);
            return res.status(500).json({ error: 'Failed to fetch videos' });
        }
        
        res.json(videos || []);
        
    } catch (error) {
        console.error('Videos API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Points Update API endpoint
app.post('/api/points/update', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.split(' ')[1];
        const supabase = getSupabase();
        
        // Verify the token and get user info
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const { points, type, timestamp } = req.body;
        
        if (!points || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Update both total and monthly points in students table
        let updateData = {};
        if (type === 'quiz') {
            // Use SQL increment functions
            const { error: quizError } = await supabase.rpc('increment_quiz_points', {
                student_id: user.id,
                points: points
            });
            if (quizError) throw quizError;
        } else if (type === 'assessment') {
            // Use SQL increment functions
            const { error: assessmentError } = await supabase.rpc('increment_assessment_points', {
                student_id: user.id,
                points: points
            });
            if (assessmentError) throw assessmentError;
        }
        
        res.json({ success: true, message: 'Points updated successfully' });
        
    } catch (error) {
        console.error('Points update API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Monthly Leaderboard Reset Function
async function resetMonthlyLeaderboard() {
    try {
        console.log('🔄 Resetting monthly leaderboard...');
        const supabase = getSupabase();
        
        // Reset all students' monthly points to 0
        const { error: resetError } = await supabase
            .from('students')
            .update({ 
                monthly_quiz_points: 0,
                monthly_assessment_points: 0,
                monthly_total_points: 0
            })
            .neq('id', 0); // Add WHERE clause to fix SQL error
        
        if (resetError) {
            console.error('❌ Error resetting monthly leaderboard:', resetError);
        } else {
            console.log('✅ Monthly leaderboard reset successfully');
        }
        
        // Archive current month's data to monthly_stats table (only if table exists)
        try {
            const { data: students, error: fetchError } = await supabase
                .from('students')
                .select('id, quiz_points, assessment_points, total_points');
            
            if (!fetchError && students && students.length > 0) {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                for (const student of students) {
                    try {
                        const { error: archiveError } = await supabase
                            .from('monthly_stats')
                            .insert({
                                student_id: student.id,
                                month: currentMonth,
                                year: currentYear,
                                quiz_points: student.quiz_points || 0,
                                assessment_points: student.assessment_points || 0,
                                total_points: student.total_points || 0
                            });
                        
                        if (archiveError) {
                            console.error('❌ Error archiving student stats:', archiveError);
                        }
                    } catch (archiveError) {
                        console.error('❌ Error archiving individual student:', archiveError);
                    }
                }
                
                console.log(`✅ Archived stats for ${students.length} students`);
            }
        } catch (archiveError) {
            console.log('⚠️ monthly_stats table not available, skipping archive');
        }
        
    } catch (error) {
        console.error('❌ Error in monthly leaderboard reset:', error);
    }
}

// Schedule monthly leaderboard reset (runs at 12 AM on 1st of each month)
function scheduleMonthlyReset() {
    try {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
        let timeUntilNextMonth = nextMonth.getTime() - now.getTime();
        
        // Fix timeout overflow issue - limit to maximum safe timeout
        const maxTimeout = 2147483647; // Maximum safe timeout in milliseconds (~24 days)
        if (timeUntilNextMonth > maxTimeout) {
            timeUntilNextMonth = maxTimeout;
            console.log('⚠️ Timeout too large, using maximum safe timeout');
        }
        
        console.log(`⏰ Next monthly leaderboard reset scheduled for: ${nextMonth.toISOString()}`);
        console.log(`⏰ Time until next reset: ${Math.round(timeUntilNextMonth / (1000 * 60 * 60 * 24))} days`);
        
        setTimeout(() => {
            resetMonthlyLeaderboard();
            // Schedule next reset
            scheduleMonthlyReset();
        }, timeUntilNextMonth);
        
    } catch (error) {
        console.error('❌ Error scheduling monthly reset:', error);
        // Fallback: schedule for next day if there's an error
        setTimeout(() => {
            console.log('🔄 Retrying monthly reset scheduler...');
            scheduleMonthlyReset();
        }, 24 * 60 * 60 * 1000); // 24 hours
    }
}

// Start the monthly reset scheduler (only in production or when explicitly enabled)
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_MONTHLY_RESET === 'true') {
    scheduleMonthlyReset();
} else {
    console.log('⚠️ Monthly leaderboard reset scheduler disabled in development mode');
}

// Only load books in development environment
if (process.env.NODE_ENV !== 'production') {
    loadBooks();
}

// Export the app for Vercel serverless functions
export default app;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Tutor.AI backend listening at http://localhost:${PORT}`);
    });
} 
