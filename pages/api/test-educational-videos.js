// Test API for educational video database
import { searchEducationalVideos, getRandomVideo, getAllVideosForSubject } from './educational-video-database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject = 'mathematics', classLevel = '6', topic = 'addition' } = req.query;

  try {
    // Test different functions
    const searchResults = searchEducationalVideos(subject, classLevel, topic);
    const randomVideo = getRandomVideo(subject, classLevel, topic);
    const allVideos = getAllVideosForSubject(subject, classLevel);

    res.status(200).json({
      success: true,
      test: {
        subject,
        classLevel,
        topic,
        searchResults: {
          count: searchResults.length,
          videos: searchResults
        },
        randomVideo,
        allVideos: {
          count: allVideos.length,
          videos: allVideos.slice(0, 5) // Show first 5
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
