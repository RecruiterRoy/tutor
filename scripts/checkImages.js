import fs from 'fs';
import path from 'path';

const extractedImagesDir = path.resolve('./extracted_images');

function countImagesInDirectory(dir) {
    let totalImages = 0;
    let pngCount = 0;
    let jpgCount = 0;
    let otherCount = 0;
    const imageFiles = [];
    
    function traverse(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (item.toLowerCase().endsWith('.png')) {
                pngCount++;
                totalImages++;
                imageFiles.push(fullPath);
            } else if (item.toLowerCase().endsWith('.jpg') || item.toLowerCase().endsWith('.jpeg')) {
                jpgCount++;
                totalImages++;
                imageFiles.push(fullPath);
            } else if (item.toLowerCase().match(/\.(gif|bmp|tiff|webp)$/)) {
                otherCount++;
                totalImages++;
                imageFiles.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return { totalImages, pngCount, jpgCount, otherCount, imageFiles };
}

function analyzeImageStructure() {
    console.log('🔍 Analyzing extracted images structure...\n');
    
    if (!fs.existsSync(extractedImagesDir)) {
        console.log('❌ extracted_images directory not found!');
        return;
    }
    
    const { totalImages, pngCount, jpgCount, otherCount, imageFiles } = countImagesInDirectory(extractedImagesDir);
    
    console.log('=== IMAGE COUNT SUMMARY ===');
    console.log(`Total images found: ${totalImages}`);
    console.log(`PNG images: ${pngCount}`);
    console.log(`JPG/JPEG images: ${jpgCount}`);
    console.log(`Other formats: ${otherCount}`);
    
    if (totalImages === 0) {
        console.log('\n❌ No images found in extracted_images directory!');
        console.log('You may need to run the image extraction script first.');
        return;
    }
    
    // Analyze by subject
    console.log('\n=== BREAKDOWN BY SUBJECT ===');
    const subjectCounts = {};
    const subjectSizes = {};
    
    imageFiles.forEach(filePath => {
        const relativePath = path.relative(extractedImagesDir, filePath);
        const pathParts = relativePath.split(path.sep);
        const subject = pathParts[0];
        
        if (subject && subject !== 'placeholder_images') {
            subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
            
            const stats = fs.statSync(filePath);
            subjectSizes[subject] = (subjectSizes[subject] || 0) + stats.size;
        }
    });
    
    Object.entries(subjectCounts).forEach(([subject, count]) => {
        const sizeMB = (subjectSizes[subject] / (1024 * 1024)).toFixed(2);
        console.log(`${subject}: ${count} images (${sizeMB} MB)`);
    });
    
    // Check for empty directories
    console.log('\n=== CHECKING FOR EMPTY DIRECTORIES ===');
    const subjects = fs.readdirSync(extractedImagesDir).filter(item => {
        const fullPath = path.join(extractedImagesDir, item);
        return fs.statSync(fullPath).isDirectory();
    });
    
    subjects.forEach(subject => {
        const subjectPath = path.join(extractedImagesDir, subject);
        const { totalImages: subjectImages } = countImagesInDirectory(subjectPath);
        if (subjectImages === 0) {
            console.log(`⚠️  ${subject}: No images found`);
        }
    });
    
    // Sample file paths
    console.log('\n=== SAMPLE FILE PATHS ===');
    const sampleFiles = imageFiles.slice(0, 5);
    sampleFiles.forEach(file => {
        const relativePath = path.relative(extractedImagesDir, file);
        console.log(`📁 ${relativePath}`);
    });
    
    if (imageFiles.length > 5) {
        console.log(`... and ${imageFiles.length - 5} more files`);
    }
    
    // Recommendations
    console.log('\n=== RECOMMENDATIONS ===');
    if (pngCount > 0 && jpgCount === 0) {
        console.log('✅ PNG images found - ready for conversion to JPG');
        console.log('📝 Run: node scripts/convertToJPG.js');
    } else if (jpgCount > 0) {
        console.log('✅ JPG images already exist');
    } else {
        console.log('❌ No images found - run extraction first');
    }
}

analyzeImageStructure(); 
