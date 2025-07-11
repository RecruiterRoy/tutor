// config.js - Hardcoded Supabase configuration
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

class SupabaseConfig {
  constructor() {
    // Hardcoded Supabase configuration
    this.config = {
      supabaseUrl: 'https://xhuljxuxnlwtocfmwiid.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzQ4MTYsImV4cCI6MjA2NzMxMDgxNn0.udHlokpxgR45eS6Pl0OWj7YT1RwW6FUAvGFTed03EIU'
    };
    this.isLoaded = true;
    console.log('SupabaseConfig initialized with hardcoded values');
  }

  async loadSupabaseConfig() {
    // No async loading needed with hardcoded values
    console.log('Using hardcoded Supabase configuration');
    return this.config;
  }

  getConfig() {
    return this.config;
  }

  isConfigLoaded() {
    return this.isLoaded;
  }
}

// Singleton instance
window.supabaseConfig = window.supabaseConfig || new SupabaseConfig();

// Global function to get Supabase client
window.getSupabaseClient = async function() {
  try {
    // Ensure config is available
    if (!window.supabaseConfig) {
      throw new Error('SupabaseConfig not initialized');
    }

    const config = window.supabaseConfig.getConfig();
    
    if (!config || !config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Supabase configuration not available or incomplete');
    }

    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
      throw new Error('Supabase library not loaded. Please check CDN connection.');
    }

    const { createClient } = window.supabase;
    
    if (typeof createClient !== 'function') {
      throw new Error('Supabase createClient function not available');
    }

    console.log('Creating Supabase client with URL:', config.supabaseUrl);
    const client = createClient(config.supabaseUrl, config.supabaseAnonKey);
    
    console.log('Supabase client created successfully');
    return client;

  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
};

})();