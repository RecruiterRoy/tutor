export default function handler(req, res) {
  res.status(200).json({
    message: 'Environment variables test',
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('ANTHROPIC') || 
      key.includes('SUPABASE') || 
      key.includes('API') ||
      key.includes('VERCEL')
    )
  });
}
