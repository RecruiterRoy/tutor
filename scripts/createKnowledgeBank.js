import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

const bucket = 'educational-content';

// Knowledge Bank Structure
const knowledgeBank = {
  subjects: {},
  grades: {},
  topics: {},
  images: {},
  books: {},
  searchIndex: {}
};

async function createKnowledgeBank() {
  console.log('🧠 Creating Comprehensive Knowledge Bank...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // 1. Scan all files in storage
    console.log('📁 Scanning educational content...');
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 });

    if (error) {
      console.error('Error scanning storage:', error);
      return;
    }

    console.log(`Found ${files.length} files in storage\n`);

    // 2. Organize content by structure
    const organizedContent = organizeContent(files);
    
    // 3. Create knowledge bank entries
    await createKnowledgeEntries(organizedContent);
    
    // 4. Create search index
    await createSearchIndex();
    
    // 5. Save knowledge bank to storage
    await saveKnowledgeBank();

    console.log('\n🎉 Knowledge Bank Created Successfully!');
    console.log('\n📊 Knowledge Bank Summary:');
    console.log(`- Subjects: ${Object.keys(knowledgeBank.subjects).length}`);
    console.log(`- Grades: ${Object.keys(knowledgeBank.grades).length}`);
    console.log(`- Topics: ${Object.keys(knowledgeBank.topics).length}`);
    console.log(`- Images: ${Object.keys(knowledgeBank.images).length}`);
    console.log(`- Books: ${Object.keys(knowledgeBank.books).length}`);

  } catch (error) {
    console.error('❌ Knowledge bank creation failed:', error);
  }
}

function organizeContent(files) {
  const organized = {
    books: {},
    images: {},
    other: []
  };

  files.forEach(file => {
    const path = file.name;
    const pathParts = path.split('/');
    
    // Organize by file type and structure
    if (path.toLowerCase().endsWith('.pdf')) {
      organizeBook(path, pathParts, file, organized);
    } else if (path.toLowerCase().match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      organizeImage(path, pathParts, file, organized);
    } else {
      organized.other.push({ path, file });
    }
  });

  return organized;
}

function organizeBook(path, pathParts, file, organized) {
  // Extract information from path: "NCERT Books/class1/English/MridangEnglishBook/aemr101.pdf"
  if (pathParts.length >= 5 && pathParts[0] === 'NCERT Books') {
    const grade = pathParts[1]; // class1
    const subject = pathParts[2]; // English
    const bookName = pathParts[3]; // MridangEnglishBook
    const fileName = pathParts[4]; // aemr101.pdf
    
    const chapterInfo = extractChapterInfo(fileName);
    
    if (!organized.books[grade]) organized.books[grade] = {};
    if (!organized.books[grade][subject]) organized.books[grade][subject] = {};
    if (!organized.books[grade][subject][bookName]) {
      organized.books[grade][subject][bookName] = {
        name: bookName,
        subject: subject,
        grade: grade,
        chapters: [],
        totalSize: 0,
        path: path
      };
    }
    
    organized.books[grade][subject][bookName].chapters.push({
      fileName: fileName,
      chapterNumber: chapterInfo.chapter,
      chapterName: chapterInfo.name,
      filePath: path,
      fileSize: file.metadata?.size || 0
    });
    
    organized.books[grade][subject][bookName].totalSize += file.metadata?.size || 0;
  }
}

function organizeImage(path, pathParts, file, organized) {
  // Extract information from image path
  const subject = extractSubjectFromPath(path);
  const grade = extractGradeFromPath(path);
  
  if (!organized.images[subject]) organized.images[subject] = {};
  if (!organized.images[subject][grade]) organized.images[subject][grade] = [];
  
  organized.images[subject][grade].push({
    path: path,
    fileName: pathParts[pathParts.length - 1],
    subject: subject,
    grade: grade,
    fileSize: file.metadata?.size || 0,
    description: generateImageDescription(path, subject, grade)
  });
}

function extractChapterInfo(fileName) {
  // Extract chapter info from filenames like: aemr101.pdf -> Chapter 1
  const match = fileName.match(/(\d{3})\.pdf$/);
  if (match) {
    const chapterNum = parseInt(match[1].substring(-2));
    return {
      chapter: chapterNum,
      name: `Chapter ${chapterNum}`
    };
  }
  
  return {
    chapter: 0,
    name: 'Unknown'
  };
}

function extractSubjectFromPath(path) {
  const pathLower = path.toLowerCase();
  if (pathLower.includes('english')) return 'English';
  if (pathLower.includes('hindi')) return 'Hindi';
  if (pathLower.includes('maths') || pathLower.includes('math')) return 'Mathematics';
  if (pathLower.includes('science')) return 'Science';
  if (pathLower.includes('social')) return 'Social Studies';
  if (pathLower.includes('history')) return 'History';
  if (pathLower.includes('geography')) return 'Geography';
  if (pathLower.includes('chemistry')) return 'Chemistry';
  if (pathLower.includes('physics')) return 'Physics';
  if (pathLower.includes('biology')) return 'Biology';
  return 'General';
}

function extractGradeFromPath(path) {
  const match = path.match(/class(\d+)/i);
  return match ? match[1] : 'unknown';
}

