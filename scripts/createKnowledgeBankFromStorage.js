import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

const bucket = 'educational-content';

async function createKnowledgeBankFromStorage() {
  console.log('🧠 Creating Knowledge Bank from Storage...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    const knowledgeBank = {
      subjects: {},
      grades: {},
      topics: {},
      images: {},
      books: {},
      searchIndex: {}
    };

    // 1. Scan NCERT Books structure
    console.log('📚 Scanning NCERT Books structure...');
    const { data: classFolders, error: classError } = await supabase.storage
      .from(bucket)
      .list('NCERT Books');

    if (classError) {
      console.error('Error accessing NCERT Books:', classError);
      return;
    }

    console.log(`Found ${classFolders.length} class folders\n`);

    // 2. Process each class folder
    for (const classFolder of classFolders) {
      const grade = classFolder.name; // class1, class2, etc.
      console.log(`📖 Processing ${grade}...`);

      // Get subjects in this class
      const { data: subjectFolders, error: subjectError } = await supabase.storage
        .from(bucket)
        .list(`NCERT Books/${grade}`);

      if (subjectError) {
        console.log(`  ⚠️  Error accessing ${grade}:`, subjectError.message);
        continue;
      }

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

      // Process each subject
      for (const subjectFolder of subjectFolders) {
        const subject = subjectFolder.name; // English, Mathematics, etc.
        console.log(`  📚 Processing ${subject}...`);

        // Get books in this subject
        const { data: bookFolders, error: bookError } = await supabase.storage
          .from(bucket)
          .list(`NCERT Books/${grade}/${subject}`);

        if (bookError) {
          console.log(`    ⚠️  Error accessing ${subject}:`, bookError.message);
          continue;
        }

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

        // Process each book
        for (const bookFolder of bookFolders) {
          const bookName = bookFolder.name;
          console.log(`    📖 Processing book: ${bookName}`);

          // Get chapters in this book
          const { data: chapterFiles, error: chapterError } = await supabase.storage
            .from(bucket)
            .list(`NCERT Books/${grade}/${subject}/${bookName}`);

          if (chapterError) {
            console.log(`      ⚠️  Error accessing ${bookName}:`, chapterError.message);
            continue;
          }

          // Filter PDF files
          const pdfChapters = chapterFiles.filter(file => 
            file.name.toLowerCase().endsWith('.pdf')
          );

          const chapters = pdfChapters.map((file, index) => ({
            chapterNumber: index + 1,
            chapterName: `Chapter ${index + 1}`,
            fileName: file.name,
            filePath: `NCERT Books/${grade}/${subject}/${bookName}/${file.name}`,
            fileSize: file.metadata?.size || 0
          }));

          // Add book to knowledge bank
          knowledgeBank.books[bookName] = {
            name: bookName,
            subject: subject,
            grade: grade,
            chapters: chapters,
            totalSize: chapters.reduce((sum, ch) => sum + ch.fileSize, 0),
            path: `NCERT Books/${grade}/${subject}/${bookName}`,
            description: `${grade} ${subject} - ${bookName}`,
            author: 'NCERT',
            publisher: 'NCERT'
          };

          // Update counters
          knowledgeBank.subjects[subject].books.push(bookName);
          knowledgeBank.subjects[subject].totalBooks++;
          knowledgeBank.subjects[subject].totalChapters += chapters.length;

          knowledgeBank.grades[grade].books.push(bookName);
          knowledgeBank.grades[grade].totalBooks++;
          knowledgeBank.grades[grade].totalChapters += chapters.length;

          if (!knowledgeBank.grades[grade].subjects.includes(subject)) {
            knowledgeBank.grades[grade].subjects.push(subject);
          }

          console.log(`      ✅ Added ${chapters.length} chapters`);
        }
      }
    }

    // 3. Create search index
    console.log('\n🔍 Creating search index...');
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

    console.log('\n🎉 Knowledge Bank Created Successfully!');
    console.log('\n📊 Knowledge Bank Summary:');
    console.log(`- Subjects: ${Object.keys(knowledgeBank.subjects).length}`);
    console.log(`- Grades: ${Object.keys(knowledgeBank.grades).length}`);
    console.log(`- Books: ${Object.keys(knowledgeBank.books).length}`);
    console.log(`- Total Chapters: ${Object.values(knowledgeBank.books).reduce((sum, book) => sum + book.chapters.length, 0)}`);

    // Display some details
    console.log('\n📚 Sample Books:');
    Object.values(knowledgeBank.books).slice(0, 5).forEach(book => {
      console.log(`  - ${book.name} (${book.subject}, ${book.grade}) - ${book.chapters.length} chapters`);
    });

  } catch (error) {
    console.error('❌ Knowledge bank creation failed:', error);
  }
}

// Run the creation
createKnowledgeBankFromStorage().catch(console.error); 