import fs from 'fs';
import path from 'path';

const extractedImagesDir = path.resolve('./extracted_images');
const indexPath = path.join(extractedImagesDir, 'index.json');

function testCurrentImages() {
    console.log('🧪 Testing current extracted images...\n');
    
    if (!fs.existsSync(indexPath)) {
        console.log('❌ No image index found!');
        return;
    }
    
    const imageIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(`📸 Found ${imageIndex.length} images in index`);
    
    if (imageIndex.length === 0) {
        console.log('❌ No images found!');
        return;
    }
    
    // Test a few sample images
    console.log('\n🔍 Testing sample images...');
    const sampleImages = imageIndex.slice(0, 5);
    
    sampleImages.forEach((img, index) => {
        const localPath = path.join(extractedImagesDir, img.imgPath);
        const exists = fs.existsSync(localPath);
        const size = exists ? fs.statSync(localPath).size : 0;
        const sizeKB = (size / 1024).toFixed(1);
        
        console.log(`${index + 1}. ${img.imgPath}`);
        console.log(`   Subject: ${img.subject}, Grade: ${img.grade}, Page: ${img.page}`);
        console.log(`   Exists: ${exists ? '✅' : '❌'}, Size: ${sizeKB} KB`);
        console.log(`   Description: ${img.description.substring(0, 80)}...`);
        console.log('');
    });
    
    // Check total disk usage
    let totalSize = 0;
    let existingCount = 0;
    
    imageIndex.forEach(img => {
        const localPath = path.join(extractedImagesDir, img.imgPath);
        if (fs.existsSync(localPath)) {
            totalSize += fs.statSync(localPath).size;
            existingCount++;
        }
    });
    
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    console.log('📊 === SUMMARY ===');
    console.log(`Total images in index: ${imageIndex.length}`);
    console.log(`Images actually on disk: ${existingCount}`);
    console.log(`Total disk usage: ${totalMB} MB`);
    console.log(`Average image size: ${(totalSize / existingCount / 1024).toFixed(1)} KB`);
    
    // Subject breakdown
    const subjectCounts = {};
    imageIndex.forEach(img => {
        subjectCounts[img.subject] = (subjectCounts[img.subject] || 0) + 1;
    });
    
    console.log('\n📚 === SUBJECT BREAKDOWN ===');
    Object.entries(subjectCounts).forEach(([subject, count]) => {
        console.log(`${subject}: ${count} images`);
    });
    
    // Grade breakdown
    const gradeCounts = {};
    imageIndex.forEach(img => {
        gradeCounts[img.grade] = (gradeCounts[img.grade] || 0) + 1;
    });
    
    console.log('\n🎓 === GRADE BREAKDOWN ===');
    Object.entries(gradeCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([grade, count]) => {
        console.log(`Class ${grade}: ${count} images`);
    });
    
    // Recommendations
    console.log('\n🎯 === RECOMMENDATIONS ===');
    
    if (existingCount > 500) {
        console.log('✅ Good number of images extracted! Ready for Supabase upload.');
        console.log('📝 Next steps:');
        console.log('1. Configure Supabase credentials in uploadImagesToSupabase.js');
        console.log('2. Run: node scripts/uploadImagesToSupabase.js');
        console.log('3. Update dashboard: node scripts/updateDashboardForImages.js');
    } else if (existingCount > 100) {
        console.log('📈 Moderate number of images. Consider:');
        console.log('1. Continue extraction for more images');
        console.log('2. Or proceed with current images for testing');
    } else {
        console.log('🚀 Few images extracted. Consider:');
        console.log('1. Restart extraction process');
        console.log('2. Check for errors in extraction');
    }
    
    // Check if we should restart extraction
    const booksDir = path.resolve('./books/NCERT Books');
    if (fs.existsSync(booksDir)) {
        try {
            const pdfFiles = [];
            function findPDFs(dir) {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        findPDFs(fullPath);
                    } else if (item.toLowerCase().endsWith('.pdf')) {
                        pdfFiles.push(fullPath);
                    }
                }
            }
            findPDFs(booksDir);
            
            console.log(`\n📚 Total PDF files available: ${pdfFiles.length}`);
            console.log(`📸 Images extracted: ${existingCount}`);
            console.log(`📊 Coverage: ${((existingCount / pdfFiles.length) * 100).toFixed(1)}%`);
            
            if (existingCount < pdfFiles.length * 0.1) {
                console.log('⚠️  Low coverage - consider restarting extraction');
            } else {
                console.log('✅ Good coverage - ready to proceed');
            }
        } catch (error) {
            console.log('⚠️  Could not analyze PDF coverage');
        }
    }
}

testCurrentImages(); 
