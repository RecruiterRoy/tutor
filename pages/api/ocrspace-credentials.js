/**
 * OCR.Space Credentials API
 * Provides OCR.Space API key to the client securely
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get OCR.Space API key from environment variables
        const apiKey = process.env.OCRSPACE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ 
                error: 'OCR.Space API key not configured in environment variables' 
            });
        }

        // Return API key to client
        return res.status(200).json({
            apiKey: apiKey,
            apiUrl: 'https://api.ocr.space/parse/image',
            features: {
                unlimitedProcessing: true,
                languageSupport: ['eng', 'hin'],
                advancedEngine: true
            }
        });

    } catch (error) {
        console.error('OCR.Space credentials API error:', error);
        return res.status(500).json({ 
            error: 'Failed to retrieve OCR.Space credentials' 
        });
    }
}
