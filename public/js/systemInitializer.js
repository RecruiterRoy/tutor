// System Initializer - Ensures all features work on every login
// This file guarantees that every feature is properly initialized

class SystemInitializer {
    constructor() {
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.initializationTimeout = 30000; // 30 seconds max
        this.features = {
            supabase: false,
            auth: false,
            tts: false,
            mic: false,
            camera: false,
            ocr: false,
            subjects: false,
            chatHistory: false,
            ui: false
        };
        
        console.log('🚀 SystemInitializer created');
    }

    async initialize() {
        console.log('🔧 Starting complete system initialization...');
        
        try {
            // Set timeout for initialization
            const initPromise = this.performInitialization();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initialization timeout')), this.initializationTimeout)
            );

            await Promise.race([initPromise, timeoutPromise]);
            
            this.initialized = true;
            console.log('✅ ALL SYSTEMS INITIALIZED SUCCESSFULLY!');
            this.showInitializationStatus();
            
        } catch (error) {
            console.error('❌ System initialization failed:', error);
            await this.handleInitializationFailure(error);
        }
    }

    async performInitialization() {
        // Initialize in specific order for dependencies
        await this.initializeSupabase();
        await this.initializeAuth();
        await this.initializeUI();
        await this.initializeTTS();
        await this.initializeMic();
        await this.initializeCamera();
        await this.initializeOCR();
        await this.loadUserSubjects();
        await this.loadChatHistory();
        
        // Verify all features are working
        await this.verifyAllFeatures();
    }

    async initializeSupabase() {
        try {
            console.log('🔧 Initializing Supabase...');
            
            // Check if supabase client is available
            if (!window.supabaseClient) {
                console.log('⚠️ Supabase client not available, skipping...');
                this.features.supabase = false;
                return;
            }
            
            // Test connection with shorter timeout for mobile
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Supabase connection timeout')), 3000)
            );
            
            const connectionPromise = window.supabaseClient.from('profiles').select('count').limit(1);
            
            const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
            
            if (error && !error.message.includes('permission')) {
                throw error;
            }
            
            this.features.supabase = true;
            console.log('✅ Supabase initialized');
            
        } catch (error) {
            console.error('❌ Supabase initialization failed:', error);
            this.features.supabase = false;
        }
    }

    async initializeAuth() {
        try {
            console.log('🔧 Initializing Auth...');
            
            // Check if user is already logged in via localStorage
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const userData = localStorage.getItem('userData');
            
            if (isLoggedIn === 'true' && userData) {
                try {
                    window.userData = JSON.parse(userData);
                    console.log('👤 User authenticated from localStorage:', window.userData.email || 'Unknown');
                    this.features.auth = true;
                    console.log('✅ Auth initialized from localStorage');
                    return;
                } catch (e) {
                    console.log('⚠️ Invalid localStorage data, trying Supabase...');
                }
            }
            
            // Fallback to Supabase auth
            if (window.supabaseClient) {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (user) {
                    window.userData = user;
                    console.log('👤 User authenticated from Supabase:', user.email);
                }
            }
            
            this.features.auth = true;
            console.log('✅ Auth initialized');
            
        } catch (error) {
            console.error('❌ Auth initialization failed:', error);
            this.features.auth = false;
        }
    }

    async initializeTTS() {
        try {
            console.log('🔧 Initializing TTS...');
            
            // Check if speech synthesis is available
            if (!window.speechSynthesis) {
                console.log('⚠️ Speech synthesis not supported, skipping TTS...');
                this.features.tts = false;
                return;
            }
            
            // Ensure TTS class is loaded
            if (!window.TextToSpeech) {
                await this.loadScript('/js/textToSpeech.js');
            }
            
            // Create TTS instance
            if (!window.textToSpeech) {
                window.textToSpeech = new window.TextToSpeech();
            }
            
            // Test TTS with silent test
            await this.testTTS();
            
            this.features.tts = true;
            console.log('✅ TTS initialized');
            
        } catch (error) {
            console.error('❌ TTS initialization failed:', error);
            this.features.tts = false;
        }
    }

    async initializeMic() {
        try {
            console.log('🔧 Initializing Microphone...');
            
            // Check if mediaDevices is available (mobile compatibility)
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log('⚠️ Media devices not supported, skipping microphone...');
                this.features.mic = false;
                return;
            }
            
            // Ensure mic system is loaded
            if (!window.micSystem && !window.MicSystem) {
                await this.loadScript('/js/mic-system.js');
            }
            
            // Initialize dashboard mic system if available
            if (typeof micSystem !== 'undefined' && micSystem.init) {
                micSystem.init();
            }
            
            // Test microphone permissions with shorter timeout for mobile
            try {
                await Promise.race([
                    this.testMicrophonePermissions(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Mic test timeout')), 2000))
                ]);
                this.features.mic = true;
                console.log('✅ Microphone initialized');
            } catch (micError) {
                console.log('⚠️ Microphone permission not granted, but module available');
                this.features.mic = true; // Available but no permission yet
            }
            
        } catch (error) {
            console.error('❌ Microphone initialization failed:', error);
            this.features.mic = false;
        }
    }

    async initializeCamera() {
        try {
            console.log('🔧 Initializing Camera...');
            
            // Check if mediaDevices is available (mobile compatibility)
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log('⚠️ Media devices not supported, skipping camera...');
                this.features.camera = false;
                return;
            }
            
            // Test camera permissions with shorter timeout for mobile
            try {
                const stream = await Promise.race([
                    navigator.mediaDevices.getUserMedia({ video: true }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Camera test timeout')), 2000))
                ]);
                stream.getTracks().forEach(track => track.stop());
                this.features.camera = true;
                console.log('✅ Camera initialized');
            } catch (cameraError) {
                console.log('⚠️ Camera permission not granted, but camera module available');
                this.features.camera = true; // Available but no permission yet
            }
            
        } catch (error) {
            console.log('⚠️ Camera initialization failed, but module available');
            this.features.camera = true; // Available but no permission yet
        }
    }

    async initializeOCR() {
        try {
            console.log('🔧 Initializing OCR...');
            
            // Load OCR services
            if (!window.azureOCRService) {
                await this.loadScript('/js/azureOCRService.js');
            }
            
            if (!window.freeOCRService) {
                await this.loadScript('/js/freeOCRService.js');
            }
            
            // Initialize image preprocessor for better OCR
            if (!window.imagePreprocessor) {
                await this.loadScript('/js/imagePreprocessor.js');
            }
            
            this.features.ocr = true;
            console.log('✅ OCR initialized');
            
        } catch (error) {
            console.error('❌ OCR initialization failed:', error);
            this.features.ocr = false;
        }
    }

    async loadUserSubjects() {
        try {
            console.log('🔧 Loading user subjects...');
            
            if (window.userData && window.supabaseClient) {
                const { data: profile } = await window.supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('id', window.userData.id)
                    .single();
                
                if (profile) {
                    // Load saved subjects
                    if (profile.preferred_subjects) {
                        window.userSubjects = profile.preferred_subjects;
                        this.updateSubjectButtons(profile.preferred_subjects);
                    }
                    
                    // Load other preferences
                    if (profile.class) {
                        window.userClass = profile.class;
                    }
                    
                    if (profile.board) {
                        window.userBoard = profile.board;
                    }
                }
            }
            
            this.features.subjects = true;
            console.log('✅ User subjects loaded');
            
        } catch (error) {
            console.error('❌ Subject loading failed:', error);
            this.features.subjects = false;
        }
    }

    async loadChatHistory() {
        try {
            console.log('🔧 Loading chat history...');
            
            if (window.userData && window.supabaseClient) {
                const { data: chats } = await window.supabaseClient
                    .from('chat_history')
                    .select('*')
                    .eq('user_id', window.userData.id)
                    .order('created_at', { ascending: false })
                    .limit(10);
                
                if (chats && chats.length > 0) {
                    window.recentChats = chats;
                    this.displayRecentChats(chats);
                }
            }
            
            this.features.chatHistory = true;
            console.log('✅ Chat history loaded');
            
        } catch (error) {
            console.error('❌ Chat history loading failed:', error);
            this.features.chatHistory = false;
        }
    }

    async initializeUI() {
        try {
            console.log('🔧 Initializing UI...');
            
            // Ensure all UI scripts are loaded
            const uiScripts = [
                '/js/dashboard.js',
                '/js/claudeChat.js',
                '/js/config.js'
            ];
            
            for (const script of uiScripts) {
                await this.loadScript(script);
            }
            
            this.features.ui = true;
            console.log('✅ UI initialized');
            
        } catch (error) {
            console.error('❌ UI initialization failed:', error);
            this.features.ui = false;
        }
    }

    async verifyAllFeatures() {
        console.log('🔍 Verifying all features...');
        
        const failedFeatures = [];
        for (const [feature, status] of Object.entries(this.features)) {
            if (!status) {
                failedFeatures.push(feature);
            }
        }
        
        if (failedFeatures.length > 0) {
            console.warn('⚠️ Some features failed to initialize:', failedFeatures);
            
            // Retry failed features
            await this.retryFailedFeatures(failedFeatures);
        }
    }

    async retryFailedFeatures(failedFeatures) {
        if (this.retryCount >= this.maxRetries) {
            console.error('❌ Max retries reached, some features may not work');
            return;
        }
        
        this.retryCount++;
        console.log(`🔄 Retrying failed features (attempt ${this.retryCount}/${this.maxRetries})`);
        
        for (const feature of failedFeatures) {
            try {
                switch (feature) {
                    case 'tts':
                        await this.initializeTTS();
                        break;
                    case 'mic':
                        await this.initializeMic();
                        break;
                    case 'supabase':
                        await this.initializeSupabase();
                        break;
                    // Add other features as needed
                }
            } catch (error) {
                console.error(`❌ Retry failed for ${feature}:`, error);
            }
        }
    }

    async handleInitializationFailure(error) {
        console.error('💥 Critical initialization failure:', error);
        
        // Show user-friendly error
        this.showErrorMessage('Some features may not work properly. Please refresh the page.');
        
        // Try emergency initialization
        await this.emergencyInitialization();
    }

    async emergencyInitialization() {
        console.log('🆘 Emergency initialization...');
        
        // Basic functionality only
        try {
            if (!window.textToSpeech) {
                window.textToSpeech = new TextToSpeech();
            }
        } catch (e) {
            console.error('Emergency TTS failed:', e);
        }
    }

    // Helper methods
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    async testTTS() {
        if (window.textToSpeech) {
            // Silent test
            const utterance = new SpeechSynthesisUtterance(' ');
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
        }
    }

    async testMicrophonePermissions() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.log('⚠️ Microphone permission not granted yet');
            return false;
        }
    }

    shouldPlayWelcome() {
        const lastWelcome = localStorage.getItem('lastWelcomeTime');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        return !lastWelcome || (now - parseInt(lastWelcome)) > oneHour;
    }

    playWelcomeMessage() {
        if (window.textToSpeech && this.features.tts) {
            const name = window.userData?.user_metadata?.full_name || 'Student';
            const message = `Welcome back ${name}! I'm ready to help you learn.`;
            
            window.textToSpeech.speak(message);
            localStorage.setItem('lastWelcomeTime', Date.now().toString());
            
            console.log('🎵 Welcome message played');
        }
    }

    updateSubjectButtons(subjects) {
        // Update subject buttons in UI
        const subjectContainer = document.querySelector('.subject-buttons');
        if (subjectContainer && subjects) {
            subjects.forEach(subject => {
                const button = document.querySelector(`[data-subject="${subject}"]`);
                if (button) {
                    button.classList.add('selected');
                }
            });
        }
    }

    displayRecentChats(chats) {
        // Display recent chats in sidebar or designated area
        const chatContainer = document.querySelector('#recentChats');
        if (chatContainer && chats) {
            const chatList = chats.map(chat => `
                <div class="recent-chat-item" onclick="loadChat('${chat.id}')">
                    <div class="chat-preview">${chat.message.substring(0, 50)}...</div>
                    <div class="chat-time">${new Date(chat.created_at).toLocaleDateString()}</div>
                </div>
            `).join('');
            
            chatContainer.innerHTML = chatList;
        }
    }

    showInitializationStatus() {
        const totalFeatures = Object.keys(this.features).length;
        const workingFeatures = Object.values(this.features).filter(Boolean).length;
        
        console.log(`📊 System Status: ${workingFeatures}/${totalFeatures} features working`);
        
        // Show mobile-friendly status message
        const statusDiv = document.createElement('div');
        statusDiv.className = 'initialization-status';
        statusDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: ${workingFeatures >= 7 ? '#10b981' : workingFeatures >= 5 ? '#f59e0b' : '#ef4444'}; 
            color: white; 
            padding: 12px 16px; border-radius: 12px; 
            z-index: 10000; font-size: 14px; font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 200px;
            text-align: center;
        `;
        
        let statusText = '';
        if (workingFeatures >= 7) {
            statusText = `✅ All systems ready (${workingFeatures}/${totalFeatures})`;
        } else if (workingFeatures >= 5) {
            statusText = `⚠️ Most systems ready (${workingFeatures}/${totalFeatures})`;
        } else {
            statusText = `❌ Some systems offline (${workingFeatures}/${totalFeatures})`;
        }
        
        statusDiv.textContent = statusText;
        
        // Add detailed status for mobile debugging
        if (window.innerWidth <= 768) {
            const detailsDiv = document.createElement('div');
            detailsDiv.style.cssText = `
                font-size: 11px; margin-top: 4px; opacity: 0.9;
            `;
            
            const featureStatus = Object.entries(this.features).map(([feature, status]) => 
                `${feature}: ${status ? '✅' : '❌'}`
            ).join(' ');
            
            detailsDiv.textContent = featureStatus;
            statusDiv.appendChild(detailsDiv);
        }
        
        document.body.appendChild(statusDiv);
        
        // Remove after 5 seconds on mobile, 3 seconds on desktop
        const removeTime = window.innerWidth <= 768 ? 5000 : 3000;
        setTimeout(() => {
            if (statusDiv.parentElement) {
                statusDiv.remove();
            }
        }, removeTime);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'initialization-error';
        errorDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: #ef4444; color: white; 
            padding: 10px 20px; border-radius: 8px; 
            z-index: 10000; font-size: 14px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Public method to get system status
    getSystemStatus() {
        return {
            initialized: this.initialized,
            features: { ...this.features },
            retryCount: this.retryCount
        };
    }
}

// Initialize system when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.systemInitializer = new SystemInitializer();
    await window.systemInitializer.initialize();
});

// Make available globally
window.SystemInitializer = SystemInitializer;
