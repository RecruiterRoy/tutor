// API endpoint for session heartbeat
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

        const { sessionId, lastActivity } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Missing sessionId' });
        }

        // Update session last activity
        const { error } = await supabase
            .from('user_sessions')
            .update({ 
                last_activity: new Date().toISOString()
            })
            .eq('id', sessionId)
            .eq('is_active', true);

        if (error) {
            console.error('Database error updating heartbeat:', error);
            return res.status(500).json({ error: 'Failed to update heartbeat' });
        }

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error updating heartbeat:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
