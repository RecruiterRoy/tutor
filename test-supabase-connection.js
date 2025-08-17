// Test Supabase Connection
// Run this to check if the database connection is working

import { createClient } from '@supabase/supabase-js';

// Check environment variables
console.log('🔧 Environment Check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Count videos
    const { data: countData, error: countError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting videos:', countError);
      return;
    }
    
    console.log(`✅ Found ${countData.length} videos in database`);
    
    // Test 2: Get a sample video
    const { data: sampleData, error: sampleError } = await supabase
      .from('videos')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error getting sample video:', sampleError);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('✅ Sample video:', sampleData[0].title);
    }
    
    // Test 3: Search for mathematics videos
    const { data: mathData, error: mathError } = await supabase
      .from('videos')
      .select('*')
      .eq('subject', 'mathematics')
      .eq('class_level', '4-6')
      .limit(3);
    
    if (mathError) {
      console.error('❌ Error searching math videos:', mathError);
      return;
    }
    
    console.log(`✅ Found ${mathData.length} math videos for class 4-6`);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();
