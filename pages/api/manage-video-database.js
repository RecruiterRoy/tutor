// Video Database Management API
// Handles video generation, validation, and database management

import { videoDBGenerator } from './video-database-generator.js';
import { supabaseVideoDB } from './supabase-video-database.js';

export default async function handler(req, res) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'POST':
        return await handlePostRequest(req, res);
      case 'GET':
        return await handleGetRequest(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in video database management:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handlePostRequest(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'generate_videos':
      return await generateVideos(req, res);
    case 'validate_videos':
      return await validateVideos(req, res);
    case 'add_video':
      return await addSingleVideo(req, res);
    case 'update_video':
      return await updateVideo(req, res);
    case 'delete_video':
      return await deleteVideo(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleGetRequest(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'stats':
      return await getStats(req, res);
    case 'search':
      return await searchVideos(req, res);
    case 'get_video':
      return await getVideo(req, res);
    case 'get_videos_by_subject':
      return await getVideosBySubject(req, res);
    case 'get_videos_by_topic':
      return await getVideosBySubjectAndTopic(req, res);
    case 'get_videos_by_subject_only':
      return await getVideosBySubjectOnly(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Generate and add all videos to database
async function generateVideos(req, res) {
  try {
    console.log('🚀 Starting video generation...');
    
    const result = await videoDBGenerator.generateAndAddAllVideos();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Successfully generated and added ${result.totalAdded} videos to database`,
        totalAdded: result.totalAdded
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error generating videos:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Validate all unvalidated videos
async function validateVideos(req, res) {
  try {
    console.log('🔍 Starting video validation...');
    
    const result = await videoDBGenerator.validateAllVideos();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Validation complete: ${result.validated} valid, ${result.failed} failed`,
        validated: result.validated,
        failed: result.failed
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error validating videos:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Add a single video to database
async function addSingleVideo(req, res) {
  try {
    const { videoData } = req.body;
    
    if (!videoData || !videoData.videoId || !videoData.title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required video data'
      });
    }

    const result = await supabaseVideoDB.addVideo(videoData);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Video added successfully',
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error adding video:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Update video information
async function updateVideo(req, res) {
  try {
    const { videoId, updates } = req.body;
    
    if (!videoId || !updates) {
      return res.status(400).json({
        success: false,
        error: 'Missing video ID or updates'
      });
    }

    const result = await supabaseVideoDB.updateValidationStatus(videoId, 'updated', updates);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Video updated successfully',
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error updating video:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Delete video from database
async function deleteVideo(req, res) {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Missing video ID'
      });
    }

    const result = await supabaseVideoDB.deleteVideo(videoId);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Video deleted successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get database statistics
async function getStats(req, res) {
  try {
    const result = await videoDBGenerator.getDatabaseStats();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Search videos by criteria
async function searchVideos(req, res) {
  try {
    const { subject, classLevel, topic, searchText } = req.query;
    
    const criteria = {};
    if (subject) criteria.subject = subject;
    if (classLevel) criteria.classLevel = classLevel;
    if (topic) criteria.topic = topic;
    if (searchText) criteria.searchText = searchText;

    const result = await supabaseVideoDB.searchVideos(criteria);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        count: result.count
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error searching videos:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get random video matching criteria
async function getVideo(req, res) {
  try {
    const { subject, classLevel, topic } = req.query;
    
    const criteria = {};
    if (subject) criteria.subject = subject;
    if (classLevel) criteria.classLevel = classLevel;
    if (topic) criteria.topic = topic;

    const result = await supabaseVideoDB.getRandomVideo(criteria);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting video:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get videos by subject and topic (new topic-based function)
async function getVideosBySubjectAndTopic(req, res) {
  try {
    const { subject, topic } = req.query;
    
    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing subject or topic'
      });
    }

    const result = await supabaseVideoDB.getVideosBySubjectAndTopic(subject, topic);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        count: result.count
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting videos by subject and topic:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get videos by subject only (new function)
async function getVideosBySubjectOnly(req, res) {
  try {
    const { subject } = req.query;
    
    if (!subject) {
      return res.status(400).json({
        success: false,
        error: 'Missing subject'
      });
    }

    const result = await supabaseVideoDB.getVideosBySubject(subject);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        count: result.count
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting videos by subject only:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get videos by subject and class level (keeping for backward compatibility)
async function getVideosBySubject(req, res) {
  try {
    const { subject, classLevel } = req.query;
    
    if (!subject || !classLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing subject or class level'
      });
    }

    const result = await supabaseVideoDB.getVideosBySubjectAndClass(subject, classLevel);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        count: result.count
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting videos by subject:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
