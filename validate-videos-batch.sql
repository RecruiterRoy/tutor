-- Video Validation Script
-- This will mark videos as validated for testing

-- Option 1: Mark all videos as validated (for testing)
UPDATE videos 
SET 
  is_validated = true,
  validation_status = 'validated',
  validation_date = NOW(),
  validation_method = 'manual_validation',
  validation_details = '{"method": "manual", "notes": "Marked as validated for testing"}'
WHERE is_validated = false OR is_validated IS NULL;

-- Option 2: Mark only specific subjects as validated
-- UPDATE videos 
-- SET 
--   is_validated = true,
--   validation_status = 'validated',
--   validation_date = NOW(),
--   validation_method = 'manual_validation',
--   validation_details = '{"method": "manual", "notes": "Marked as validated for testing"}'
-- WHERE (is_validated = false OR is_validated IS NULL)
--   AND subject = 'mathematics';

-- Check validation results
SELECT 
  'Validation Complete' as status,
  COUNT(*) as total_videos,
  COUNT(CASE WHEN is_validated = true THEN 1 END) as validated_videos,
  COUNT(CASE WHEN is_validated = false OR is_validated IS NULL THEN 1 END) as unvalidated_videos
FROM videos;
