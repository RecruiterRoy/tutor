/**
 * Azure OCR API Endpoint
 * Handles OCR requests with daily limits and fallback to free OCR
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get Azure credentials from environment
        const subscriptionKey = process.env.AZURE_VISION_KEY;
        const endpoint = process.env.AZURE_VISION_ENDPOINT;

        if (!subscriptionKey || !endpoint) {
            return res.status(500).json({ 
                error: 'Azure OCR not configured',
                fallback: true 
            });
        }

        // Get image data from request
        const { imageData, imageType } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(imageData, 'base64');

        // Prepare Azure OCR request
        const url = `${endpoint}/vision/v3.2/read/analyze`;
        const headers = {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': subscriptionKey
        };

        // Send initial request to Azure
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: imageBuffer
        });

        if (!response.ok) {
            throw new Error(`Azure OCR request failed: ${response.status} ${response.statusText}`);
        }

        // Get operation location for polling
        const operationLocation = response.headers.get('Operation-Location');
        if (!operationLocation) {
            throw new Error('No operation location received from Azure');
        }

        // Poll for results
        const result = await pollForResults(operationLocation, subscriptionKey);

        // Extract and return text
        const extractedText = extractTextFromResult(result);

        return res.status(200).json({
            success: true,
            text: extractedText.text,
            confidence: extractedText.confidence,
            pages: extractedText.pages,
            source: 'azure'
        });

    } catch (error) {
        console.error('Azure OCR API error:', error);
        
        return res.status(500).json({
            error: error.message,
            fallback: true,
            message: 'Azure OCR failed. Please try free OCR instead.'
        });
    }
}

// Poll for OCR results
async function pollForResults(operationLocation, subscriptionKey) {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(operationLocation, {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                }
            });

            if (!response.ok) {
                throw new Error(`Polling failed: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'succeeded') {
                return result;
            } else if (result.status === 'failed') {
                throw new Error('OCR processing failed');
            }

            // Wait 1 second before next poll
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;

        } catch (error) {
            console.error('Polling error:', error);
            throw error;
        }
    }

    throw new Error('OCR processing timeout');
}

// Extract text from Azure OCR result
function extractTextFromResult(result) {
    try {
        const extractedText = [];
        
        if (result.analyzeResult && result.analyzeResult.readResults) {
            result.analyzeResult.readResults.forEach(page => {
                page.lines.forEach(line => {
                    extractedText.push(line.text);
                });
            });
        }

        const confidence = calculateAverageConfidence(result);

        return {
            text: extractedText.join('\n'),
            confidence: confidence,
            pages: result.analyzeResult?.readResults?.length || 1
        };

    } catch (error) {
        console.error('Error extracting text from result:', error);
        throw new Error('Failed to parse OCR result');
    }
}

// Calculate average confidence from OCR result
function calculateAverageConfidence(result) {
    try {
        let totalConfidence = 0;
        let confidenceCount = 0;

        if (result.analyzeResult && result.analyzeResult.readResults) {
            result.analyzeResult.readResults.forEach(page => {
                page.lines.forEach(line => {
                    if (line.confidence !== undefined) {
                        totalConfidence += line.confidence;
                        confidenceCount++;
                    }
                });
            });
        }

        return confidenceCount > 0 ? (totalConfidence / confidenceCount) * 100 : 0;
    } catch (error) {
        return 0;
    }
}
