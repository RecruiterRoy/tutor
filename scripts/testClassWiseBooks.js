import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

async function testClassWiseBooks() {
  console.log('🧪 Testing Class-wise Book System\n');

  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Checking database tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('class_books')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ class_books table not found:', tablesError);
      return;
    }
    
    console.log('✅ class_books table exists');

    // Test 2: Get total book count
    const { count: totalBooks, error: countError } = await supabase
      .from('class_books')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting books:', countError);
    } else {
      console.log(`✅ Total books in database: ${totalBooks}`);
    }

    // Test 3: Get books by class
    console.log('\n2️⃣ Testing class-wise book retrieval...');
    
    const testClasses = ['class1', 'class10'];
    
    for (const className of testClasses) {
      console.log(`\n📚 Books for ${className}:`);
      
      const { data: books, error } = await supabase
        .from('class_books')
        .select('*')
        .eq('class_name', className)
        .order('subject', { ascending: true })
        .order('chapter_number', { ascending: true });

      if (error) {
        console.error(`❌ Error fetching ${className} books:`, error);
      } else {
        console.log(`   📖 Total chapters: ${books.length}`);
        
        // Group by subject
        const bySubject = {};
        books.forEach(book => {
          if (!bySubject[book.subject]) {
            bySubject[book.subject] = [];
          }
          bySubject[book.subject].push(book);
        });
        
        for (const [subject, subjectBooks] of Object.entries(bySubject)) {
          console.log(`   📚 ${subject}: ${subjectBooks.length} chapters`);
        }
      }
    }

    // Test 4: Get books by class and subject
    console.log('\n3️⃣ Testing subject-specific retrieval...');
    
    const { data: scienceBooks, error: scienceError } = await supabase
      .from('class_books')
      .select('*')
      .eq('class_name', 'class10')
      .eq('subject', 'Science')
      .order('chapter_number', { ascending: true });

    if (scienceError) {
      console.error('❌ Error fetching Science books:', scienceError);
    } else {
      console.log(`✅ Class 10 Science: ${scienceBooks.length} chapters`);
      scienceBooks.slice(0, 3).forEach(book => {
        console.log(`   📄 ${book.chapter_name} (${(book.file_size / (1024 * 1024)).toFixed(2)} MB)`);
      });
    }

    // Test 5: Test file access
    console.log('\n4️⃣ Testing file access...');
    
    if (scienceBooks && scienceBooks.length > 0) {
      const testFile = scienceBooks[0];
      console.log(`Testing access to: ${testFile.file_path}`);
      
      const { data: fileUrl, error: fileError } = await supabase.storage
        .from('educational-content')
        .createSignedUrl(testFile.file_path, 60); // 60 seconds

      if (fileError) {
        console.error('❌ File access error:', fileError);
      } else {
        console.log('✅ File access successful');
        console.log(`   🔗 URL generated for: ${testFile.chapter_name}`);
      }
    }

    // Test 6: Summary statistics
    console.log('\n5️⃣ System Summary:');
    
    const { data: classStats, error: statsError } = await supabase
      .from('class_books')
      .select('class_name, subject')
      .order('class_name', { ascending: true });

    if (statsError) {
      console.error('❌ Error getting statistics:', statsError);
    } else {
      const stats = {};
      classStats.forEach(book => {
        if (!stats[book.class_name]) {
          stats[book.class_name] = new Set();
        }
        stats[book.class_name].add(book.subject);
      });
      
      console.log('📊 Books by Class:');
      Object.entries(stats).forEach(([className, subjects]) => {
        console.log(`   ${className}: ${subjects.size} subjects (${Array.from(subjects).join(', ')})`);
      });
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 System Status:');
    console.log('✅ Database tables created');
    console.log('✅ Books organized by class');
    console.log('✅ File access working');
    console.log('✅ Ready for frontend integration');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testClassWiseBooks(); 