import fs from 'fs';
import path from 'path';

const extractedImagesDir = path.resolve('./extracted_images');
const indexPath = path.join(extractedImagesDir, 'index_with_supabase.json');
const dashboardPath = path.resolve('./dashboard.html');

function updateDashboardImageLoading() {
    console.log('🔄 Updating dashboard to use extracted images...\n');
    
    if (!fs.existsSync(indexPath)) {
        console.log('❌ Supabase index not found! Please run the upload script first.');
        return;
    }
    
    if (!fs.existsSync(dashboardPath)) {
        console.log('❌ Dashboard file not found!');
        return;
    }
    
    const imageIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(`📸 Found ${imageIndex.length} images in index`);
    
    // Read dashboard content
    let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    // Create the new loadRelevantImages function
    const newLoadRelevantImagesFunction = `
        // Updated to use extracted images from Supabase
        async function loadRelevantImages(subject, grade, topic) {
            try {
                // Load the image index
                const response = await fetch('/extracted_images/index_with_supabase.json');
                if (!response.ok) {
                    throw new Error('Failed to load image index');
                }
                const imageIndex = await response.json();
                
                // Filter images by subject and grade
                let relevantImages = imageIndex.filter(img => 
                    img.subject === subject && 
                    img.grade === grade.toString() &&
                    img.uploaded === true
                );
                
                // If topic is provided, try to find more specific matches
                if (topic && topic.trim()) {
                    const topicWords = topic.toLowerCase().split('\\s+');
                    const topicRelevant = relevantImages.filter(img => {
                        const description = img.description.toLowerCase();
                        return topicWords.some(word => description.includes(word));
                    });
                    
                    // Use topic-relevant images if found, otherwise use all subject/grade images
                    if (topicRelevant.length > 0) {
                        relevantImages = topicRelevant;
                    }
                }
                
                // Limit to 5 images and format for display
                return relevantImages.slice(0, 5).map(img => ({
                    url: img.supabaseUrl || \`/extracted_images/\${img.imgPath}\`,
                    description: img.description,
                    subject: img.subject,
                    grade: img.grade,
                    page: img.page,
                    imageIndex: img.imageIndex
                }));
                
            } catch (error) {
                console.error('Error loading images:', error);
                return [];
            }
        }
    `;
    
    // Find and replace the existing loadRelevantImages function
    const loadRelevantImagesRegex = /async function loadRelevantImages\([^)]*\)\s*\{[\s\S]*?\}/;
    
    if (loadRelevantImagesRegex.test(dashboardContent)) {
        dashboardContent = dashboardContent.replace(loadRelevantImagesRegex, newLoadRelevantImagesFunction);
        console.log('✅ Updated loadRelevantImages function');
    } else {
        // If function doesn't exist, add it before the closing script tag
        const scriptClosingIndex = dashboardContent.lastIndexOf('</script>');
        if (scriptClosingIndex !== -1) {
            dashboardContent = dashboardContent.slice(0, scriptClosingIndex) + 
                             newLoadRelevantImagesFunction + '\n    ' +
                             dashboardContent.slice(scriptClosingIndex);
            console.log('✅ Added loadRelevantImages function');
        } else {
            console.log('❌ Could not find script closing tag');
            return;
        }
    }
    
    // Create a backup of the original dashboard
    const backupPath = dashboardPath + '.backup.' + new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(backupPath, fs.readFileSync(dashboardPath, 'utf8'));
    console.log(`💾 Created backup: ${backupPath}`);
    
    // Write the updated dashboard
    fs.writeFileSync(dashboardPath, dashboardContent);
    console.log('✅ Dashboard updated successfully');
    
    // Create a simple API endpoint for image serving
    const apiEndpoint = `
        // Add this to your server.js or create a new API file
        app.get('/api/images', async (req, res) => {
            try {
                const { subject, grade, topic } = req.query;
                
                // Load image index
                const imageIndex = JSON.parse(fs.readFileSync('./extracted_images/index_with_supabase.json', 'utf8'));
                
                // Filter images
                let relevantImages = imageIndex.filter(img => 
                    img.subject === subject && 
                    img.grade === grade &&
                    img.uploaded === true
                );
                
                // Apply topic filtering if provided
                if (topic) {
                    const topicWords = topic.toLowerCase().split('\\s+');
                    const topicRelevant = relevantImages.filter(img => {
                        const description = img.description.toLowerCase();
                        return topicWords.some(word => description.includes(word));
                    });
                    
                    if (topicRelevant.length > 0) {
                        relevantImages = topicRelevant;
                    }
                }
                
                // Return formatted images
                const formattedImages = relevantImages.slice(0, 10).map(img => ({
                    url: img.supabaseUrl || \`/extracted_images/\${img.imgPath}\`,
                    description: img.description,
                    subject: img.subject,
                    grade: img.grade,
                    page: img.page,
                    imageIndex: img.imageIndex
                }));
                
                res.json(formattedImages);
                
            } catch (error) {
                console.error('Image API error:', error);
                res.status(500).json({ error: 'Failed to load images' });
            }
        });
    `;
    
    console.log('\n📝 === API ENDPOINT CODE ===');
    console.log('Add this to your server.js file:');
    console.log(apiEndpoint);
    
    console.log('\n🎯 === NEXT STEPS ===');
    console.log('1. Configure your Supabase credentials in uploadImagesToSupabase.js');
    console.log('2. Run the upload script: node scripts/uploadImagesToSupabase.js');
    console.log('3. Add the API endpoint to your server.js');
    console.log('4. Test image loading in the dashboard');
}

updateDashboardImageLoading(); 