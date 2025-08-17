// Test API to verify video embeddability
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Test videos - these should be guaranteed to work
  const testVideos = [
    {
      id: 'yCjJyiqpAuU',
      title: 'Twinkle Twinkle Little Star',
      url: 'https://www.youtube.com/watch?v=yCjJyiqpAuU'
    },
    {
      id: 'hq3yfQnllfQ', 
      title: 'ABC Song',
      url: 'https://www.youtube.com/watch?v=hq3yfQnllfQ'
    },
    {
      id: 'ZanHgPprl-0',
      title: 'Head Shoulders Knees and Toes',
      url: 'https://www.youtube.com/watch?v=ZanHgPprl-0'
    },
    {
      id: 'DR-cfDsHCGA',
      title: 'Counting Songs',
      url: 'https://www.youtube.com/watch?v=DR-cfDsHCGA'
    },
    {
      id: 'BELlZKpi1Zs',
      title: 'Phonics Song',
      url: 'https://www.youtube.com/watch?v=BELlZKpi1Zs'
    },
    {
      id: 'ncORPosDrjI',
      title: 'Water Cycle',
      url: 'https://www.youtube.com/watch?v=ncORPosDrjI'
    }
  ];

  const results = [];

  for (const video of testVideos) {
    try {
      // Test oEmbed
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(video.url)}&format=json`;
      const response = await fetch(oembedUrl);
      
      if (response.ok) {
        const data = await response.json();
        results.push({
          videoId: video.id,
          title: video.title,
          status: 'WORKING',
          oembed: {
            title: data.title,
            author: data.author_name,
            thumbnail: data.thumbnail_url
          }
        });
      } else {
        results.push({
          videoId: video.id,
          title: video.title,
          status: 'FAILED',
          error: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      results.push({
        videoId: video.id,
        title: video.title,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  const workingVideos = results.filter(r => r.status === 'WORKING');
  const failedVideos = results.filter(r => r.status !== 'WORKING');

  res.status(200).json({
    summary: {
      total: testVideos.length,
      working: workingVideos.length,
      failed: failedVideos.length
    },
    working: workingVideos,
    failed: failedVideos,
    all: results
  });
}
