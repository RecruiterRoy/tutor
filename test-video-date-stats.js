// Test script to check video date statistics
// Run this to see when videos were posted/added

async function testVideoDateStats() {
  try {
    console.log('📊 Testing YouTube video upload date statistics...');
    
    const response = await fetch('http://localhost:3000/api/video-date-stats');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ YouTube Video Upload Date Statistics:');
      console.log(`Total videos: ${result.data.totalVideos}`);
      console.log(`Data source: ${result.data.source}`);
      
      console.log('\n📅 YouTube Upload Date Breakdown:');
      result.data.dateBreakdown.forEach(stat => {
        console.log(`  ${stat.monthName}: ${stat.count} videos uploaded to YouTube`);
      });
      
      console.log('\n📋 Summary:');
      console.log(result.data.summary);
      
      // Show some sample video details if available
      if (result.data.videoDetails && result.data.videoDetails.length > 0) {
        console.log('\n📺 Sample Videos with Upload Dates:');
        const sampleVideos = result.data.videoDetails.slice(0, 5); // Show first 5
        sampleVideos.forEach(video => {
          const uploadDate = new Date(video.uploadDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          console.log(`  • "${video.title}" by ${video.channel} - Uploaded: ${uploadDate}`);
        });
      }
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test topic-based video search
async function testTopicBasedSearch() {
  try {
    console.log('\n🎯 Testing topic-based video search...');
    
    const testCases = [
      { subject: 'mathematics', topic: 'addition' },
      { subject: 'science', topic: 'physics' },
      { subject: 'english', topic: 'grammar' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🔍 Searching for ${testCase.subject} - ${testCase.topic}:`);
      
      const response = await fetch(`http://localhost:3000/api/manage-video-database?action=get_videos_by_topic&subject=${testCase.subject}&topic=${testCase.topic}`);
      const result = await response.json();
      
      if (result.success) {
        console.log(`  ✅ Found ${result.count} videos`);
        if (result.data && result.data.length > 0) {
          console.log(`  📺 Sample: ${result.data[0].title}`);
        }
      } else {
        console.log(`  ❌ Error: ${result.error}`);
      }
    }
  } catch (error) {
    console.error('❌ Topic search test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting video system tests...\n');
  
  await testVideoDateStats();
  await testTopicBasedSearch();
  
  console.log('\n✅ Tests completed!');
}

// Run if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
}
