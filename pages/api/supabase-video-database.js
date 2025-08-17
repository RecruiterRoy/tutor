// Supabase Video Database Management System
// Handles 500+ educational videos with validation and search capabilities

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Database Schema:
// videos table:
// - id (uuid, primary key)
// - video_id (text, unique)
// - video_url (text) - Full YouTube URL
// - title (text)
// - description (text)
// - channel (text)
// - subject (text)
// - class_level (text)
// - topic (text)
// - duration (text)
// - is_validated (boolean)
// - validation_status (text)
// - validation_date (timestamp)
// - created_at (timestamp)
// - updated_at (timestamp)

export class SupabaseVideoDatabase {
  constructor() {
    this.supabase = supabase;
  }

  // Add a single video to the database
  async addVideo(videoData) {
    try {
      const { data, error } = await this.supabase
        .from('videos')
        .insert([{
          video_id: videoData.videoId,
          video_url: `https://www.youtube.com/watch?v=${videoData.videoId}`,
          title: videoData.title,
          description: videoData.description,
          channel: videoData.channel,
          subject: videoData.subject,
          class_level: videoData.classLevel,
          topic: videoData.topic,
          duration: videoData.duration,
          is_validated: false,
          validation_status: 'pending'
        }])
        .select();

      if (error) {
        console.error('Error adding video:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Added video: ${videoData.title}`);
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in addVideo:', error);
      return { success: false, error: error.message };
    }
  }

  // Add multiple videos in batch
  async addVideosBatch(videosArray) {
    try {
      const videosToInsert = videosArray.map(video => ({
        video_id: video.videoId,
        video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
        title: video.title,
        description: video.description,
        channel: video.channel,
        subject: video.subject,
        class_level: video.classLevel,
        topic: video.topic,
        duration: video.duration,
        is_validated: false,
        validation_status: 'pending'
      }));

      const { data, error } = await this.supabase
        .from('videos')
        .insert(videosToInsert)
        .select();

      if (error) {
        console.error('Error adding videos batch:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Added ${data.length} videos to database`);
      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Error in addVideosBatch:', error);
      return { success: false, error: error.message };
    }
  }

  // Search videos by criteria
  async searchVideos(criteria = {}) {
    try {
      let query = this.supabase
        .from('videos')
        .select('*')
        .eq('is_validated', true);

      if (criteria.subject) {
        query = query.eq('subject', criteria.subject);
      }
      if (criteria.classLevel) {
        query = query.eq('class_level', criteria.classLevel);
      }
      if (criteria.topic) {
        query = query.ilike('topic', `%${criteria.topic}%`);
      }
      if (criteria.searchText) {
        query = query.or(`title.ilike.%${criteria.searchText}%,description.ilike.%${criteria.searchText}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching videos:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Error in searchVideos:', error);
      return { success: false, error: error.message };
    }
  }

  // Get random video matching criteria
  async getRandomVideo(criteria = {}) {
    try {
      const result = await this.searchVideos(criteria);
      if (!result.success || result.data.length === 0) {
        return { success: false, error: 'No videos found' };
      }

      const randomIndex = Math.floor(Math.random() * result.data.length);
      return { success: true, data: result.data[randomIndex] };
    } catch (error) {
      console.error('Error in getRandomVideo:', error);
      return { success: false, error: error.message };
    }
  }

  // Update video validation status
  async updateValidationStatus(videoId, status, details = {}) {
    try {
      const { data, error } = await this.supabase
        .from('videos')
        .update({
          is_validated: status === 'valid',
          validation_status: status,
          validation_date: new Date().toISOString(),
          ...details
        })
        .eq('video_id', videoId)
        .select();

      if (error) {
        console.error('Error updating validation status:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Updated validation status for ${videoId}: ${status}`);
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in updateValidationStatus:', error);
      return { success: false, error: error.message };
    }
  }

  // Get database statistics
  async getStats() {
    try {
      const { data: totalVideos, error: totalError } = await this.supabase
        .from('videos')
        .select('*', { count: 'exact' });

      const { data: validatedVideos, error: validatedError } = await this.supabase
        .from('videos')
        .select('*', { count: 'exact' })
        .eq('is_validated', true);

      if (totalError || validatedError) {
        return { success: false, error: 'Error getting stats' };
      }

      const stats = {
        total: totalVideos.length,
        validated: validatedVideos.length,
        pending: totalVideos.length - validatedVideos.length,
        validationRate: ((validatedVideos.length / totalVideos.length) * 100).toFixed(1)
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error in getStats:', error);
      return { success: false, error: error.message };
    }
  }

  // Get video date statistics (YouTube upload dates)
  async getVideoDateStats() {
    try {
      const { data: videos, error } = await this.supabase
        .from('videos')
        .select('video_id, title, channel, created_at, validation_date')
        .eq('is_validated', true);

      if (error) {
        console.error('Error getting video date stats:', error);
        return { success: false, error: error.message };
      }

      console.log(`📊 Fetching YouTube upload dates for ${videos.length} videos...`);

      // Get YouTube upload dates using YouTube Data API
      const apiKey = process.env.YOUTUBE_DATA_API_KEY;
      if (!apiKey) {
        console.log('⚠️ YouTube API key not available, using database dates as fallback');
        return this.getDatabaseDateStats(videos);
      }

      const videoIds = videos.map(v => v.video_id);
      const batchSize = 50; // YouTube API allows max 50 videos per request
      const allVideoData = [];

      // Process videos in batches
      for (let i = 0; i < videoIds.length; i += batchSize) {
        const batch = videoIds.slice(i, i + batchSize);
        const videoIdsString = batch.join(',');
        
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoIdsString}&part=snippet&key=${apiKey}`;
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data.items) {
              allVideoData.push(...data.items);
            }
          } else {
            console.log(`⚠️ YouTube API error for batch ${i/batchSize + 1}: ${response.status}`);
          }
        } catch (error) {
          console.log(`⚠️ Error fetching batch ${i/batchSize + 1}: ${error.message}`);
        }
      }

      if (allVideoData.length === 0) {
        console.log('⚠️ No YouTube data retrieved, using database dates as fallback');
        return this.getDatabaseDateStats(videos);
      }

      // Group videos by YouTube upload date
      const dateStats = {};
      const videoDetails = [];

      allVideoData.forEach(video => {
        const uploadDate = new Date(video.snippet.publishedAt);
        const monthYear = `${uploadDate.getFullYear()}-${String(uploadDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!dateStats[monthYear]) {
          dateStats[monthYear] = 0;
        }
        dateStats[monthYear]++;

        videoDetails.push({
          videoId: video.id,
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          uploadDate: uploadDate.toISOString(),
          monthYear: monthYear
        });
      });

      // Convert to sorted array
      const sortedStats = Object.entries(dateStats)
        .map(([monthYear, count]) => ({
          monthYear,
          year: parseInt(monthYear.split('-')[0]),
          month: parseInt(monthYear.split('-')[1]),
          count,
          monthName: new Date(monthYear + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }))
        .sort((a, b) => new Date(a.monthYear + '-01') - new Date(b.monthYear + '-01'));

      return { 
        success: true, 
        data: {
          totalVideos: allVideoData.length,
          dateBreakdown: sortedStats,
          summary: sortedStats.map(stat => `${stat.monthName}: ${stat.count} videos`).join(', '),
          videoDetails: videoDetails,
          source: 'youtube_api'
        }
      };
    } catch (error) {
      console.error('Error in getVideoDateStats:', error);
      return { success: false, error: error.message };
    }
  }

  // Fallback function using database dates
  async getDatabaseDateStats(videos) {
    const dateStats = {};
    videos.forEach(video => {
      const createdDate = new Date(video.created_at);
      const validationDate = video.validation_date ? new Date(video.validation_date) : null;
      
      // Use validation date if available, otherwise use created date
      const dateToUse = validationDate || createdDate;
      const monthYear = `${dateToUse.getFullYear()}-${String(dateToUse.getMonth() + 1).padStart(2, '0')}`;
      
      if (!dateStats[monthYear]) {
        dateStats[monthYear] = 0;
      }
      dateStats[monthYear]++;
    });

    const sortedStats = Object.entries(dateStats)
      .map(([monthYear, count]) => ({
        monthYear,
        year: parseInt(monthYear.split('-')[0]),
        month: parseInt(monthYear.split('-')[1]),
        count,
        monthName: new Date(monthYear + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }))
      .sort((a, b) => new Date(a.monthYear + '-01') - new Date(b.monthYear + '-01'));

    return { 
      success: true, 
      data: {
        totalVideos: videos.length,
        dateBreakdown: sortedStats,
        summary: sortedStats.map(stat => `${stat.monthName}: ${stat.count} videos`).join(', '),
        source: 'database_dates'
      }
    };
  }

  // Get videos by subject and topic (removed class level dependency)
  async getVideosBySubjectAndTopic(subject, topic) {
    try {
      const { data, error } = await this.supabase
        .from('videos')
        .select('*')
        .eq('subject', subject)
        .ilike('topic', `%${topic}%`)
        .eq('is_validated', true);

      if (error) {
        console.error('Error getting videos by subject and topic:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Error in getVideosBySubjectAndTopic:', error);
      return { success: false, error: error.message };
    }
  }

  // Get videos by subject only (removed class level dependency)
  async getVideosBySubject(subject) {
    try {
      const { data, error } = await this.supabase
        .from('videos')
        .select('*')
        .eq('subject', subject)
        .eq('is_validated', true);

      if (error) {
        console.error('Error getting videos by subject:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Error in getVideosBySubject:', error);
      return { success: false, error: error.message };
    }
  }

  // Get videos by subject and class level (keeping for backward compatibility)
  async getVideosBySubjectAndClass(subject, classLevel) {
    try {
      const { data, error } = await this.supabase
        .from('videos')
        .select('*')
        .eq('subject', subject)
        .eq('class_level', classLevel)
        .eq('is_validated', true);

      if (error) {
        console.error('Error getting videos by subject and class:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Error in getVideosBySubjectAndClass:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete video by video_id
  async deleteVideo(videoId) {
    try {
      const { error } = await this.supabase
        .from('videos')
        .delete()
        .eq('video_id', videoId);

      if (error) {
        console.error('Error deleting video:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Deleted video: ${videoId}`);
      return { success: true };
    } catch (error) {
      console.error('Error in deleteVideo:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all unvalidated videos
  async getUnvalidatedVideos() {
    try {
      const { data, error } = await this.supabase
        .from('videos')
        .select('*')
        .eq('is_validated', false);

      if (error) {
        console.error('Error getting unvalidated videos:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Error in getUnvalidatedVideos:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const supabaseVideoDB = new SupabaseVideoDatabase();
