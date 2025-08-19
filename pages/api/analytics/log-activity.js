// API endpoint to log user activity
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
            sessionId,
            activityType,
            activityDetails,
            pageUrl,
            durationSeconds
        } = req.body;

        if (!userId || !sessionId || !activityType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Call the database function to log activity
        const { error } = await supabase.rpc('log_user_activity', {
            p_user_id: userId,
            p_session_id: sessionId,
            p_activity_type: activityType,
            p_activity_details: activityDetails,
            p_page_url: pageUrl,
            p_duration_seconds: durationSeconds
        });

        if (error) {
            console.error('Database error logging activity:', error);
            return res.status(500).json({ error: 'Failed to log activity' });
        }

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error logging activity:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
