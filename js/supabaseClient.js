import { createClient } from '@supabase/supabase-js';

let supabase = null;

export async function getSupabaseClient() {
    if (supabase) return supabase;
    const response = await fetch('/api/supabase-config');
    const config = await response.json();
    if (!config.supabaseUrl || !config.supabaseKey) {
        throw new Error('Supabase configuration not available');
    }
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    return supabase;
} 