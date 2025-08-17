// Test Import API
// This will help us debug the import issue

export default async function handler(req, res) {
  try {
    console.log('🔧 Testing imports...');
    
    // Test 1: Check if we can import the module
    let supabaseVideoDB;
    try {
      const { supabaseVideoDB: importedDB } = await import('./supabase-video-database.js');
      supabaseVideoDB = importedDB;
      console.log('✅ Supabase video database imported successfully');
    } catch (importError) {
      console.error('❌ Import error:', importError);
      return res.status(500).json({
        success: false,
        error: 'Import failed',
        details: importError.message
      });
    }
    
    // Test 2: Check if getRandomVideo method exists
    if (!supabaseVideoDB || typeof supabaseVideoDB.getRandomVideo !== 'function') {
      console.error('❌ getRandomVideo method not found');
      return res.status(500).json({
        success: false,
        error: 'getRandomVideo method not found',
        supabaseVideoDB: !!supabaseVideoDB,
        methods: supabaseVideoDB ? Object.keys(supabaseVideoDB) : 'null'
      });
    }
    
    // Test 3: Try to call getRandomVideo
    try {
      const result = await supabaseVideoDB.getRandomVideo({
        subject: 'mathematics',
        classLevel: '4-6'
      });
      
      console.log('✅ getRandomVideo called successfully');
      
      return res.status(200).json({
        success: true,
        message: 'Import and method call successful',
        result: result
      });
      
    } catch (methodError) {
      console.error('❌ Method call error:', methodError);
      return res.status(500).json({
        success: false,
        error: 'Method call failed',
        details: methodError.message
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
}
