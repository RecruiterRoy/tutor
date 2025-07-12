import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const extractedImagesDir = path.resolve('./extracted_images');
const indexPath = path.join(extractedImagesDir, 'index.json');

async function checkExtractionStatus() {
    console.log('🔍 Checking image extraction status...\n');
    
    // Check if extraction is still running
    try {
        const { stdout } = await execAsync('Get-Process | Where-Object {$_.ProcessName -like "*node*"}');
        const nodeProcesses = stdout.trim().split('\n').filter(line => line.trim());
        
        if (nodeProcesses.length > 0) {
            console.log('🔄 Image extraction is STILL RUNNING');
            console.log('Active Node.js processes:');
            nodeProcesses.forEach(process => {
                console.log(`  ${process}`);
            });
        } else {
            console.log('✅ No Node.js processes found - extraction may be complete');
        }
    } catch (error) {
        console.log('⚠️  Could not check for running processes');
    }
    
    // Check current progress
    if (fs.existsSync(indexPath)) {
        const imageIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        console.log(`\n📊 Current Progress:`);
        console.log(`  📸 Total images extracted: ${imageIndex.length}`);
        
        // Count by subject
        const subjectCounts = {};
        imageIndex.forEach(img => {
            subjectCounts[img.subject] = (subjectCounts[img.subject] || 0) + 1;
        });
        
        console.log('\n📚 Images by Subject:');
        Object.entries(subjectCounts).forEach(([subject, count]) => {
            console.log(`  ${subject}: ${count} images`);
        });
        
        // Count by grade
        const gradeCounts = {};
        imageIndex.forEach(img => {
            gradeCounts[img.grade] = (gradeCounts[img.grade] || 0) + 1;
        });
        
        console.log('\n🎓 Images by Grade:');
        Object.entries(gradeCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([grade, count]) => {
            console.log(`  Class ${grade}: ${count} images`);
        });
        
        // Check for recent activity
        const stats = fs.statSync(indexPath);
        const lastModified = new Date(stats.mtime);
        const timeSinceModified = Date.now() - lastModified.getTime();
        const minutesSinceModified = Math.floor(timeSinceModified / 60000);
        
        console.log(`\n⏰ Last index update: ${lastModified.toLocaleString()} (${minutesSinceModified} minutes ago)`);
        
        if (minutesSinceModified < 5) {
            console.log('🔄 Extraction appears to be actively running');
        } else if (minutesSinceModified < 30) {
            console.log('⏸️  Extraction may have paused or slowed down');
        } else {
            console.log('✅ Extraction appears to be complete');
        }
        
    } else {
        console.log('❌ No image index found - extraction may not have started');
    }
    
    // Check for backup files
    const backupFiles = fs.readdirSync(extractedImagesDir).filter(file => file.startsWith('index_backup_'));
    if (backupFiles.length > 0) {
        console.log(`\n💾 Found ${backupFiles.length} backup files`);
        backupFiles.sort().slice(-3).forEach(backup => {
            const backupPath = path.join(extractedImagesDir, backup);
            const stats = fs.statSync(backupPath);
            console.log(`  ${backup} (${new Date(stats.mtime).toLocaleString()})`);
        });
    }
    
    // Check total PDF count for comparison
    const booksDir = path.resolve('./books/NCERT Books');
    if (fs.existsSync(booksDir)) {
        try {
            const { stdout } = await execAsync('Get-ChildItem -Path "./books/NCERT Books" -Recurse -Filter "*.pdf" | Measure-Object | Select-Object -ExpandProperty Count');
            const totalPDFs = parseInt(stdout.trim());
            console.log(`\n📚 Total PDF files in source: ${totalPDFs}`);
        } catch (error) {
            console.log('⚠️  Could not count PDF files');
        }
    }
    
    // Check disk usage
    try {
        const { stdout } = await execAsync('Get-ChildItem -Path "./extracted_images" -Recurse -File | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum');
        const totalBytes = parseInt(stdout.trim());
        const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
        console.log(`\n💾 Total disk usage: ${totalMB} MB`);
    } catch (error) {
        console.log('⚠️  Could not calculate disk usage');
    }
    
    console.log('\n🎯 === RECOMMENDATIONS ===');
    
    if (fs.existsSync(indexPath)) {
        const imageIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        
        if (imageIndex.length > 1000) {
            console.log('✅ Good progress! Consider uploading to Supabase storage');
            console.log('📝 Run: node scripts/uploadImagesToSupabase.js (after configuring credentials)');
        } else if (imageIndex.length > 100) {
            console.log('📈 Extraction in progress - continue monitoring');
        } else {
            console.log('🚀 Extraction just started - be patient');
        }
    }
    
    console.log('\n📋 === NEXT STEPS ===');
    console.log('1. Wait for extraction to complete (if still running)');
    console.log('2. Configure Supabase credentials in uploadImagesToSupabase.js');
    console.log('3. Upload images to Supabase storage');
    console.log('4. Update dashboard to use new image paths');
    console.log('5. Test image loading in the application');
}

checkExtractionStatus().catch(console.error); 