function generateImageDescription(path, subject, grade) {
  const fileName = path.split('/').pop();
  const gradeText = grade === 'unknown' ? '' : `Class ${grade}`;
  return `${gradeText} ${subject} - ${fileName.replace(/\.[^/.]+$/, '')}`;
}

async function createKnowledgeEntries(organizedContent) {
  console.log('📚 Creating knowledge entries...\n');

  // Create subject knowledge
  for (const [grade, subjects] of Object.entries(organizedContent.books)) {
    for (const [subject, books] of Object.entries(subjects)) {
      if (!knowledgeBank.subjects[subject]) {
        knowledgeBank.subjects[subject] = {
          name: subject,
          grades: [],
          books: [],
          topics: [],
          totalBooks: 0,
          totalChapters: 0
        };
      }
      
      knowledgeBank.subjects[subject].grades.push(grade);
      knowledgeBank.subjects[subject].totalBooks += Object.keys(books).length;
      
      for (const [bookName, bookData] of Object.entries(books)) {
        knowledgeBank.subjects[subject].books.push(bookName);
        knowledgeBank.subjects[subject].totalChapters += bookData.chapters.length;
        
        // Add to books index
        knowledgeBank.books[bookName] = {
          name: bookName,
          subject: subject,
          grade: grade,
          chapters: bookData.chapters,
          totalSize: bookData.totalSize,
          path: bookData.path
        };
      }
    }
  }

  // Create grade knowledge
  for (const [grade, subjects] of Object.entries(organizedContent.books)) {
    knowledgeBank.grades[grade] = {
      name: grade,
      subjects: Object.keys(subjects),
      books: [],
      totalBooks: 0,
      totalChapters: 0
    };
    
    for (const [subject, books] of Object.entries(subjects)) {
      for (const [bookName, bookData] of Object.entries(books)) {
        knowledgeBank.grades[grade].books.push(bookName);
        knowledgeBank.grades[grade].totalBooks++;
        knowledgeBank.grades[grade].totalChapters += bookData.chapters.length;
      }
    }
  }

  // Create image knowledge
  for (const [subject, grades] of Object.entries(organizedContent.images)) {
    for (const [grade, images] of Object.entries(grades)) {
      if (!knowledgeBank.images[subject]) knowledgeBank.images[subject] = {};
      knowledgeBank.images[subject][grade] = images;
    }
  }

  console.log('✅ Knowledge entries created');
}

async function createSearchIndex() {
  console.log('🔍 Creating search index...\n');

  // Create searchable index for quick lookups
  knowledgeBank.searchIndex = {
    bySubject: {},
    byGrade: {},
    byTopic: {},
    byBook: {},
    byChapter: {}
  };

  // Index by subject
  for (const [subject, data] of Object.entries(knowledgeBank.subjects)) {
    knowledgeBank.searchIndex.bySubject[subject.toLowerCase()] = data;
  }

  // Index by grade
  for (const [grade, data] of Object.entries(knowledgeBank.grades)) {
    knowledgeBank.searchIndex.byGrade[grade.toLowerCase()] = data;
  }

  // Index by book
  for (const [bookName, data] of Object.entries(knowledgeBank.books)) {
    knowledgeBank.searchIndex.byBook[bookName.toLowerCase()] = data;
  }

  // Index by chapter
  for (const [bookName, bookData] of Object.entries(knowledgeBank.books)) {
    for (const chapter of bookData.chapters) {
      const key = `${bookName}-chapter-${chapter.chapterNumber}`.toLowerCase();
      knowledgeBank.searchIndex.byChapter[key] = {
        book: bookData,
        chapter: chapter
      };
    }
  }

  console.log('✅ Search index created');
}

async function saveKnowledgeBank() {
  console.log('💾 Saving knowledge bank to storage...\n');

  try {
    // Save main knowledge bank
    const knowledgeBankJson = JSON.stringify(knowledgeBank, null, 2);
    const { error: mainError } = await supabase.storage
      .from(bucket)
      .upload('knowledge-bank/index.json', knowledgeBankJson, {
        contentType: 'application/json',
        upsert: true
      });

    if (mainError) {
      console.error('Error saving main knowledge bank:', mainError);
    } else {
      console.log('✅ Main knowledge bank saved');
    }

    // Save search index separately for quick access
    const searchIndexJson = JSON.stringify(knowledgeBank.searchIndex, null, 2);
    const { error: searchError } = await supabase.storage
      .from(bucket)
      .upload('knowledge-bank/search-index.json', searchIndexJson, {
        contentType: 'application/json',
        upsert: true
      });

    if (searchError) {
      console.error('Error saving search index:', searchError);
    } else {
      console.log('✅ Search index saved');
    }

    // Save subject-specific knowledge files
    for (const [subject, data] of Object.entries(knowledgeBank.subjects)) {
      const subjectJson = JSON.stringify(data, null, 2);
      const { error: subjectError } = await supabase.storage
        .from(bucket)
        .upload(`knowledge-bank/subjects/${subject.toLowerCase()}.json`, subjectJson, {
          contentType: 'application/json',
          upsert: true
        });

      if (subjectError) {
        console.error(`Error saving ${subject} knowledge:`, subjectError);
      }
    }

    console.log('✅ All knowledge bank files saved');

  } catch (error) {
    console.error('Error saving knowledge bank:', error);
  }
}

// Run the knowledge bank creation
createKnowledgeBank().catch(console.error); 