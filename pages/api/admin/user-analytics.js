// Admin API endpoint to get user analytics data
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
        );

        // Verify admin access
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid authentication' });
        }

        // Check if user is admin
        const { data: userData } = await supabase
            .from('auth.users')
            .select('raw_user_meta_data')
            .eq('id', user.id)
            .single();

        if (!userData?.raw_user_meta_data?.role === 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { 
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate = new Date().toISOString().split('T')[0],
            type = 'summary'
        } = req.query;

        let result;

        switch (type) {
            case 'summary':
                // Get user analytics summary
                const { data: summaryData, error: summaryError } = await supabase
                    .rpc('get_user_analytics_summary', {
                        p_start_date: startDate,
                        p_end_date: endDate
                    });

                if (summaryError) {
                    console.error('Error getting analytics summary:', summaryError);
                    return res.status(500).json({ error: 'Failed to get analytics summary' });
                }

                result = {
                    type: 'summary',
                    period: { startDate, endDate },
                    data: summaryData || []
                };
                break;

            case 'active':
                // Get currently active users
                const { data: activeData, error: activeError } = await supabase
                    .rpc('get_active_users');

                if (activeError) {
                    console.error('Error getting active users:', activeError);
                    return res.status(500).json({ error: 'Failed to get active users' });
                }

                result = {
                    type: 'active',
                    timestamp: new Date().toISOString(),
                    data: activeData || []
                };
                break;

            case 'sessions':
                // Get session details for a specific user
                const { userId, limit = 50 } = req.query;
                
                if (!userId) {
                    return res.status(400).json({ error: 'userId required for sessions type' });
                }

                const { data: sessionsData, error: sessionsError } = await supabase
                    .rpc('get_user_session_history', {
                        p_user_id: userId,
                        p_limit: parseInt(limit)
                    });

                if (sessionsError) {
                    console.error('Error getting user sessions:', sessionsError);
                    return res.status(500).json({ error: 'Failed to get user sessions' });
                }

                result = {
                    type: 'sessions',
                    userId: userId,
                    data: sessionsData || []
                };
                break;

            case 'stats':
                // Get overall platform statistics
                const { data: statsData, error: statsError } = await supabase
                    .from('user_daily_usage')
                    .select('*')
                    .gte('date', startDate)
                    .lte('date', endDate);

                if (statsError) {
                    console.error('Error getting platform stats:', statsError);
                    return res.status(500).json({ error: 'Failed to get platform stats' });
                }

                // Calculate aggregated stats
                const totalUsers = new Set(statsData.map(d => d.user_id)).size;
                const totalSessions = statsData.reduce((sum, d) => sum + (d.sessions_count || 0), 0);
                const totalTime = statsData.reduce((sum, d) => sum + (d.total_time_minutes || 0), 0);
                const totalChats = statsData.reduce((sum, d) => sum + (d.chats_sent || 0), 0);
                const totalQuizzes = statsData.reduce((sum, d) => sum + (d.quizzes_completed || 0), 0);
                const totalOcrScans = statsData.reduce((sum, d) => sum + (d.ocr_scans || 0), 0);

                result = {
                    type: 'stats',
                    period: { startDate, endDate },
                    summary: {
                        totalUsers,
                        totalSessions,
                        totalTimeHours: Math.round(totalTime / 60 * 100) / 100,
                        avgSessionTime: totalSessions > 0 ? Math.round(totalTime / totalSessions * 100) / 100 : 0,
                        totalChats,
                        totalQuizzes,
                        totalOcrScans
                    },
                    dailyData: statsData
                };
                break;

            default:
                return res.status(400).json({ error: 'Invalid type parameter' });
        }

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            ...result
        });

    } catch (error) {
        console.error('Error in user analytics API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
