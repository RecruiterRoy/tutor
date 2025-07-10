// Use the global Supabase client from CDN
let supabase = null;

export async function getSupabaseClient() {
    if (supabase) return supabase;
    
    try {
        const response = await fetch('/api/supabase-config');
        const config = await response.json();
        
        if (!config.supabaseUrl || !config.supabaseKey) {
            throw new Error('Supabase configuration not available');
        }
        
        // Use the global Supabase client that should be loaded via CDN
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
        } else {
            throw new Error('Supabase CDN not loaded');
        }
        
        return supabase;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        throw error;
    }
} 