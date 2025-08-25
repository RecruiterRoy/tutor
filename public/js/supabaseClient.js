// Use the global Supabase client from CDN
let supabase = null;

async function getSupabaseClient() {
    if (supabase) return supabase;
    
    try {
        // Check if Supabase is loaded globally
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase CDN not loaded');
        }
        
        // Use the configuration from config.js
        const config = window.TUTOR_CONFIG;
        if (!config || !config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
            throw new Error('Supabase configuration not available');
        }
        
                // Create the client
        try {
            supabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY); 
            console.log('✅ Supabase client initialized successfully');
        } catch (error) {
            console.error('❌ Supabase client initialization failed:', error);
            // Don't crash the dashboard, continue without Supabase
        }
        
        return supabase;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        throw error;
    }
}

// Initialize immediately and expose to window
async function initializeSupabaseClient() {
    try {
        const client = await getSupabaseClient();
        window.supabaseClient = client;
        console.log('✅ Supabase client exposed to window.supabaseClient');
        return client;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        throw error;
    }
}

// Initialize immediately if possible
if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined' && window.TUTOR_CONFIG) {
    initializeSupabaseClient().catch(error => {
        console.warn('Supabase initialization failed, continuing without it:', error);
    });
}

// Also initialize when DOM is loaded (fallback)
window.addEventListener('DOMContentLoaded', function() {
    if (!window.supabaseClient && typeof window.supabase !== 'undefined' && window.TUTOR_CONFIG) {
        initializeSupabaseClient().catch(error => {
            console.warn('Supabase initialization failed on DOMContentLoaded, continuing without it:', error);
        });
    }
}); 
