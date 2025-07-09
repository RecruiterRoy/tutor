// Configuration file for TUTOR.AI
// This file contains the Supabase configuration for the application

const config = {
    // Supabase Configuration
    supabaseUrl: 'https://xhuljxuxnlwtocfmwiid.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzQ4MTYsImV4cCI6MjA2NzMxMDgxNn0.udHlokpxgR45eS6Pl0OWj7YT1RwW6FUAvGFTed03EIU',
    
    // Application Configuration
    appName: 'TUTOR.AI',
    version: '1.0.0',
    
    // API Configuration
    apiBaseUrl: '/api',
    
    // Feature Flags
    features: {
        voiceInput: true,
        fileUpload: true,
        chatHistory: true,
        progressTracking: true
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    // Make available globally for browser use
    window.appConfig = config;
} 