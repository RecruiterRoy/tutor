import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

async function populateBooksManually() {
  console.log('📚 Manually populating books database...\n');
  
  // Book data based on what we found in storage
  const books = [
    // Class 1 English
    {
      class_name: 'class1',
      subject: 'English',
      language: 'English',
      book_name: 'MridangEnglishBook',
      chapter_number: 1,
      chapter_name: 'Chapter 1',
      file_path: 'NCERT Books/class1/English/MridangEnglishBook/aemr101.pdf',
      file_size: 0,
      syllabus_type: 'NCERT',
      is_active: true
    },
    {
      class_name: 'class1',
      subject: 'English',
      language: 'English',
      book_name: 'MridangEnglishBook',
      chapter_number: 2,
      chapter_name: 'Chapter 2',
      file_path: 'NCERT Books/class1/English/MridangEnglishBook/aemr102.pdf',
      file_size: 0,
      syllabus_type: 'NCERT',
      is_active: true
    },
    {
      class_name: 'class1',
      subject: 'English',
      language: 'English',
      book_name: 'MridangEnglishBook',
      chapter_number: 3,
      chapter_name: 'Chapter 3',
      file_path: 'NCERT Books/class1/English/MridangEnglishBook/aemr103.pdf',
      file_size: 0,
      syllabus_type: 'NCERT',
      is_active: true
    },
    // Class 2 English
    {
      class_name: 'class2',
      subject: 'English',
      language: 'English',
      book_name: 'Mridang',
      chapter_number: 1,
      chapter_name: 'Chapter 1',
      file_path: 'NCERT Books/class2/English/Mridang/bemr101.pdf',
      file_size: 0,
      syllabus_type: 'NCERT',
      is_active: true
    },
    {
      class_name: 'class2',
      subject: 'English',
      language: 'English',
      book_name: 'Mridang',
      chapter_number: 2,
      chapter_name: 'Chapter 2',
      file_path: 'NCERT Books/class2/English/Mridang/bemr102.pdf',
      file_size: 0,
      syllabus_type: 'NCERT',
      is_active: true
    },
    // Class 3 English
    {
      class_name: 'class3',
      subject: 'English',
      language: 'English',
      book_name: 'Santoor',
      chapter_number: 1,
      chapter_name: 'Chapter 1',
      file_path: 'NCERT Books/class3/English/Santoor/cesa101.pdf',
      file_size: 0,
      syllabus_type: 'NCERT',
      is_active: true
    },
    {
      class_name: 'class3',
      subject: 'English',
      language: 'English',
      book_name: 'Santoor',
      chapter_number: 2,
      chapter_name: 'Chapter 2',
      file_path: 'NCERT Books/class3/English/Santoor/cesa102.pdf',
      file_size: 0,
      syllabus_type: 'NCERT',
      is_active: true
    }
  ];

  try {
    let inserted = 0;
    
    for (const book of books) {
      const { error } = await supabase
        .from('class_books')
        .upsert(book, {
          onConflict: 'class_name,subject,language,book_name,chapter_number'
        });

      if (error) {
        console.error(`Error inserting ${book.file_path}:`, error);
      } else {
        inserted++;
        console.log(`✅ Inserted: ${book.file_path}`);
      }
    }

    console.log(`\n🎉 Successfully inserted ${inserted} book records!`);
    
    // Test the system
    console.log('\n�� Testing the system...');
    const { data: testBooks, error: testError } = await supabase.rpc('get_class_books', {
      p_class_name: 'class1',
      p_subject: null,
      p_language: 'English'
    });

    if (testError) {
      console.error('❌ Test failed:', testError);
    } else {
      console.log(`✅ Test successful! Found ${testBooks?.length || 0} books for class1`);
    }

  } catch (error) {
    console.error('❌ Population failed:', error);
  }
}

populateBooksManually().catch(console.error);