import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const booksDir = path.resolve('./books/NCERT Books');
const outputDir = path.resolve('./extracted_images');
const indexPath = path.resolve('./extracted_images/index.json');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Recursively find all PDF files in NCERT Books folder only
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

function extractSubjectFromPath(pdfPath) {
  const pathParts = path.relative(booksDir, pdfPath).split(path.sep);
  for (const part of pathParts) {
    const lowerPart = part.toLowerCase();
    if (lowerPart.includes('english')) return 'english';
    if (lowerPart.includes('hindi')) return 'hindi';
    if (lowerPart.includes('maths') || lowerPart.includes('math')) return 'mathematics';
    if (lowerPart.includes('science')) return 'science';
    if (lowerPart.includes('social')) return 'social_studies';
    if (lowerPart.includes('history')) return 'history';
    if (lowerPart.includes('geography')) return 'geography';
    if (lowerPart.includes('chemistry')) return 'chemistry';
    if (lowerPart.includes('physics')) return 'physics';
    if (lowerPart.includes('biology')) return 'biology';
    if (lowerPart.includes('accountancy')) return 'accountancy';
    if (lowerPart.includes('economics')) return 'economics';
    if (lowerPart.includes('business')) return 'business_studies';
    if (lowerPart.includes('computer')) return 'computer_science';
    if (lowerPart.includes('sanskrit')) return 'sanskrit';
    if (lowerPart.includes('arts')) return 'arts';
    if (lowerPart.includes('physical')) return 'physical_education';
  }
  return 'general';
}

function extractGradeFromPath(pdfPath) {
  const pathParts = path.relative(booksDir, pdfPath).split(path.sep);
  for (const part of pathParts) {
    if (part.toLowerCase().includes('class')) {
      const match = part.match(/class(\d+)/i);
      if (match) return match[1];
    }
  }
  return 'unknown';
}

function generateDescription(subject, grade, page, bookName, imageIndex) {
  const gradeText = grade === 'unknown' ? '' : `Class ${grade}`;
  const subjectText = subject.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const descriptions = {
    'mathematics': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} showing mathematical diagrams, formulas, or problem-solving examples`,
    'science': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} containing scientific diagrams, experiments, or illustrations`,
    'english': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} with reading passages, grammar exercises, or literary content`,
    'hindi': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} containing Hindi text, grammar, or literature`,
    'social_studies': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} with maps, historical events, or geographical information`,
    'history': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} showing historical events, timelines, or historical figures`,
    'geography': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} with maps, geographical features, or environmental concepts`,
    'chemistry': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} containing chemical formulas, molecular structures, or laboratory experiments`,
    'physics': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} with physics diagrams, formulas, or scientific concepts`,
    'biology': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} showing biological diagrams, cell structures, or living organisms`,
    'accountancy': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} with accounting principles, financial statements, or business concepts`,
    'economics': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} containing economic theories, graphs, or financial concepts`,
    'business_studies': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} with business concepts, management principles, or organizational structures`,
    'computer_science': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} showing programming concepts, computer diagrams, or technology illustrations`,
    'sanskrit': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} with Sanskrit text, grammar, or classical literature`,
    'arts': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} containing artistic concepts, creative exercises, or cultural content`,
    'physical_education': `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} with sports diagrams, fitness concepts, or health information`
  };
  
  return descriptions[subject] || `${gradeText} ${subjectText} - Page ${page} Image ${imageIndex} from ${bookName}`;
}

async function getPageCount(pdfPath) {
  try {
    // Try using pdfinfo if available
    const { stdout } = await execAsync(`pdfinfo "${pdfPath}"`);
    const match = stdout.match(/Pages:\s*(\d+)/);
    if (match) return parseInt(match[1]);
  } catch (e) {
    // Fallback: estimate based on file size (rough approximation)
    const stats = fs.statSync(pdfPath);
    const sizeMB = stats.size / (1024 * 1024);
    // Rough estimate: 1MB ≈ 10 pages
    return Math.max(1, Math.floor(sizeMB * 10));
  }
  return 10; // Default fallback
}

