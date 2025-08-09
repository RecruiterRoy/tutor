export default function handler(req, res) {
  // Simple test to check environment variables
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const keyLength = process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0;
  const keyStart = process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'NOT_SET';
  
  res.status(200).json({
    message: 'Environment variables test',
    hasAnthropicKey,
    keyLength,
    keyStart,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
