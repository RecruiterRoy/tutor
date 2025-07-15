// public/js/auth.js
// Simplified Authentication for Mobile App

// Global auth state
window.authState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true
};

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeAuth();
});

async function initializeAuth() {
  try {
    // Wait for Supabase client to be available
    if (!window.supabaseClient) {
      console.log('Waiting for Supabase client...');
      await waitForSupabase();
    }
    
    // Get current session
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    if (error) {
      console.error('Auth initialization error:', error);
      handleAuthError(error);
      return;
    }
    
    if (session) {
      window.authState.session = session;
      window.authState.user = session.user;
      window.authState.isAuthenticated = true;
      console.log('User authenticated:', session.user.email);
    }
    
    window.authState.isLoading = false;
    
    // Set up auth state change listener
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      handleAuthStateChange(event, session);
    });
    
  } catch (error) {
    console.error('Auth initialization failed:', error);
    window.authState.isLoading = false;
    handleAuthError(error);
  }
}

function waitForSupabase(maxWait = 5000) {
  return new Promise((resolve, reject) => {
    const checkInterval = 100;
    let elapsed = 0;
    
    const check = () => {
      if (window.supabaseClient) {
        resolve();
      } else if (elapsed >= maxWait) {
        reject(new Error('Supabase client not available'));
      } else {
        elapsed += checkInterval;
        setTimeout(check, checkInterval);
      }
    };
    
    check();
  });
}

function handleAuthStateChange(event, session) {
  switch (event) {
    case 'SIGNED_IN':
      window.authState.session = session;
      window.authState.user = session.user;
      window.authState.isAuthenticated = true;
      onAuthSuccess(session);
      break;
      
    case 'SIGNED_OUT':
      window.authState.session = null;
      window.authState.user = null;
      window.authState.isAuthenticated = false;
      onAuthSignOut();
      break;
      
    case 'TOKEN_REFRESHED':
      window.authState.session = session;
      console.log('Token refreshed');
      break;
      
    default:
      console.log('Unhandled auth event:', event);
  }
}

async function signIn(email, password) {
  try {
    if (!window.supabaseClient) {
      throw new Error('Authentication service not available');
    }
    
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    
    if (error) {
      console.error('Sign in error:', error.message);
      throw new Error(getErrorMessage(error));
    }
    
    return data;
    
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}

async function signUp(email, password, userData = {}) {
  try {
    if (!window.supabaseClient) {
      throw new Error('Authentication service not available');
    }
    
    const { data, error } = await window.supabaseClient.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      console.error('Sign up error:', error.message);
      throw new Error(getErrorMessage(error));
    }
    
    return data;
    
  } catch (error) {
    console.error('Registration error:', error.message);
    throw error;
  }
}

async function signOut() {
  try {
    if (!window.supabaseClient) {
      console.log('Supabase client not available, redirecting anyway...');
      window.location.href = '/login.html';
      return;
    }
    
    const { error } = await window.supabaseClient.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error.message);
    }
    
    // Always redirect regardless of error
    window.location.href = '/login.html';
    
  } catch (error) {
    console.error('Logout error:', error.message);
    // Force redirect even on error
    window.location.href = '/login.html';
  }
}

async function resetPassword(email) {
  try {
    if (!window.supabaseClient) {
      throw new Error('Authentication service not available');
    }
    
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });
    
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Password reset error:', error.message);
    throw error;
  }
}

function onAuthSuccess(session) {
  console.log('Authentication successful');
  
  // Save user preference for auto-login
  if (window.appConfig?.app?.autoSave) {
    localStorage.setItem('tutor_last_login', Date.now());
  }
  
  // Redirect to dashboard if on login page
  if (window.location.pathname === '/login.html' || window.location.pathname === '/register.html') {
    window.location.href = '/dashboard.html';
  }
  
  // Dispatch custom event for other components
  window.dispatchEvent(new CustomEvent('authSuccess', { detail: session }));
}

function onAuthSignOut() {
  console.log('User signed out');
  
  // Clear local storage
  localStorage.removeItem('tutor_last_login');
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('authSignOut'));
  
  // Redirect if not already on login page
  if (window.location.pathname !== '/login.html') {
    window.location.href = '/login.html';
  }
}

function handleAuthError(error) {
  console.error('Authentication error:', error);
  
  const errorMessage = getErrorMessage(error);
  
  // Show user-friendly error if config allows
  if (window.appConfig?.errorHandling?.showUserFriendlyErrors) {
    showAuthError(errorMessage);
  }
  
  // Redirect to login if on protected page
  const protectedPages = ['/dashboard.html', '/profile.html'];
  if (protectedPages.some(page => window.location.pathname.includes(page))) {
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 2000);
  }
}

function getErrorMessage(error) {
  const errorMessages = {
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed': 'Please check your email and confirm your account.',
    'User not found': 'No account found with this email address.',
    'Too many requests': 'Too many login attempts. Please try again later.',
    'Network error': 'Connection error. Please check your internet and try again.',
    'Signup disabled': 'Account registration is currently disabled.'
  };
  
  const message = error?.message || error || 'An unexpected error occurred';
  return errorMessages[message] || message;
}

function showAuthError(message) {
  // Create and show error toast
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 left-4 right-4 bg-red-600 text-white p-3 rounded-lg text-sm font-medium text-center z-50';
  toast.textContent = message;
  toast.style.animation = 'slideDown 0.3s ease-out';
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Utility function to check if user is authenticated
function isAuthenticated() {
  return window.authState.isAuthenticated && window.authState.session;
}

// Utility function to get current user
function getCurrentUser() {
  return window.authState.user;
}

// Utility function to get current session
function getCurrentSession() {
  return window.authState.session;
}

// Export functions for global use
window.auth = {
  signIn,
  signUp,
  signOut,
  resetPassword,
  isAuthenticated,
  getCurrentUser,
  getCurrentSession,
  state: window.authState
};

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

