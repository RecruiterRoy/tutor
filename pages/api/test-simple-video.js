// Simple test to verify the guaranteed working video
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const testVideo = {
    videoId: 'yCjJyiqpAuU',
    title: 'Twinkle Twinkle Little Star',
    url: 'https://www.youtube.com/watch?v=yCjJyiqpAuU'
  };

  try {
    // Test oEmbed
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(testVideo.url)}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (response.ok) {
      const data = await response.json();
      res.status(200).json({
        success: true,
        message: 'Video is embeddable and working',
        video: {
          ...testVideo,
          oembed: {
            title: data.title,
            author: data.author_name,
            thumbnail: data.thumbnail_url
          }
        }
      });
    } else {
      res.status(200).json({
        success: false,
        message: `Video test failed: HTTP ${response.status}`,
        video: testVideo
      });
    }
  } catch (error) {
    res.status(200).json({
      success: false,
      message: `Video test error: ${error.message}`,
      video: testVideo
    });
  }
}