async function extractImagesFromPDF(pdfPath) {
  const pdfName = path.parse(pdfPath).name;
  const subject = extractSubjectFromPath(pdfPath);
  const grade = extractGradeFromPath(pdfPath);
  const relativePath = path.relative(booksDir, pdfPath);
  
  console.log(`Processing ${pdfName} (${subject}, Class ${grade})`);
  
  try {
    const pageCount = await getPageCount(pdfPath);
    console.log(`  Found ${pageCount} pages`);
    
    const images = [];
    const bookDir = path.join(outputDir, subject, grade, pdfName);
    
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }
    
    // Extract images from each page using pdfimages
    for (let page = 1; page <= Math.min(pageCount, 200); page++) { // Increased limit to 200 pages per book
      try {
        // Create a temporary directory for this page
        const pageTempDir = path.join(bookDir, `page_${page}_temp`);
        if (!fs.existsSync(pageTempDir)) {
          fs.mkdirSync(pageTempDir, { recursive: true });
        }
        
        // Extract images from this page using pdfimages
        await execAsync(`pdfimages -f ${page} -l ${page} -j "${pdfPath}" "${path.join(pageTempDir, 'image')}"`);
        
        // Check what images were extracted
        const extractedFiles = fs.readdirSync(pageTempDir).filter(file => 
          file.toLowerCase().endsWith('.jpg') || 
          file.toLowerCase().endsWith('.jpeg') || 
          file.toLowerCase().endsWith('.png')
        );
        
        if (extractedFiles.length > 0) {
          console.log(`    Page ${page}: Found ${extractedFiles.length} images`);
          
          // Process each extracted image
          extractedFiles.forEach((imageFile, imageIndex) => {
            const sourcePath = path.join(pageTempDir, imageFile);
            const imgFileName = `${pdfName}-page-${page.toString().padStart(3, '0')}-img-${(imageIndex + 1).toString().padStart(2, '0')}.jpg`;
            const imgPath = path.join(bookDir, imgFileName);
            const relativeImgPath = path.relative(outputDir, imgPath);
            
            // Convert to JPG if needed and move to final location
            if (imageFile.toLowerCase().endsWith('.jpg') || imageFile.toLowerCase().endsWith('.jpeg')) {
              fs.copyFileSync(sourcePath, imgPath);
            } else {
              // Convert PNG to JPG using ImageMagick if available
              try {
                execAsync(`magick "${sourcePath}" "${imgPath}"`);
              } catch (e) {
                // If ImageMagick not available, just copy the file
                fs.copyFileSync(sourcePath, imgPath);
              }
            }
            
            const description = generateDescription(subject, grade, page, pdfName, imageIndex + 1);
            
            images.push({
              file: pdfName,
              page: page,
              imageIndex: imageIndex + 1,
              imgPath: relativeImgPath,
              fullPath: relativePath,
              subject: subject,
              grade: grade,
              description: description,
              tags: [subject, `class-${grade}`, `page-${page}`, `image-${imageIndex + 1}`, 'ncert', 'textbook'],
              extracted: true
            });
          });
        } else {
          // Only log every 10th page to reduce console spam
          if (page % 10 === 0) {
            console.log(`    Page ${page}: No images found`);
          }
        }
        
        // Clean up temporary directory
        fs.rmSync(pageTempDir, { recursive: true, force: true });
        
      } catch (e) {
        // Only log errors for pages that should have images
        if (page <= 50) { // Only log errors for first 50 pages to reduce spam
          console.log(`    Failed to extract images from page ${page}: ${e.message}`);
        }
      }
    }
    
    console.log(`  Completed ${pdfName}: ${images.length} images extracted`);
    return images;
    
  } catch (e) {
    console.error(`Failed to process ${pdfName}:`, e.message);
    return [];
  }
}

