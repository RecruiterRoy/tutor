// API to validate all videos in the expanded database
import { videoValidator } from './video-validator.js';
import { expandedVideoDatabase, getTotalVideoCount } from './expanded-video-database.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting validation of expanded video database...');
    
    // Extract all videos from the database
    const allVideos = [];
    for (const [subject, subjectData] of Object.entries(expandedVideoDatabase)) {
      for (const [classLevel, classData] of Object.entries(subjectData)) {
        for (const [topic, videos] of Object.entries(classData)) {
          for (const video of videos) {
            allVideos.push({
              ...video,
              subject,
              classLevel,
              topic
            });
          }
        }
      }
    }

    console.log(`📊 Total videos to validate: ${allVideos.length}`);
    
    // Validate all videos in batches
    const batchSize = 10; // Process 10 videos at a time
    const results = {
      valid: [],
      invalid: [],
      total: allVideos.length,
      startTime: Date.now()
    };

    for (let i = 0; i < allVideos.length; i += batchSize) {
      const batch = allVideos.slice(i, i + batchSize);
      console.log(`🔍 Validating batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allVideos.length/batchSize)}`);
      
      const batchResults = await videoValidator.validateBatch(batch);
      results.valid.push(...batchResults.valid);
      results.invalid.push(...batchResults.invalid);
      
      // Small delay between batches
      if (i + batchSize < allVideos.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    results.successRate = (results.valid.length / results.total) * 100;

    // Create validated database with only working videos
    const validatedDatabase = {};
    
    for (const video of results.valid) {
      const { subject, classLevel, topic, ...videoData } = video;
      
      if (!validatedDatabase[subject]) {
        validatedDatabase[subject] = {};
      }
      if (!validatedDatabase[subject][classLevel]) {
        validatedDatabase[subject][classLevel] = {};
      }
      if (!validatedDatabase[subject][classLevel][topic]) {
        validatedDatabase[subject][classLevel][topic] = [];
      }
      
      validatedDatabase[subject][classLevel][topic].push(videoData);
    }

    // Generate summary statistics
    const summary = {
      original: {
        total: results.total,
        subjects: Object.keys(expandedVideoDatabase).length
      },
      validated: {
        total: results.valid.length,
        successRate: results.successRate.toFixed(1) + '%',
        subjects: Object.keys(validatedDatabase).length
      },
      failed: {
        total: results.invalid.length,
        failureRate: (100 - results.successRate).toFixed(1) + '%'
      },
      performance: {
        duration: `${results.duration}ms`,
        averageTimePerVideo: `${(results.duration / results.total).toFixed(0)}ms`
      }
    };

    // Group failed videos by reason
    const failureReasons = {};
    for (const video of results.invalid) {
      const reason = video.validation?.reason || 'unknown';
      if (!failureReasons[reason]) {
        failureReasons[reason] = [];
      }
      failureReasons[reason].push(video);
    }

    console.log('✅ Validation complete!');
    console.log(`📊 Summary: ${results.valid.length}/${results.total} videos valid (${results.successRate.toFixed(1)}%)`);

    res.status(200).json({
      success: true,
      summary,
      validatedDatabase,
      failedVideos: {
        count: results.invalid.length,
        reasons: failureReasons,
        videos: results.invalid.slice(0, 20) // Show first 20 failed videos
      },
      validationStats: videoValidator.getStats()
    });

  } catch (error) {
    console.error('❌ Error during video validation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
