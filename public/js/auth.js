// tutor/js/auth.js
// Complete authentication system for Supabase with persistent sessions

class TutorAuth {
    constructor() {
      this.supabase = null;
      this.user = null;
      this.rememberMe = localStorage.getItem('rememberMe') === 'true';
      this.initialized = false;
      this.init();
    }
  
    // ========================
    // INITIALIZATION
    // ========================
  
    async init() {
      // Wait for Supabase to be available
      await this.waitForSupabase();
      
      // Check existing session
      await this.checkSession();
      
      // Setup auth state listener
      this.setupAuthListener();
      
      // Restore remember me preference
      this.restoreRememberMe();
      
      this.initialized = true;
    }
    
    async waitForSupabase() {
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds max
      
      while (!window.supabase?.auth && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!window.supabase?.auth) {
        throw new Error('Supabase client not initialized after 10 seconds');
      }
      
      this.supabase = window.supabase;
    }
  
    async checkSession() {
      try {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error) throw error;
        if (session) this.user = session.user;
        
      } catch (error) {
        console.error('Session check failed:', error);
      }
    }
  
    setupAuthListener() {
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        this.user = session?.user || null;
        
        // Handle session persistence
        if (this.rememberMe && event === 'SIGNED_IN') {
          await this.setPersistentSession();
        }
        
        // Handle auth events
        this.handleAuthEvents(event);
      });
    }
  
    // ========================
    // AUTHENTICATION METHODS
    // ========================
  
    // Email + Password
    async signInWithEmail(email, password, rememberMe = false) {
      try {
        this.rememberMe = rememberMe;
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        return { success: true, user: data.user };
        
      } catch (error) {
        console.error('Email sign in failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    // Magic Link (Email)
    async sendMagicLink(email, rememberMe = false) {
      try {
        this.rememberMe = rememberMe;
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        const { data, error } = await this.supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
            shouldCreateUser: true
          }
        });
        
        if (error) throw error;
        return { success: true, message: 'Magic link sent!' };
        
      } catch (error) {
        console.error('Magic link failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    // Phone (Twilio)
    async sendPhoneOTP(phone, rememberMe = false) {
      try {
        this.rememberMe = rememberMe;
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        // Format phone number (remove all non-digit characters)
        const formattedPhone = phone.replace(/\D/g, '');
        
        const { data, error } = await this.supabase.auth.signInWithOtp({
          phone: `+${formattedPhone}`,
          options: {
            shouldCreateUser: true
          }
        });
        
        if (error) throw error;
        return { success: true, message: 'OTP sent!' };
        
      } catch (error) {
        console.error('Phone OTP failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    async verifyPhoneOTP(phone, token) {
      try {
        const formattedPhone = phone.replace(/\D/g, '');
        
        const { data, error } = await this.supabase.auth.verifyOtp({
          phone: `+${formattedPhone}`,
          token,
          type: 'sms'
        });
        
        if (error) throw error;
        return { success: true, user: data.user };
        
      } catch (error) {
        console.error('OTP verification failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    // Google OAuth
    async signInWithGoogle(rememberMe = false) {
      try {
        this.rememberMe = rememberMe;
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        const { data, error } = await this.supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });
        
        if (error) throw error;
        return { success: true };
        
      } catch (error) {
        console.error('Google sign in failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    // Sign Up
    async signUpWithEmail(email, password, userData = {}, rememberMe = false) {
      try {
        this.rememberMe = rememberMe;
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        
        return { 
          success: true, 
          user: data.user, 
          needsConfirmation: !data.session 
        };
        
      } catch (error) {
        console.error('Sign up failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    // ========================
    // SESSION MANAGEMENT
    // ========================
  
    async setPersistentSession() {
      if (!this.rememberMe) return;
      
      try {
        // Refresh session to get long-lived token
        const { data, error } = await this.supabase.auth.refreshSession();
        
        if (error) throw error;
        if (data.session) {
          // Set to never expire (controlled by Supabase's refresh token rotation)
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: data.session,
            expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
          }));
        }
        
      } catch (error) {
        console.error('Persistent session failed:', error);
      }
    }
  
    restoreRememberMe() {
      const rememberMe = localStorage.getItem('rememberMe');
      if (rememberMe !== null) {
        this.rememberMe = rememberMe === 'true';
        
        // Restore session if remember me is enabled
        if (this.rememberMe) {
          this.tryRestoreSession();
        }
      }
    }
  
    async tryRestoreSession() {
      try {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error) throw error;
        if (session) {
          this.user = session.user;
          return true;
        }
        
      } catch (error) {
        console.error('Session restore failed:', error);
        localStorage.removeItem('supabase.auth.token');
      }
      return false;
    }
  
    // ========================
    // PASSWORD MANAGEMENT
    // ========================
  
    async resetPassword(email) {
      try {
        const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        
        if (error) throw error;
        return { success: true, message: 'Password reset email sent!' };
        
      } catch (error) {
        console.error('Password reset failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    async updatePassword(newPassword) {
      try {
        const { data, error } = await this.supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) throw error;
        return { success: true, message: 'Password updated!' };
        
      } catch (error) {
        console.error('Password update failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    // ========================
    // USER MANAGEMENT
    // ========================
  
    async getUserProfile() {
      if (!this.user) return null;
      
      try {
        const { data, error } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', this.user.id)
          .single();
        
        if (error) throw error;
        return data;
        
      } catch (error) {
        console.error('Profile fetch failed:', error);
        return null;
      }
    }
  
    async updateProfile(updates) {
      if (!this.user) return { success: false, error: 'Not authenticated' };
      
      try {
        // Update auth user
        const { data: authData, error: authError } = await this.supabase.auth.updateUser({
          data: updates
        });
        
        if (authError) throw authError;
        
        // Update profile in profiles table
        const { data, error } = await this.supabase
          .from('profiles')
          .update(updates)
          .eq('id', this.user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return { success: true, profile: data };
        
      } catch (error) {
        console.error('Profile update failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    // ========================
    // LOGOUT
    // ========================
  
    async signOut() {
      try {
        const { error } = await this.supabase.auth.signOut();
        
        // Clear local session data
        this.user = null;
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('rememberMe');
        
        if (error) throw error;
        return { success: true };
        
      } catch (error) {
        console.error('Sign out failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    // ========================
    // EVENT HANDLING
    // ========================
  
    handleAuthEvents(event) {
      switch (event) {
        case 'SIGNED_IN':
          this.handleSignedIn();
          break;
          
        case 'SIGNED_OUT':
          this.handleSignedOut();
          break;
          
        case 'TOKEN_REFRESHED':
          if (this.rememberMe) {
            this.setPersistentSession();
          }
          break;
      }
    }
  
    handleSignedIn() {
      // Redirect to dashboard after sign in
      if (!window.location.pathname.includes('dashboard')) {
        window.location.href = '/dashboard';
      }
    }
  
    handleSignedOut() {
      // Redirect to login page after sign out
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/login';
      }
    }
  }
  
  // Initialize auth system when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.tutorAuth) {
      window.tutorAuth = new TutorAuth();
    }
  });
  
  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorAuth;
  }