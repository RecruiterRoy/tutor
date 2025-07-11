import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

const bucket = 'educational-content';

async function deepStorageCheck() {
  console.log('🔍 Deep checking Supabase storage structure...\n');
  
  try {
    // List all files recursively
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000, search: '*.pdf' });
    
    if (error) {
      console.error('Error fetching files:', error);
      return;
    }
    
    console.log(`📁 Found ${files.length} files in storage:\n`);
    
    // Show all PDF files
    files.forEach(file => {
      const size = file.metadata?.size ? `${(file.metadata.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size';
      console.log(`📄 ${file.name} (${size})`);
    });
    
    // Check specific paths
    console.log('\n🔍 Checking specific class folders...\n');
    
    const pathsToCheck = [
      'NCERT Books/class1/English/MridangEnglishBook/',
      'NCERT Books/class2/English/Mridang/',
      'NCERT Books/class3/English/Santoor/'
    ];
    
    for (const path of pathsToCheck) {
      const { data: pathFiles, error: pathError } = await supabase.storage
        .from(bucket)
        .list(path, { limit: 100 });
      
      if (pathError) {
        console.log(`❌ Error checking ${path}: ${pathError.message}`);
      } else {
        console.log(`📂 ${path} (${pathFiles?.length || 0} files)`);
        if (pathFiles && pathFiles.length > 0) {
          pathFiles.forEach(file => {
            console.log(`   📄 ${file.name}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking storage:', error);
  }
}

deepStorageCheck().catch(console.error);