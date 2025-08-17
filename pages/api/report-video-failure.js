// API endpoint to report failed videos and maintain blacklist
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId, reason, userAgent } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Initialize global failed video cache if it doesn't exist
    if (!global.failedVideoCache) {
      global.failedVideoCache = new Set();
    }

    // Add video to failed cache
    global.failedVideoCache.add(videoId);

    // Log the failure for debugging
    console.log(`❌ Video reported as failed: ${videoId}`, {
      reason: reason || 'not specified',
      userAgent: userAgent || 'unknown',
      timestamp: new Date().toISOString(),
      cacheSize: global.failedVideoCache.size
    });

    // Optional: Store in database for persistence (if you want long-term tracking)
    // await supabase.from('failed_videos').insert({
    //   video_id: videoId,
    //   reason: reason,
    //   user_agent: userAgent,
    //   reported_at: new Date().toISOString()
    // });

    res.status(200).json({
      success: true,
      message: 'Video failure reported successfully',
      blacklistedVideos: global.failedVideoCache.size
    });

  } catch (error) {
    console.error('Error reporting video failure:', error);
    res.status(500).json({
      error: 'Failed to report video failure',
      details: error.message
    });
  }
}
