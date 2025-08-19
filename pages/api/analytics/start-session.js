// API endpoint to start a user session
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const {
            userId,
            deviceType,
            browser,
            platform,
            screenResolution,
            timezone,
            userAgent
        } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        // Get client IP
        const ipAddress = req.headers['x-forwarded-for'] || 
                         req.connection.remoteAddress || 
                         req.socket.remoteAddress ||
                         req.headers['x-real-ip'] ||
                         '127.0.0.1';

        // Call the database function to start session
        const { data, error } = await supabase.rpc('start_user_session', {
            p_user_id: userId,
            p_ip_address: ipAddress,
            p_user_agent: userAgent,
            p_device_type: deviceType,
            p_browser: browser,
            p_platform: platform,
            p_screen_resolution: screenResolution,
            p_timezone: timezone
        });

        if (error) {
            console.error('Database error starting session:', error);
            return res.status(500).json({ error: 'Failed to start session' });
        }

        console.log('✅ Session started for user:', userId, 'Session ID:', data);

        return res.status(200).json({
            success: true,
            sessionId: data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error starting session:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
