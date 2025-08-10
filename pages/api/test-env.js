export default function handler(req, res) {
  // Simple test to check environment variables
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const keyLength = process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0;
  const keyStart = process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'NOT_SET';
  const keyEnd = process.env.ANTHROPIC_API_KEY ? '...' + process.env.ANTHROPIC_API_KEY.substring(process.env.ANTHROPIC_API_KEY.length - 4) : 'NOT_SET';
  
  // Check if it's a valid Anthropic key format
  const isValidFormat = process.env.ANTHROPIC_API_KEY ? 
    (process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-') && process.env.ANTHROPIC_API_KEY.length > 50) : false;
  
  res.status(200).json({
    message: 'Environment variables test',
    hasAnthropicKey,
    keyLength,
    keyStart,
    keyEnd,
    isValidFormat,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    allEnvVars: Object.keys(process.env).filter(key => key.includes('ANTHROPIC') || key.includes('API') || key.includes('VERCEL'))
  });
}
