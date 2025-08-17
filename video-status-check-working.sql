-- Video Database Status Check (WORKING)
-- This script will show you the current status of your videos

-- Check total number of videos
SELECT 
  'Total Videos' as metric,
  COUNT(*)::text as count
FROM videos;

-- Check videos by validation status
SELECT 
  'Videos by Status: ' || COALESCE(validation_status, 'NULL') as metric,
  COUNT(*)::text as count
FROM videos 
GROUP BY validation_status;

-- Check videos by subject and class level
SELECT 
  subject || ' - Class ' || class_level as metric,
  COUNT(*)::text as count
FROM videos 
GROUP BY subject, class_level
ORDER BY subject, class_level;

-- Show sample of unvalidated videos
SELECT 
  video_id,
  title,
  subject,
  class_level,
  topic,
  channel,
  is_validated,
  validation_status
FROM videos 
WHERE is_validated = false OR is_validated IS NULL
ORDER BY subject, class_level, topic
LIMIT 10;
