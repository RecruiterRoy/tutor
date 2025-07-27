// Cleanup Supabase Storage
import { createClient } from '@supabase/supabase-js';

// Use the same config as your app
const supabaseUrl = 'https://vfqdjpiyaabufpaofysz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWRqcGl5YWFidWZwYW9meXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDkzMDEsImV4cCI6MjA2OTE4NTMwMX0.SVY1Kf7D1nbXssuxCnnHcvaDAIintOpCLfhxV6rHvjo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupStorage() {
    console.log('🧹 Cleaning up Supabase Storage...\n');
    
    try {
        // List all buckets
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
            console.error('❌ Error listing buckets:', bucketsError);
            return;
        }
        
        for (const bucket of buckets) {
            console.log(`📂 Processing bucket: ${bucket.name}`);
            
            try {
                // List all files in bucket
                const { data: files, error: filesError } = await supabase.storage
                    .from(bucket.name)
                    .list('', { limit: 1000 });
                
                if (filesError) {
                    console.log(`   ❌ Error listing files: ${filesError.message}`);
                    continue;
                }
                
                console.log(`   📄 Found ${files.length} files`);
                
                // Find large files (>10MB)
                const largeFiles = files.filter(file => 
                    file.metadata?.size && file.metadata.size > 10 * 1024 * 1024
                );
                
                if (largeFiles.length > 0) {
                    console.log(`   ⚠️ Found ${largeFiles.length} large files (>10MB):`);
                    
                    for (const file of largeFiles) {
                        const sizeMB = (file.metadata.size / (1024 * 1024)).toFixed(1);
                        console.log(`      - ${file.name} (${sizeMB} MB)`);
                        
                        // Ask user if they want to delete
                        console.log(`      🗑️ Delete this file? (y/n)`);
                        // For now, just log - you can manually delete if needed
                    }
                }
                
                // Check for book-related files
                const bookFiles = files.filter(file => 
                    file.name.toLowerCase().includes('book') ||
                    file.name.toLowerCase().includes('ncert') ||
                    file.name.toLowerCase().includes('pdf')
                );
                
                if (bookFiles.length > 0) {
                    console.log(`   📚 Found ${bookFiles.length} book-related files:`);
                    bookFiles.forEach(file => {
                        const sizeMB = file.metadata?.size ? 
                            (file.metadata.size / (1024 * 1024)).toFixed(1) : 'Unknown';
                        console.log(`      - ${file.name} (${sizeMB} MB)`);
                    });
                }
                
            } catch (error) {
                console.log(`   ❌ Error processing bucket: ${error.message}`);
            }
            
            console.log('');
        }
        
        console.log('✅ Storage analysis complete!');
        console.log('\n📋 RECOMMENDATIONS:');
        console.log('1. Keep user profile images (small files)');
        console.log('2. Remove large book files from Supabase storage');
        console.log('3. Books are already working from Vercel deployment');
        console.log('4. Your laptop does NOT need to stay on');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

cleanupStorage(); 