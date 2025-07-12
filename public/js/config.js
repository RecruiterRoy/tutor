// config.js - Environment-aware Supabase configuration
(function() {
  'use strict';

  // Prevent multiple script execution
  if (window.supabaseConfigLoaded) {
    console.log('SupabaseConfig script already loaded, skipping execution');
    return;
  }
  
  // Mark script as loaded
  window.supabaseConfigLoaded = true;

  // Check if SupabaseConfig already exists
  if (window.supabaseConfig) {
    console.log('SupabaseConfig already exists, skipping redeclaration');
    return;
  }

  console.log('🔧 Initializing SupabaseConfig...');

  class SupabaseConfig {
    constructor() {
      // Try to get from injected environment variables first
      let supabaseUrl = '';
      let supabaseAnonKey = '';
      let apiBaseUrl = '';

      // Check for injected environment variables (from server middleware)
      if (typeof window.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' && window.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseUrl = window.NEXT_PUBLIC_SUPABASE_URL;
        supabaseAnonKey = window.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        apiBaseUrl = window.NEXT_PUBLIC_API_BASE_URL || 'https://tutor-ai-phi.vercel.app';
        console.log('✅ Using injected environment variables');
      } else {
        // Fallback to hardcoded values
        supabaseUrl = 'https://xhuljxuxnlwtocfmwiid.supabase.co';
        supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzQ4MTYsImV4cCI6MjA2NzMxMDgxNn0.udHlokpxgR45eS6Pl0OWj7YT1RwW6FUAvGFTed03EIU';
        // Use production API URL for deployed app
        apiBaseUrl = 'https://tutor-ai-phi.vercel.app';
        console.log('⚠️ Using hardcoded fallback values');
      }

      this.config = {
        supabaseUrl: supabaseUrl,
        supabaseAnonKey: supabaseAnonKey,
        apiBaseUrl: apiBaseUrl
      };
      
      this.isLoaded = true;
      console.log('✅ SupabaseConfig initialized successfully');
      console.log('📍 URL:', this.config.supabaseUrl);
      console.log('🔑 Key:', this.config.supabaseAnonKey.substring(0, 20) + '...');
      console.log('🌐 API Base URL:', this.config.apiBaseUrl);
    }

    getConfig() {
      return this.config;
    }

    isConfigLoaded() {
      return this.isLoaded;
    }
  }

  // Create singleton instance
  window.supabaseConfig = new SupabaseConfig();

  // Global function to get Supabase client
  window.getSupabaseClient = async function() {
    try {
      console.log('🔄 Creating Supabase client...');

      // Ensure config is available
      if (!window.supabaseConfig) {
        throw new Error('SupabaseConfig not initialized');
      }

      const config = window.supabaseConfig.getConfig();
      
      if (!config || !config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error('Supabase configuration not available or incomplete');
      }

      // Check if Supabase library is loaded
      if (typeof window.supabase === 'undefined' || !window.supabase) {
        throw new Error('Supabase library not loaded. Please check CDN connection.');
      }

      // Check if createClient function exists
      if (typeof window.supabase.createClient !== 'function') {
        throw new Error('Supabase createClient function not available');
      }

      const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      
      console.log('✅ Supabase client created successfully');
      return client;

    } catch (error) {
      console.error('❌ Error creating Supabase client:', error);
      throw error;
    }
  };

  // Global function to get API base URL
  window.getApiBaseUrl = function() {
    if (!window.supabaseConfig) {
      return 'https://tutor-ai-phi.vercel.app'; // Fallback
    }
    return window.supabaseConfig.getConfig().apiBaseUrl;
  };

  console.log('🎯 SupabaseConfig module loaded successfully');

})();