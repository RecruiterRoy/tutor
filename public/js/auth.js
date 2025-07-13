// auth.js - Robust singleton pattern with multiple load protection
(function() {
  'use strict';

  // Prevent multiple script execution
  if (window.tutorAuthLoaded) {
    console.log('TutorAuth script already loaded, skipping execution');
    return;
  }
  
  // Mark script as loaded
  window.tutorAuthLoaded = true;

  // Check if TutorAuth class already exists
  if (window.TutorAuth) {
    console.log('TutorAuth class already exists, skipping redeclaration');
    return;
  }

  console.log('Initializing TutorAuth class...');

  class TutorAuth {
    constructor() {
      this.supabase = null;
      this.currentUser = null;
      this.isInitialized = false;
      this.initializationPromise = null;
    }

    async init() {
      // Prevent multiple initializations
      if (this.initializationPromise) {
        return this.initializationPromise;
      }

      this.initializationPromise = this._initialize();
      return this.initializationPromise;
    }

    async _initialize() {
      try {
        console.log('Initializing TutorAuth...');
        
        // Wait for Supabase to be available
        await this.waitForSupabase();
        
        // Get Supabase client
        this.supabase = await window.getSupabaseClient();
        
        // Check current session
        const { data: { session } } = await this.supabase.auth.getSession();
        this.currentUser = session?.user || null;
        
        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event);
          this.currentUser = session?.user || null;
          this.handleAuthChange(event, session);
        });

        this.isInitialized = true;
        console.log('TutorAuth initialized successfully');
        
        return this;

      } catch (error) {
        console.error('TutorAuth initialization failed:', error);
        throw error;
      }
    }

    async waitForSupabase(timeout = 10000) {
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        if (typeof window.supabase !== 'undefined' && 
            typeof window.getSupabaseClient === 'function') {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      throw new Error('Supabase client not initialized after 10 seconds');
    }

    async signInWithEmail(email, password) {
      if (!this.isInitialized) {
        throw new Error('TutorAuth not initialized');
      }

      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        this.currentUser = data.user;
        return { success: true, user: data.user };

      } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
      }
    }

    async signUpWithEmail(email, password, metadata = {}) {
      if (!this.isInitialized) {
        throw new Error('TutorAuth not initialized');
      }

      try {
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        });

        if (error) throw error;

        return { success: true, user: data.user };

      } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
      }
    }

    async signOut() {
      if (!this.isInitialized) {
        throw new Error('TutorAuth not initialized');
      }

      try {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;

        this.currentUser = null;
        return { success: true };

      } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
      }
    }

    getCurrentUser() {
      return this.currentUser;
    }

    isAuthenticated() {
      return !!this.currentUser;
    }

    handleAuthChange(event, session) {
      // Handle auth state changes
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in');
          // Redirect to dashboard or handle sign in
          break;
        case 'SIGNED_OUT':
          console.log('User signed out');
          // Redirect to login or handle sign out
          break;
        case 'PASSWORD_RECOVERY':
          console.log('Password recovery initiated');
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed');
          break;
        case 'USER_UPDATED':
          console.log('User updated');
          break;
      }
    }
  }

  // Create singleton instance
  window.TutorAuth = new TutorAuth();
  
  console.log('TutorAuth class defined');

})();
