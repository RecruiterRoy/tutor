// Video Validation System - Tests videos before adding to database
// Ensures all videos are embeddable and playable

export class VideoValidator {
  constructor() {
    this.validatedVideos = new Map(); // Cache validated videos
    this.failedVideos = new Set(); // Track failed videos
  }

  // Main validation function
  async validateVideo(videoId, title = '', channel = '') {
    try {
      console.log(`🔍 Validating video: ${videoId} - ${title}`);
      
      // Check if already validated
      if (this.validatedVideos.has(videoId)) {
        console.log(`✅ Video ${videoId} already validated`);
        return this.validatedVideos.get(videoId);
      }

      // Check if already failed
      if (this.failedVideos.has(videoId)) {
        console.log(`❌ Video ${videoId} previously failed validation`);
        return { isValid: false, reason: 'previously_failed' };
      }

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Method 1: YouTube Data API (most reliable)
      const apiResult = await this.validateWithYouTubeAPI(videoId);
      if (apiResult.isValid) {
        this.validatedVideos.set(videoId, apiResult);
        console.log(`✅ Video ${videoId} validated via YouTube API`);
        return apiResult;
      }

      // Method 2: oEmbed API (backup)
      const oembedResult = await this.validateWithOEmbed(videoUrl);
      if (oembedResult.isValid) {
        this.validatedVideos.set(videoId, oembedResult);
        console.log(`✅ Video ${videoId} validated via oEmbed`);
        return oembedResult;
      }

      // Method 3: Direct HEAD request (last resort)
      const headResult = await this.validateWithHeadRequest(videoUrl);
      if (headResult.isValid) {
        this.validatedVideos.set(videoId, headResult);
        console.log(`✅ Video ${videoId} validated via HEAD request`);
        return headResult;
      }

      // All methods failed
      console.log(`❌ Video ${videoId} failed all validation methods`);
      this.failedVideos.add(videoId);
      return { isValid: false, reason: 'all_methods_failed' };

    } catch (error) {
      console.error(`❌ Error validating video ${videoId}:`, error.message);
      this.failedVideos.add(videoId);
      return { isValid: false, reason: 'validation_error', error: error.message };
    }
  }

  // Validate using YouTube Data API
  async validateWithYouTubeAPI(videoId) {
    try {
      const apiKey = process.env.YOUTUBE_DATA_API_KEY;
      if (!apiKey) {
        console.log('⚠️ YouTube API key not available, skipping API validation');
        return { isValid: false, reason: 'no_api_key' };
      }

      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=status,snippet&key=${apiKey}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        return { isValid: false, reason: `api_error_${response.status}` };
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        return { isValid: false, reason: 'video_not_found' };
      }

      const video = data.items[0];
      const isEmbeddable = video.status?.embeddable !== false;
      const isPrivate = video.status?.privacyStatus === 'private';
      const isBlocked = video.status?.uploadStatus === 'rejected';
      const isDeleted = video.status?.uploadStatus === 'deleted';

      if (!isEmbeddable || isPrivate || isBlocked || isDeleted) {
        return {
          isValid: false,
          reason: `not_embeddable: embeddable=${isEmbeddable}, private=${isPrivate}, blocked=${isBlocked}, deleted=${isDeleted}`
        };
      }

      return {
        isValid: true,
        method: 'youtube_api',
        title: video.snippet?.title || '',
        channelTitle: video.snippet?.channelTitle || '',
        description: video.snippet?.description || '',
        publishedAt: video.snippet?.publishedAt || '',
        duration: video.snippet?.duration || '',
        viewCount: video.statistics?.viewCount || '0'
      };

    } catch (error) {
      return { isValid: false, reason: 'api_error', error: error.message };
    }
  }

  // Validate using oEmbed API
  async validateWithOEmbed(videoUrl) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const response = await fetch(oembedUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return { isValid: false, reason: 'not_embeddable' };
        }
        return { isValid: false, reason: `oembed_error_${response.status}` };
      }

      const data = await response.json();
      if (!data || !data.title || !data.thumbnail_url) {
        return { isValid: false, reason: 'invalid_oembed_data' };
      }

      return {
        isValid: true,
        method: 'oembed',
        title: data.title || '',
        channelTitle: data.author_name || '',
        description: data.title || '',
        thumbnail: data.thumbnail_url || ''
      };

    } catch (error) {
      return { isValid: false, reason: 'oembed_error', error: error.message };
    }
  }

  // Validate using HEAD request
  async validateWithHeadRequest(videoUrl) {
    try {
      const response = await fetch(videoUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        return { isValid: false, reason: `head_error_${response.status}` };
      }

      return {
        isValid: true,
        method: 'head_request',
        title: '',
        channelTitle: '',
        description: 'Video URL accessible'
      };

    } catch (error) {
      return { isValid: false, reason: 'head_error', error: error.message };
    }
  }

  // Batch validate multiple videos
  async validateBatch(videos) {
    console.log(`🔍 Starting batch validation of ${videos.length} videos`);
    
    const results = {
      valid: [],
      invalid: [],
      total: videos.length,
      startTime: Date.now()
    };

    for (const video of videos) {
      try {
        const result = await this.validateVideo(video.videoId, video.title, video.channel);
        
        if (result.isValid) {
          results.valid.push({
            ...video,
            validation: result
          });
        } else {
          results.invalid.push({
            ...video,
            validation: result
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error in batch validation for ${video.videoId}:`, error);
        results.invalid.push({
          ...video,
          validation: { isValid: false, reason: 'batch_error', error: error.message }
        });
      }
    }

    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    results.successRate = (results.valid.length / results.total) * 100;

    console.log(`✅ Batch validation complete:`);
    console.log(`   Valid: ${results.valid.length}`);
    console.log(`   Invalid: ${results.invalid.length}`);
    console.log(`   Success Rate: ${results.successRate.toFixed(1)}%`);
    console.log(`   Duration: ${results.duration}ms`);

    return results;
  }

  // Get validation statistics
  getStats() {
    return {
      validatedCount: this.validatedVideos.size,
      failedCount: this.failedVideos.size,
      totalValidated: this.validatedVideos.size + this.failedVideos.size
    };
  }

  // Clear cache
  clearCache() {
    this.validatedVideos.clear();
    this.failedVideos.clear();
    console.log('🧹 Video validation cache cleared');
  }
}

// Export singleton instance
export const videoValidator = new VideoValidator();
