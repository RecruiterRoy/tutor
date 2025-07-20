export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if required environment variables are set
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        anthropic: hasAnthropicKey ? 'configured' : 'missing_key',
        supabase: (hasSupabaseUrl && hasSupabaseKey) ? 'configured' : 'missing_config'
      }
    };

    const isHealthy = hasAnthropicKey && hasSupabaseUrl && hasSupabaseKey;
    
    if (isHealthy) {
      res.status(200).json(healthStatus);
    } else {
      healthStatus.status = 'degraded';
      res.status(200).json(healthStatus);
    }

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// For App Router (Next.js 13+)
export async function GET() {
  try {
    // Check if required environment variables are set
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        anthropic: hasAnthropicKey ? 'configured' : 'missing_key',
        supabase: (hasSupabaseUrl && hasSupabaseKey) ? 'configured' : 'missing_config'
      }
    };

    const isHealthy = hasAnthropicKey && hasSupabaseUrl && hasSupabaseKey;
    
    if (isHealthy) {
      return Response.json(healthStatus);
    } else {
      healthStatus.status = 'degraded';
      return Response.json(healthStatus);
    }

  } catch (error) {
    console.error('Health check error:', error);
    return Response.json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