async function main() {
  console.log('Starting comprehensive actual image extraction from ALL NCERT Books...');
  
  const pdfFiles = findPDFFiles(booksDir);
  console.log(`Found ${pdfFiles.length} PDF files in NCERT Books`);
  
  if (pdfFiles.length === 0) {
    console.log('No PDF files found in NCERT Books folder');
    return;
  }
  
  // Create placeholder images directory
  const placeholderDir = path.join(outputDir, 'placeholder_images');
  if (!fs.existsSync(placeholderDir)) {
    fs.mkdirSync(placeholderDir, { recursive: true });
  }
  
  // Create a simple placeholder image (1x1 pixel JPG)
  const placeholderImage = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A', 'base64');
  fs.writeFileSync(path.join(placeholderDir, 'placeholder.jpg'), placeholderImage);
  
  const allImages = [];
  let processedCount = 0;
  let totalImages = 0;
  let errorCount = 0;
  const errors = [];
  
  // Process ALL books (not just 10)
  console.log(`\n🚀 Starting extraction of images from all ${pdfFiles.length} books...`);
  console.log('This may take several hours. Progress will be saved every 50 books.\n');
  
  const startTime = Date.now();
  
  for (const pdfPath of pdfFiles) {
    try {
      const images = await extractImagesFromPDF(pdfPath);
      allImages.push(...images);
      totalImages += images.length;
      processedCount++;
      
      // Calculate progress and time estimates
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const avgTimePerBook = elapsedMinutes / processedCount;
      const remainingBooks = pdfFiles.length - processedCount;
      const estimatedRemainingMinutes = remainingBooks * avgTimePerBook;
      
      console.log(`📊 Progress: ${processedCount}/${pdfFiles.length} books (${((processedCount/pdfFiles.length)*100).toFixed(1)}%)`);
      console.log(`   📸 Total images: ${totalImages}`);
      console.log(`   ⏱️  Elapsed: ${elapsedMinutes.toFixed(1)} min | Est. remaining: ${estimatedRemainingMinutes.toFixed(1)} min`);
      
      // Save progress every 50 books
      if (processedCount % 50 === 0) {
        fs.writeFileSync(indexPath, JSON.stringify(allImages, null, 2));
        console.log(`💾 Progress saved: ${allImages.length} images indexed`);
        
        // Also save a backup with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(outputDir, `index_backup_${timestamp}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(allImages, null, 2));
        console.log(`💾 Backup saved: ${backupPath}`);
      }
      
    } catch (e) {
      errorCount++;
      errors.push({ file: path.relative(booksDir, pdfPath), error: e.message });
      console.error(`❌ Failed to process ${path.relative(booksDir, pdfPath)}:`, e.message);
    }
  }
  
  // Final save
  fs.writeFileSync(indexPath, JSON.stringify(allImages, null, 2));
  
  const totalTimeMinutes = (Date.now() - startTime) / 60000;
  
  console.log('\n🎉 === EXTRACTION COMPLETE ===');
  console.log(`📚 Total books processed: ${processedCount}`);
  console.log(`📸 Total images extracted: ${totalImages}`);
  console.log(`✅ Successfully extracted: ${allImages.filter(img => img.extracted).length}`);
  console.log(`❌ Errors encountered: ${errorCount}`);
  console.log(`⏱️  Total time: ${totalTimeMinutes.toFixed(1)} minutes`);
  console.log(`📁 Image index saved to: ${indexPath}`);
  
  // Summary by subject
  const subjectCounts = {};
  const subjectSizes = {};
  allImages.forEach(img => {
    subjectCounts[img.subject] = (subjectCounts[img.subject] || 0) + 1;
    
    // Calculate total size for each subject
    try {
      const imgPath = path.join(outputDir, img.imgPath);
      if (fs.existsSync(imgPath)) {
        const stats = fs.statSync(imgPath);
        subjectSizes[img.subject] = (subjectSizes[img.subject] || 0) + stats.size;
      }
    } catch (e) {
      // Ignore size calculation errors
    }
  });
  
  console.log('\n📊 === BREAKDOWN BY SUBJECT ===');
  Object.entries(subjectCounts).forEach(([subject, count]) => {
    const sizeMB = subjectSizes[subject] ? (subjectSizes[subject] / (1024 * 1024)).toFixed(2) : '0';
    console.log(`${subject}: ${count} images (${sizeMB} MB)`);
  });
  
  // Show top 10 errors if any
  if (errors.length > 0) {
    console.log('\n❌ === TOP 10 ERRORS ===');
    errors.slice(0, 10).forEach((error, index) => {
      console.log(`${index + 1}. ${error.file}: ${error.error}`);
    });
    if (errors.length > 10) {
      console.log(`... and ${errors.length - 10} more errors`);
    }
  }
  
  console.log('\n🎯 === NEXT STEPS ===');
  console.log('1. Review the extracted images in the extracted_images folder');
  console.log('2. Test image loading in the dashboard');
  console.log('3. Upload to Supabase storage when ready');
  console.log('4. Update the dashboard to use the new image paths');
}

main().catch(console.error); 