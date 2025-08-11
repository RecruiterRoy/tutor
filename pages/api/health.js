export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      supabase: !!process.env.SUPABASE_SERVICE_KEY,
      supabase_url: !!process.env.SUPABASE_URL
    },
    environment: process.env.NODE_ENV || 'development'
  });
} 
