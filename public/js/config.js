// public/js/config.js
// Configuration for TUTOR.AI mobile app
window.TUTOR_CONFIG = {
    SUPABASE_URL: 'https://vfqdjpiyaabufpaofysz.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWRqcGl5YWFidWZwYW9meXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDkzMDEsImV4cCI6MjA2OTE4NTMwMX0.SVY1Kf7D1nbXssuxCnnHcvaDAIintOpCLfhxV6rHvjo',
  
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
    enableVoiceFeatures: true, // Enabled for voice functionality
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
    voiceInput: true, // Enabled for voice input functionality
    textToSpeech: true, // Enabled for text-to-speech functionality
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

// Supabase client initialization is handled in supabaseClient.js
// This prevents multiple instances

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.TUTOR_CONFIG;
}

