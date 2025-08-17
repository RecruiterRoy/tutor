export default function handler(req, res) {
  res.status(200).json({
    message: 'Environment variables test',
    NODE_ENV: process.env.NODE_ENV,
    hasYouTubeKey: !!process.env.YOUTUBE_DATA_API_KEY,
    youtubeKeyLength: process.env.YOUTUBE_DATA_API_KEY ? process.env.YOUTUBE_DATA_API_KEY.length : 0,
    youtubeKeyPreview: process.env.YOUTUBE_DATA_API_KEY ? process.env.YOUTUBE_DATA_API_KEY.substring(0, 10) + '...' : 'none',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('YOUTUBE'))
  });
}
