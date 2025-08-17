import { supabaseVideoDB } from './supabase-video-database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Getting video date statistics...');
    
    const result = await supabaseVideoDB.getVideoDateStats();
    
    if (!result.success) {
      console.error('❌ Error getting video date stats:', result.error);
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }

    console.log('✅ Video date statistics retrieved successfully');
    return res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('❌ Error in video date stats API:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
