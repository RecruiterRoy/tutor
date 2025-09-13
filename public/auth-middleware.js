// Authentication Middleware for Strict OAuth Verification
// This file contains shared authentication logic to prevent OAuth bypassing

// Supabase configuration
const supabaseUrl = 'https://vfqdjpiyaabufpaofysz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWRqcGl5YWFidWZwYW9meXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDkzMDEsImV4cCI6MjA2OTE4NTMwMX0.SVY1Kf7D1nbXssuxCnnHcvaDAIintOpCLfhxV6rHvjo';

// Initialize Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Strict OAuth verification function
async function verifyOAuthCompletion(user) {
    try {
        console.log('🔄 Verifying OAuth completion for user:', user.email);
        
        // Check if user has a profile (indicates completed registration)
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id) // Use 'id' instead of 'user_id'
            .single();
        
        if (profileError && profileError.code === 'PGRST116') {
            console.log('❌ No user profile found - OAuth not completed');
            return { isValid: false, reason: 'No profile found' };
        }
        
        if (!profile) {
            console.log('❌ No user profile found - OAuth not completed');
            return { isValid: false, reason: 'No profile found' };
        }
        
        // Check if user has completed required fields
        const requiredFields = ['full_name', 'phone', 'school_name', 'board', 'class', 'city', 'state']; // Use 'school_name' instead of 'school'
        const missingFields = requiredFields.filter(field => !profile[field] || profile[field] === 'Not set');
        
        if (missingFields.length > 0) {
            console.log('❌ Missing required fields:', missingFields);
            return { isValid: false, reason: 'Incomplete profile', missingFields };
        }
        
        // Check if email is verified (for email users)
        if (user.app_metadata?.provider === 'email' && !user.email_confirmed_at) {
            console.log('❌ Email not verified');
            return { isValid: false, reason: 'Email not verified' };
        }
        
        // Check if user has valid authentication method
        const validProviders = ['google', 'email'];
        const userProvider = user.app_metadata?.provider;
        
        if (!userProvider || !validProviders.includes(userProvider)) {
            console.log('❌ Invalid authentication provider:', userProvider);
            return { isValid: false, reason: 'Invalid authentication method' };
        }
        
        console.log('✅ OAuth verification passed for provider:', userProvider);
        return { isValid: true, provider: userProvider };
        
    } catch (error) {
        console.error('❌ OAuth verification error:', error);
        return { isValid: false, reason: 'Verification error' };
    }
}

// Authentication check function
async function checkAuthentication() {
    try {
        console.log('🔄 Checking authentication...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Session check error:', error);
            return { isAuthenticated: false, reason: 'Session error' };
        }
        
        if (!session) {
            console.log('❌ No active session');
            return { isAuthenticated: false, reason: 'No session' };
        }
        
        console.log('✅ User authenticated:', session.user.email);
        
        // Verify OAuth completion
        const authResult = await verifyOAuthCompletion(session.user);
        if (!authResult.isValid) {
            console.log('❌ OAuth not completed');
            return { isAuthenticated: false, reason: authResult.reason, user: session.user };
        }
        
        console.log('✅ OAuth verification passed');
        return { isAuthenticated: true, user: session.user, provider: authResult.provider };
        
    } catch (error) {
        console.error('❌ Authentication check failed:', error);
        return { isAuthenticated: false, reason: 'Check failed' };
    }
}

// Redirect function based on authentication status
function handleAuthenticationRedirect(authResult, currentPage) {
    if (!authResult.isAuthenticated) {
        if (authResult.reason === 'No session' || authResult.reason === 'Session error') {
            // Redirect to login
            if (currentPage !== 'login') {
                window.location.href = 'login.html';
            }
        } else if (authResult.reason === 'No profile found' || authResult.reason === 'Incomplete profile') {
            // Redirect to registration
            if (currentPage !== 'register') {
                window.location.href = 'register.html';
            }
        } else {
            // Redirect to login for other issues
            if (currentPage !== 'login') {
                window.location.href = 'login.html';
            }
        }
        return false;
    }
    
    // User is authenticated and OAuth is complete
    if (currentPage === 'login' || currentPage === 'register') {
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// Export functions for use in other files
window.AuthMiddleware = {
    verifyOAuthCompletion,
    checkAuthentication,
    handleAuthenticationRedirect,
    supabase
};
