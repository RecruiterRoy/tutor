// User Analytics Tracker
// Automatically tracks user sessions, activity, and usage patterns

class UserAnalytics {
    constructor() {
        this.sessionId = null;
        this.userId = null;
        this.isTracking = false;
        this.lastActivity = Date.now();
        this.activityCheckInterval = null;
        this.heartbeatInterval = null;
        this.sessionStartTime = null;
        
        // Configuration
        this.config = {
            heartbeatInterval: 30000, // 30 seconds
            inactivityThreshold: 300000, // 5 minutes
            activityCheckInterval: 10000, // 10 seconds
            autoEndSession: true,
            trackPageViews: true,
            trackInteractions: true
        };
        
        this.init();
    }

    async init() {
        console.log('📊 Initializing User Analytics...');
        
        // Get user data
        await this.getUserData();
        
        if (this.userId) {
            // Start session tracking
            await this.startSession();
            
            // Set up activity monitoring
            this.setupActivityMonitoring();
            
            // Set up beforeunload handler
            this.setupUnloadHandler();
            
            console.log('✅ User Analytics initialized');
        } else {
            console.log('⚠️ User Analytics not started - no user logged in');
        }
    }

    async getUserData() {
        try {
            // Get user from Supabase
            if (window.supabaseClient) {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (user) {
                    this.userId = user.id;
                    window.userData = user;
                    console.log('👤 User identified:', user.email);
                }
            }
            
            // Fallback: check window.userData
            if (!this.userId && window.userData) {
                this.userId = window.userData.id;
            }
        } catch (error) {
            console.error('❌ Failed to get user data:', error);
        }
    }

    async startSession() {
        if (!this.userId || this.isTracking) return;

        try {
            console.log('🚀 Starting user session...');
            
            // Gather device information
            const deviceInfo = this.getDeviceInfo();
            
            // Call API to start session
            const response = await fetch('/api/analytics/start-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    ...deviceInfo
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.sessionId = data.sessionId;
                this.isTracking = true;
                this.sessionStartTime = Date.now();
                
                console.log('✅ Session started:', this.sessionId);
                
                // Start heartbeat
                this.startHeartbeat();
                
                // Log initial page view
                this.logActivity('page_view', {
                    url: window.location.href,
                    title: document.title
                });
                
            } else {
                console.error('❌ Failed to start session:', response.statusText);
            }
        } catch (error) {
            console.error('❌ Error starting session:', error);
        }
    }

    async endSession() {
        if (!this.sessionId || !this.isTracking) return;

        try {
            console.log('🛑 Ending user session...');
            
            // Stop intervals
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
            }
            if (this.activityCheckInterval) {
                clearInterval(this.activityCheckInterval);
            }

            // Call API to end session
            await fetch('/api/analytics/end-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId
                })
            });

            this.isTracking = false;
            console.log('✅ Session ended');
            
        } catch (error) {
            console.error('❌ Error ending session:', error);
        }
    }

    async logActivity(activityType, details = null, duration = null) {
        if (!this.sessionId || !this.isTracking) return;

        try {
            await fetch('/api/analytics/log-activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    sessionId: this.sessionId,
                    activityType: activityType,
                    activityDetails: details,
                    pageUrl: window.location.href,
                    durationSeconds: duration
                })
            });

            // Update last activity
            this.lastActivity = Date.now();
            
        } catch (error) {
            console.error('❌ Error logging activity:', error);
        }
    }

    setupActivityMonitoring() {
        // Track user interactions
        const events = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];
        
        events.forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.lastActivity = Date.now();
            }, { passive: true });
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.logActivity('page_blur');
            } else {
                this.logActivity('page_focus');
                this.lastActivity = Date.now();
            }
        });

        // Set up activity check interval
        this.activityCheckInterval = setInterval(() => {
            this.checkInactivity();
        }, this.config.activityCheckInterval);

        console.log('👁️ Activity monitoring started');
    }

    checkInactivity() {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivity;

        if (timeSinceLastActivity > this.config.inactivityThreshold) {
            console.log('😴 User inactive, pausing tracking');
            this.logActivity('inactive');
            
            // Optionally end session after long inactivity
            if (this.config.autoEndSession && timeSinceLastActivity > this.config.inactivityThreshold * 2) {
                this.endSession();
            }
        }
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            if (this.isTracking) {
                // Send heartbeat to keep session alive
                try {
                    await fetch('/api/analytics/heartbeat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId: this.sessionId,
                            lastActivity: this.lastActivity
                        })
                    });
                } catch (error) {
                    console.warn('⚠️ Heartbeat failed:', error);
                }
            }
        }, this.config.heartbeatInterval);
    }

    setupUnloadHandler() {
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            if (this.isTracking) {
                // Use sendBeacon for reliable delivery
                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/analytics/end-session', JSON.stringify({
                        sessionId: this.sessionId
                    }));
                } else {
                    // Fallback: synchronous request
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/analytics/end-session', false);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.send(JSON.stringify({
                        sessionId: this.sessionId
                    }));
                }
            }
        });

        // Handle page hide (mobile browsers)
        window.addEventListener('pagehide', () => {
            this.endSession();
        });
    }

    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        
        // Detect device type
        let deviceType = 'desktop';
        if (/tablet|ipad/i.test(userAgent)) {
            deviceType = 'tablet';
        } else if (/mobile|phone|android|iphone/i.test(userAgent)) {
            deviceType = 'mobile';
        }

        // Detect browser
        let browser = 'unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';

        // Detect platform
        let platform = 'unknown';
        if (userAgent.includes('Windows')) platform = 'Windows';
        else if (userAgent.includes('Mac')) platform = 'macOS';
        else if (userAgent.includes('Linux')) platform = 'Linux';
        else if (userAgent.includes('Android')) platform = 'Android';
        else if (userAgent.includes('iOS')) platform = 'iOS';

        return {
            deviceType,
            browser,
            platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            userAgent: userAgent
        };
    }

    // Public methods for tracking specific activities
    trackChat(message) {
        this.logActivity('chat', {
            messageLength: message.length,
            hasImage: message.includes('data:image'),
            timestamp: new Date().toISOString()
        });
    }

    trackQuiz(quizData) {
        this.logActivity('quiz', {
            question: quizData.question?.substring(0, 100),
            answer: quizData.answer?.substring(0, 100),
            isCorrect: quizData.isCorrect,
            points: quizData.points,
            timestamp: new Date().toISOString()
        });
    }

    trackOCR(ocrData) {
        this.logActivity('ocr', {
            textLength: ocrData.text?.length || 0,
            confidence: ocrData.confidence,
            processingTime: ocrData.processingTime,
            servicesUsed: ocrData.servicesUsed,
            timestamp: new Date().toISOString()
        });
    }

    trackMicUse(duration) {
        this.logActivity('mic_use', {
            durationSeconds: duration,
            timestamp: new Date().toISOString()
        }, duration);
    }

    trackPageView(url, title) {
        this.logActivity('page_view', {
            url: url || window.location.href,
            title: title || document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        });
    }

    // Method to get current session info
    getSessionInfo() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            isTracking: this.isTracking,
            sessionDuration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
            lastActivity: this.lastActivity
        };
    }

    // Method to manually end session
    async forceEndSession() {
        await this.endSession();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other systems to initialize
    setTimeout(() => {
        window.userAnalytics = new UserAnalytics();
    }, 2000);
});

// Make available globally
window.UserAnalytics = UserAnalytics;
