// public/js/config.js
// Configuration for TUTOR.AI mobile app
window.appConfig = {
  // Supabase Configuration
  supabaseUrl: "https://xhuljxuxnlwtocfmwiid.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzQ4MTYsImV4cCI6MjA2NzMxMDgxNn0.udHlokpxgR45eS6Pl0OWj7YT1RwW6FUAvGFTed03EIU",
  
  // API Configuration
  apiBaseUrl: window.location.origin,
  
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
      window.appConfig.supabaseUrl,
      window.appConfig.supabaseAnonKey
    );
    console.log('Supabase client initialized from config');
  }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.appConfig;
}

