import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'process.env.SUPABASE_SERVICE_KEY'
);

const bucket = 'educational-content';

// Class-wise book configuration
const classConfig = {
  'class1': {
    subjects: ['English', 'Hindi', 'Maths', 'Urdu'],
    languages: ['English', 'Hindi'],
    description: 'Primary education - Basic reading, writing, and arithmetic'
  },
  'class2': {
    subjects: ['English', 'Hindi', 'Maths', 'Urdu'],
    languages: ['English', 'Hindi'],
    description: 'Primary education - Building foundational skills'
  },
  'class3': {
    subjects: ['English', 'Hindi', 'Maths', 'Urdu'],
    languages: ['English', 'Hindi'],
    description: 'Primary education - Developing core competencies'
  },
  'class4': {
    subjects: ['English', 'Hindi', 'Maths', 'Urdu'],
    languages: ['English', 'Hindi'],
    description: 'Primary education - Strengthening fundamentals'
  },
  'class5': {
    subjects: ['English', 'Hindi', 'Maths', 'Urdu'],
    languages: ['English', 'Hindi'],
    description: 'Primary education - Preparing for middle school'
  },
  'class6': {
    subjects: ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
    languages: ['English', 'Hindi'],
    description: 'Middle school - Introduction to specialized subjects'
  },
  'class7': {
    subjects: ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
    languages: ['English', 'Hindi'],
    description: 'Middle school - Building subject expertise'
  },
  'class8': {
    subjects: ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
    languages: ['English', 'Hindi'],
    description: 'Middle school - Preparing for high school'
  },
  'class9': {
    subjects: ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit', 'Physical Education'],
    languages: ['English', 'Hindi'],
    description: 'High school - Foundation for board exams'
  },
  'class10': {
    subjects: ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit', 'Physical Education'],
    languages: ['English', 'Hindi'],
    description: 'High school - Board exam preparation'
  },
  'class11': {
    subjects: ['English', 'Hindi', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'History', 'Geography', 'Political Science'],
    languages: ['English', 'Hindi'],
    description: 'Senior secondary - Science and Commerce streams'
  },
  'class12': {
    subjects: ['English', 'Hindi', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'History', 'Geography', 'Political Science'],
    languages: ['English', 'Hindi'],
    description: 'Senior secondary - Board exam preparation'
  }
};

