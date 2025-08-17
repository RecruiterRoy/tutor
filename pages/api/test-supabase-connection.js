// Test Supabase Connection API
// This will help us debug the database connection issue

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  try {
    console.log('🔧 Testing Supabase connection...');
    console.log('URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('SUPABASE_SERVICE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase environment variables'
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Count total videos
    const { count: totalCount, error: countError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count error:', countError);
      return res.status(500).json({
        success: false,
        error: 'Database count error',
        details: countError
      });
    }
    
    // Test 2: Get sample videos
    const { data: sampleVideos, error: sampleError } = await supabase
      .from('videos')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Sample error:', sampleError);
      return res.status(500).json({
        success: false,
        error: 'Database sample error',
        details: sampleError
      });
    }
    
    // Test 3: Search for specific videos
    const { data: mathVideos, error: mathError } = await supabase
      .from('videos')
      .select('*')
      .eq('subject', 'mathematics')
      .eq('class_level', '4-6')
      .limit(3);
    
    if (mathError) {
      console.error('❌ Math search error:', mathError);
      return res.status(500).json({
        success: false,
        error: 'Database search error',
        details: mathError
      });
    }
    
    console.log('✅ Supabase connection successful!');
    
    return res.status(200).json({
      success: true,
      data: {
        totalVideos: totalCount,
        sampleVideos: sampleVideos,
        mathVideos: mathVideos,
        environment: {
          urlSet: !!supabaseUrl,
          keySet: !!supabaseKey
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
}
