-- Daily Challenge Rankings System for Supabase
-- This file contains the corrected ranking functions and views

-- 1. User Rankings View (for India & City rankings)
CREATE OR REPLACE VIEW user_rankings AS
WITH user_stats AS (
    SELECT 
        dcp.user_id,
        up.city,
        up.full_name,
        dcp.total_points,
        dcp.current_streak,
        dcp.total_correct,
        dcp.total_attempted,
        ROW_NUMBER() OVER (ORDER BY dcp.total_points DESC, dcp.current_streak DESC) as india_rank,
        ROW_NUMBER() OVER (PARTITION BY up.city ORDER BY dcp.total_points DESC, dcp.current_streak DESC) as city_rank
    FROM daily_challenge_progress dcp
    JOIN user_profiles up ON dcp.user_id = up.id
    WHERE dcp.total_attempted > 0
)
SELECT * FROM user_stats;

-- 2. Function to get user's India rank
CREATE OR REPLACE FUNCTION get_user_india_rank(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT india_rank INTO user_rank
    FROM user_rankings
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql;

-- 3. Function to get user's city rank
CREATE OR REPLACE FUNCTION get_user_city_rank(user_uuid UUID, user_city TEXT)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT city_rank INTO user_rank
    FROM user_rankings
    WHERE user_id = user_uuid AND city = user_city;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql;

-- 4. Grant permissions
GRANT SELECT ON user_rankings TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_india_rank(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_city_rank(UUID, TEXT) TO authenticated;
