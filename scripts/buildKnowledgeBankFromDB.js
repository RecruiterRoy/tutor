import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

const bucket = 'educational-content';

async function buildKnowledgeBankFromDB() {
  console.log('🧠 Building Knowledge Bank from Database...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // 1. Get all books from database
    console.log('📚 Fetching books from database...');
    const { data: books, error: booksError } = await supabase
      .from('user_books')
      .select('*');

    if (booksError) {
      console.error('Error fetching books:', booksError);
      return;
    }

    console.log(`Found ${books.length} books in database\n`);

    // 2. Get all images from storage
    console.log('🖼️  Scanning for images...');
    const { data: allFiles, error: filesError } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 });

    if (filesError) {
      console.error('Error scanning storage:', filesError);
      return;
    }

    // Filter images
    const imageFiles = allFiles.filter(file => 
      file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|svg)$/)
    );

    console.log(`Found ${imageFiles.length} image files\n`);

    // 3. Build knowledge bank structure
    const knowledgeBank = {
      subjects: {},
      grades: {},
      topics: {},
      images: {},
      books: {},
      searchIndex: {}
    };

    // Process books
    console.log('📖 Processing books...');
    for (const book of books) {
      const bookName = book.title;
      const subject = book.subject;
      const grade = book.grade;

      // Add to subjects
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

      if (!knowledgeBank.subjects[subject].grades.includes(grade)) {
        knowledgeBank.subjects[subject].grades.push(grade);
      }

      knowledgeBank.subjects[subject].books.push(bookName);
      knowledgeBank.subjects[subject].totalBooks++;

      // Add to grades
      if (!knowledgeBank.grades[grade]) {
        knowledgeBank.grades[grade] = {
          name: grade,
          subjects: [],
          books: [],
          totalBooks: 0,
          totalChapters: 0
        };
      }

      if (!knowledgeBank.grades[grade].subjects.includes(subject)) {
        knowledgeBank.grades[grade].subjects.push(subject);
      }

      knowledgeBank.grades[grade].books.push(bookName);
      knowledgeBank.grades[grade].totalBooks++;

      // Add to books with chapters
      const chapters = [];
      if (book.chapters) {
        try {
          const chapterData = JSON.parse(book.chapters);
          chapters.push(...chapterData);
        } catch (e) {
          // If chapters is not JSON, create a default chapter
          chapters.push({
            chapterNumber: 1,
            chapterName: 'Chapter 1',
            fileName: book.file_path ? book.file_path.split('/').pop() : 'unknown.pdf'
          });
        }
      } else {
        // Create default chapter if no chapters data
        chapters.push({
          chapterNumber: 1,
          chapterName: 'Chapter 1',
          fileName: book.file_path ? book.file_path.split('/').pop() : 'unknown.pdf'
        });
      }

      knowledgeBank.books[bookName] = {
        name: bookName,
        subject: subject,
        grade: grade,
        chapters: chapters,
        totalSize: book.file_size || 0,
        path: book.file_path || '',
        description: book.description || '',
        author: book.author || '',
        publisher: book.publisher || ''
      };

      knowledgeBank.subjects[subject].totalChapters += chapters.length;
      knowledgeBank.grades[grade].totalChapters += chapters.length;
    }

    // Process images
    console.log('🖼️  Processing images...');
    for (const image of imageFiles) {
      const pathParts = image.name.split('/');
      const subject = extractSubjectFromPath(image.name);
      const grade = extractGradeFromPath(image.name);

      if (!knowledgeBank.images[subject]) {
        knowledgeBank.images[subject] = {};
      }

      if (!knowledgeBank.images[subject][grade]) {
        knowledgeBank.images[subject][grade] = [];
      }

      knowledgeBank.images[subject][grade].push({
        path: image.name,
        fileName: pathParts[pathParts.length - 1],
        subject: subject,
        grade: grade,
        fileSize: image.metadata?.size || 0,
        description: generateImageDescription(image.name, subject, grade)
      });
    }

    // Create search index
    console.log('🔍 Creating search index...');
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

    // 4. Save knowledge bank
    console.log('💾 Saving knowledge bank...');
    const knowledgeBankJson = JSON.stringify(knowledgeBank, null, 2);
    const { error: saveError } = await supabase.storage
      .from(bucket)
      .upload('knowledge-bank/index.json', knowledgeBankJson, {
        contentType: 'application/json',
        upsert: true
      });

    if (saveError) {
      console.error('Error saving knowledge bank:', saveError);
      return;
    }

    // Save search index separately
    const searchIndexJson = JSON.stringify(knowledgeBank.searchIndex, null, 2);
    const { error: searchError } = await supabase.storage
      .from(bucket)
      .upload('knowledge-bank/search-index.json', searchIndexJson, {
        contentType: 'application/json',
        upsert: true
      });

    if (searchError) {
      console.error('Error saving search index:', searchError);
    }

    console.log('\n🎉 Knowledge Bank Built Successfully!');
    console.log('\n📊 Knowledge Bank Summary:');
    console.log(`- Subjects: ${Object.keys(knowledgeBank.subjects).length}`);
    console.log(`- Grades: ${Object.keys(knowledgeBank.grades).length}`);
    console.log(`- Books: ${Object.keys(knowledgeBank.books).length}`);
    console.log(`- Image Categories: ${Object.keys(knowledgeBank.images).length}`);

    // Display some details
    console.log('\n📚 Sample Books:');
    Object.values(knowledgeBank.books).slice(0, 3).forEach(book => {
      console.log(`  - ${book.name} (${book.subject}, ${book.grade}) - ${book.chapters.length} chapters`);
    });

  } catch (error) {
    console.error('❌ Knowledge bank build failed:', error);
  }
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

// Run the build
buildKnowledgeBankFromDB().catch(console.error); 