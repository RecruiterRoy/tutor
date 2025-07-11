// config.js - Fixed version for NEXT_PUBLIC environment variables
class SupabaseConfig {
  constructor() {
    this.config = null;
    this.isLoaded = false;
  }

  async loadSupabaseConfig() {
    try {
      // Option 1: Use NEXT_PUBLIC_ environment variables (direct access)
      if (typeof window !== 'undefined' && window.NEXT_PUBLIC_SUPABASE_URL) {
        this.config = {
          supabaseUrl: window.NEXT_PUBLIC_SUPABASE_URL,
          supabaseAnonKey: window.NEXT_PUBLIC_SUPABASE_ANON_KEY
        };
        console.log('Using NEXT_PUBLIC environment variables');
      } else {
        // Option 2: Fetch from your API endpoint (fallback)
        console.log('Falling back to API config endpoint');
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        this.config = await response.json();
      }

      // Validate config
      if (!this.config?.supabaseUrl || !this.config?.supabaseAnonKey) {
        throw new Error('Invalid Supabase configuration');
      }

      this.isLoaded = true;
      console.log('Supabase config loaded successfully');
      return this.config;

    } catch (error) {
      console.error('Failed to load Supabase config:', error);
      throw error;
    }
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
    if (!window.supabaseConfig.isConfigLoaded()) {
      await window.supabaseConfig.loadSupabaseConfig();
    }

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