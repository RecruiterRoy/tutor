// config.js - Hardcoded Supabase configuration
class SupabaseConfig {
  constructor() {
    // Hardcoded Supabase configuration
    this.config = {
      supabaseUrl: 'https://xhuljxuxnlwtocfmwiid.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzQ4MTYsImV4cCI6MjA2NzMxMDgxNn0.udHlokpxgR45eS6Pl0OWj7YT1RwW6FUAvGFTed03EIU'
    };
    this.isLoaded = true;
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

async function getSupabaseClient() {
  try {
    const config = window.supabaseConfig.getConfig();
    
    if (!config) {
      throw new Error('Supabase configuration not available');
    }

    // Check if Supabase is loaded
    if (typeof window.supabase === 'undefined') {
      throw new Error('Supabase library not loaded');
    }

    const { createClient } = window.supabase;
    return createClient(config.supabaseUrl, config.supabaseAnonKey);

  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}