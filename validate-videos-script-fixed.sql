-- Video Database Status Check Script (FIXED)
-- Run this to see the current status of your videos

-- Check total number of videos
SELECT 
  'Total Videos' as metric,
  COUNT(*)::text as count
FROM videos

UNION ALL

-- Check videos by validation status
SELECT 
  'Videos by Status: ' || validation_status as metric,
  COUNT(*)::text as count
FROM videos 
GROUP BY validation_status

UNION ALL

-- Check videos by subject and class
SELECT 
  CONCAT(subject, ' - Class ', class_level) as metric,
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
WHERE is_validated = false 
ORDER BY subject, class_level, topic
LIMIT 10;
