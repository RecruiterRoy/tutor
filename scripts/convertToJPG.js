import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const extractedImagesDir = path.resolve('./extracted_images');

// Check if ImageMagick is available
async function checkImageMagick() {
    try {
        await execAsync('magick --version');
        return true;
    } catch (error) {
        try {
            await execAsync('convert --version');
            return true;
        } catch (error2) {
            return false;
        }
    }
}

// Convert PNG to JPG using ImageMagick
async function convertPNGtoJPG(pngPath, jpgPath, quality = 85) {
    try {
        // Create directory if it doesn't exist
        const jpgDir = path.dirname(jpgPath);
        if (!fs.existsSync(jpgDir)) {
            fs.mkdirSync(jpgDir, { recursive: true });
        }
        
        // Use ImageMagick to convert PNG to JPG
        await execAsync(`magick "${pngPath}" -quality ${quality} "${jpgPath}"`);
        
        // Verify the JPG was created
        if (fs.existsSync(jpgPath)) {
            const originalSize = fs.statSync(pngPath).size;
            const newSize = fs.statSync(jpgPath).size;
            const compressionRatio = ((originalSize - newSize) / originalSize * 100).toFixed(1);
            
            return {
                success: true,
                originalSize,
                newSize,
                compressionRatio: parseFloat(compressionRatio)
            };
        } else {
            throw new Error('JPG file was not created');
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Find all PNG files recursively
function findPNGFiles(dir) {
    const pngFiles = [];
    
    function traverse(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (item.toLowerCase().endsWith('.png')) {
                pngFiles.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return pngFiles;
}

// Update index.json to reflect JPG paths
function updateIndexForJPG(indexPath) {
    if (!fs.existsSync(indexPath)) {
        console.log('⚠️  index.json not found, skipping index update');
        return;
    }
    
    try {
        const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        let updatedCount = 0;
        
        indexData.forEach(item => {
            if (item.imgPath && item.imgPath.endsWith('.png')) {
                const oldPath = item.imgPath;
                const newPath = oldPath.replace(/\.png$/i, '.jpg');
                item.imgPath = newPath;
                updatedCount++;
            }
        });
        
        fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
        console.log(`✅ Updated ${updatedCount} entries in index.json`);
        
    } catch (error) {
        console.error('❌ Error updating index.json:', error.message);
    }
}

async function main() {
    console.log('🔄 Starting PNG to JPG conversion...\n');
    
    // Check if extracted_images directory exists
    if (!fs.existsSync(extractedImagesDir)) {
        console.log('❌ extracted_images directory not found!');
        console.log('Please run the image extraction script first.');
        return;
    }
    
    // Check if ImageMagick is available
    const hasImageMagick = await checkImageMagick();
    if (!hasImageMagick) {
        console.log('❌ ImageMagick not found!');
        console.log('Please install ImageMagick to convert images:');
        console.log('  Windows: Download from https://imagemagick.org/script/download.php');
        console.log('  macOS: brew install imagemagick');
        console.log('  Linux: sudo apt-get install imagemagick');
        return;
    }
    
    console.log('✅ ImageMagick found, proceeding with conversion...\n');
    
    // Find all PNG files
    const pngFiles = findPNGFiles(extractedImagesDir);
    console.log(`Found ${pngFiles.length} PNG files to convert`);
    
    if (pngFiles.length === 0) {
        console.log('✅ No PNG files found - nothing to convert!');
        return;
    }
    
    // Conversion statistics
    let successCount = 0;
    let errorCount = 0;
    let totalOriginalSize = 0;
    let totalNewSize = 0;
    const errors = [];
    
    console.log('\n=== CONVERTING PNG TO JPG ===');
    
    for (let i = 0; i < pngFiles.length; i++) {
        const pngPath = pngFiles[i];
        const jpgPath = pngPath.replace(/\.png$/i, '.jpg');
        const relativePath = path.relative(extractedImagesDir, pngPath);
        
        console.log(`[${i + 1}/${pngFiles.length}] Converting: ${relativePath}`);
        
        const result = await convertPNGtoJPG(pngPath, jpgPath);
        
        if (result.success) {
            successCount++;
            totalOriginalSize += result.originalSize;
            totalNewSize += result.newSize;
            
            console.log(`  ✅ Success (${result.compressionRatio}% smaller)`);
            
            // Optionally delete the original PNG file
            // Uncomment the next line if you want to delete PNG files after conversion
            // fs.unlinkSync(pngPath);
            
        } else {
            errorCount++;
            errors.push({ file: relativePath, error: result.error });
            console.log(`  ❌ Failed: ${result.error}`);
        }
        
        // Progress update every 10 files
        if ((i + 1) % 10 === 0) {
            console.log(`  Progress: ${i + 1}/${pngFiles.length} (${((i + 1) / pngFiles.length * 100).toFixed(1)}%)`);
        }
    }
    
    // Final statistics
    console.log('\n=== CONVERSION COMPLETE ===');
    console.log(`Total files processed: ${pngFiles.length}`);
    console.log(`Successful conversions: ${successCount}`);
    console.log(`Failed conversions: ${errorCount}`);
    
    if (successCount > 0) {
        const totalOriginalMB = (totalOriginalSize / (1024 * 1024)).toFixed(2);
        const totalNewMB = (totalNewSize / (1024 * 1024)).toFixed(2);
        const totalSavedMB = ((totalOriginalSize - totalNewSize) / (1024 * 1024)).toFixed(2);
        const overallCompression = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);
        
        console.log(`\n=== STORAGE SAVINGS ===`);
        console.log(`Original size: ${totalOriginalMB} MB`);
        console.log(`New size: ${totalNewMB} MB`);
        console.log(`Space saved: ${totalSavedMB} MB (${overallCompression}% reduction)`);
    }
    
    // Show errors if any
    if (errors.length > 0) {
        console.log('\n=== CONVERSION ERRORS ===');
        errors.slice(0, 10).forEach(error => {
            console.log(`❌ ${error.file}: ${error.error}`);
        });
        if (errors.length > 10) {
            console.log(`... and ${errors.length - 10} more errors`);
        }
    }
    
    // Update index.json
    console.log('\n=== UPDATING INDEX ===');
    const indexPath = path.join(extractedImagesDir, 'index.json');
    updateIndexForJPG(indexPath);
    
    console.log('\n✅ PNG to JPG conversion complete!');
    console.log('📝 The dashboard will now use JPG images for better web compatibility.');
}

main().catch(console.error); 