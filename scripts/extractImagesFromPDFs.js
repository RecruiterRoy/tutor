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

function generateDescription(subject, grade, page, bookName) {
  const gradeText = grade === 'unknown' ? '' : `Class ${grade}`;
  const subjectText = subject.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const descriptions = {
    'mathematics': `${gradeText} ${subjectText} - Page ${page} showing mathematical concepts, diagrams, formulas, or problem-solving examples`,
    'science': `${gradeText} ${subjectText} - Page ${page} containing scientific diagrams, experiments, concepts, or illustrations`,
    'english': `${gradeText} ${subjectText} - Page ${page} with reading passages, grammar exercises, or literary content`,
    'hindi': `${gradeText} ${subjectText} - Page ${page} containing Hindi text, grammar, or literature`,
    'social_studies': `${gradeText} ${subjectText} - Page ${page} with maps, historical events, geographical information, or social concepts`,
    'history': `${gradeText} ${subjectText} - Page ${page} showing historical events, timelines, or historical figures`,
    'geography': `${gradeText} ${subjectText} - Page ${page} with maps, geographical features, or environmental concepts`,
    'chemistry': `${gradeText} ${subjectText} - Page ${page} containing chemical formulas, molecular structures, or laboratory experiments`,
    'physics': `${gradeText} ${subjectText} - Page ${page} with physics diagrams, formulas, or scientific concepts`,
    'biology': `${gradeText} ${subjectText} - Page ${page} showing biological diagrams, cell structures, or living organisms`,
    'accountancy': `${gradeText} ${subjectText} - Page ${page} with accounting principles, financial statements, or business concepts`,
    'economics': `${gradeText} ${subjectText} - Page ${page} containing economic theories, graphs, or financial concepts`,
    'business_studies': `${gradeText} ${subjectText} - Page ${page} with business concepts, management principles, or organizational structures`,
    'computer_science': `${gradeText} ${subjectText} - Page ${page} showing programming concepts, computer diagrams, or technology illustrations`,
    'sanskrit': `${gradeText} ${subjectText} - Page ${page} with Sanskrit text, grammar, or classical literature`,
    'arts': `${gradeText} ${subjectText} - Page ${page} containing artistic concepts, creative exercises, or cultural content`,
    'physical_education': `${gradeText} ${subjectText} - Page ${page} with sports diagrams, fitness concepts, or health information`
  };
  
  return descriptions[subject] || `${gradeText} ${subjectText} - Page ${page} from ${bookName}`;
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
    
    // Extract ALL pages from the book
    for (let page = 1; page <= pageCount; page++) {
      const imgFileName = `${pdfName}-page-${page.toString().padStart(3, '0')}.jpg`;
      const imgPath = path.join(bookDir, imgFileName);
      const relativeImgPath = path.relative(outputDir, imgPath);
      
      try {
        // Try to extract using pdftoppm with JPG format
        await execAsync(`pdftoppm -jpeg -f ${page} -l ${page} "${pdfPath}" "${path.join(bookDir, pdfName + '-page')}"`);
        
        // Rename the output file to our desired name
        const tempFile = path.join(bookDir, `${pdfName}-page-${page.toString().padStart(3, '0')}-1.jpg`);
        if (fs.existsSync(tempFile)) {
          fs.renameSync(tempFile, imgPath);
        }
        
        const description = generateDescription(subject, grade, page, pdfName);
        
        images.push({
          file: pdfName,
          page: page,
          imgPath: relativeImgPath,
          fullPath: relativePath,
          subject: subject,
          grade: grade,
          description: description,
          tags: [subject, `class-${grade}`, `page-${page}`, 'ncert', 'textbook'],
          extracted: true
        });
        
        if (page % 10 === 0) {
          console.log(`    Extracted page ${page}/${pageCount}`);
        }
      } catch (e) {
        console.log(`    Failed to extract page ${page}: ${e.message}`);
        // Create placeholder entry for failed extraction
        images.push({
          file: pdfName,
          page: page,
          imgPath: `placeholder_images/placeholder.jpg`,
          fullPath: relativePath,
          subject: subject,
          grade: grade,
          description: generateDescription(subject, grade, page, pdfName),
          tags: [subject, `class-${grade}`, `page-${page}`, 'ncert', 'textbook'],
          extracted: false,
          error: e.message
        });
      }
    }
    
    console.log(`  Completed ${pdfName}: ${images.length} pages processed`);
    return images;
    
  } catch (e) {
    console.error(`Failed to process ${pdfName}:`, e.message);
    return [];
  }
}

async function main() {
  console.log('Starting comprehensive image extraction from NCERT Books...');
  
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
  let totalPages = 0;
  
  // Process ALL books (not just 200)
  for (const pdfPath of pdfFiles) {
    try {
      const images = await extractImagesFromPDF(pdfPath);
      allImages.push(...images);
      totalPages += images.length;
      processedCount++;
      
      console.log(`Progress: ${processedCount}/${pdfFiles.length} books, ${totalPages} total pages`);
      
      // Save progress every 10 books
      if (processedCount % 10 === 0) {
        fs.writeFileSync(indexPath, JSON.stringify(allImages, null, 2));
        console.log(`Progress saved: ${allImages.length} images indexed`);
      }
      
    } catch (e) {
      console.error(`Failed to process ${pdfPath}:`, e.message);
    }
  }
  
  // Final save
  fs.writeFileSync(indexPath, JSON.stringify(allImages, null, 2));
  
  console.log('\n=== EXTRACTION COMPLETE ===');
  console.log(`Total books processed: ${processedCount}`);
  console.log(`Total pages extracted: ${totalPages}`);
  console.log(`Successfully extracted: ${allImages.filter(img => img.extracted).length}`);
  console.log(`Placeholder entries: ${allImages.filter(img => !img.extracted).length}`);
  console.log(`Image index saved to: ${indexPath}`);
  
  // Summary by subject
  const subjectCounts = {};
  allImages.forEach(img => {
    subjectCounts[img.subject] = (subjectCounts[img.subject] || 0) + 1;
  });
  
  console.log('\n=== BREAKDOWN BY SUBJECT ===');
  Object.entries(subjectCounts).forEach(([subject, count]) => {
    console.log(`${subject}: ${count} pages`);
  });
}

main().catch(console.error); 
