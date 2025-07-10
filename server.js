import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
// Import PDFProcessor lazily to avoid Vercel deployment issues
// import { PDFProcessor } from './utils/pdfExtractor.js';
import rateLimit from 'express-rate-limit';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOOKS_DIR = path.join(__dirname, 'books');

const app = express();

// Force rebuild timestamp
const REBUILD_TIMESTAMP = process.env.REBUILD_TIMESTAMP || Date.now();
console.log(`Server starting with rebuild timestamp: ${REBUILD_TIMESTAMP}`);

// Initialize OpenAI lazily to avoid startup crashes
let openai = null;
function getOpenAI() {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
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
            const { PDFProcessor } = await import('./utils/pdfExtractor.js');
            pdfProcessor = new PDFProcessor();
        } catch (error) {
            console.warn('PDF Processor initialization failed:', error.message);
            // Create a fallback processor that doesn't use PDF parsing
            pdfProcessor = {
                findRelevantContent: () => [],
                extractPDFText: async () => null,
                processAllPDFs: async () => console.log('PDF processing not available'),
                getBooksByClassAndSubject: () => []
            };
        }
    }
    return pdfProcessor;
}

// Middleware
app.use(cors());
app.use(express.json());

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
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_ANON_KEY
    });
});

// GPT Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, grade, subject, language } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Filter out any messages with null/undefined/empty content
    const filteredMessages = messages.filter(msg =>
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

    // Add system prompt based on grade and subject
    const systemPrompt = {
      role: 'system',
      content: `You are a friendly, proactive Indian teacher for ${grade || 'a student'}. Current subject: ${subject || 'general'}. Please respond in ${language || 'English'}.

IMPORTANT: Always address the student by their first name. If you don't know their name, ask for it politely. Never use "children" or "kids" - always use their actual name.

Always explain concepts clearly and simply, using:
- Visuals FIRST: diagrams (Mermaid), tables, or charts (Chart.js) whenever possible
- Markdown formatting for all responses (use paragraphs, bullet/numbered lists, and tables where helpful)
- Markdown image syntax for pictures (use relevant image URLs if available)
- Mermaid code blocks (~~~mermaid ... ~~~) for diagrams and flowcharts
- Chart.js code blocks (~~~chartjs ... ~~~) with valid Chart.js JSON config for bar, line, or pie charts
- Embed YouTube/video links in Markdown if a video is relevant
If a diagram or chart is requested, always try to provide a Mermaid diagram or Chart.js chart using tildes (~~~) for code blocks. Only use text if a visual is not possible. Always keep answers visually clear and easy to follow for a school student.${bookContext}`
    };

    const gptMessages = [systemPrompt, ...filteredMessages];

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if available
      messages: gptMessages,
      temperature: 0.7,
    });

    res.json({
      response: completion.choices[0].message.content,
      status: "success"
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process request'
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

        if (fs.existsSync(ncertPath)) {
            traverseDir(ncertPath);
        }
        
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
        const books = Array.from(pdfProcessor.bookContent.entries()).map(([fileName, content]) => ({
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
    { id: 'marathi-male', name: 'Marathi Male', region: 'Maharashtra', gender: 'male', image: '👨‍🦱' },
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

// Page routes (must come BEFORE static file serving)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Static file serving (must come after page routes)
app.use(express.static(path.join(__dirname)));

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
        
        // Only process PDFs if we have a books directory and no existing content
        if (pdfProc.bookContent.size === 0 && fs.existsSync('./books')) {
            console.log('Processing PDFs from books directory...');
            await pdfProc.processAllPDFs('./books');
            await pdfProc.saveToFile('./processed_books.json');
            console.log(`Processed and saved ${pdfProc.bookContent.size} books`);
        }
        
        console.log(`Total books loaded: ${pdfProc.bookContent.size}`);
    } catch (error) {
        console.error('Error loading books:', error);
        console.log('Continuing without book data...');
        // Don't fail the server startup for book loading issues
    }
}

// Only load books in development environment
if (process.env.NODE_ENV !== 'production') {
    loadBooks();
}

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve extracted images statically
app.use('/extracted_images', express.static(path.join(__dirname, 'extracted_images')));

// Book images API
app.get('/api/book-images', (req, res) => {
  const { file, page, keyword } = req.query;
  const indexPath = path.join(__dirname, 'extracted_images', 'index.json');
  if (!fs.existsSync(indexPath)) return res.json({ images: [] });
  const allImages = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  let results = allImages;
  if (file) results = results.filter(img => img.file.includes(file));
  if (page) results = results.filter(img => img.page == page);
  // For now, keyword just matches file name; can be improved with OCR later
  if (keyword) results = results.filter(img => img.file.toLowerCase().includes(keyword.toLowerCase()));
  res.json({ images: results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Tutor.AI backend listening at http://localhost:${PORT}`);
}); 