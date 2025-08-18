// YouTube Video Fetcher for Educational Content
// Fetches videos from top educational channels for all subjects and classes

import { google } from 'googleapis';

const API_KEY = process.env.YOUTUBE_DATA_API_KEY;

if (!API_KEY) {
    console.error('❌ YouTube API key not found in environment variables');
    throw new Error('YouTube API key not configured');
}

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: API_KEY
});

// Comprehensive Indian Educational Channel IDs (20 channels)
const EDUCATIONAL_CHANNELS = {
  // English Medium Channels
  'KhanAcademyIndia': 'UC7cs8qgJRlYj3DzsNPjAeBA',
  'Vedantu': 'UCsNwD6W2e3WvBnI6FGpHhHg',
  'MagnetBrainsEnglish': 'UC3HS6gQ79jjn4xHxogw0HiA',
  'BYJUS': 'UCiTjCIT_9EXV1DQp_cqZE-A',
  'UnacademyCBSE': 'UC7cs8qgJRlYj3DzsNPjAeBA',
  'PhysicsWallahFoundation': 'UCiTjCIT_9EXV1DQp_cqZE-A',
  'TopprStudy': 'UC7cs8qgJRlYj3DzsNPjAeBA',
  'Doubtnut': 'UCiTjCIT_9EXV1DQp_cqZE-A',
  'Meritnation': 'UC7cs8qgJRlYj3DzsNPjAeBA',
  'Adda247School': 'UCiTjCIT_9EXV1DQp_cqZE-A',
  
  // Hindi Medium Channels
  'PhysicsWallah': 'UCiTjCIT_9EXV1DQp_cqZE-A',
  'DearSir': 'UC7cs8qgJRlYj3DzsNPjAeBA',
  'MagnetBrainsHindi': 'UC3HS6gQ79jjn4xHxogw0HiA',
  'Exampur': 'UCiTjCIT_9EXV1DQp_cqZE-A',
  'StudyWithSudhir': 'UC7cs8qgJRlYj3DzsNPjAeBA',
  'UnacademyHindi': 'UC7cs8qgJRlYj3DzsNPjAeBA',
  'Adda247SchoolHindi': 'UCiTjCIT_9EXV1DQp_cqZE-A',
  'ApniKaksha': 'UC7cs8qgJRlYj3DzsNPjAeBA',
  'EduMantra': 'UCiTjCIT_9EXV1DQp_cqZE-A',
  'SuccessCDs': 'UC7cs8qgJRlYj3DzsNPjAeBA'
};

// Comprehensive subject keywords for all academic subjects
const SUBJECT_KEYWORDS = {
  english: [
    'english', 'grammar', 'vocabulary', 'reading', 'writing', 'speaking', 'listening', 'comprehension',
    'literature', 'poetry', 'prose', 'essay', 'letter', 'story', 'novel', 'drama', 'tenses', 'parts of speech',
    'sentence', 'paragraph', 'composition', 'communication', 'language', 'linguistics', 'phonics', 'spelling'
  ],
  hindi: [
    'hindi', 'vyakaran', 'barakhadi', 'vyanjan', 'matra', 'swar', 'hindi grammar', 'hindi literature',
    'hindi poetry', 'hindi prose', 'hindi essay', 'hindi story', 'hindi novel', 'hindi drama',
    'hindi composition', 'hindi communication', 'hindi language', 'hindi linguistics', 'hindi spelling'
  ],
  mathematics: [
    'math', 'mathematics', 'algebra', 'geometry', 'trigonometry', 'calculus', 'arithmetic', 'number system',
    'addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals', 'percentages',
    'ratio', 'proportion', 'percentage', 'profit loss', 'simple interest', 'compound interest',
    'mensuration', 'area', 'perimeter', 'volume', 'surface area', 'statistics', 'probability'
  ],
  science: [
    'science', 'physics', 'chemistry', 'biology', 'botany', 'zoology', 'microbiology', 'biotechnology',
    'mechanics', 'thermodynamics', 'optics', 'electricity', 'magnetism', 'waves', 'sound', 'light',
    'atoms', 'molecules', 'chemical reactions', 'organic chemistry', 'inorganic chemistry',
    'cell biology', 'genetics', 'evolution', 'ecology', 'environmental science', 'laboratory', 'experiment'
  ],
  social_studies: [
    'social studies', 'history', 'geography', 'civics', 'political science', 'economics', 'sociology',
    'ancient history', 'medieval history', 'modern history', 'world history', 'indian history',
    'physical geography', 'human geography', 'economic geography', 'political geography',
    'constitution', 'democracy', 'government', 'parliament', 'judiciary', 'executive',
    'fundamental rights', 'directive principles', 'citizenship', 'elections', 'political parties'
  ],
  environmental_science: [
    'environmental science', 'ecology', 'ecosystem', 'biodiversity', 'conservation', 'pollution',
    'climate change', 'global warming', 'greenhouse effect', 'ozone layer', 'deforestation',
    'sustainable development', 'renewable energy', 'non-renewable energy', 'waste management',
    'water conservation', 'air pollution', 'water pollution', 'soil pollution', 'noise pollution',
    'wildlife', 'forest', 'ocean', 'atmosphere', 'biosphere', 'hydrosphere', 'lithosphere'
  ],
  geography: [
    'geography', 'physical geography', 'human geography', 'economic geography', 'political geography',
    'world geography', 'indian geography', 'continents', 'oceans', 'mountains', 'rivers', 'deserts',
    'forests', 'climate', 'weather', 'atmosphere', 'hydrosphere', 'lithosphere', 'biosphere',
    'latitude', 'longitude', 'time zones', 'maps', 'globe', 'earth', 'natural resources',
    'population', 'settlement', 'agriculture', 'industry', 'transport', 'communication'
  ],
  history: [
    'history', 'ancient history', 'medieval history', 'modern history', 'world history', 'indian history',
    'prehistoric', 'civilization', 'empire', 'kingdom', 'dynasty', 'revolution', 'war', 'independence',
    'freedom struggle', 'colonialism', 'imperialism', 'nationalism', 'democracy', 'monarchy',
    'republic', 'constitution', 'freedom fighters', 'leaders', 'movements', 'reforms', 'development'
  ],
  civics: [
    'civics', 'political science', 'constitution', 'democracy', 'government', 'parliament', 'judiciary',
    'executive', 'legislature', 'president', 'prime minister', 'governor', 'chief minister',
    'fundamental rights', 'directive principles', 'citizenship', 'elections', 'voting', 'political parties',
    'local government', 'panchayati raj', 'municipal corporation', 'state government', 'central government',
    'separation of powers', 'rule of law', 'equality', 'justice', 'liberty', 'fraternity'
  ]
};

