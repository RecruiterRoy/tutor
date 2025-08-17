// API endpoint to fetch YouTube educational videos
import { fetchEducationalVideos, fetchAllEducationalVideos } from './youtube-video-fetcher.js';
import { supabaseVideoDB } from './supabase-video-database.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, subject, classLevel, maxVideos } = req.body;

    console.log('🚀 Starting YouTube video fetch...');

    switch (action) {
      case 'fetch_subject_class':
        if (!subject || !classLevel) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing subject or classLevel' 
          });
        }
        
        const videos = await fetchEducationalVideos(
          subject, 
          classLevel, 
          maxVideos || 25
        );
        
        return res.status(200).json({
          success: true,
          data: videos,
          count: videos.length,
          subject,
          classLevel
        });

      case 'fetch_all':
        const allVideos = await fetchAllEducationalVideos();
        
        return res.status(200).json({
          success: true,
          data: allVideos,
          count: allVideos.length,
          summary: {
            bySubject: groupBySubject(allVideos),
            byClass: groupByClass(allVideos)
          }
        });

      case 'fetch_and_save':
        if (!subject || !classLevel) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing subject or classLevel' 
          });
        }
        
        const fetchedVideos = await fetchEducationalVideos(
          subject, 
          classLevel, 
          maxVideos || 25
        );
        
        // Save to database
        const savedVideos = [];
        for (const video of fetchedVideos) {
          try {
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
            }
          } catch (error) {
            console.error(`Error saving video ${video.videoId}:`, error.message);
          }
        }
        
        return res.status(200).json({
          success: true,
          fetched: fetchedVideos.length,
          saved: savedVideos.length,
          data: savedVideos,
          subject,
          classLevel
        });

      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Use: fetch_subject_class, fetch_all, or fetch_and_save' 
        });
    }

  } catch (error) {
    console.error('❌ Error in YouTube video fetch:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Helper functions
function groupBySubject(videos) {
  const grouped = {};
  videos.forEach(video => {
    if (!grouped[video.subject]) {
      grouped[video.subject] = [];
    }
    grouped[video.subject].push(video);
  });
  
  return Object.entries(grouped).map(([subject, videos]) => ({
    subject,
    count: videos.length
  }));
}

function groupByClass(videos) {
  const grouped = {};
  videos.forEach(video => {
    if (!grouped[video.classLevel]) {
      grouped[video.classLevel] = [];
    }
    grouped[video.classLevel].push(video);
  });
  
  return Object.entries(grouped).map(([classLevel, videos]) => ({
    classLevel,
    count: videos.length
  }));
}
