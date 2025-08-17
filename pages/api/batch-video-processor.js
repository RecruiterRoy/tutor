// Batch Video Processor API
// Controls the systematic fetching and saving of videos for all subjects and classes

import { 
  processAllBatches, 
  processSpecificBatch, 
  getBatchProgress, 
  getDatabaseStats,
  SUBJECT_CLASS_COMBINATIONS 
} from './batch-video-fetcher.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, subject, classLevel, targetCount } = req.body;

    console.log('🚀 Batch Video Processor API called:', action);

    switch (action) {
      case 'start_all_batches':
        // Start processing all subject-class combinations
        console.log('🎯 Starting all batch processing...');
        
        // Start the process in background (non-blocking)
        processAllBatches().then(result => {
          console.log('✅ All batches completed:', result);
        }).catch(error => {
          console.error('❌ All batches failed:', error);
        });
        
        return res.status(200).json({
          success: true,
          message: 'Batch processing started in background',
          totalCombinations: SUBJECT_CLASS_COMBINATIONS.length,
          combinations: SUBJECT_CLASS_COMBINATIONS
        });

      case 'process_specific':
        if (!subject || !classLevel) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing subject or classLevel' 
          });
        }
        
        console.log(`🎯 Processing specific batch: ${subject} class ${classLevel}`);
        const result = await processSpecificBatch(subject, classLevel, targetCount || 20);
        
        return res.status(200).json({
          success: true,
          data: result
        });

      case 'get_progress':
        const progress = getBatchProgress();
        return res.status(200).json({
          success: true,
          data: progress
        });

      case 'get_stats':
        const stats = await getDatabaseStats();
        return res.status(200).json({
          success: true,
          data: stats
        });

      case 'get_combinations':
        return res.status(200).json({
          success: true,
          data: {
            total: SUBJECT_CLASS_COMBINATIONS.length,
            combinations: SUBJECT_CLASS_COMBINATIONS
          }
        });

      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Use: start_all_batches, process_specific, get_progress, get_stats, or get_combinations' 
        });
    }

  } catch (error) {
    console.error('❌ Error in batch video processor:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
