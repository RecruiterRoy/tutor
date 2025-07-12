import fs from 'fs';
import path from 'path';

const booksDir = path.resolve('./books/NCERT Books');

function findPDFFiles(dir) {
    const pdfFiles = [];
    
    function traverse(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (item.toLowerCase().endsWith('.pdf')) {
                pdfFiles.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return pdfFiles;
}

function main() {
    console.log('🔍 Checking for PDF files in NCERT Books...\n');
    
    if (!fs.existsSync(booksDir)) {
        console.log('❌ NCERT Books directory not found!');
        return;
    }
    
    const pdfFiles = findPDFFiles(booksDir);
    
    console.log(`Found ${pdfFiles.length} PDF files`);
    
    if (pdfFiles.length === 0) {
        console.log('❌ No PDF files found!');
        console.log('Please add PDF files to the books/NCERT Books directory.');
        return;
    }
    
    // Show first 10 PDF files
    console.log('\n=== SAMPLE PDF FILES ===');
    pdfFiles.slice(0, 10).forEach((file, index) => {
        const relativePath = path.relative(booksDir, file);
        const stats = fs.statSync(file);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`${index + 1}. ${relativePath} (${sizeMB} MB)`);
    });
    
    if (pdfFiles.length > 10) {
        console.log(`... and ${pdfFiles.length - 10} more files`);
    }
    
    // Analyze by class
    console.log('\n=== BREAKDOWN BY CLASS ===');
    const classCounts = {};
    
    pdfFiles.forEach(file => {
        const relativePath = path.relative(booksDir, file);
        const pathParts = relativePath.split(path.sep);
        const classPart = pathParts[0];
        
        if (classPart && classPart.toLowerCase().includes('class')) {
            classCounts[classPart] = (classCounts[classPart] || 0) + 1;
        }
    });
    
    Object.entries(classCounts).forEach(([className, count]) => {
        console.log(`${className}: ${count} PDFs`);
    });
    
    console.log('\n✅ PDF files found - ready for image extraction!');
    console.log('📝 Run: node scripts/extractImagesFromPDFs.js');
}

main(); 