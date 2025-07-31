import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  'https://vfqdjpiyaabufpaofysz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

const bucket = 'educational-content';

async function checkCurrentStorage() {
  console.log('🔍 Checking current Supabase storage contents...\n');
  
  try {
    // List all files in storage
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 });
    
    if (error) {
      console.error('❌ Error fetching files:', error);
      return;
    }
    
    console.log(`📁 Found ${files.length} files in storage:\n`);
    
    if (files.length === 0) {
      console.log('📭 Storage is empty. Ready to upload CBSE syllabus and books!');
      return;
    }
    
    // Group files by folder
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
      
      folderFiles.slice(0, 3).forEach(file => {
        const size = file.metadata?.size ? `${(file.metadata.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size';
        console.log(`   📄 ${file.name} (${size})`);
      });
      
      if (folderFiles.length > 3) {
        console.log(`   ... and ${folderFiles.length - 3} more files`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking storage:', error);
  }
}

checkCurrentStorage().catch(console.error); 