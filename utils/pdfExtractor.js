import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export class PDFProcessor {
    constructor() {
        this.bookContent = new Map();
    }

    // Extract text from PDF
    async extractPDFText(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            return data.text;
        } catch (error) {
            console.error('Error extracting PDF:', error);
            return null;
        }
    }

    // Recursively find all PDF files in a directory
    findPDFFiles(dir) {
        const pdfFiles = [];
        
        function traverse(currentDir) {
            if (!fs.existsSync(currentDir)) return;
            
            const items = fs.readdirSync(currentDir);
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    traverse(fullPath);
                } else if (item.toLowerCase().endsWith('.pdf')) {
                    pdfFiles.push(fullPath);
                }
            }
        }
        
        traverse(dir);
        return pdfFiles;
    }

    // Process all PDFs in a directory and subdirectories
    async processAllPDFs(pdfDirectory = './books') {
        console.log(`Scanning for PDFs in: ${pdfDirectory}`);
        const pdfFiles = this.findPDFFiles(pdfDirectory);
        console.log(`Found ${pdfFiles.length} PDF files`);
        
        for (const filePath of pdfFiles) {
            try {
                const text = await this.extractPDFText(filePath);
                
                if (text) {
                    // Parse file path to get subject and grade
                    const { subject, grade, bookName } = this.parseFilePath(filePath, pdfDirectory);
                    
                    // Chunk the text into manageable pieces
                    const chunks = this.chunkText(text, 2000);
                    
                    // Use relative path as key
                    const relativePath = path.relative(pdfDirectory, filePath);
                    
                    // Store in memory
                    this.bookContent.set(relativePath, {
                        subject,
                        grade,
                        bookName,
                        fullText: text,
                        chunks,
                        fileName: path.basename(filePath),
                        filePath: relativePath
                    });
                    
                    console.log(`Processed: ${relativePath} - ${chunks.length} chunks (${subject}, ${grade})`);
                }
            } catch (error) {
                console.error(`Error processing ${filePath}:`, error);
            }
        }
    }

    // Parse file path to extract subject, grade, and book name
    parseFilePath(filePath, baseDir) {
        const relativePath = path.relative(baseDir, filePath);
        const pathParts = relativePath.split(path.sep);
        
        // Extract class/grade from path
        let grade = 'unknown';
        for (const part of pathParts) {
            if (part.toLowerCase().includes('class')) {
                const match = part.match(/class(\d+)/i);
                if (match) {
                    grade = match[1];
                    break;
                }
            }
        }
        
        // Extract subject from path
        let subject = 'general';
        const subjectMap = {
            'english': 'english',
            'hindi': 'hindi',
            'maths': 'mathematics',
            'math': 'mathematics',
            'science': 'science',
            'social': 'social_studies',
            'social studies': 'social_studies',
            'history': 'history',
            'geography': 'geography',
            'accountancy': 'accountancy',
            'biology': 'biology',
            'chemistry': 'chemistry',
            'physics': 'physics',
            'economics': 'economics',
            'business': 'business_studies',
            'computer': 'computer_science',
            'sanskrit': 'sanskrit',
            'physical': 'physical_education',
            'arts': 'arts',
            'vocational': 'vocational_education'
        };
        
        for (const part of pathParts) {
            const lowerPart = part.toLowerCase();
            for (const [key, value] of Object.entries(subjectMap)) {
                if (lowerPart.includes(key)) {
                    subject = value;
                    break;
                }
            }
            if (subject !== 'general') break;
        }
        
        // Extract book name from filename
        const fileName = path.basename(filePath, '.pdf');
        const bookName = fileName.replace(/[_-]/g, ' ');
        
        return { subject, grade, bookName };
    }

    // Chunk text into smaller pieces for GPT context
    chunkText(text, maxLength = 2000) {
        const chunks = [];
        const sentences = text.split(/[.!?]+/);
        let currentChunk = '';
        
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > maxLength && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence + '. ';
            }
        }
        
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }

    // Find relevant content for a query
    findRelevantContent(query, subject = null, grade = null) {
        const relevantChunks = [];
        const queryWords = query.toLowerCase().split(' ');
        
        for (const [filePath, content] of this.bookContent) {
            // Filter by subject and grade if specified
            if (subject && content.subject !== subject) continue;
            if (grade && content.grade !== grade) continue;
            
            // Score chunks based on query relevance
            for (const chunk of content.chunks) {
                const score = this.calculateRelevanceScore(chunk, queryWords);
                if (score > 0) {
                    relevantChunks.push({
                        text: chunk,
                        score,
                        subject: content.subject,
                        grade: content.grade,
                        fileName: content.fileName,
                        bookName: content.bookName
                    });
                }
            }
        }
        
        // Sort by relevance score and return top chunks
        return relevantChunks
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(chunk => chunk.text);
    }

    // Calculate relevance score for a chunk
    calculateRelevanceScore(chunk, queryWords) {
        const chunkWords = chunk.toLowerCase().split(' ');
        let score = 0;
        
        for (const queryWord of queryWords) {
            if (queryWord.length > 2) { // Ignore very short words
                const matches = chunkWords.filter(word => 
                    word.includes(queryWord) || queryWord.includes(word)
                ).length;
                score += matches;
            }
        }
        
        return score;
    }

    // Save processed content to JSON file
    async saveToFile(outputPath = './processed_books.json') {
        const data = {};
        for (const [filePath, content] of this.bookContent) {
            data[filePath] = {
                subject: content.subject,
                grade: content.grade,
                bookName: content.bookName,
                chunks: content.chunks,
                chunkCount: content.chunks.length,
                fileName: content.fileName
            };
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Saved processed content to ${outputPath} (${Object.keys(data).length} books)`);
    }

    // Load processed content from JSON file
    async loadFromFile(inputPath = './processed_books.json') {
        if (fs.existsSync(inputPath)) {
            const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
            
            for (const [filePath, content] of Object.entries(data)) {
                this.bookContent.set(filePath, content);
            }
            
            console.log(`Loaded ${Object.keys(data).length} processed books`);
        }
    }

    // Get books by class and subject
    getBooksByClassAndSubject(classNumber, subject = null) {
        const books = [];
        for (const [filePath, content] of this.bookContent) {
            if (content.grade === classNumber.toString()) {
                if (!subject || content.subject === subject) {
                    books.push({
                        filePath,
                        bookName: content.bookName,
                        subject: content.subject,
                        grade: content.grade,
                        chunkCount: content.chunks.length
                    });
                }
            }
        }
        return books;
    }
}

export const pdfProcessor = new PDFProcessor();
export const extractPDFText = (pdfPath) => pdfProcessor.extractPDFText(pdfPath);