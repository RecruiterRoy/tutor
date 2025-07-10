// Configuration for the Tutor.AI application
window.appConfig = {
    // Supabase Configuration
    supabaseUrl: 'https://xhuljxuxnlwtocfmwiid.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzQ4MTYsImV4cCI6MjA2NzMxMDgxNn0.udHlokpxgR45eS6Pl0OWj7YT1RwW6FUAvGFTed03EIU',
    
    // API Configuration
    // For development: 'http://localhost:3000'
    // For production: Using current Vercel deployment
    apiBaseUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin,
    
    // Environment
    environment: window.location.hostname === 'localhost' ? 'development' : 'production'
}; 