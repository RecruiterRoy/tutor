-- ===================================
-- USER ANALYTICS SYSTEM
-- Track login sessions, usage time, and user activity
-- ===================================

-- 1. User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN session_end IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (session_end - session_start)) / 60
            ELSE NULL
        END
    ) STORED,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT, -- 'mobile', 'tablet', 'desktop'
    browser TEXT,
    platform TEXT, -- 'windows', 'android', 'ios', 'mac', 'linux'
    screen_resolution TEXT,
    timezone TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    pages_visited INTEGER DEFAULT 0,
    interactions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Activity Log Table  
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'login', 'logout', 'page_view', 'chat', 'quiz', 'ocr', 'mic_use'
    activity_details JSONB,
    page_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER
);

-- 3. Daily Usage Summary Table
CREATE TABLE IF NOT EXISTS user_daily_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    total_time_minutes INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    first_login TIMESTAMP WITH TIME ZONE,
    last_logout TIMESTAMP WITH TIME ZONE,
    pages_visited INTEGER DEFAULT 0,
    chats_sent INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    ocr_scans INTEGER DEFAULT 0,
    mic_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 4. Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_duration ON user_sessions(duration_minutes);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_session_id ON user_activity_log(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity_log(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_daily_usage_user_id ON user_daily_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_usage_date ON user_daily_usage(date);

-- 5. Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to daily usage table
DROP TRIGGER IF EXISTS update_user_daily_usage_updated_at ON user_daily_usage;
CREATE TRIGGER update_user_daily_usage_updated_at
    BEFORE UPDATE ON user_daily_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Functions for Analytics

-- Function to start a new session
CREATE OR REPLACE FUNCTION start_user_session(
    p_user_id UUID,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_type TEXT DEFAULT NULL,
    p_browser TEXT DEFAULT NULL,
    p_platform TEXT DEFAULT NULL,
    p_screen_resolution TEXT DEFAULT NULL,
    p_timezone TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    session_id UUID;
BEGIN
    -- End any existing active sessions for this user
    UPDATE user_sessions 
    SET session_end = NOW(), 
        is_active = FALSE 
    WHERE user_id = p_user_id AND is_active = TRUE;

    -- Create new session
    INSERT INTO user_sessions (
        user_id, ip_address, user_agent, device_type, 
        browser, platform, screen_resolution, timezone
    ) VALUES (
        p_user_id, p_ip_address, p_user_agent, p_device_type,
        p_browser, p_platform, p_screen_resolution, p_timezone
    ) RETURNING id INTO session_id;

    -- Log login activity
    INSERT INTO user_activity_log (user_id, session_id, activity_type, activity_details)
    VALUES (p_user_id, session_id, 'login', jsonb_build_object(
        'device_type', p_device_type,
        'browser', p_browser,
        'platform', p_platform
    ));

    -- Update daily usage
    INSERT INTO user_daily_usage (user_id, date, sessions_count, first_login)
    VALUES (p_user_id, CURRENT_DATE, 1, NOW())
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
        sessions_count = user_daily_usage.sessions_count + 1,
        first_login = CASE 
            WHEN user_daily_usage.first_login IS NULL THEN NOW()
            ELSE user_daily_usage.first_login
        END;

    RETURN session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to end a session
CREATE OR REPLACE FUNCTION end_user_session(p_session_id UUID) 
RETURNS VOID AS $$
DECLARE
    session_user_id UUID;
    session_start_time TIMESTAMP WITH TIME ZONE;
    session_duration INTEGER;
BEGIN
    -- Get session info and end it
    UPDATE user_sessions 
    SET session_end = NOW(), 
        is_active = FALSE,
        last_activity = NOW()
    WHERE id = p_session_id AND is_active = TRUE
    RETURNING user_id, session_start INTO session_user_id, session_start_time;

    IF session_user_id IS NOT NULL THEN
        -- Calculate duration
        session_duration := EXTRACT(EPOCH FROM (NOW() - session_start_time)) / 60;

        -- Log logout activity
        INSERT INTO user_activity_log (user_id, session_id, activity_type, activity_details)
        VALUES (session_user_id, p_session_id, 'logout', jsonb_build_object(
            'duration_minutes', session_duration
        ));

        -- Update daily usage
        UPDATE user_daily_usage 
        SET 
            total_time_minutes = total_time_minutes + session_duration,
            last_logout = NOW()
        WHERE user_id = session_user_id AND date = CURRENT_DATE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_session_id UUID,
    p_activity_type TEXT,
    p_activity_details JSONB DEFAULT NULL,
    p_page_url TEXT DEFAULT NULL,
    p_duration_seconds INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Insert activity log
    INSERT INTO user_activity_log (
        user_id, session_id, activity_type, activity_details, 
        page_url, duration_seconds
    ) VALUES (
        p_user_id, p_session_id, p_activity_type, p_activity_details,
        p_page_url, p_duration_seconds
    );

    -- Update session last activity
    UPDATE user_sessions 
    SET last_activity = NOW(), 
        interactions_count = interactions_count + 1
    WHERE id = p_session_id;

    -- Update daily usage counters
    UPDATE user_daily_usage 
    SET 
        pages_visited = CASE WHEN p_activity_type = 'page_view' THEN pages_visited + 1 ELSE pages_visited END,
        chats_sent = CASE WHEN p_activity_type = 'chat' THEN chats_sent + 1 ELSE chats_sent END,
        quizzes_completed = CASE WHEN p_activity_type = 'quiz' THEN quizzes_completed + 1 ELSE quizzes_completed END,
        ocr_scans = CASE WHEN p_activity_type = 'ocr' THEN ocr_scans + 1 ELSE ocr_scans END,
        mic_uses = CASE WHEN p_activity_type = 'mic_use' THEN mic_uses + 1 ELSE mic_uses END
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    total_sessions INTEGER,
    total_time_hours NUMERIC,
    avg_session_minutes NUMERIC,
    last_login TIMESTAMP WITH TIME ZONE,
    days_active INTEGER,
    total_chats INTEGER,
    total_quizzes INTEGER,
    total_ocr_scans INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.email,
        COALESCE(u.raw_user_meta_data->>'full_name', 'Unknown') as full_name,
        COALESCE(session_stats.total_sessions, 0)::INTEGER as total_sessions,
        COALESCE(ROUND(session_stats.total_time_hours, 2), 0) as total_time_hours,
        COALESCE(ROUND(session_stats.avg_session_minutes, 1), 0) as avg_session_minutes,
        session_stats.last_login,
        COALESCE(daily_stats.days_active, 0)::INTEGER as days_active,
        COALESCE(daily_stats.total_chats, 0)::INTEGER as total_chats,
        COALESCE(daily_stats.total_quizzes, 0)::INTEGER as total_quizzes,
        COALESCE(daily_stats.total_ocr_scans, 0)::INTEGER as total_ocr_scans
    FROM auth.users u
    LEFT JOIN (
        SELECT 
            us.user_id,
            COUNT(*) as total_sessions,
            SUM(duration_minutes) / 60.0 as total_time_hours,
            AVG(duration_minutes) as avg_session_minutes,
            MAX(session_start) as last_login
        FROM user_sessions us
        WHERE us.session_start::DATE BETWEEN p_start_date AND p_end_date
        GROUP BY us.user_id
    ) session_stats ON u.id = session_stats.user_id
    LEFT JOIN (
        SELECT 
            ud.user_id,
            COUNT(*) as days_active,
            SUM(chats_sent) as total_chats,
            SUM(quizzes_completed) as total_quizzes,
            SUM(ocr_scans) as total_ocr_scans
        FROM user_daily_usage ud
        WHERE ud.date BETWEEN p_start_date AND p_end_date
        GROUP BY ud.user_id
    ) daily_stats ON u.id = daily_stats.user_id
    WHERE session_stats.user_id IS NOT NULL
    ORDER BY session_stats.total_time_hours DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to get detailed session history for a user
CREATE OR REPLACE FUNCTION get_user_session_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
    session_id UUID,
    session_start TIMESTAMP WITH TIME ZONE,
    session_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    device_type TEXT,
    browser TEXT,
    platform TEXT,
    interactions_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.id as session_id,
        us.session_start,
        us.session_end,
        us.duration_minutes,
        us.device_type,
        us.browser,
        us.platform,
        us.interactions_count
    FROM user_sessions us
    WHERE us.user_id = p_user_id
    ORDER BY us.session_start DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get real-time active users
CREATE OR REPLACE FUNCTION get_active_users()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    session_start TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,
    minutes_online INTEGER,
    device_type TEXT,
    platform TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.email,
        COALESCE(u.raw_user_meta_data->>'full_name', 'Unknown') as full_name,
        us.session_start,
        us.last_activity,
        EXTRACT(EPOCH FROM (NOW() - us.session_start))::INTEGER / 60 as minutes_online,
        us.device_type,
        us.platform
    FROM user_sessions us
    JOIN auth.users u ON us.user_id = u.id
    WHERE us.is_active = TRUE 
    AND us.last_activity > NOW() - INTERVAL '10 minutes'
    ORDER BY us.last_activity DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. Row Level Security Policies

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_usage ENABLE ROW LEVEL SECURITY;

-- Admin policies (can see all data)
CREATE POLICY "Admins can manage all sessions" ON user_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can manage all activity logs" ON user_activity_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can manage all daily usage" ON user_daily_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- User policies (can only see their own data)
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity" ON user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily usage" ON user_daily_usage
    FOR SELECT USING (auth.uid() = user_id);

-- 8. Grant permissions
GRANT ALL ON user_sessions TO authenticated;
GRANT ALL ON user_activity_log TO authenticated;
GRANT ALL ON user_daily_usage TO authenticated;

GRANT EXECUTE ON FUNCTION start_user_session(UUID, INET, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION end_user_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity(UUID, UUID, TEXT, JSONB, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analytics_summary(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_session_history(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_users() TO authenticated;

-- 9. Create a cleanup function to remove old data
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS VOID AS $$
BEGIN
    -- Delete activity logs older than 1 year
    DELETE FROM user_activity_log 
    WHERE timestamp < NOW() - INTERVAL '1 year';
    
    -- Delete daily usage older than 2 years
    DELETE FROM user_daily_usage 
    WHERE date < CURRENT_DATE - INTERVAL '2 years';
    
    -- Delete sessions older than 1 year
    DELETE FROM user_sessions 
    WHERE session_start < NOW() - INTERVAL '1 year';
    
    RAISE NOTICE 'Old analytics data cleaned up successfully';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension - optional)
-- SELECT cron.schedule('cleanup-analytics', '0 2 * * 0', 'SELECT cleanup_old_analytics_data();');

COMMIT;
