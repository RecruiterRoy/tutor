// Configuration for the Tutor.AI application
window.appConfig = {
    // Supabase Configuration
    supabaseUrl: 'https://xhuljxuxnlwtocfmwiid.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NjU5NTYsImV4cCI6MjA1MTI0MTk1Nn0.xzUEGlhqaAjLhc3WFnXfDLPqtPHvZb0zGZKjmKqUZJA',
    
    // API Configuration
    // For development: 'http://localhost:3000'
    // For production: Using Vercel deployment
    apiBaseUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://tutor-eight-dusky.vercel.app',
    
    // Environment
    environment: window.location.hostname === 'localhost' ? 'development' : 'production'
}; 