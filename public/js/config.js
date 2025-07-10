// config.js - Simplified and fixed version
const SUPABASE_URL = 'https://xhuljxuxnlwtocfmwiid.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzQ4MTYsImV4cCI6MjA2NzMxMDgxNn0.udHlokpxgR45eS6Pl0OWj7YT1RwW6FUAvGFTed03EIU';

// Directly create client without API calls
function getSupabaseClient() {
  if (!window.supabase?.createClient) {
    throw new Error('Supabase client library not loaded');
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Initialize immediately when loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.supabase = getSupabaseClient();
    console.log('Supabase initialized successfully');
  } catch (error) {
    console.error('Supabase init error:', error);
  }
});