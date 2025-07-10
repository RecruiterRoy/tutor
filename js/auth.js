// auth.js - TUTOR.AI Authentication Utilities
// Handles all authentication logic for the application

// Remove module import - use global window.supabase instead

class TutorAuth {
    constructor() {
        this.supabase = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        // Wait for global supabase to be available
        while (!window.supabase) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.supabase = window.supabase;
        
        // Initialize auth state
        this.currentUser = null;
        
        // Set up auth state listener
        this.setupAuthListener();
    }

    // Set up authentication state listener
    setupAuthListener() {
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (session) {
                this.currentUser = session.user;
                this.isAuthenticated = true;
                
                // Update user profile if needed
                await this.updateUserProfile(session.user);
                
                // Redirect based on user completion status
                this.handleAuthRedirect();
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
            }
            
            // Update UI based on auth state
            this.updateAuthUI();
        });
    }

    // Email/Password Authentication
    async signInWithEmail(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Email sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Magic Link Authentication
    async signInWithMagicLink(email) {
        try {
            const { data, error } = await this.supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard.html`
                }
            });

            if (error) throw error;
            return { success: true, message: 'Magic link sent to your email!' };
        } catch (error) {
            console.error('Magic link error:', error);
            return { success: false, error: error.message };
        }
    }

    // Phone/OTP Authentication
    async signInWithPhone(phone) {
        try {
            const { data, error } = await this.supabase.auth.signInWithOtp({
                phone: phone,
                options: {
                    shouldCreateUser: true
                }
            });

            if (error) throw error;
            return { success: true, message: 'OTP sent to your phone!' };
        } catch (error) {
            console.error('Phone sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Verify OTP
    async verifyOTP(phone, token) {
        try {
            const { data, error } = await this.supabase.auth.verifyOtp({
                phone: phone,
                token: token,
                type: 'sms'
            });

            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            console.error('OTP verification error:', error);
            return { success: false, error: error.message };
        }
    }

    // Google OAuth
    async signInWithGoogle() {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard.html`
                }
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign Up with Email
    async signUpWithEmail(email, password, userData = {}) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: userData
                }
            });

            if (error) throw error;
            return { success: true, user: data.user, needsConfirmation: !data.session };
        } catch (error) {
            console.error('Email sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign Out
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            // Redirect to login page
            window.location.href = '/login.html';
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Reset Password
    async resetPassword(email) {
        try {
            const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;
            return { success: true, message: 'Password reset email sent!' };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update User Profile
    async updateUserProfile(user) {
        try {
            // Get existing user profile
            const { data: existingUser, error: fetchError } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            // If user doesn't exist in our users table, they were just created
            if (!existingUser) {
                console.log('User profile will be created by trigger');
                return;
            }

            // Update user profile with latest auth data
            const updates = {
                email: user.email,
                updated_at: new Date().toISOString()
            };

            // Add phone if available
            if (user.phone) {
                updates.phone = user.phone;
                updates.phone_verified = true;
            }

            const { error: updateError } = await this.supabase
                .from('users')
                .update(updates)
                .eq('id', user.id);

            if (updateError) throw updateError;
        } catch (error) {
            console.error('Profile update error:', error);
        }
    }

    // Get User Profile
    async getUserProfile(userId = null) {
        try {
            const id = userId || this.currentUser?.id;
            if (!id) return null;

            const { data, error } = await this.supabase
                .from('users')
                .select(`
                    *,
                    student_profiles (*),
                    user_subscriptions (
                        *,
                        subscription_plans (*)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }

    // Check if user has completed profile
    async checkProfileCompletion(userId = null) {
        try {
            const profile = await this.getUserProfile(userId);
            if (!profile) return false;

            // Check if student profile exists
            const hasStudentProfile = profile.student_profiles && profile.student_profiles.length > 0;
            
            return {
                hasBasicProfile: !!profile.full_name,
                hasStudentProfile: hasStudentProfile,
                hasSubscription: profile.user_subscriptions && profile.user_subscriptions.length > 0,
                isComplete: !!profile.full_name && hasStudentProfile
            };
        } catch (error) {
            console.error('Profile completion check error:', error);
            return false;
        }
    }

    // Check subscription status
    async getSubscriptionStatus(userId = null) {
        try {
            const id = userId || this.currentUser?.id;
            if (!id) return null;

            const { data, error } = await this.supabase
                .from('user_subscriptions')
                .select(`
                    *,
                    subscription_plans (*)
                `)
                .eq('user_id', id)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Subscription status error:', error);
            return null;
        }
    }

    // Handle authentication redirects
    handleAuthRedirect() {
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on a protected page
        if (currentPath.includes('dashboard') || currentPath.includes('profile')) {
            return;
        }

        // Redirect authenticated users away from auth pages
        if (this.isAuthenticated && (currentPath.includes('login') || currentPath.includes('register'))) {
            window.location.href = '/dashboard.html';
        }
    }

    // Update UI based on auth state
    updateAuthUI() {
        // Update login/logout buttons
        const loginButtons = document.querySelectorAll('.login-btn');
        const logoutButtons = document.querySelectorAll('.logout-btn');
        const userInfo = document.querySelectorAll('.user-info');

        if (this.isAuthenticated) {
            loginButtons.forEach(btn => btn.style.display = 'none');
            logoutButtons.forEach(btn => btn.style.display = 'block');
            userInfo.forEach(info => {
                info.style.display = 'block';
                info.textContent = this.currentUser?.email || 'User';
            });
        } else {
            loginButtons.forEach(btn => btn.style.display = 'block');
            logoutButtons.forEach(btn => btn.style.display = 'none');
            userInfo.forEach(info => info.style.display = 'none');
        }
    }

    // Protect routes (call this on protected pages)
    async protectRoute() {
        const session = await this.supabase.auth.getSession();
        
        if (!session.data.session) {
            window.location.href = '/login.html';
            return false;
        }
        
        return true;
    }

    // Get current session
    async getCurrentSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Session error:', error);
            return null;
        }
    }

    // Refresh session
    async refreshSession() {
        try {
            const { data, error } = await this.supabase.auth.refreshSession();
            if (error) throw error;
            return data.session;
        } catch (error) {
            console.error('Session refresh error:', error);
            return null;
        }
    }

    // Upload file to Supabase Storage
    async uploadFile(file, bucket = 'homework', path = '') {
        try {
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = path ? `${path}/${fileName}` : fileName;

            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            return { success: true, url: publicUrl, path: data.path };
        } catch (error) {
            console.error('File upload error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create homework submission
    async createHomeworkSubmission(homeworkData) {
        try {
            const { data, error } = await this.supabase
                .from('homework_submissions')
                .insert([{
                    user_id: this.currentUser.id,
                    ...homeworkData
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, submission: data };
        } catch (error) {
            console.error('Homework submission error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user's homework submissions
    async getHomeworkSubmissions(limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from('homework_submissions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { success: true, submissions: data };
        } catch (error) {
            console.error('Get homework submissions error:', error);
            return { success: false, error: error.message };
        }
    }

    // Save AI chat message
    async saveChatMessage(sessionId, message, messageType = 'user') {
        try {
            const { data, error } = await this.supabase
                .from('ai_chat_messages')
                .insert([{
                    session_id: sessionId,
                    user_id: this.currentUser.id,
                    message_type: messageType,
                    content: message
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, message: data };
        } catch (error) {
            console.error('Save chat message error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create AI chat session
    async createChatSession(title = 'New Chat', subject = null) {
        try {
            const { data, error } = await this.supabase
                .from('ai_chat_sessions')
                .insert([{
                    user_id: this.currentUser.id,
                    title: title,
                    subject: subject
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, session: data };
        } catch (error) {
            console.error('Create chat session error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update daily progress
    async updateDailyProgress(progressData) {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await this.supabase
                .from('daily_progress')
                .upsert([{
                    user_id: this.currentUser.id,
                    date: today,
                    ...progressData
                }], {
                    onConflict: 'user_id,date'
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, progress: data };
        } catch (error) {
            console.error('Update daily progress error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize global auth instance
window.tutorAuth = new TutorAuth();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorAuth;
}