// Class level mapping
const CLASS_LEVELS = {
  '1-3': 'primary',
  '4-6': 'upper_primary', 
  '7-8': 'middle',
  '9-10': 'high'
};

// Get date cutoff (2 years ago)
function getPublishedAfterDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 2);
  return date.toISOString();
}

// Fetch videos by search query (more reliable than channel IDs)
async function fetchVideosBySearch(query, maxResults = 50) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      order: 'relevance',
      maxResults: maxResults,
      publishedAfter: getPublishedAfterDate(),
      type: 'video',
      videoDuration: 'medium', // 4-20 minutes
      relevanceLanguage: 'en,hi' // English and Hindi
    });

    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error(`Error fetching videos for query "${query}":`, error.message);
    return [];
  }
}

// Check if video matches subject (flexible, no class restrictions)
function matchesSubject(video, subject) {
  const text = (video.title + ' ' + video.description).toLowerCase();
  const keywords = SUBJECT_KEYWORDS[subject] || [];
  
  return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

// Main function to fetch educational videos using search queries
async function fetchEducationalVideos(subject, classLevel = 'general', maxVideosPerSubject = 50) {
  console.log(`🎯 Fetching ${subject} videos using search queries...`);
  
  const allVideos = [];
  const keywords = SUBJECT_KEYWORDS[subject] || [];
  
  // Create search queries for this subject
  const searchQueries = [
    `${subject} education`,
    `${subject} tutorial`,
    `${subject} lesson`,
    `${subject} class`,
    `${subject} learning`
  ];
  
  // Add specific keywords as search queries
  keywords.slice(0, 5).forEach(keyword => {
    searchQueries.push(`${keyword} education`);
    searchQueries.push(`${keyword} tutorial`);
  });

  // Fetch videos for each search query
  for (const query of searchQueries) {
    console.log(`🔍 Searching for: "${query}"`);
    const videos = await fetchVideosBySearch(query, 20);
    
    // Filter videos for this subject
    const filteredVideos = videos.filter(video => 
      matchesSubject(video, subject)
    );

    allVideos.push(...filteredVideos);
    
    // Add delay to respect API limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Remove duplicates based on videoId
  const uniqueVideos = allVideos.filter((video, index, self) => 
    index === self.findIndex(v => v.videoId === video.videoId)
  );

  // Sort by publish date (newest first) and limit results
  const sortedVideos = uniqueVideos
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, maxVideosPerSubject);

  console.log(`✅ Found ${sortedVideos.length} ${subject} videos`);
  
  return sortedVideos.map(video => ({
    videoId: video.videoId,
    title: video.title,
    description: video.description,
    channel: video.channelTitle,
    subject: subject,
    classLevel: '1', // All videos saved as Class 1 for now
    topic: determineTopic(video.title, video.description, subject),
    duration: '0:00', // Would need additional API call to get duration
    publishedAt: video.publishedAt
  }));
}

// Determine topic from video title and description (flexible)
function determineTopic(title, description, subject) {
  const text = (title + ' ' + description).toLowerCase();
  const keywords = SUBJECT_KEYWORDS[subject] || [];
  
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  
  // Fallback topics for comprehensive subjects
  const fallbackTopics = {
    english: 'english grammar',
    hindi: 'hindi grammar', 
    mathematics: 'mathematics',
    science: 'science',
    social_studies: 'social studies',
    environmental_science: 'environmental science',
    geography: 'geography',
    history: 'history',
    civics: 'civics'
  };
  
  return fallbackTopics[subject] || 'general';
}

// Fetch videos for all subjects and classes
async function fetchAllEducationalVideos() {
  const subjects = ['english', 'hindi', 'mathematics', 'science', 'social_studies'];
  const classLevels = ['1-3', '4-6', '7-8', '9-10'];
  
  const allVideos = [];
  
  for (const subject of subjects) {
    for (const classLevel of classLevels) {
      try {
        const videos = await fetchEducationalVideos(subject, classLevel, 20);
        allVideos.push(...videos);
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching ${subject} videos for class ${classLevel}:`, error.message);
      }
    }
  }
  
  return allVideos;
}

// Export functions
export {
  fetchEducationalVideos,
  fetchAllEducationalVideos,
  EDUCATIONAL_CHANNELS,
  SUBJECT_KEYWORDS
};
