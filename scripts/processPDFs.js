import { extractPDFText } from '../utils/pdfExtractor.js';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function getMetadataFromPath(filePath) {
  // Example: books/NCERT Books/class10/English/First Flight/jeff101.pdf
  const parts = filePath.split(path.sep);
  // Find class (e.g., class10), subject (e.g., English), book (e.g., First Flight)
  let grade = null, subject = null, book = null;
  for (let i = 0; i < parts.length; i++) {
    if (/class\d+/.test(parts[i])) grade = parseInt(parts[i].replace('class', ''));
    if (['English','Hindi','Maths','Science','Sanskrit','Social Science','Biology','Physics','Chemistry','Accountancy','Business Studies','Economics','Geography','History','Home Science','Informatics Practices','Political Science','Psychology','Sociology','Biotechnology','Computer','Arts','Physical Education','Vocational Education','Knowledge Traditions and Practices in India','Math'].includes(parts[i])) subject = parts[i];
    // Book name is next after subject
    if (subject && !book && i+1 < parts.length-1) book = parts[i+1];
  }
  return { grade, subject, book };
}

async function savePDFContent(text, filePath) {
  const { grade, subject } = getMetadataFromPath(filePath);
  if (!grade) {
    console.warn('Skipping file (no grade found):', filePath);
    return;
  }
  const title = path.basename(filePath);
  const content_type = 'lesson';
  const content_url = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
  const { error } = await supabase.from('educational_content').insert({
    title,
    content_type,
    subject: subject || 'Unknown',
    grade,
    content_url,
    content_data: { text }
  });
  if (error) throw error;
}

function getAllPDFs(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllPDFs(filePath));
    } else if (file.toLowerCase().endsWith('.pdf')) {
      results.push(filePath);
    }
  });
  return results;
}

(async () => {
  try {
    const booksDir = path.join(process.cwd(), 'books');
    const pdfFiles = getAllPDFs(booksDir);
    for (const filePath of pdfFiles) {
      console.log('Processing:', filePath);
      const text = await extractPDFText(filePath);
      await savePDFContent(text, filePath);
    }
    console.log('All PDFs processed and saved to Supabase.');
    // Delete this script after running
    fs.unlinkSync(__filename);
  } catch (err) {
    console.error('Error processing PDFs:', err);
    process.exit(1);
  }
})(); 