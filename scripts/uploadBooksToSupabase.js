import { createClient } from '@supabase/supabase-js';
import { readdirSync, statSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  'https://vfqdjpiyaabufpaofysz.supabase.co',
  'process.env.SUPABASE_SERVICE_KEY'
);

const bucket = 'educational-content';
const localBooksPath = join(__dirname, '..', 'books');

async function uploadBooksToSupabase() {
  console.log('📚 Uploading books to Supabase storage...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Check if books folder exists
    if (!statSync(localBooksPath).isDirectory()) {
      console.error('❌ Books folder not found at:', localBooksPath);
      return;
    }

    console.log(`📁 Found books folder: ${localBooksPath}\n`);

    let totalFiles = 0;
    let uploadedFiles = 0;
    let skippedFiles = 0;
    let errorFiles = 0;

    // Recursively scan the books folder
    async function scanAndUpload(dirPath, relativePath = '') {
      const items = readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const itemRelativePath = join(relativePath, item).replace(/\\/g, '/');
        const stats = statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          await scanAndUpload(fullPath, itemRelativePath);
        } else if (stats.isFile() && item.toLowerCase().endsWith('.pdf')) {
          totalFiles++;
          
          try {
            console.log(`📄 Uploading: ${itemRelativePath}`);
            
            // Read the file
            const fileBuffer = readFileSync(fullPath);
            
            // Upload to Supabase storage
            const { data, error } = await supabase.storage
              .from(bucket)
              .upload(itemRelativePath, fileBuffer, {
                contentType: 'application/pdf',
                upsert: true // Overwrite if exists
              });
            
            if (error) {
              console.error(`❌ Error uploading ${itemRelativePath}:`, error.message);
              errorFiles++;
            } else {
              console.log(`✅ Uploaded: ${itemRelativePath}`);
              uploadedFiles++;
            }
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.error(`❌ Failed to upload ${itemRelativePath}:`, error.message);
            errorFiles++;
          }
        } else {
          console.log(`⏭️ Skipping non-PDF file: ${itemRelativePath}`);
          skippedFiles++;
        }
      }
    }

    // Start the upload process
    await scanAndUpload(localBooksPath);

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 UPLOAD SUMMARY:');
    console.log(`📁 Total files found: ${totalFiles}`);
    console.log(`✅ Successfully uploaded: ${uploadedFiles}`);
    console.log(`⏭️ Skipped (non-PDF): ${skippedFiles}`);
    console.log(`❌ Failed uploads: ${errorFiles}`);
    
    if (uploadedFiles > 0) {
      console.log('\n🎉 Books uploaded successfully!');
      console.log('📋 Next steps:');
      console.log('1. Run the setup script to populate the database:');
      console.log('   node scripts/setupClassWiseBooks.js');
      console.log('2. Test the system:');
      console.log('   node scripts/testClassWiseSystem.js');
    } else {
      console.log('\n⚠️ No books were uploaded. Please check your books folder structure.');
    }

  } catch (error) {
    console.error('❌ Upload process failed:', error);
  }
}

// Run the upload
uploadBooksToSupabase().catch(console.error); 
