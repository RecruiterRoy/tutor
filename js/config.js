// config.js - Client-side configuration
// This file provides configuration for the frontend

// Base URL for API calls
const API_BASE_URL = window.location.origin;

// Supabase configuration - will be loaded from server
let supabaseConfig = null;

// Load Supabase configuration from environment variables
async function loadSupabaseConfig() {
    try {
        // Use Vercel's NEXT_PUBLIC_ environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
            supabaseConfig = {
                supabaseUrl: supabaseUrl,
                supabaseKey: supabaseKey
            };
            console.log('Supabase config loaded from environment variables');
            return supabaseConfig;
        }
        
        // Fallback for local development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Using fallback config for local development');
            return {
                supabaseUrl: 'https://xhuljxuxnlwtocfmwiid.supabase.co',
                supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzQ4MTYsImV4cCI6MjA2NzMxMDgxNn0.udHlokpxgR45eS6Pl0OWj7YT1RwW6FUAvGFTed03EIU'
            };
        }
        
        throw new Error('Supabase environment variables not found');
    } catch (error) {
        console.error('Failed to load Supabase config:', error);
        return null;
    }
}

// Get Supabase client
async function getSupabaseClient() {
    if (!supabaseConfig) {
        await loadSupabaseConfig();
    }
    
    if (!supabaseConfig || !supabaseConfig.supabaseUrl || !supabaseConfig.supabaseKey) {
        throw new Error('Supabase configuration not available');
    }
    
    // Supabase should already be loaded by now
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.error('Supabase not available. Available globals:', Object.keys(window).filter(k => k.includes('supabase')));
        throw new Error('Supabase client library not loaded');
    }
    
    return window.supabase.createClient(supabaseConfig.supabaseUrl, supabaseConfig.supabaseKey);
}

// API helper functions
const API = {
    // Chat API
    async chat(messages, grade, subject, language) {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                grade,
                subject,
                language
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // Health check
    async health() {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Get books
    async getBooks(grade, subject) {
        const params = new URLSearchParams();
        if (grade) params.append('grade', grade);
        if (subject) params.append('subject', subject);
        
        const response = await fetch(`${API_BASE_URL}/api/fs/books?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Search books
    async searchBooks(query, subject, grade) {
        const response = await fetch(`${API_BASE_URL}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                subject,
                grade
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // Get avatars
    async getAvatars() {
        const response = await fetch(`${API_BASE_URL}/api/avatars`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Save preferences
    async savePreferences(userId, preferences) {
        const response = await fetch(`${API_BASE_URL}/api/preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                preferences
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // Save study session
    async saveStudySession(userId, topic, subject, duration) {
        const response = await fetch(`${API_BASE_URL}/api/study-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                topic,
                subject,
                duration
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // PDF parsing
    async parsePDF(buffer, filePath, text) {
        const response = await fetch(`${API_BASE_URL}/api/pdf/parse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                buffer,
                filePath,
                text
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // Get PDF status
    async getPDFStatus() {
        const response = await fetch(`${API_BASE_URL}/api/pdf/status`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_BASE_URL,
        loadSupabaseConfig,
        getSupabaseClient,
        API
    };
} 