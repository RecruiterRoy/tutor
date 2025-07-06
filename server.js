import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { extractPDFText } from './utils/pdfExtractor.js';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 512,
      temperature: 0.7
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI API error' });
  }
});

// Save extracted PDF content to Supabase (educational_content table)
async function savePDFContent(text, fileName) {
  // Example: parse subject, grade, etc. from fileName or metadata
  // Here, we use placeholders; adapt as needed
  const subject = 'Mathematics';
  const grade = 10;
  const title = fileName;
  const content_type = 'lesson';
  const content_url = `/books/${fileName}`;
  const { error } = await supabase.from('educational_content').insert({
    title,
    content_type,
    subject,
    grade,
    content_url,
    content_data: { text }
  });
  if (error) throw error;
}

// Process PDF books in the books directory
const processPDFBooks = async () => {
  const booksDir = path.join(process.cwd(), 'books');
  // Example: process all PDFs in booksDir (recursive as needed)
  const pdfFiles = fs.readdirSync(booksDir).filter(f => f.endsWith('.pdf'));
  for (const file of pdfFiles) {
    const filePath = path.join(booksDir, file);
    const text = await extractPDFText(filePath);
    await savePDFContent(text, file);
  }
};

// Admin endpoint to trigger PDF processing
app.post('/api/process-books', async (req, res) => {
  try {
    await processPDFBooks();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF processing error' });
  }
});

app.listen(port, () => {
  console.log(`Tutor.AI backend listening at http://localhost:${port}`);
}); 