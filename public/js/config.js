// public/js/config.js
// Configuration for TUTOR.AI mobile app
window.TUTOR_CONFIG = {
    // Use NEXT_PUBLIC_ environment variables for Vercel deployment
    SUPABASE_URL: window.NEXT_PUBLIC_SUPABASE_URL || 'https://xhuljxuxnlwtocfmwiid.supabase.co',
    SUPABASE_ANON_KEY: window.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODYwOTMsImV4cCI6MjA2Nzk2MjA5M30.mTsc-UknUlrhTqfUCzALyRhmqC26XvwMVNHgD5Ttkw4',
  
  // Payment Configuration
  RAZORPAY_KEY_ID: window.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_test_key',
  
  // API Configuration
  apiBaseUrl: 'https://tutor-nine-puce.vercel.app',
  
  // Mobile Optimization Settings
  mobile: {
    enableVoiceFeatures: true, // Enabled for mobile
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
    voiceInput: true, // Enabled for mobile
    textToSpeech: true, // Enabled for mobile
    progressTracking: true,
    bookReader: true,
    lessonPlanner: true,
    teacherPersonas: true,
    payments: true // Enable payment system
  },
  
  // Payment Plans
  paymentPlans: {
    monthly: {
      name: 'Monthly Premium',
      price: 99,
      currency: 'INR',
      duration: '30 days',
      features: [
        'Unlimited AI Chat',
        'Voice Input/Output',
        'Priority Support',
        'Advanced AI Models',
        'No Ads'
      ]
    },
    yearly: {
      name: 'Yearly Premium',
      price: 990,
      currency: 'INR',
      duration: '365 days',
      features: [
        'All Monthly Features',
        '2 Months Free',
        'Early Access to Features',
        'Exclusive Content'
      ]
    }
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
    console.log('Supabase URL:', window.TUTOR_CONFIG.SUPABASE_URL);
    console.log('Using NEXT_PUBLIC_ variables:', !!window.NEXT_PUBLIC_SUPABASE_URL);
  }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.TUTOR_CONFIG;
}

