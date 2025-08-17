// Batch Video Fetcher - Fetches 20 unique videos for each subject and class
// Saves them systematically to Supabase

import { fetchEducationalVideos } from './youtube-video-fetcher.js';
import { supabaseVideoDB } from './supabase-video-database.js';

// Comprehensive subject mapping for 1000+ videos target
const SUBJECT_COMBINATIONS = [
  { subject: 'english', targetCount: 120 },
  { subject: 'hindi', targetCount: 120 },
  { subject: 'mathematics', targetCount: 150 },
  { subject: 'science', targetCount: 150 },
  { subject: 'social_studies', targetCount: 120 },
  { subject: 'environmental_science', targetCount: 100 },
  { subject: 'geography', targetCount: 100 },
  { subject: 'history', targetCount: 100 },
  { subject: 'civics', targetCount: 100 }
];

// Track progress and results
let batchProgress = {
  total: 3, // 3 subjects: english, hindi, mathematics (Class 1-4 only)
  completed: 0,
  failed: 0,
  results: []
};

// Fetch and save videos for a specific subject (flexible)
async function fetchAndSaveVideos(subject, targetCount = 100) {
  console.log(`🎯 Starting batch for ${subject} (flexible search)...`);
  
  try {
    // Check existing videos in database
    const existingResult = await supabaseVideoDB.getVideosBySubject(subject);
    const existingCount = existingResult.success ? existingResult.data.length : 0;
    
    console.log(`📊 Found ${existingCount} existing videos for ${subject}`);
    
    if (existingCount >= targetCount) {
      console.log(`✅ Already have ${existingCount} videos for ${subject}, skipping...`);
      return {
        success: true,
        subject,
        existing: existingCount,
        fetched: 0,
        saved: 0,
        message: 'Already have sufficient videos'
      };
    }
    
    const neededCount = targetCount - existingCount;
    console.log(`📥 Need to fetch ${neededCount} more videos...`);
    
    // Fetch videos from YouTube (flexible search)
    const fetchedVideos = await fetchEducationalVideos(subject, 'flexible', neededCount + 20); // Fetch extra to account for duplicates
    
    if (!fetchedVideos || fetchedVideos.length === 0) {
      console.log(`⚠️ No videos found for ${subject}`);
      return {
        success: false,
        subject,
        existing: existingCount,
        fetched: 0,
        saved: 0,
        message: 'No videos found'
      };
    }
    
    console.log(`📺 Fetched ${fetchedVideos.length} videos from YouTube`);
    
    // Save videos to database
    const savedVideos = [];
    const duplicateCount = 0;
    
    for (const video of fetchedVideos) {
      try {
        // Check if video already exists
        const existingVideo = await supabaseVideoDB.searchVideos({
          videoId: video.videoId
        });
        
        if (existingVideo.success && existingVideo.data.length > 0) {
          console.log(`🔄 Video ${video.videoId} already exists, skipping...`);
          duplicateCount++;
          continue;
        }
        
        // Add video to database
        const result = await supabaseVideoDB.addVideo({
          videoId: video.videoId,
          title: video.title,
          description: video.description,
          channel: video.channel,
          subject: video.subject,
          classLevel: video.classLevel,
          topic: video.topic,
          duration: video.duration,
          thumbnailUrl: video.thumbnailUrl
        });
        
        if (result.success) {
          savedVideos.push(result.data);
          console.log(`✅ Saved video: ${video.title}`);
        }
        
        // Stop if we have enough videos
        if (savedVideos.length >= neededCount) {
          break;
        }
        
        // Add delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error saving video ${video.videoId}:`, error.message);
      }
    }
    
    const finalCount = existingCount + savedVideos.length;
    console.log(`✅ Completed ${subject}: ${savedVideos.length} new videos saved (${finalCount} total)`);
    
    return {
      success: true,
      subject,
      existing: existingCount,
      fetched: fetchedVideos.length,
      saved: savedVideos.length,
      duplicates: duplicateCount,
      total: finalCount,
      message: `Successfully saved ${savedVideos.length} new videos`
    };
    
  } catch (error) {
    console.error(`❌ Error in batch for ${subject}:`, error.message);
    return {
      success: false,
      subject,
      error: error.message,
      message: 'Batch failed'
    };
  }
}

// Process all batches
async function processAllBatches() {
  console.log('🚀 Starting comprehensive video batch processing...');
  console.log(`📋 Total subjects to process: ${SUBJECT_COMBINATIONS.length}`);
  
  batchProgress = {
    total: SUBJECT_COMBINATIONS.length,
    completed: 0,
    failed: 0,
    results: []
  };
  
  for (const combination of SUBJECT_COMBINATIONS) {
    try {
      console.log(`\n🔄 Processing ${combination.subject} (${batchProgress.completed + 1}/${batchProgress.total})...`);
      
      const result = await fetchAndSaveVideos(
        combination.subject, 
        combination.targetCount
      );
      
      batchProgress.results.push(result);
      
      if (result.success) {
        batchProgress.completed++;
      } else {
        batchProgress.failed++;
      }
      
      console.log(`📊 Progress: ${batchProgress.completed}/${batchProgress.total} completed, ${batchProgress.failed} failed`);
      
      // Add delay between batches to respect API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error processing ${combination.subject}:`, error.message);
      batchProgress.failed++;
      batchProgress.results.push({
        success: false,
        subject: combination.subject,
        error: error.message
      });
    }
  }
  
  console.log('\n🎉 Batch processing completed!');
  console.log(`✅ Completed: ${batchProgress.completed}`);
  console.log(`❌ Failed: ${batchProgress.failed}`);
  
  return batchProgress;
}

// Get batch progress
function getBatchProgress() {
  return batchProgress;
}

// Process specific subject
async function processSpecificBatch(subject, targetCount = 100) {
  console.log(`🎯 Processing specific batch: ${subject}`);
  
  const result = await fetchAndSaveVideos(subject, targetCount);
  
  return {
    success: true,
    result,
    summary: {
      subject,
      targetCount,
      actualSaved: result.saved || 0,
      totalInDatabase: result.total || 0
    }
  };
}

// Get database statistics
async function getDatabaseStats() {
  try {
    const stats = await supabaseVideoDB.getStats();
    
    if (!stats.success) {
      return { success: false, error: stats.error };
    }
    
    // Get breakdown by subject and class
    const breakdown = {};
    const subjects = ['english', 'hindi', 'mathematics', 'science', 'social_studies'];
    const classLevels = ['1-3', '4-6', '7-8', '9-10'];
    
    for (const subject of subjects) {
      breakdown[subject] = {};
      for (const classLevel of classLevels) {
        const result = await supabaseVideoDB.getVideosBySubjectAndClass(subject, classLevel);
        breakdown[subject][classLevel] = result.success ? result.data.length : 0;
      }
    }
    
    return {
      success: true,
      stats: stats.data,
      breakdown
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export {
  processAllBatches,
  processSpecificBatch,
  getBatchProgress,
  getDatabaseStats,
  SUBJECT_COMBINATIONS
};
