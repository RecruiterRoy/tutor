import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

const bucket = 'educational-content';

async function debugStorage() {
  console.log('🔍 Debugging Storage Contents...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // List all files in storage
    console.log('📁 All files in storage:');
    const { data: allFiles, error: allError } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 });

    if (allError) {
      console.error('Error listing files:', allError);
      return;
    }

    console.log(`Total files found: ${allFiles.length}\n`);

    // Group files by directory
    const fileGroups = {};
    allFiles.forEach(file => {
      const pathParts = file.name.split('/');
      const directory = pathParts.length > 1 ? pathParts[0] : 'root';
      
      if (!fileGroups[directory]) {
        fileGroups[directory] = [];
      }
      fileGroups[directory].push(file);
    });

    // Display grouped files
    for (const [dir, files] of Object.entries(fileGroups)) {
      console.log(`📂 ${dir}/ (${files.length} files):`);
      files.forEach(file => {
        const size = file.metadata?.size ? `(${(file.metadata.size / 1024 / 1024).toFixed(2)} MB)` : '';
        console.log(`  - ${file.name} ${size}`);
      });
      console.log();
    }

    // Check for NCERT Books specifically
    console.log('🔍 Checking for NCERT Books structure:');
    const { data: ncertFiles, error: ncertError } = await supabase.storage
      .from(bucket)
      .list('NCERT Books', { limit: 1000 });

    if (ncertError) {
      console.log('❌ No NCERT Books directory found or error accessing it');
    } else {
      console.log(`✅ Found ${ncertFiles.length} files in NCERT Books/`);
      ncertFiles.forEach(file => {
        console.log(`  - ${file.name}`);
      });
    }

    // Check for extracted images
    console.log('\n🖼️  Checking for extracted images:');
    const { data: imageFiles, error: imageError } = await supabase.storage
      .from(bucket)
      .list('extracted_images', { limit: 1000 });

    if (imageError) {
      console.log('❌ No extracted_images directory found or error accessing it');
    } else {
      console.log(`✅ Found ${imageFiles.length} files in extracted_images/`);
      imageFiles.forEach(file => {
        console.log(`  - ${file.name}`);
      });
    }

    // Check database for book records
    console.log('\n📊 Checking database for book records:');
    const { data: books, error: dbError } = await supabase
      .from('user_books')
      .select('*');

    if (dbError) {
      console.log('❌ Error accessing books table:', dbError.message);
    } else {
      console.log(`✅ Found ${books.length} book records in database:`);
      books.forEach(book => {
        console.log(`  - ${book.title} (${book.subject}, ${book.grade})`);
      });
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugStorage().catch(console.error); 