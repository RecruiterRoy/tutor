// public/js/config.js
// Configuration for TUTOR.AI mobile app
window.TUTOR_CONFIG = {
    SUPABASE_URL: 'https://xhuljxuxnlwtocfmwiid.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODYwOTMsImV4cCI6MjA2Nzk2MjA5M30.mTsc-UknUlrhTqfUCzALyRhmqC26XvwMVNHgD5Ttkw4',
  
  // API Configuration - Dynamic based on current domain
  get apiBaseUrl() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    } else if (hostname === 'tution.app') {
      return 'https://tution.app';
    } else if (hostname === 'tutor-omega-seven.vercel.app') {
      return 'https://tutor-omega-seven.vercel.app';
    } else {
      // Fallback to current origin
      return window.location.origin;
    }
  },
  
  // Mobile Optimization Settings
  mobile: {
    enableVoiceFeatures: false, // Disabled by default for stability
    enableAnimations: true,
    enableOfflineSupport: false,
    maxCacheSize: "50MB",
    imageOptimization: true
  },
  
  // App Settings
  app: {
    name: "TUTOR.AI",
    version: "1.0.0",
    defaultLanguage: "en",
    supportedLanguages: ["en", "hi", "hi-en"],
    maxChatHistory: 50,
    autoSave: true
  },
  
  // Feature Flags
  features: {
    chat: true,
    voiceInput: false, // Disabled for mobile stability
    textToSpeech: false, // Disabled for mobile stability
    progressTracking: true,
    bookReader: true,
    lessonPlanner: true,
    teacherPersonas: true
  },
  
  // Error Handling
  errorHandling: {
    enableErrorReporting: true,
    maxRetries: 3,
    retryDelay: 1000,
    showUserFriendlyErrors: true
  },
  
  // Performance Settings
  performance: {
    lazyLoadImages: true,
    enablePreloading: true,
    minifyRequests: true,
    cacheStaticAssets: true
  }
};

// Initialize Supabase client when config is loaded
window.addEventListener('DOMContentLoaded', function() {
  if (typeof window.supabase !== 'undefined') {
    window.supabaseClient = window.supabase.createClient(
      window.TUTOR_CONFIG.SUPABASE_URL,
      window.TUTOR_CONFIG.SUPABASE_ANON_KEY
    );
    console.log('Supabase client initialized from config');
  }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.TUTOR_CONFIG;
}

