// API endpoint to end a user session
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

        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Missing sessionId' });
        }

        // Call the database function to end session
        const { error } = await supabase.rpc('end_user_session', {
            p_session_id: sessionId
        });

        if (error) {
            console.error('Database error ending session:', error);
            return res.status(500).json({ error: 'Failed to end session' });
        }

        console.log('✅ Session ended:', sessionId);

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error ending session:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
