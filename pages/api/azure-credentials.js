/**
 * Azure Credentials API
 * Provides Azure OCR credentials to the client securely
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get Azure credentials from environment variables
        const subscriptionKey = process.env.AZURE_VISION_KEY;
        const endpoint = process.env.AZURE_VISION_ENDPOINT;

        if (!subscriptionKey || !endpoint) {
            return res.status(500).json({ 
                error: 'Azure OCR credentials not configured in environment variables' 
            });
        }

        // Return credentials to client
        return res.status(200).json({
            subscriptionKey: subscriptionKey,
            endpoint: endpoint,
            maxPagesPerMonth: 5000,
            maxCallsPerMinute: 20,
            freeUserDailyLimit: 5,
            paidUserDailyLimit: 10
        });

    } catch (error) {
        console.error('Azure credentials API error:', error);
        return res.status(500).json({ 
            error: 'Failed to retrieve Azure credentials' 
        });
    }
}
