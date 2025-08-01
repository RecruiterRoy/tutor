import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://vfqdjpiyaabufpaofysz.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const extractedImagesDir = path.resolve('./extracted_images');
const indexPath = path.join(extractedImagesDir, 'index.json');

// Test Supabase connection
async function testConnection() {
    try {
        console.log('🔍 Testing Supabase connection...');
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.error('❌ Connection failed:', error.message);
            return false;
        }
        
        console.log('✅ Connection successful');
        console.log('📦 Available buckets:', data.map(b => b.name));
        
        // Test educational-content bucket access
        const { data: bucketData, error: bucketError } = await supabase.storage
            .from('educational-content')
            .list('', { limit: 1 });
        
        if (bucketError) {
            console.error('❌ Cannot access educational-content bucket:', bucketError.message);
            return false;
        }
        
        console.log('✅ educational-content bucket accessible');
        return true;
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

async function uploadImage(localPath, storagePath) {
    try {
        const fileBuffer = fs.readFileSync(localPath);
        console.log(`  📁 Uploading: ${storagePath} (${(fileBuffer.length/1024).toFixed(1)}KB)`);
        
        const { data, error } = await supabase.storage
            .from('educational-content')
            .upload(storagePath, fileBuffer, {
                contentType: 'image/jpeg',
                upsert: true
            });
        
        if (error) {
            console.error(`  ❌ Error: ${error.message}`);
            return null;
        }
        
        console.log(`  ✅ Success: ${data.path}`);
        return data;
    } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        return null;
    }
}

async function getPublicUrl(storagePath) {
    try {
        const { data } = supabase.storage
            .from('educational-content')
            .getPublicUrl(storagePath);
        return data.publicUrl;
    } catch (error) {
        console.error(`Failed to get URL for ${storagePath}:`, error.message);
        return null;
    }
}

async function uploadAllImages() {
    console.log('🚀 Starting image upload to knowledge-bank...\n');
    
    // Test connection first
    if (!await testConnection()) {
        console.log('❌ Cannot proceed without connection');
        return;
    }
    
    if (!fs.existsSync(indexPath)) {
        console.log('❌ Image index not found! Run extraction first.');
        return;
    }
    
    const imageIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(`📸 Found ${imageIndex.length} images to upload\n`);
    
    let uploaded = 0;
    let failed = 0;
    const updatedIndex = [];
    
    // Test with first image
    console.log('🧪 Testing with first image...');
    const testImage = imageIndex[0];
    const testPath = path.join(extractedImagesDir, testImage.imgPath);
    const testStoragePath = `knowledge-bank/${testImage.imgPath.replace(/\\/g, '/')}`;
    
    if (fs.existsSync(testPath)) {
        const testResult = await uploadImage(testPath, testStoragePath);
        if (testResult) {
            console.log('✅ Test successful! Continuing...\n');
        } else {
            console.log('❌ Test failed! Check configuration.');
            return;
        }
    }
    
    for (let i = 0; i < imageIndex.length; i++) {
        const image = imageIndex[i];
        const localPath = path.join(extractedImagesDir, image.imgPath);
        
        if (!fs.existsSync(localPath)) {
            console.log(`⚠️  Missing: ${image.imgPath}`);
            failed++;
            continue;
        }
        
        const storagePath = `knowledge-bank/${image.imgPath.replace(/\\/g, '/')}`;
        console.log(`[${i + 1}/${imageIndex.length}] ${image.imgPath}`);
        
        const result = await uploadImage(localPath, storagePath);
        
        if (result) {
            const publicUrl = await getPublicUrl(storagePath);
            updatedIndex.push({
                ...image,
                supabasePath: storagePath,
                supabaseUrl: publicUrl,
                uploaded: true,
                uploadedAt: new Date().toISOString()
            });
            uploaded++;
            
            if (uploaded % 10 === 0) {
                console.log(`  📊 Progress: ${uploaded}/${imageIndex.length}`);
                const progressPath = path.join(extractedImagesDir, 'index_with_supabase.json');
                fs.writeFileSync(progressPath, JSON.stringify(updatedIndex, null, 2));
            }
        } else {
            failed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Save final results
    const finalPath = path.join(extractedImagesDir, 'index_with_supabase.json');
    fs.writeFileSync(finalPath, JSON.stringify(updatedIndex, null, 2));
    
    console.log('\n🎉 === UPLOAD COMPLETE ===');
    console.log(`✅ Uploaded: ${uploaded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📁 Saved to: ${finalPath}`);
    
    // Subject summary
    const subjects = {};
    updatedIndex.forEach(img => {
        subjects[img.subject] = (subjects[img.subject] || 0) + 1;
    });
    
    console.log('\n📊 By Subject:');
    Object.entries(subjects).forEach(([subject, count]) => {
        console.log(`  ${subject}: ${count} images`);
    });
}

// Run the upload
if (supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key') {
    console.log('❌ Configure Supabase credentials first!');
} else {
    uploadAllImages().catch(console.error);
} 

