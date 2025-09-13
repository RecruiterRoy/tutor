// Smart Notifications System
// Personalized study reminders and learning notifications

class SmartNotifications {
    constructor() {
        this.notifications = [];
        this.isSupported = 'Notification' in window;
        this.permission = 'default';
        this.studySchedule = this.loadStudySchedule();
        this.lastNotificationTime = this.loadLastNotificationTime();
        
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            console.log('❌ Notifications not supported');
            return;
        }

        // Request permission
        this.permission = await this.requestPermission();
        
        if (this.permission === 'granted') {
            this.setupNotifications();
            this.startNotificationScheduler();
        }
    }

    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            console.log('🔔 Notification permission:', permission);
            return permission;
        } catch (error) {
            console.error('❌ Failed to request notification permission:', error);
            return 'denied';
        }
    }

    setupNotifications() {
        // Setup notification types
        this.notifications = [
            {
                id: 'daily-challenge',
                title: '🎯 Daily Challenge Ready!',
                body: 'Complete today\'s challenge to earn points and improve your skills!',
                icon: '/images/tution.app_emblem.jpg',
                tag: 'daily-challenge',
                requireInteraction: false,
                actions: [
                    { action: 'start', title: 'Start Challenge' },
                    { action: 'later', title: 'Remind Later' }
                ]
            },
            {
                id: 'study-reminder',
                title: '📚 Time to Study!',
                body: 'Your scheduled study session is ready. Let\'s continue learning!',
                icon: '/images/tution.app_emblem.jpg',
                tag: 'study-reminder',
                requireInteraction: false,
                actions: [
                    { action: 'start', title: 'Start Studying' },
                    { action: 'snooze', title: 'Snooze 15min' }
                ]
            },
            {
                id: 'break-reminder',
                title: '☕ Take a Break!',
                body: 'You\'ve been studying for a while. Time for a short break!',
                icon: '/images/tution.app_emblem.jpg',
                tag: 'break-reminder',
                requireInteraction: false,
                actions: [
                    { action: 'break', title: 'Take Break' },
                    { action: 'continue', title: 'Continue' }
                ]
            },
            {
                id: 'progress-celebration',
                title: '🎉 Great Progress!',
                body: 'You\'ve completed your study goal for today! Keep up the great work!',
                icon: '/images/tution.app_emblem.jpg',
                tag: 'progress-celebration',
                requireInteraction: false,
                actions: [
                    { action: 'celebrate', title: 'Celebrate' },
                    { action: 'continue', title: 'Keep Going' }
                ]
            },
            {
                id: 'weak-area-alert',
                title: '⚠️ Focus Area Detected',
                body: 'We noticed you might need more practice in this topic. Let\'s work on it!',
                icon: '/images/tution.app_emblem.jpg',
                tag: 'weak-area-alert',
                requireInteraction: false,
                actions: [
                    { action: 'practice', title: 'Practice Now' },
                    { action: 'later', title: 'Later' }
                ]
            }
        ];

        // Setup notification click handlers
        this.setupClickHandlers();
    }

    setupClickHandlers() {
        // Handle notification clicks
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
                    this.handleNotificationClick(event.data);
                }
            });
        }
    }

    handleNotificationClick(data) {
        const { action, notificationId } = data;
        
        switch (action) {
            case 'start':
                this.startLearningSession();
                break;
            case 'snooze':
                this.snoozeNotification(notificationId, 15);
                break;
            case 'break':
                this.startBreak();
                break;
            case 'continue':
                this.continueStudying();
                break;
            case 'practice':
                this.startWeakAreaPractice();
                break;
            case 'celebrate':
                this.celebrateProgress();
                break;
            default:
                console.log('Unknown notification action:', action);
        }
    }

    startNotificationScheduler() {
        // Check for notifications every minute
        setInterval(() => {
            this.checkAndSendNotifications();
        }, 60000);

        // Initial check
        this.checkAndSendNotifications();
    }

    async checkAndSendNotifications() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Time in minutes
        
        // Check if enough time has passed since last notification
        const timeSinceLastNotification = now.getTime() - this.lastNotificationTime;
        const minInterval = 30 * 60 * 1000; // 30 minutes minimum between notifications
        
        if (timeSinceLastNotification < minInterval) {
            return;
        }

        // Check study schedule
        const scheduledTime = this.getScheduledStudyTime();
        if (scheduledTime && Math.abs(currentTime - scheduledTime) <= 15) {
            await this.sendNotification('study-reminder');
            return;
        }

        // Check for daily challenge
        if (this.shouldSendDailyChallenge()) {
            await this.sendNotification('daily-challenge');
            return;
        }

        // Check study duration for break reminder
        if (this.shouldSendBreakReminder()) {
            await this.sendNotification('break-reminder');
            return;
        }

        // Check progress for celebration
        if (this.shouldSendProgressCelebration()) {
            await this.sendNotification('progress-celebration');
            return;
        }

        // Check weak areas
        if (this.shouldSendWeakAreaAlert()) {
            await this.sendNotification('weak-area-alert');
            return;
        }
    }

    async sendNotification(notificationId) {
        if (this.permission !== 'granted') {
            return;
        }

        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) {
            console.error('❌ Notification not found:', notificationId);
            return;
        }

        try {
            // Check if notification is already shown
            const existingNotifications = await navigator.serviceWorker.ready;
            const notifications = await existingNotifications.getNotifications();
            
            const isAlreadyShown = notifications.some(n => n.tag === notification.tag);
            if (isAlreadyShown) {
                return;
            }

            // Send notification via service worker
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(notification.title, {
                    body: notification.body,
                    icon: notification.icon,
                    tag: notification.tag,
                    requireInteraction: notification.requireInteraction,
                    actions: notification.actions,
                    data: {
                        notificationId: notificationId,
                        timestamp: Date.now()
                    }
                });

                this.lastNotificationTime = Date.now();
                this.saveLastNotificationTime();
                
                console.log('📱 Notification sent:', notificationId);
            }
        } catch (error) {
            console.error('❌ Failed to send notification:', error);
        }
    }

    // Smart notification triggers
    shouldSendDailyChallenge() {
        const lastChallenge = localStorage.getItem('lastDailyChallenge');
        const today = new Date().toDateString();
        
        return !lastChallenge || lastChallenge !== today;
    }

    shouldSendBreakReminder() {
        const studyStartTime = localStorage.getItem('studyStartTime');
        if (!studyStartTime) return false;
        
        const studyDuration = Date.now() - parseInt(studyStartTime);
        const breakThreshold = 45 * 60 * 1000; // 45 minutes
        
        return studyDuration > breakThreshold;
    }

    shouldSendProgressCelebration() {
        const todayProgress = this.getTodayProgress();
        const dailyGoal = this.getDailyGoal();
        
        return todayProgress >= dailyGoal;
    }

    shouldSendWeakAreaAlert() {
        const weakAreas = this.getWeakAreas();
        return weakAreas.length > 0;
    }

    getScheduledStudyTime() {
        const schedule = this.studySchedule;
        const now = new Date();
        const dayOfWeek = now.getDay();
        
        if (schedule[dayOfWeek]) {
            const [hours, minutes] = schedule[dayOfWeek].split(':');
            return parseInt(hours) * 60 + parseInt(minutes);
        }
        
        return null;
    }

    // Helper methods
    getTodayProgress() {
        const progress = localStorage.getItem('todayProgress');
        return progress ? parseInt(progress) : 0;
    }

    getDailyGoal() {
        const goal = localStorage.getItem('dailyGoal');
        return goal ? parseInt(goal) : 60; // Default 60 minutes
    }

    getWeakAreas() {
        const weakAreas = localStorage.getItem('weakAreas');
        return weakAreas ? JSON.parse(weakAreas) : [];
    }

    loadStudySchedule() {
        const schedule = localStorage.getItem('studySchedule');
        return schedule ? JSON.parse(schedule) : {
            0: '09:00', // Sunday
            1: '16:00', // Monday
            2: '16:00', // Tuesday
            3: '16:00', // Wednesday
            4: '16:00', // Thursday
            5: '14:00', // Friday
            6: '10:00'  // Saturday
        };
    }

    loadLastNotificationTime() {
        const time = localStorage.getItem('lastNotificationTime');
        return time ? parseInt(time) : 0;
    }

    saveLastNotificationTime() {
        localStorage.setItem('lastNotificationTime', this.lastNotificationTime.toString());
    }

    // Action handlers
    startLearningSession() {
        // Focus on chat section and start learning
        const chatSection = document.getElementById('chatSection');
        if (chatSection) {
            chatSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Auto-start with a learning prompt
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = "Let's start today's learning session!";
                chatInput.dispatchEvent(new Event('input'));
                
                const sendButton = document.getElementById('sendButton');
                if (sendButton) {
                    sendButton.click();
                }
            }
        }, 1000);
    }

    snoozeNotification(notificationId, minutes) {
        setTimeout(() => {
            this.sendNotification(notificationId);
        }, minutes * 60 * 1000);
    }

    startBreak() {
        // Show break reminder
        this.showBreakModal();
    }

    continueStudying() {
        // Continue studying without break
        console.log('Continuing study session...');
    }

    startWeakAreaPractice() {
        const weakAreas = this.getWeakAreas();
        if (weakAreas.length > 0) {
            const area = weakAreas[0];
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = `Let's practice ${area} to improve my understanding.`;
                chatInput.dispatchEvent(new Event('input'));
                
                const sendButton = document.getElementById('sendButton');
                if (sendButton) {
                    sendButton.click();
                }
            }
        }
    }

    celebrateProgress() {
        // Show celebration animation
        this.showCelebrationModal();
    }

    showBreakModal() {
        // Create break reminder modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
                <div class="text-4xl mb-4">☕</div>
                <h3 class="text-lg font-semibold mb-2">Time for a Break!</h3>
                <p class="text-gray-600 mb-4">You've been studying for a while. Take a 5-minute break to refresh your mind.</p>
                <div class="flex space-x-3">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Take Break
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400">
                        Continue
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showCelebrationModal() {
        // Create celebration modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
                <div class="text-4xl mb-4">🎉</div>
                <h3 class="text-lg font-semibold mb-2">Congratulations!</h3>
                <p class="text-gray-600 mb-4">You've completed your daily study goal! Keep up the amazing work!</p>
                <button onclick="this.closest('.fixed').remove()" class="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600">
                    Awesome!
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Public methods for external use
    setStudySchedule(schedule) {
        this.studySchedule = schedule;
        localStorage.setItem('studySchedule', JSON.stringify(schedule));
    }

    setDailyGoal(minutes) {
        localStorage.setItem('dailyGoal', minutes.toString());
    }

    updateProgress(minutes) {
        const today = new Date().toDateString();
        const todayProgress = this.getTodayProgress();
        const newProgress = todayProgress + minutes;
        
        localStorage.setItem('todayProgress', newProgress.toString());
        localStorage.setItem('lastStudyDate', today);
    }

    markStudyStart() {
        localStorage.setItem('studyStartTime', Date.now().toString());
    }

    markStudyEnd() {
        localStorage.removeItem('studyStartTime');
    }

    addWeakArea(area) {
        const weakAreas = this.getWeakAreas();
        if (!weakAreas.includes(area)) {
            weakAreas.push(area);
            localStorage.setItem('weakAreas', JSON.stringify(weakAreas));
        }
    }

    removeWeakArea(area) {
        const weakAreas = this.getWeakAreas();
        const filtered = weakAreas.filter(a => a !== area);
        localStorage.setItem('weakAreas', JSON.stringify(filtered));
    }
}

// Initialize smart notifications
let smartNotifications;

document.addEventListener('DOMContentLoaded', () => {
    smartNotifications = new SmartNotifications();
    
    // Make it globally available
    window.smartNotifications = smartNotifications;
});

console.log('📱 Smart Notifications System loaded');