async function setupDatabaseTables() {
  console.log('🗄️ Setting up database tables...\n');

  try {
    // Create class_books table using direct SQL
    const { error: classBooksError } = await supabase
      .from('class_books')
      .select('*')
      .limit(1);

    if (classBooksError && classBooksError.code === 'PGRST116') {
      console.log('⚠️ class_books table does not exist. Please create it manually in Supabase dashboard:');
      console.log(`
        CREATE TABLE class_books (
          id SERIAL PRIMARY KEY,
          class_name VARCHAR(10) NOT NULL,
          subject VARCHAR(50) NOT NULL,
          language VARCHAR(20) DEFAULT 'English',
          book_name VARCHAR(255) NOT NULL,
          chapter_number INTEGER,
          chapter_name VARCHAR(255),
          file_path TEXT NOT NULL,
          file_size BIGINT,
          syllabus_type VARCHAR(20) DEFAULT 'NCERT',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(class_name, subject, language, book_name, chapter_number)
        );
      `);
    } else {
      console.log('✅ class_books table exists');
    }

    // Check user_class_access table
    const { error: userAccessError } = await supabase
      .from('user_class_access')
      .select('*')
      .limit(1);

    if (userAccessError && userAccessError.code === 'PGRST116') {
      console.log('⚠️ user_class_access table does not exist. Please create it manually in Supabase dashboard:');
      console.log(`
        CREATE TABLE user_class_access (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          class_name VARCHAR(10) NOT NULL,
          subjects TEXT[] NOT NULL,
          languages TEXT[] DEFAULT ARRAY['English'],
          access_granted_at TIMESTAMP DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true,
          UNIQUE(user_id, class_name)
        );
      `);
    } else {
      console.log('✅ user_class_access table exists');
    }

    // Check book_metadata table
    const { error: metadataError } = await supabase
      .from('book_metadata')
      .select('*')
      .limit(1);

    if (metadataError && metadataError.code === 'PGRST116') {
      console.log('⚠️ book_metadata table does not exist. Please create it manually in Supabase dashboard:');
      console.log(`
        CREATE TABLE book_metadata (
          id SERIAL PRIMARY KEY,
          class_name VARCHAR(10) NOT NULL,
          subject VARCHAR(50) NOT NULL,
          total_chapters INTEGER,
          total_pages INTEGER,
          syllabus_year VARCHAR(10),
          board VARCHAR(20) DEFAULT 'CBSE',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
    } else {
      console.log('✅ book_metadata table exists');
    }

  } catch (error) {
    console.error('Database setup check failed:', error);
  }
}

async function scanAndOrganizeBooks() {
  console.log('📚 Scanning and organizing books by class...\n');

  try {
    // Get all files from storage
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 });

    if (error) {
      console.error('Error fetching files:', error);
      return;
    }

    const organizedBooks = {};

    // Organize files by class
    for (const file of files) {
      const filePath = file.name;
      const fileSize = file.metadata?.size || 0;
      
      // Parse path: "NCERT Books/class1/English/MridangEnglishBook/aemr101.pdf"
      const pathParts = filePath.split('/');
      
      if (pathParts.length >= 4 && pathParts[0] === 'NCERT Books') {
        const className = pathParts[1]; // class1, class2, etc.
        const subject = pathParts[2]; // English, Hindi, etc.
        const bookName = pathParts[3]; // MridangEnglishBook, etc.
        const fileName = pathParts[4]; // aemr101.pdf, etc.
        
        if (!organizedBooks[className]) {
          organizedBooks[className] = {};
        }
        
        if (!organizedBooks[className][subject]) {
          organizedBooks[className][subject] = {};
        }
        
        if (!organizedBooks[className][subject][bookName]) {
          organizedBooks[className][subject][bookName] = [];
        }
        
        // Extract chapter info from filename
        const chapterInfo = extractChapterInfo(fileName);
        
        organizedBooks[className][subject][bookName].push({
          fileName,
          filePath,
          fileSize,
          chapterNumber: chapterInfo.chapter,
          chapterName: chapterInfo.name
        });
      }
    }

    // Display organization results
    console.log('📊 BOOK ORGANIZATION RESULTS:\n');
    
    for (const [className, subjects] of Object.entries(organizedBooks)) {
      console.log(`🏫 ${className.toUpperCase()}:`);
      
      for (const [subject, books] of Object.entries(subjects)) {
        console.log(`  📚 ${subject}:`);
        
        for (const [bookName, chapters] of Object.entries(books)) {
          const totalSize = chapters.reduce((sum, ch) => sum + ch.fileSize, 0);
          console.log(`    📖 ${bookName}: ${chapters.length} chapters (${(totalSize / (1024 * 1024)).toFixed(2)} MB)`);
        }
      }
      console.log('');
    }

    return organizedBooks;

  } catch (error) {
    console.error('Book organization failed:', error);
    return null;
  }
}

function extractChapterInfo(fileName) {
  // Extract chapter info from filenames like:
  // aemr101.pdf -> Chapter 1
  // jesc108.pdf -> Chapter 8
  
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

async function populateDatabase(organizedBooks) {
  console.log('💾 Populating database with book information...\n');

  try {
    let totalInserted = 0;

    for (const [className, subjects] of Object.entries(organizedBooks)) {
      console.log(`Processing ${className}...`);
      
      for (const [subject, books] of Object.entries(subjects)) {
        for (const [bookName, chapters] of Object.entries(books)) {
          for (const chapter of chapters) {
            try {
              const { error } = await supabase
                .from('class_books')
                .upsert({
                  class_name: className,
                  subject: subject,
                  language: 'English', // Default, can be updated later
                  book_name: bookName,
                  chapter_number: chapter.chapterNumber,
                  chapter_name: chapter.chapterName,
                  file_path: chapter.filePath,
                  file_size: chapter.fileSize,
                  syllabus_type: 'NCERT',
                  is_active: true
                }, {
                  onConflict: 'class_name,subject,language,book_name,chapter_number'
                });

              if (error) {
                console.error(`Error inserting ${chapter.filePath}:`, error);
              } else {
                totalInserted++;
              }
            } catch (error) {
              console.error(`Error processing ${chapter.filePath}:`, error);
            }
          }
        }
      }
    }

    console.log(`✅ Successfully inserted ${totalInserted} book records`);

  } catch (error) {
    console.error('Database population failed:', error);
  }
}

async function createClassAccessFunctions() {
  console.log('🔧 Helper functions need to be created manually in Supabase dashboard...\n');

  console.log('📋 Please create these functions in your Supabase SQL editor:\n');
  
  console.log('1. get_class_books function:');
  console.log(`
    CREATE OR REPLACE FUNCTION get_class_books(
      p_class_name VARCHAR(10),
      p_subject VARCHAR(50) DEFAULT NULL,
      p_language VARCHAR(20) DEFAULT 'English'
    ) RETURNS TABLE (
      id INTEGER,
      class_name VARCHAR(10),
      subject VARCHAR(50),
      language VARCHAR(20),
      book_name VARCHAR(255),
      chapter_number INTEGER,
      chapter_name VARCHAR(255),
      file_path TEXT,
      file_size BIGINT
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        cb.id,
        cb.class_name,
        cb.subject,
        cb.language,
        cb.book_name,
        cb.chapter_number,
        cb.chapter_name,
        cb.file_path,
        cb.file_size
      FROM class_books cb
      WHERE cb.class_name = p_class_name
        AND cb.is_active = true
        AND (p_subject IS NULL OR cb.subject = p_subject)
        AND (p_language IS NULL OR cb.language = p_language)
      ORDER BY cb.subject, cb.book_name, cb.chapter_number;
    END;
    $$ LANGUAGE plpgsql;
  `);

  console.log('2. assign_user_class_access function:');
  console.log(`
    CREATE OR REPLACE FUNCTION assign_user_class_access(
      p_user_id UUID,
      p_class_name VARCHAR(10),
      p_subjects TEXT[] DEFAULT NULL,
      p_languages TEXT[] DEFAULT ARRAY['English']
    ) RETURNS BOOLEAN AS $$
    BEGIN
      INSERT INTO user_class_access (user_id, class_name, subjects, languages)
      VALUES (p_user_id, p_class_name, 
              COALESCE(p_subjects, ARRAY(SELECT DISTINCT subject FROM class_books WHERE class_name = p_class_name)),
              p_languages)
      ON CONFLICT (user_id, class_name) 
      DO UPDATE SET 
        subjects = EXCLUDED.subjects,
        languages = EXCLUDED.languages,
        access_granted_at = NOW(),
        is_active = true;
      
      RETURN TRUE;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN FALSE;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

async function main() {
  console.log('🚀 Setting up Class-wise Book Management System\n');
  console.log('=' .repeat(60) + '\n');

  // Step 1: Setup database tables
  await setupDatabaseTables();
  console.log('');

  // Step 2: Scan and organize books
  const organizedBooks = await scanAndOrganizeBooks();
  console.log('');

  if (organizedBooks) {
    // Step 3: Populate database
    await populateDatabase(organizedBooks);
    console.log('');

    // Step 4: Create helper functions
    await createClassAccessFunctions();
    console.log('');

    console.log('🎉 Class-wise book management system setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the system with a sample user');
    console.log('2. Update the frontend to use class-wise book access');
    console.log('3. Implement lazy loading for better performance');
  }
}

// Run the setup
main().catch(console.error); 
