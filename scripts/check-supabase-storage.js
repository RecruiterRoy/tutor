import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseStorage() {
    console.log('🔍 Checking Supabase Storage Usage...\n');
    
    try {
        // List all buckets
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
            console.error('❌ Error listing buckets:', bucketsError);
            return;
        }
        
        console.log(`📦 Found ${buckets.length} storage buckets:\n`);
        
        let totalSize = 0;
        let totalFiles = 0;
        
        for (const bucket of buckets) {
            console.log(`📂 Bucket: ${bucket.name}`);
            console.log(`   Public: ${bucket.public ? 'Yes' : 'No'}`);
            console.log(`   Created: ${new Date(bucket.created_at).toLocaleDateString()}`);
            
            try {
                // List files in bucket
                const { data: files, error: filesError } = await supabase.storage
                    .from(bucket.name)
                    .list('', { limit: 1000 });
                
                if (filesError) {
                    console.log(`   ❌ Error listing files: ${filesError.message}`);
                    continue;
                }
                
                console.log(`   📄 Files: ${files.length}`);
                
                // Calculate total size
                let bucketSize = 0;
                files.forEach(file => {
                    if (file.metadata?.size) {
                        bucketSize += file.metadata.size;
                        totalSize += file.metadata.size;
                    }
                    totalFiles++;
                });
                
                console.log(`   💾 Size: ${(bucketSize / (1024 * 1024)).toFixed(2)} MB`);
                
                // Show first few files
                if (files.length > 0) {
                    console.log('   📋 Sample files:');
                    files.slice(0, 3).forEach(file => {
                        const size = file.metadata?.size ? 
                            `${(file.metadata.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown';
                        console.log(`      - ${file.name} (${size})`);
                    });
                    if (files.length > 3) {
                        console.log(`      ... and ${files.length - 3} more files`);
                    }
                }
                
            } catch (error) {
                console.log(`   ❌ Error accessing bucket: ${error.message}`);
            }
            
            console.log('');
        }
        
        // Summary
        console.log('📊 STORAGE SUMMARY:');
        console.log(`Total Files: ${totalFiles}`);
        console.log(`Total Size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`Free Tier Limit: 1 GB`);
        console.log(`Usage: ${((totalSize / (1024 * 1024 * 1024)) * 100).toFixed(1)}% of free tier`);
        
        if (totalSize > 1024 * 1024 * 1024) {
            console.log('\n⚠️ WARNING: You are exceeding the free tier limit!');
            console.log('Consider removing large files from storage.');
        }
        
    } catch (error) {
        console.error('❌ Error checking storage:', error);
    }
}

checkSupabaseStorage(); 