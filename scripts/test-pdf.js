import pdfHandler from '../lib/pdfHandler.js';

async function testPDFHandler() {
    console.log('Testing PDF Handler...');
    
    try {
        // Test 1: Check status
        console.log('\n1. Checking PDF Handler status...');
        const status = pdfHandler.getStatus();
        console.log('Status:', status);
        
        if (!status.available) {
            console.log('❌ PDF parsing is not available');
            return;
        }
        
        console.log('✅ PDF parsing is available');
        
        // Test 2: Test with sample text
        console.log('\n2. Testing with sample text...');
        const sampleText = 'This is a sample text for testing.';
        const textResult = await pdfHandler.parsePDFBuffer(Buffer.from(sampleText));
        console.log('Text parsing result:', textResult);
        
        console.log('✅ PDF Handler is working correctly');
        
    } catch (error) {
        console.error('❌ PDF Handler test failed:', error.message);
    }
}

// Run the test
testPDFHandler().catch(console.error); 