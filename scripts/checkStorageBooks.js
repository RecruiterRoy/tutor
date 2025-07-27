import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vfqdjpiyaabufpaofysz.supabase.co',
  'process.env.SUPABASE_SERVICE_KEY'
);

const bucket = 'educational-content';

async function checkStorageBooks() {
  console.log('🔍 Checking what books are in your Supabase storage...\n');
  
  try {
    // List all files in storage
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 });
    
    if (error) {
      console.error('Error fetching files:', error);
      return;
    }
    
    console.log(`📁 Found ${files.length} files in storage:\n`);
    
    // Group files by folder structure
    const folders = {};
    files.forEach(file => {
      const pathParts = file.name.split('/');
      const folder = pathParts[0] || 'root';
      
      if (!folders[folder]) {
        folders[folder] = [];
      }
      folders[folder].push(file);
    });
    
    // Display folder structure
    Object.entries(folders).forEach(([folder, folderFiles]) => {
      console.log(`📂 ${folder}/ (${folderFiles.length} files)`);
      
      // Show first few files in each folder
      folderFiles.slice(0, 5).forEach(file => {
        const size = file.metadata?.size ? `${(file.metadata.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size';
        console.log(`   📄 ${file.name} (${size})`);
      });
      
      if (folderFiles.length > 5) {
        console.log(`   ... and ${folderFiles.length - 5} more files`);
      }
      console.log('');
    });
    
    // Check if we have NCERT Books folder
    if (folders['NCERT Books']) {
      console.log('✅ Found NCERT Books folder!');
      console.log('📋 To populate the database, you need to:');
      console.log('1. Make sure your books are organized as: NCERT Books/class1/English/BookName/chapter.pdf');
      console.log('2. Run the setup script again: node scripts/setupClassWiseBooks.js');
    } else {
      console.log('⚠️ No NCERT Books folder found');
      console.log('📋 Your books need to be organized in this structure:');
      console.log('   NCERT Books/');
      console.log('   ├── class1/');
      console.log('   │   ├── English/');
      console.log('   │   │   └── BookName/');
      console.log('   │   │       └── chapter.pdf');
      console.log('   │   └── Hindi/');
      console.log('   └── class2/');
      console.log('       └── ...');
    }
    
  } catch (error) {
    console.error('Error checking storage:', error);
  }
}

checkStorageBooks().catch(console.error); 
