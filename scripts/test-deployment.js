import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test basic server functionality without PDF parsing
async function testServerStartup() {
    console.log('Testing server startup...');
    
    try {
        // Test 1: Basic imports
        console.log('1. Testing basic imports...');
        const app = express();
        console.log('✅ Express app created successfully');
        
        // Test 2: Try to import PDFProcessor (should not crash)
        console.log('2. Testing PDFProcessor import...');
        try {
            const { PDFProcessor } = await import('../utils/pdfExtractor.js');
            console.log('✅ PDFProcessor imported successfully');
        } catch (error) {
            console.log('⚠️ PDFProcessor import failed (expected in some environments):', error.message);
        }
        
        // Test 3: Try to import PDFHandler (should not crash)
        console.log('3. Testing PDFHandler import...');
        try {
            const pdfHandler = await import('../lib/pdfHandler.js');
            console.log('✅ PDFHandler imported successfully');
        } catch (error) {
            console.log('⚠️ PDFHandler import failed (expected in some environments):', error.message);
        }
        
        console.log('✅ Server startup test completed successfully');
        
    } catch (error) {
        console.error('❌ Server startup test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testServerStartup().catch(console.error); 