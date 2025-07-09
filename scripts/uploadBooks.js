import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

const booksDir = join(__dirname, '../books');
const bucket = 'educational-content';

async function uploadFile(filePath, storagePath) {
  try {
    const fileBuffer = readFileSync(filePath);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
    if (error) {
      console.error(`Failed to upload ${storagePath}:`, error.message);
    } else {
      console.log(`Uploaded: ${storagePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function getAllPdfFiles(dir, fileList = []) {
  readdirSync(dir).forEach(f => {
    const fullPath = join(dir, f);
    if (statSync(fullPath).isDirectory()) {
      getAllPdfFiles(fullPath, fileList);
    } else if (f.endsWith('.pdf')) {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

async function processBatch(files, start, batchSize) {
  const end = Math.min(start + batchSize, files.length);
  const batch = files.slice(start, end);
  
  for (const filePath of batch) {
    const storagePath = relative(booksDir, filePath).replace(/\\/g, '/');
    await uploadFile(filePath, storagePath);
  }

  if (end < files.length) {
    console.log(`Processed ${end}/${files.length} files. Continuing...`);
    // Wait a bit before processing next batch
    await new Promise(resolve => setTimeout(resolve, 1000));
    await processBatch(files, end, batchSize);
  }
}

(async () => {
  try {
    const allFiles = getAllPdfFiles(booksDir);
    console.log(`Found ${allFiles.length} PDF files to process`);
    await processBatch(allFiles, 0, 5); // Process 5 files at a time
    console.log('All files processed!');
  } catch (error) {
    console.error('Error:', error);
  }
})();