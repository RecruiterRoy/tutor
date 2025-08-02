// Dashboard.js - Main dashboard functionality
// Note: Supabase client is initialized via config.js and supabaseClient.js

// Use the global supabaseClient that's initialized in config.js
// No need to declare supabase here as it's already available via window.supabaseClient

// Make functions globally accessible IMMEDIATELY for HTML onclick handlers
// These will be replaced with actual implementations later
window.toggleVoiceRecording = function() {
    console.log('toggleVoiceRecording called - waiting for implementation');
};

window.closeSidebar = function() {
    console.log('closeSidebar called - waiting for implementation');
};

window.showSection = function(sectionName) {
    console.log('showSection called - waiting for implementation:', sectionName);
};

window.saveChatMessage = function(message, response) {
    console.log('saveChatMessage called - waiting for implementation');
};

window.closeMobileSidebar = function() {
    console.log('closeMobileSidebar called - waiting for implementation');
};

window.showSubjectManager = function() {
    console.log('showSubjectManager called - waiting for implementation');
};

window.openMobileSidebar = function() {
    console.log('openMobileSidebar called - waiting for implementation');
};

window.playTTS = function() {
    console.log('playTTS called - waiting for implementation');
};

window.stopTTS = function() {
    console.log('stopTTS called - waiting for implementation');
};

window.addNewSubject = function() {
    console.log('addNewSubject called - waiting for implementation');
};

window.handleAvatarSelection = function(language) {
    console.log('handleAvatarSelection called - waiting for implementation:', language);
};

window.downloadApp = function() {
    console.log('downloadApp called - waiting for implementation');
};

window.scrollToTop = function() {
    console.log('scrollToTop called - waiting for implementation');
};

window.forceShowTrialOverlay = function() {
    console.log('forceShowTrialOverlay called - waiting for implementation');
};

window.upgradeToPremium = function() {
    console.log('upgradeToPremium called - waiting for implementation');
};

window.closeTrialOverlay = function() {
    console.log('closeTrialOverlay called - waiting for implementation');
};

// Make variables globally accessible immediately
window.currentUser = null;
window.isRecording = false;
window.selectedAvatar = 'roy-sir';
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
window.userDataLoaded = false; // Flag to track if user data is loaded

// Initialize Supabase when page loads
async function initializeSupabase() {
    try {
        // Use the global supabaseClient that's initialized in config.js
        if (window.supabaseClient) {
            console.log('Supabase initialized successfully');
        } else {
            throw new Error('Supabase client not available');
        }
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        alert('Failed to initialize database connection. Please try again.');
        window.location.href = '/login';
    }
}

// PDF Processor will be initialized separately if needed
let pdfProcessor = null;

// Global state - currentUser is managed by dashboard.html
let recognition;
let recognitionTimeout;
let isRecording = false;
let isAmbientListening = false;
// Global variables
let currentUser = null;
let currentGrade = null;
let currentSubject = null;
let selectedAvatar = 'roy-sir'; // Default to Roy Sir, will be overridden by user preference
let conversationHistory = [];
let synth = window.speechSynthesis;
let selectedVoice = null;
let voiceRate = 1.0;
let voicePitch = 1.0;
let preWarmedRecognition = null;
let voicesLoaded = false;
let lastResponseDate = null; // Track the date of last AI response

// Make variables globally accessible immediately
window.currentUser = currentUser;
window.isRecording = isRecording;
window.selectedAvatar = selectedAvatar;

// Functions are already defined above

// Indian Regional Avatars
const regionalAvatars = [
    // Specific Teacher Avatars (based on language preference)
    { id: 'ms-sapana', name: 'Ms. Sapana', region: 'Hindi/Hinglish', gender: 'female', image: '👩‍🏫', language: 'hindi' },
    { id: 'roy-sir', name: 'Roy Sir', region: 'English', gender: 'male', image: '👨‍🏫', language: 'english' },
    
    // North India
    { id: 'punjabi-male', name: 'Punjabi Male', region: 'Punjab', gender: 'male', image: '👨‍🦱' },
    { id: 'punjabi-female', name: 'Punjabi Female', region: 'Punjab', gender: 'female', image: '👩‍🦱' },
    { id: 'haryanvi-male', name: 'Haryanvi Male', region: 'Haryana', gender: 'male', image: '👨‍🦲' },
    { id: 'haryanvi-female', name: 'Haryanvi Female', region: 'Haryana', gender: 'female', image: '👩‍🦲' },
    
    // South India
    { id: 'tamil-male', name: 'Tamil Male', region: 'Tamil Nadu', gender: 'male', image: '👨‍🦳' },
    { id: 'tamil-female', name: 'Tamil Female', region: 'Tamil Nadu', gender: 'female', image: '👩‍🦳' },
    { id: 'telugu-male', name: 'Telugu Male', region: 'Andhra Pradesh', gender: 'male', image: '👨‍🦱' },
    { id: 'telugu-female', name: 'Telugu Female', region: 'Andhra Pradesh', gender: 'female', image: '👩‍🦱' },
    { id: 'kannada-male', name: 'Kannada Male', region: 'Karnataka', gender: 'male', image: '👨‍🦲' },
    { id: 'kannada-female', name: 'Kannada Female', region: 'Karnataka', gender: 'female', image: '👩‍🦲' },
    { id: 'malayali-male', name: 'Malayali Male', region: 'Kerala', gender: 'male', image: '👨‍🦳' },
    { id: 'malayali-female', name: 'Malayali Female', region: 'Kerala', gender: 'female', image: '👩‍🦳' },
    
    // East India
    { id: 'bengali-male', name: 'Bengali Male', region: 'West Bengal', gender: 'male', image: '👨‍🦱' },
    { id: 'bengali-female', name: 'Bengali Female', region: 'West Bengal', gender: 'female', image: '👩‍🦱' },
    { id: 'odia-male', name: 'Odia Male', region: 'Odisha', gender: 'male', image: '👨‍🦲' },
    { id: 'odia-female', name: 'Odia Female', region: 'Odisha', gender: 'female', image: '👩‍🦲' },
    
    // West India
    { id: 'gujarati-male', name: 'Gujarati Male', region: 'Gujarat', gender: 'male', image: '👨‍🦳' },
    { id: 'gujarati-female', name: 'Gujarati Female', region: 'Gujarat', gender: 'female', image: '👩‍🦳' },
    { id: 'marathi-male', name: 'Marathi Male', region: 'Maharashtra', gender: 'male', image: '👨‍🦱' },
    { id: 'marathi-female', name: 'Marathi Female', region: 'Maharashtra', gender: 'female', image: '👩‍🦱' },
    
    // Central India
    { id: 'madhyapradesh-male', name: 'Madhya Pradesh Male', region: 'Madhya Pradesh', gender: 'male', image: '👨‍🦲' },
    { id: 'madhyapradesh-female', name: 'Madhya Pradesh Female', region: 'Madhya Pradesh', gender: 'female', image: '👩‍🦲' },
    
    // Northeast India
    { id: 'assamese-male', name: 'Assamese Male', region: 'Assam', gender: 'male', image: '👨‍🦳' },
    { id: 'assamese-female', name: 'Assamese Female', region: 'Assam', gender: 'female', image: '👩‍🦳' },
    { id: 'manipuri-male', name: 'Manipuri Male', region: 'Manipur', gender: 'male', image: '👨‍🦱' },
    { id: 'manipuri-female', name: 'Manipuri Female', region: 'Manipur', gender: 'female', image: '👩‍🦱' },
    
    // Kashmir
    { id: 'kashmiri-male', name: 'Kashmiri Male', region: 'Kashmir', gender: 'male', image: '👨‍🦲' },
    { id: 'kashmiri-female', name: 'Kashmiri Female', region: 'Kashmir', gender: 'female', image: '👩‍🦲' }
];

// Mobile detection and optimization
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
window.isMobile = isMobile; // Make it globally accessible

        // Request microphone permission
        async function requestMicrophonePermission() {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    console.log('✅ Microphone permission granted');
                    stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
                    
                    // Update voice button to show permission granted
                    const voiceButton = document.getElementById('voiceButton');
                    if (voiceButton) {
                        voiceButton.title = 'Voice input ready';
                        voiceButton.classList.remove('text-red-400');
                        voiceButton.classList.add('text-green-400');
                    }
                }
            } catch (error) {
                console.warn('⚠️ Microphone permission denied or not available:', error);
                
                // Update voice button to show permission needed
                const voiceButton = document.getElementById('voiceButton');
                if (voiceButton) {
                    voiceButton.title = 'Microphone permission needed';
                    voiceButton.classList.remove('text-green-400');
                    voiceButton.classList.add('text-red-400');
                }
                
                // Show permission request on first voice button click
                if (error.name === 'NotAllowedError') {
                    showError('Microphone permission is required for voice input. Please allow microphone access in your browser settings.');
                }
            }
        }
        
        // Mobile optimization function
        function applyMobileOptimizations() {
            // Prevent zoom on input focus (iOS)
            const inputs = document.querySelectorAll('input, textarea, select');
            
            // Request microphone permission on mobile devices
            if (isMobile) {
                requestMicrophonePermission();
            }
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (isMobile) {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
    
    // Improve touch scrolling
    const scrollableElements = document.querySelectorAll('.chat-container, .modal-content, .subject-manager-modal');
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
        element.style.overflowScrolling = 'touch';
    });
    
    // Add mobile-specific event listeners
    setupMobileEventListeners();
    
    // Optimize for mobile performance
    if (isMobile) {
        // Reduce animations on mobile for better performance
        document.body.style.setProperty('--transition-duration', '0.2s');
        
        // Enable mobile-specific features
        enableMobileFeatures();
    }
}

function setupMobileEventListeners() {
    // Handle mobile-specific gestures
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipeGesture();
    }, { passive: true });
    
    // Handle swipe gestures
    function handleSwipeGesture() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - could be used for quick actions
                console.log('Swipe up detected');
            } else {
                // Swipe down - could be used to close modals
                console.log('Swipe down detected');
                const activeModal = document.querySelector('.modal-content:not(.hidden)');
                if (activeModal) {
                    // Close modal on swipe down
                    const closeButton = activeModal.querySelector('[onclick*="close"], [onclick*="hide"]');
                    if (closeButton) {
                        closeButton.click();
                    }
                }
            }
        }
    }
}

function enableMobileFeatures() {
    // Enable mobile-specific voice recognition improvements
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // Mobile voice recognition optimizations
        const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (recognition) {
            // Set mobile-optimized settings
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
        }
    }
    
    // Mobile-specific TTS optimizations
    if ('speechSynthesis' in window) {
        // Optimize for mobile speakers
        const utterance = new SpeechSynthesisUtterance();
        utterance.volume = 0.8; // Slightly lower volume for mobile
        utterance.rate = 0.9; // Slightly slower for mobile
    }
    
    // Mobile-specific UI improvements
    if (isMobile) {
        // Add mobile-specific CSS classes
        document.body.classList.add('mobile-device');
        
        // Optimize chat container for mobile
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.style.height = 'calc(100vh - 200px)';
            chatContainer.style.maxHeight = 'calc(100vh - 200px)';
        }
        
        // Add mobile-specific keyboard handling
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('focus', () => {
                // Scroll to input on mobile
                setTimeout(() => {
                    chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        }
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Mobile-specific optimizations
        if (isMobile) {
            console.log('📱 Mobile device detected - applying optimizations');
            applyMobileOptimizations();
        }
        
        // Register service worker for caching
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration);
            } catch (error) {
                console.warn('⚠️ Service Worker registration failed:', error);
            }
        }
        
        await initializeSupabase();
        
        // Initialize dashboard
        await initializeDashboard();
        
        // Initialize Mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose'
        });

        // Initialize voice services
        if ('speechSynthesis' in window) {
            await initVoiceSelection();
        } else {
            const voiceSelect = document.getElementById('voiceSelect');
            if(voiceSelect) voiceSelect.disabled = true;
            console.log('Text-to-speech not supported');
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            initSpeechRecognition();
        } else {
            const voiceButton = document.getElementById('voiceButton');
            if(voiceButton) voiceButton.style.display = 'none';
            console.log('Speech recognition not supported');
        }

        // --- Keep existing initialization logic ---
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    
        if (error || !user) {
            console.log('No authenticated user, redirecting to login');
            window.location.href = '/login';
            return;
        }
    
        // Set current user globally
        window.currentUser = user;
        currentUser = user; // Set local variable too
        console.log('✅ User authenticated:', user.id);
    
        // currentUser is already set from authentication
        await loadUserData();
        setupEventListeners();
        populateAvatarGrid();
        initializeVoiceFeatures();
        populateVoices();
        
        // Wait for TTS to be ready before loading voice settings
        setTimeout(() => {
            loadVoiceSettings();
            setupVoiceSettingsListeners();
            setupSmallTTSControls();
        }, 1000);
        
        initSpeechRecognition();
        showWelcomeMessage();
        
        // Show welcome message
        showWelcomeMessage();
        // --- End of existing logic ---

        // Test voice services
        setTimeout(() => {
            if (speechSynthesis && speechSynthesis.getVoices().length > 0) {
                speakText("Welcome to Tutor AI. Voice services are ready.");
            } else {
                 console.log("Skipping welcome message as voices are not ready yet.");
            }
        }, 1500);
        
        // Set up periodic user session refresh for multiple users
        setInterval(async () => {
            try {
                const { data: { user }, error } = await window.supabaseClient.auth.getUser();
                if (error || !user) {
                    console.warn('⚠️ User session expired, redirecting to login...');
                    window.location.href = '/login.html';
                } else {
                    currentUser = user; // Update current user
                    console.log('✅ User session refreshed:', user.id);
                }
            } catch (sessionError) {
                console.warn('⚠️ Session check failed:', sessionError);
            }
        }, 300000); // Check every 5 minutes

    } catch (error) {
        console.error('Initialization error:', error);
        showError("Failed to initialize some features");
    }
});

async function initializeDashboard() {
    try {
        console.log('🚀 Initializing dashboard...');
        
        // Get current user from Supabase auth
        const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
        
        if (authError || !user) {
            console.error('❌ No authenticated user found:', authError);
            window.location.href = '/login.html';
            return;
        }
        
        // Set current user globally
        window.currentUser = user;
        currentUser = user; // Set local variable too
        console.log('✅ User authenticated:', user.id);
        
        // Check user verification status - be more lenient for all users
        const { data: profile, error } = await window.supabaseClient
            .from('user_profiles')
            .select('verification_status, full_name, email, class, board, ai_avatar')
            .eq('id', user.id)
            .single();
        
        if (error) {
            console.error('❌ Error fetching user profile:', error);
            console.log('🔄 User profile not found, but continuing with basic features...');
            // Don't redirect, just continue with basic functionality
        } else {
            console.log('✅ User profile found:', profile);
            
            // Auto-approve all users regardless of verification status
            if (profile && profile.verification_status !== 'approved') {
                console.log('🔄 Auto-approving user...');
                try {
                    // Update profile to approved status
                    const { error: updateError } = await window.supabaseClient
                        .from('user_profiles')
                        .update({
                            verification_status: 'approved',
                            economic_status: 'Premium',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', user.id);
                    
                    if (updateError) {
                        console.warn('⚠️ Auto-approval update failed:', updateError);
                    } else {
                        console.log('✅ User auto-approved successfully');
                        profile.verification_status = 'approved';
                    }
                } catch (approvalError) {
                    console.warn('⚠️ Auto-approval failed:', approvalError);
                    // Continue anyway since user is authenticated
                }
            }
            
            // Set selected avatar from profile
            if (profile.ai_avatar) {
                selectedAvatar = profile.ai_avatar;
                window.selectedAvatar = profile.ai_avatar;
            }
        }
        
        console.log('✅ User verified and ready for dashboard');
        
        // Continue with dashboard initialization
        console.log('🔄 Loading user data...');
        await loadUserData();
        console.log('✅ User data loaded, loading books...');
        await loadBooks();
        setupEventListeners();
        populateAvatarGrid();
        initializeVoiceFeatures();
        populateVoices();
        
        // Wait for TTS to be ready before loading voice settings
        setTimeout(() => {
            loadVoiceSettings();
            setupVoiceSettingsListeners();
        }, 1000);
        
        initSpeechRecognition();
        showWelcomeMessage();
        
        // Initialize additional features
        if (window.learningProgress) {
            window.learningProgress.loadProgress();
        }
        
        if (window.groupLearning) {
            window.groupLearning.initializeRealtime();
        }
        
        console.log('✅ Dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showError('Failed to initialize dashboard. Please refresh the page.');
    }
    
    // currentUser is already set from authentication
    await loadUserData();
}

async function loadUserData() {
    try {
        clearDashboardError();
        
        // Get current user from Supabase auth
        const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
        
        if (authError) {
            console.error('❌ Auth error:', authError);
            showDashboardError('Authentication error. Please log in again.');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
        
        if (!user || !user.id) {
            console.error('❌ No authenticated user found');
            showDashboardError('No user found. Please log in again.');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
        
        // Update currentUser with fresh data
        currentUser = user;
        window.currentUser = user; // Set global variable
        console.log('✅ Current user loaded:', user.id);
        
        // Get user profile from user_profiles table
        const { data: profile, error } = await window.supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', window.currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            showDashboardError('Error loading profile: ' + error.message);
            return;
        }
        
        if (profile) {
            console.log('✅ User profile loaded:', profile);
            
            // Store user data globally
            window.userData = profile;
            window.currentUser = currentUser;
            
            // Update all UI elements using the centralized function
            updateUserDisplay(profile);
            
            // Populate welcome section
            const welcomeMessage = document.getElementById('welcomeMessage');
            const userInfo = document.getElementById('userInfo');
            
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome back, ${profile.full_name || 'Student'}!`;
            }
            
            if (userInfo) {
                const classLevel = profile.class_level || profile.class || 'N/A';
                const cleanClassLevel = classLevel.replace(/^Class\s*/i, '');
                userInfo.textContent = `Class ${cleanClassLevel} • ${profile.board || 'N/A'}`;
            }
            
            console.log('✅ User display updated:', profile.full_name, 'Class', profile.class || profile.class_level);
            
            // Set flag that user data is loaded
            window.userDataLoaded = true;
            
            // Initialize subject manager with user data
            if (window.subjectManager) {
                const userClass = profile.class_level || profile.class || 'Class 6';
                const userBoard = profile.board || 'CBSE';
                await window.subjectManager.initialize(currentUser, userClass, userBoard);
                
                // Load current subject if saved
                if (profile.current_subject) {
                    await window.subjectManager.selectSubject(profile.current_subject);
                }
            }
        } else {
            console.log('⚠️ No profile found, using basic user info');
            
            // Use basic user info from auth
            const welcomeMessage = document.getElementById('welcomeMessage');
            const userInfo = document.getElementById('userInfo');
            const userName = document.getElementById('userName');
            const userClass = document.getElementById('userClass');
            
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome back, Student!`;
            }
            
            if (userInfo) {
                userInfo.textContent = `Class N/A • N/A`;
            }
            
            if (userName) {
                userName.textContent = 'Student';
            }
            
            if (userClass) {
                userClass.textContent = `Class N/A`;
            }
            
            // Store basic user data
            window.userData = { full_name: 'Student', class: 'N/A', board: 'N/A' };
            
            // Populate profile modal fields with basic info
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profilePhone = document.getElementById('profilePhone');
            const profileClass = document.getElementById('profileClass');
            const learningStyle = document.getElementById('learningStyle');
            const preferredLanguage = document.getElementById('preferredLanguage');
            
            if (profileName) profileName.value = 'Student';
            if (profileEmail) profileEmail.value = window.currentUser.email || '';
            if (profilePhone) profilePhone.value = '';
            if (profileClass) profileClass.value = 'Class N/A';
            if (learningStyle) learningStyle.value = 'visual';
            if (preferredLanguage) preferredLanguage.value = 'en';
            
            // Set default avatar
            selectedAvatar = 'roy-sir';
            window.selectedAvatar = 'roy-sir';
            updateAvatarDisplay();
            
            // Update user display
            updateUserDisplay({ full_name: 'Student', class: 'N/A', board: 'N/A' });
            
            // Initialize subject manager with basic info
            if (window.subjectManager) {
                await window.subjectManager.initialize(currentUser, 'Class 6', 'CBSE');
            }
        }
        
        // If profile exists, populate additional fields
        if (profile) {
            // Populate profile modal fields
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profilePhone = document.getElementById('profilePhone');
            const profileClass = document.getElementById('profileClass');
            const learningStyle = document.getElementById('learningStyle');
            const preferredLanguage = document.getElementById('preferredLanguage');
            
            if (profileName) profileName.value = profile.full_name || '';
            if (profileEmail) profileEmail.value = window.currentUser.email || '';
            if (profilePhone) profilePhone.value = profile.phone || '';
            if (profileClass) {
                const classLevel = profile.class_level || profile.class || 'N/A';
                const cleanClassLevel = classLevel.replace(/^Class\s*/i, '');
                profileClass.value = `Class ${cleanClassLevel}`;
            }
            if (learningStyle) learningStyle.value = profile.learning_style || 'visual';
            if (preferredLanguage) preferredLanguage.value = profile.preferred_language || 'en';
            
            // Set grade and subject selectors
            const gradeSelect = document.getElementById('gradeSelect');
            const subjectSelect = document.getElementById('subjectSelect');
            
            if (gradeSelect && profile.class_level) {
                gradeSelect.value = profile.class_level;
            }
            
            if (subjectSelect && profile.preferred_subject) {
                subjectSelect.value = profile.preferred_subject;
            }
            
            // Set avatar if saved
            if (profile.ai_avatar) {
                selectedAvatar = profile.ai_avatar;
                window.selectedAvatar = profile.ai_avatar; // Set global variable for TTS
                updateAvatarDisplay();
            } else if (profile.preferred_language) {
                // Set default avatar based on preferred language
                const defaultAvatar = getDefaultAvatarForLanguage(profile.preferred_language);
                if (defaultAvatar) {
                    selectedAvatar = defaultAvatar.id;
                    window.selectedAvatar = defaultAvatar.id; // Set global variable for TTS
                    // Update user profile with default avatar
                    await window.supabaseClient
                        .from('user_profiles')
                        .update({ ai_avatar: defaultAvatar.id })
                        .eq('id', window.currentUser.id);
                    updateAvatarDisplay();
                }
            }
            
            // Update user display in both sidebar sections
            updateUserDisplay(profile);
            
            // Store user data globally
            window.userData = profile;
            
            // Initialize subject manager
            if (window.subjectManager) {
                const userClass = profile.class_level || profile.class || 'Class 6';
                const userBoard = profile.board || 'CBSE';
                await window.subjectManager.initialize(currentUser, userClass, userBoard);
                
                // Load current subject if saved
                if (profile.current_subject) {
                    await window.subjectManager.selectSubject(profile.current_subject);
                }
            }
        }
    } catch (error) {
        showDashboardError('Error loading user data: ' + error.message);
    }
}

function showWelcomeMessage() {
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
        const welcomeMessage = `
            <div class="ai-message message">
                <div class="flex items-center space-x-3 mb-3">
                    <div class="text-2xl">👨‍🏫</div>
                    <div>
                        <p class="text-white font-semibold">Welcome to TUTOR.AI!</p>
                        <p class="text-gray-300 text-sm">Your personal AI tutor is ready to help you learn.</p>
                    </div>
                </div>
                <p class="text-white">Hello! I'm your AI tutor. I can help you with your studies using NCERT books. Please select your grade and subject above, then ask me any question!</p>
                <div class="mt-3 p-3 bg-blue-500/20 rounded-lg">
                    <p class="text-blue-200 text-sm"><strong>Quick Start:</strong></p>
                    <ul class="text-blue-200 text-sm mt-1 space-y-1">
                        <li>• "Explain photosynthesis"</li>
                        <li>• "Help me with algebra"</li>
                        <li>• "What is democracy?"</li>
                        <li>• "Tell me about Indian history"</li>
                    </ul>
                </div>
            </div>
        `;
        chatBox.innerHTML = welcomeMessage;
    }
}

async function loadBooks() {
    try {
        // Get user's class from the profile or UI
                const userClass = window.currentUser?.user_metadata?.class ||
                         document.getElementById('userClass')?.textContent?.replace('Class ', '') || 
                         '10'; // Default fallback
        
        // Extract class number (e.g., "Class 10" -> "10")
        const classNumber = userClass.toString().replace(/[^\d]/g, '');
        
        // Use the filtered endpoint with class parameter
        const response = await fetch(`${window.TUTOR_CONFIG?.apiBaseUrl || ''}/api/fs/books?grade=${classNumber}`);
        if (!response.ok) throw new Error('Failed to load books');
        
        const books = await response.json();
        const bookList = document.getElementById('bookList');
        if (!bookList) return;
        bookList.innerHTML = '';
        
        if (books.length === 0) {
            bookList.innerHTML = '<p class="text-gray-400 col-span-full">No books available for your class yet. More books will be added soon!</p>';
            return;
        }
        
        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'bg-purple-600/50 hover:bg-purple-600/70 p-2 rounded-lg text-white text-sm flex items-center cursor-pointer';
            bookElement.title = book.name;
            bookElement.innerHTML = `
                <span class="mr-2">📚</span>
                <span class="truncate">${book.name}</span>
            `;
            bookElement.onclick = () => openBook(book.id, book.name);
            bookList.appendChild(bookElement);
        });
        
    } catch (error) {
        console.error('Error loading books:', error);
        showDashboardError('Failed to load study materials');
    }
}

function openBook(bookId, bookName) {
    // Create a modal to view the book
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="glass-effect rounded-2xl p-6 w-full max-w-4xl max-h-screen flex flex-col overflow-hidden">
            <div class="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 class="text-white text-xl font-bold truncate pr-4">${bookName}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-red-400 text-2xl font-bold">
                    &times;
                </button>
            </div>
            <div class="flex-grow">
                <iframe src="/api/fs/books/${bookId}" class="w-full h-full border-none rounded-lg"></iframe>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function setupEventListeners() {
    // Grade and subject selectors
    const gradeSelect = document.getElementById('gradeSelect');
    if (gradeSelect) {
        gradeSelect.addEventListener('change', updateContext);
    }
    
    const subjectSelect = document.getElementById('subjectSelect');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', updateContext);
    }
    
    // Message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    // Voice button
    const voiceButton = document.getElementById('voiceButton');
    if (voiceButton) {
        voiceButton.addEventListener('click', toggleVoiceRecording);
    }
    
    // Accessibility options
    const dyslexicFont = document.getElementById('dyslexicFont');
    if (dyslexicFont) {
        dyslexicFont.addEventListener('change', updateAccessibility);
    }
    
    const highContrast = document.getElementById('highContrast');
    if (highContrast) {
        highContrast.addEventListener('change', updateAccessibility);
    }
    
    const screenReader = document.getElementById('screenReader');
    if (screenReader) {
        screenReader.addEventListener('change', updateAccessibility);
    }

    // Profile modal
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfile = document.getElementById('closeProfile');
    const saveProfile = document.getElementById('saveProfile');
    
    if (profileBtn && profileModal) {
        profileBtn.addEventListener('click', () => {
            profileModal.classList.remove('hidden');
        });
    }
    
    if (closeProfile && profileModal) {
        closeProfile.addEventListener('click', () => {
            profileModal.classList.add('hidden');
        });
    }
    
    if (saveProfile) {
        saveProfile.addEventListener('click', saveProfileChanges);
    }
}

function populateAvatarGrid() {
    const avatarGrid = document.getElementById('avatarGrid');
    if (!avatarGrid) {
        console.log('Avatar grid element not found');
        return;
    }
    
    avatarGrid.innerHTML = '';
    
    regionalAvatars.forEach(avatar => {
        const avatarElement = document.createElement('div');
        avatarElement.className = 'avatar-option p-2 text-center';
        avatarElement.innerHTML = `
            <div class="text-3xl mb-2">${avatar.image}</div>
            <div class="text-xs text-white">${avatar.name}</div>
        `;
        avatarElement.onclick = (event) => selectAvatar(avatar.id, event);
        avatarGrid.appendChild(avatarElement);
    });
}

async function selectAvatar(avatarId, event) {
    selectedAvatar = avatarId;
    window.selectedAvatar = avatarId; // Set global variable
    
    // Update visual selection
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    if (event && event.target) {
        event.target.closest('.avatar-option').classList.add('selected');
    }
    
    // Update user display
    const avatar = regionalAvatars.find(a => a.id === avatarId);
    if (avatar) {
        const userAvatar = document.getElementById('userAvatar');
        const userAvatar2 = document.getElementById('userAvatar2');
        if (userAvatar) {
            userAvatar.innerHTML = avatar.image;
        }
        if (userAvatar2) {
            userAvatar2.innerHTML = avatar.image;
        }
    }
    
    // Save avatar preference to Supabase immediately
    if (currentUser && currentUser.id) {
        try {
            await window.supabaseClient.from('user_profiles').upsert({ 
                id: currentUser.id, 
                ai_avatar: selectedAvatar 
            });
            console.log('Avatar preference saved:', selectedAvatar);
        } catch (error) {
            console.error('Error saving avatar preference:', error);
        }
    }
}

async function updateContext() {
    currentGrade = document.getElementById('gradeSelect').value;
    currentSubject = document.getElementById('subjectSelect').value;
    
    // Update user preferences
    if (currentUser) {
        await window.supabaseClient.from('user_preferences').upsert({
            user_id: currentUser.id,
            preference_key: 'current_grade',
            preference_value: currentGrade
        });
        
        await window.supabaseClient.from('user_preferences').upsert({
            user_id: currentUser.id,
            preference_key: 'current_subject',
            preference_value: currentSubject
        });
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    // Check if user data is loaded
    if (!window.userDataLoaded) {
        console.error('❌ User data not loaded yet');
        await addMessage('ai', 'Please wait, loading your profile...');
        return;
    }
    
    // Add user message to chat
    await addMessage('user', text);
    input.value = '';
    showTypingIndicator();
    
    try {
        // Use already loaded user data instead of fetching again
        const userProfile = window.userData;
        
        if (!userProfile) {
            console.error('❌ No user profile available');
            await addMessage('ai', 'Error: User profile not loaded. Please refresh the page.');
            return;
        }
        
        // Get user class/subject from profile
        const userClass = userProfile.class || userProfile.class_level || 'Class 6';
        const userSubject = window.currentSubject || '';
        const userBoard = userProfile.board || 'CBSE';
        
        // Check if this is the first response of the day
        const today = new Date().toDateString();
        const isFirstResponseOfDay = lastResponseDate !== today;
        
        console.log('📤 Sending message with user data:', {
            name: userProfile.full_name,
            class: userClass,
            board: userBoard,
            subject: userSubject,
            isFirstResponseOfDay: isFirstResponseOfDay,
            userProfile: userProfile
        });
        
        // Get the current avatar from user profile or global variable
        const currentAvatar = userProfile?.ai_avatar || window.selectedAvatar || selectedAvatar || 'roy-sir';
        
        // Get recent chat history for context
        let chatHistory = [];
        if (window.subjectManager && window.subjectManager.getCurrentSubject()) {
            const subjectHistory = window.subjectManager.subjectChatHistory[window.subjectManager.getCurrentSubject()] || [];
            chatHistory = subjectHistory.slice(-10); // Last 10 messages for context
        }

        // Send to AI backend with complete user profile and chat history
        const response = await fetch('/api/enhanced-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                grade: userClass.replace(/[^0-9]/g, ''), // Extract number from class
                subject: userSubject,
                userProfile: userProfile,
                teacher: currentAvatar === 'ms-sapana' ? 'Ms. Sapana' : 'Roy Sir',
                isFirstResponseOfDay: isFirstResponseOfDay,
                chatHistory: chatHistory
            })
        });
        
        const data = await response.json();
        removeTypingIndicator();
        
        if (data.success && data.response) {
            await addMessage('ai', data.response);
            
            // Save message to subject history if subject manager is active
            if (window.subjectManager && window.subjectManager.getCurrentSubject()) {
                await window.subjectManager.saveChatMessage(
                    window.subjectManager.getCurrentSubject(),
                    text,
                    data.response
                );
            }
            
            // Update the last response date after successful response
            lastResponseDate = today;
        } else {
            console.error('AI response error:', data);
            await addMessage('ai', 'Sorry, I could not get a response from the AI.');
        }
    } catch (err) {
        console.error('Send message error:', err);
        removeTypingIndicator();
        await addMessage('ai', 'Error connecting to AI server.');
    }
}

async function addMessage(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-${role} p-4 rounded-2xl mb-4`;
    
    // Process Mermaid diagrams
    // Ensure content is a string before processing
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);
    let processedContent = contentString;
    const hasMermaid = contentString.includes('```mermaid');
    
    if (hasMermaid) {
        processedContent = contentString.replace(/```mermaid([\s\S]*?)```/g, 
            '<div class="mermaid bg-gray-800 p-4 rounded-lg my-4">$1</div>');
    }
    
    // Process other markdown
    processedContent = marked.parse(processedContent);
    
    messageDiv.innerHTML = `
        <div class="flex items-start space-x-4">
            <div class="w-10 h-10 ${role === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-green-500 to-blue-600'} rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-sm">${role === 'user' ? 'You' : 'AI'}</span>
            </div>
            <div class="flex-1 overflow-x-auto">
                <div class="text-white message-content prose prose-invert max-w-none">${processedContent}</div>
                <p class="text-gray-400 text-xs mt-2">Just now</p>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Render diagrams after a small delay
    if (hasMermaid) {
        setTimeout(renderDiagrams, 100);
    }

    if (role === 'ai') {
        // Use the new TTS system for AI responses
        if (window.textToSpeech) {
            window.textToSpeech.speak(content, { role: 'ai' });
        } else {
            speakText(content);
        }
    }
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) typingDiv.remove();
}

async function saveStudySession(question, answer) {
    if (!currentUser) return;
    
    try {
        await fetch(`${window.TUTOR_CONFIG?.apiBaseUrl || ''}/api/study-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                topic: question,
                subject: currentSubject || 'general',
                duration: 5 // Default duration in minutes
            })
        });
    } catch (error) {
        console.error('Error saving study session:', error);
    }
}

// Initialize voice features
function initializeVoiceFeatures() {
    // Initialize speech synthesis
    if (window.speechSynthesis) {
        // Some browsers need this event to populate voices
        speechSynthesis.onvoiceschanged = function() {
            console.log('Voices changed, refreshing voice list');
            populateVoices();
        };
        
        // First try to populate voices immediately
        populateVoices();
        
        // Fallback in case voices aren't loaded yet
        setTimeout(populateVoices, 1000);
    } else {
        console.log('Speech synthesis not supported');
        document.getElementById('voiceSelect').disabled = true;
    }

    // Initialize speech recognition
    initSpeechRecognition();
    
    // Load saved settings
    loadVoiceSettings();
    
    // Setup voice control listeners
    setupVoiceSettingsListeners();
}

function populateVoices() {
    return new Promise((resolve) => {
        if (!speechSynthesis) {
            return resolve([]);
        }
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            voicesLoaded = true;
            resolve(voices);
        } else {
            speechSynthesis.onvoiceschanged = () => {
                voicesLoaded = true;
                resolve(speechSynthesis.getVoices());
            };
            // Fallback timeout
            setTimeout(() => {
                if (!voicesLoaded) {
                    console.log('Voice loading timeout');
                    resolve(speechSynthesis.getVoices());
                }
            }, 2000);
        }
    });
}

function loadVoiceSettings() {
    const voiceRate = document.getElementById('voiceRate');
    const voicePitch = document.getElementById('voicePitch');
    const voiceRateValue = document.getElementById('voiceRateValue');
    const voicePitchValue = document.getElementById('voicePitchValue');
    
    // Load settings from TTS system if available, otherwise from localStorage
    if (window.textToSpeech) {
        if (voiceRate) {
            voiceRate.value = window.textToSpeech.rate || 1.0;
        }
        if (voicePitch) {
            voicePitch.value = window.textToSpeech.pitch || 1.0;
        }
    } else {
        // Fallback to localStorage
        if (voiceRate) {
            voiceRate.value = localStorage.getItem('voiceRate') || '1.0';
        }
        if (voicePitch) {
            voicePitch.value = localStorage.getItem('voicePitch') || '1.0';
        }
    }
    
    // Update display values
    if (voiceRateValue && voiceRate) {
        voiceRateValue.textContent = voiceRate.value;
    }
    if (voicePitchValue && voicePitch) {
        voicePitchValue.textContent = voicePitch.value;
    }
}

function setupVoiceSettingsListeners() {
    const voiceRate = document.getElementById('voiceRate');
    const voicePitch = document.getElementById('voicePitch');
    const voiceRateValue = document.getElementById('voiceRateValue');
    const voicePitchValue = document.getElementById('voicePitchValue');
    const voiceButton = document.getElementById('voiceButton');

    if (voiceRate) {
        voiceRate.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            // Update display
            if (voiceRateValue) {
                voiceRateValue.textContent = value.toFixed(2);
            }
            // Update TTS system
            if (window.textToSpeech) {
                window.textToSpeech.setRate(value);
            }
            // Save to localStorage as backup
            localStorage.setItem('voiceRate', value.toString());
        });
        
        voiceRate.addEventListener('change', (e) => {
            const value = parseFloat(e.target.value);
            // Update TTS system
            if (window.textToSpeech) {
                window.textToSpeech.setRate(value);
            }
            // Save to localStorage
            localStorage.setItem('voiceRate', value.toString());
        });
    }

    if (voicePitch) {
        voicePitch.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            // Update display
            if (voicePitchValue) {
                voicePitchValue.textContent = value.toFixed(2);
            }
            // Update TTS system
            if (window.textToSpeech) {
                window.textToSpeech.setPitch(value);
            }
            // Save to localStorage as backup
            localStorage.setItem('voicePitch', value.toString());
        });
        
        voicePitch.addEventListener('change', (e) => {
            const value = parseFloat(e.target.value);
            // Update TTS system
            if (window.textToSpeech) {
                window.textToSpeech.setPitch(value);
            }
            // Save to localStorage
            localStorage.setItem('voicePitch', value.toString());
        });
    }

    if (voiceButton) {
        voiceButton.addEventListener('click', toggleVoiceRecording);
    }
}

// Global variables for voice recognition
// Note: isRecording is already declared at the top of the file

function initSpeechRecognition() {
    try {
        const voiceButton = document.getElementById('voiceButton');
        
        if (!voiceButton) {
            console.log('Voice button not found');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('Speech recognition not supported');
            voiceButton.style.display = 'none';
            showError('Voice recognition not supported in this browser');
            return;
        }

        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Set language based on current avatar
        const currentAvatar = window.selectedAvatar || 'roy-sir';
        if (currentAvatar === 'ms-sapana') {
            recognition.lang = 'hi-IN'; // Hindi for Ms. Sapana
        } else {
            recognition.lang = 'en-IN'; // English for Roy Sir
        }

        recognition.onstart = () => {
            console.log('Speech recognition started');
            isRecording = true;
            const voiceIcon = document.getElementById('voiceIcon');
            if (voiceIcon) {
                voiceIcon.textContent = '🔴';
            }
            voiceButton.classList.add('voice-recording');
            
            // Set timeout (15 seconds)
            recognitionTimeout = setTimeout(() => {
                if (isRecording) {
                    recognition.stop();
                    showError("No speech detected. Please try again.");
                }
            }, 15000);
        };

        recognition.onresult = (event) => {
            clearTimeout(recognitionTimeout);
            const transcript = event.results[0][0].transcript;
            console.log('Speech recognized:', transcript);
            document.getElementById('chatInput').value = transcript;
            showSuccess("Voice input received: " + transcript);
            stopRecording();
        };

        recognition.onerror = (event) => {
            clearTimeout(recognitionTimeout);
            console.error('Speech recognition error:', event.error);
            
            let errorMessage = 'Voice input error: ';
            switch(event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone found. Please check your audio settings.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
                    break;
                case 'network':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                case 'service-not-allowed':
                    errorMessage = 'Speech recognition service not allowed. Please check permissions.';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            showError(errorMessage);
            stopRecording();
        };

        recognition.onend = () => {
            clearTimeout(recognitionTimeout);
            stopRecording();
        };

        console.log('Speech recognition initialized successfully');

    } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        const voiceButton = document.getElementById('voiceButton');
        if (voiceButton) {
            voiceButton.style.display = 'none';
        }
        showError('Voice input not available in this browser');
    }
}

function stopRecording() {
    isRecording = false;
    const voiceButton = document.getElementById('voiceButton');
    const voiceIcon = document.getElementById('voiceIcon');
    if (voiceButton) {
        voiceButton.classList.remove('voice-recording');
    }
    if (voiceIcon) {
        voiceIcon.textContent = '🎤';
    }
}

async function toggleVoiceRecording() {
    // Assign to global variable for HTML onclick access
    window._toggleVoiceRecording = toggleVoiceRecording;
    try {
        if (!recognition) {
            showError('Voice recognition not initialized');
            return;
        }

        if (isRecording) {
            // Stop listening
            recognition.stop();
            stopRecording();
            showSuccess('Voice recording stopped');
        } else {
            // Check microphone permission first
            try {
                await requestMicrophonePermission();
                
                // Start listening
                recognition.start();
                showSuccess('Voice recording started - speak now!');
            } catch (permissionError) {
                console.error('Microphone permission error:', permissionError);
                showError('Microphone permission required. Please allow microphone access and try again.');
            }
        }
        
    } catch (error) {
        console.error('Voice recording error:', error);
        showError('Could not access microphone. Please check permissions.');
    }
}

async function speakText(text) {
    console.log('[TTS] Attempting to speak:', text);
    if (!speechSynthesis) {
        console.error('[TTS] Speech synthesis not supported.');
        return;
    }

    try {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        console.log('[TTS] Cancelled previous speech.');

        // Wait for voices to load
        console.log('[TTS] Loading voices...');
        const voices = await populateVoices();
        console.log(`[TTS] ${voices.length} voices loaded.`);
        
        const voiceSelect = document.getElementById('voiceSelect');
        const voiceRate = document.getElementById('voiceRate');
        const voicePitch = document.getElementById('voicePitch');
        
        const selectedVoiceName = voiceSelect ? voiceSelect.value : '';
        console.log(`[TTS] Selected voice from dropdown: ${selectedVoiceName}`);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = voiceRate ? parseFloat(voiceRate.value) || 1 : 1;
        utterance.pitch = voicePitch ? parseFloat(voicePitch.value) || 1 : 1;

        // Select voice if available
        if (selectedVoiceName && voices.length > 0) {
            const selectedVoice = voices.find(v => v.name === selectedVoiceName);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang;
                console.log(`[TTS] Assigned voice: ${selectedVoice.name} (${selectedVoice.lang})`);
            } else {
                console.log(`[TTS] Selected voice '${selectedVoiceName}' not found. Using fallback.`);
                // Fallback to first English voice
                const englishVoice = voices.find(v => v.lang.startsWith('en-'));
                if (englishVoice) {
                    utterance.voice = englishVoice;
                    console.log(`[TTS] Fallback voice: ${englishVoice.name}`);
                }
            }
        } else {
            console.log('[TTS] No voice selected or no voices available. Using system default.');
        }

        utterance.onstart = () => console.log('[TTS] Speech started.');
        utterance.onend = () => console.log('[TTS] Speech finished.');
        utterance.onerror = (event) => {
            console.error('[TTS] Speech synthesis error:', event);
            showError(`TTS Error: ${event.error}`);
        };

        speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('[TTS] Error in speakText function:', error);
    }
}

// Initialize voice selection dropdown
async function initVoiceSelection() {
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect) return;
    voiceSelect.innerHTML = '<option value="">Loading voices...</option>';

    try {
        const voices = await populateVoices();
        voiceSelect.innerHTML = ''; // Clear loading message

        const indianLangCodes = ['en-IN', 'hi-IN', 'bn-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'ta-IN', 'te-IN'];

        const filteredVoices = voices.filter(voice => {
            const name = voice.name.toLowerCase();
            const lang = voice.lang;

            // Keep "Microsoft Ravi"
            if (name.includes('ravi') && lang === 'en-IN') {
                return true;
            }
            // Keep "Google Hindi"
            if (name.includes('google') && lang === 'hi-IN') {
                return true;
            }
            // Keep any other Indian regional languages
            if (indianLangCodes.includes(lang) && !(name.includes('ravi') || name.includes('google'))) {
                return true;
            }
            
            return false;
        });

        if (filteredVoices.length === 0) {
            voiceSelect.innerHTML = '<option value="">Specified voices not found</option>';
            console.log("Could not find 'Microsoft Ravi' or 'Google Hindi'. Please check your system's installed voices.");
            // As a fallback, populate with whatever is available
            voices.forEach(v => {
                const option = document.createElement('option');
                option.value = v.name;
                option.textContent = `${v.name} (${v.lang})`;
                voiceSelect.appendChild(option);
            });
            return;
        }

        // Populate dropdown with the filtered voices
        filteredVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });

        // Set default voice to "Microsoft Ravi"
        const defaultVoice = filteredVoices.find(v => v.name.toLowerCase().includes('ravi') && v.lang === 'en-IN');
        if (defaultVoice) {
            voiceSelect.value = defaultVoice.name;
        } else if (filteredVoices.length > 0) {
            // Fallback to the first available voice in the filtered list
            voiceSelect.value = filteredVoices[0].name;
        }
        
        console.log(`[TTS] Populated dropdown with ${filteredVoices.length} filtered voices.`);

    } catch (error) {
        console.error('Error loading voices:', error);
        voiceSelect.innerHTML = '<option value="">Voice loading failed</option>';
    }
}

// Enhanced Diagram Rendering
async function renderDiagrams() {
    try {
        await mermaid.run({
            querySelector: '.mermaid',
            suppressErrors: true
        });
    } catch (error) {
        console.error('Mermaid rendering error:', error);
    }
}

// OAuth Functions
function showOAuthModal() {
    document.getElementById('oauthModal').classList.remove('hidden');
}

function hideOAuthModal() {
    document.getElementById('oauthModal').classList.add('hidden');
}

async function signInWithGoogle() {
    try {
        const { error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'https://tution.app/dashboard'
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        alert('Failed to sign in with Google. Please try again.');
    }
}

async function signInWithGitHub() {
    try {
        const { error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: 'https://tution.app/dashboard'
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('Error signing in with GitHub:', error);
        alert('Failed to sign in with GitHub. Please try again.');
    }
}

async function logout() {
    if (!window.supabaseClient) return;
    
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        
        window.location.href = '/';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
}

// UI Functions
function showSection(sectionName) {
    // Assign to global variable for HTML onclick access
    window._showSection = showSection;
    console.log('Showing section:', sectionName);
    
    // Hide all sections
    const sections = document.querySelectorAll('[id$="Section"]');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'bg-white/10', 'text-white');
        item.classList.add('text-gray-300');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName + 'Section');
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
        console.log('Section shown:', sectionName + 'Section');
    } else {
        console.log('Section not found:', sectionName + 'Section');
    }
    
    // Add active class to nav item
    const activeNavItems = document.querySelectorAll(`[onclick*="showSection('${sectionName}')"]`);
    activeNavItems.forEach(activeNavItem => {
        activeNavItem.classList.add('active', 'bg-white/10', 'text-white');
        activeNavItem.classList.remove('text-gray-300');
    });
    
    console.log('Section navigation completed for:', sectionName);
}

function toggleSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar.classList.contains('-translate-x-full')) {
        // Open sidebar
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        
        // Mobile-specific improvements
        if (isMobile) {
            // Prevent body scroll when sidebar is open
            document.body.style.overflow = 'hidden';
            
            // Add touch-to-close functionality
            overlay.addEventListener('click', closeSidebar, { once: true });
            
            // Add swipe-to-close functionality
            let touchStartX = 0;
            sidebar.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            
            sidebar.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;
                
                if (diff > 50) { // Swipe left to close
                    closeSidebar();
                }
            }, { passive: true });
        }
    } else {
        closeSidebar();
    }
}

function closeSidebar() {
    // Assign to global variable for HTML onclick access
    window._closeSidebar = closeSidebar;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0', 'pointer-events-none');
    }
}

function closeMobileSidebar() {
    // Assign to global variable for HTML onclick access
    window._closeMobileSidebar = closeMobileSidebar;
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        
        // Restore body scroll
        if (window.isMobile) {
            document.body.style.overflow = '';
        }
    }
}

// Close sidebar when clicking overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('mobileSidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
});

function updateUserDisplay(profile) {
    // Update all user name elements (both sets)
    const userNameElements = [
        document.getElementById('userName'),
        document.getElementById('userName2')
    ];
    
    const userClassElements = [
        document.getElementById('userClass'),
        document.getElementById('userClass2')
    ];
    
    const userAvatarElements = [
        document.getElementById('userAvatar'),
        document.getElementById('userAvatar2')
    ];
    
    const userInitialsElement = document.getElementById('userInitials');
    
    // Update user names
    userNameElements.forEach(element => {
        if (element) {
            element.textContent = profile.full_name || profile.name || 'Student';
        }
    });
    
    // Update user classes
    userClassElements.forEach(element => {
        if (element) {
            const grade = profile.grade || profile.class_level || profile.class || '10';
            // Remove "Class" prefix if it already exists
            const cleanGrade = grade.replace(/^Class\s*/i, '');
            element.textContent = `Class ${cleanGrade}`;
        }
    });
    
    // Update user avatars
    userAvatarElements.forEach(element => {
        if (element) {
            const avatarId = profile.ai_avatar || selectedAvatar;
            const avatar = regionalAvatars.find(a => a.id === avatarId);
            if (avatar) {
                element.innerHTML = avatar.image;
            } else {
                // Default avatar if none found
                element.innerHTML = '👤';
            }
        }
    });
    
    if (userInitialsElement) {
        const name = profile.full_name || profile.name || 'Student';
        userInitialsElement.textContent = name.charAt(0).toUpperCase();
    }
}

async function savePreferences() {
    try {
        const preferences = {
            learning_style: document.getElementById('learningStyle').value,
            preferred_language: document.getElementById('preferredLanguage').value,
            avatar_id: selectedAvatar,
            accessibility: {
                dyslexic_font: document.getElementById('dyslexicFont').checked,
                high_contrast: document.getElementById('highContrast').checked,
                screen_reader: document.getElementById('screenReader').checked
            }
        };
        
        await window.supabaseClient.from('user_preferences').upsert({
            user_id: currentUser.id,
            preference_key: 'user_preferences',
            preference_value: preferences
        });
        
        alert('Preferences saved successfully!');
    } catch (error) {
        console.error('Error saving preferences:', error);
        alert('Failed to save preferences. Please try again.');
    }
}

function loadUserPreferences() {
    // Load saved preferences and apply them
    // This would be implemented based on your preferences structure
}

function updateAccessibility() {
    const dyslexicFont = document.getElementById('dyslexicFont').checked;
    const highContrast = document.getElementById('highContrast').checked;
    
    document.body.classList.toggle('font-dyslexic', dyslexicFont);
    document.body.classList.toggle('high-contrast', highContrast);
}

function askQuickQuestion(question) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = question;
    sendMessage();
}

// Helper function to get default avatar based on language
function getDefaultAvatarForLanguage(language) {
    const languageLower = language.toLowerCase();
    
    if (languageLower.includes('hindi') || languageLower.includes('hi') || languageLower.includes('hinglish')) {
        return regionalAvatars.find(avatar => avatar.id === 'ms-sapana');
    } else if (languageLower.includes('english') || languageLower.includes('en')) {
        return regionalAvatars.find(avatar => avatar.id === 'roy-sir');
    } else {
        // Default to Roy Sir for English
        return regionalAvatars.find(avatar => avatar.id === 'roy-sir');
    }
}

// Export functions for global access
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.sendMessage = sendMessage;
window.startVoiceInput = toggleVoiceRecording;
window.selectAvatar = selectAvatar;
window.savePreferences = savePreferences;
window.signInWithGoogle = signInWithGoogle;
window.signInWithGitHub = signInWithGitHub;
window.logout = logout;

// Save profile changes
async function saveProfileChanges() {
    try {
        const profileName = document.getElementById('profileName');
        const profilePhone = document.getElementById('profilePhone');
        const learningStyle = document.getElementById('learningStyle');
        const preferredLanguage = document.getElementById('preferredLanguage');
        
        const { error } = await window.supabaseClient
            .from('user_profiles')
            .upsert({
                id: currentUser.id,
                full_name: profileName.value,
                phone: profilePhone.value,
                learning_style: learningStyle.value,
                preferred_language: preferredLanguage.value,
                ai_avatar: selectedAvatar
            });
        
        if (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile changes.');
        } else {
            alert('Profile updated successfully!');
            document.getElementById('profileModal').classList.add('hidden');
            await loadUserData(); // Reload data to reflect changes
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile changes.');
    }
}

// Update avatar display
function updateAvatarDisplay() {
    const aiAvatar = document.getElementById('aiAvatar');
    const avatarCards = document.querySelectorAll('.avatar-selection-card');
    
    // Update AI avatar icon
    if (aiAvatar) {
        aiAvatar.innerHTML = '';
        const icon = document.createElement('i');
        
        switch (selectedAvatar) {
            case 'professor':
                icon.className = 'fas fa-user-tie text-white';
                break;
            case 'mentor':
                icon.className = 'fas fa-chalkboard-teacher text-white';
                break;
            case 'friend':
                icon.className = 'fas fa-smile text-white';
                break;
            case 'expert':
                icon.className = 'fas fa-lightbulb text-white';
                break;
            default:
                icon.className = 'fas fa-user-tie text-white';
        }
        
        aiAvatar.appendChild(icon);
    }
    
    // Update avatar card selection
    avatarCards.forEach(card => {
        card.classList.remove('selected');
        // Check if this card corresponds to the selected avatar
        const isHindiCard = card.querySelector('img[alt="Ms. Sapana"]') && selectedAvatar === 'ms-sapana';
        const isEnglishCard = card.querySelector('img[alt="Roy Sir"]') && selectedAvatar === 'roy-sir';
        if (isHindiCard || isEnglishCard) {
            card.classList.add('selected');
        }
    });
}

// Setup avatar selection
function setupAvatarSelection() {
    const avatarCards = document.querySelectorAll('.avatar-selection-card');
    avatarCards.forEach(card => {
        card.addEventListener('click', () => {
            avatarCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            // Determine which avatar was selected based on the image alt text
            const img = card.querySelector('img');
            if (img && img.alt === 'Ms. Sapana') {
                selectedAvatar = 'ms-sapana';
                window.selectedAvatar = 'ms-sapana';
            } else if (img && img.alt === 'Roy Sir') {
                selectedAvatar = 'roy-sir';
                window.selectedAvatar = 'roy-sir';
            }
            
            updateAvatarDisplay();
            saveAvatarPreference();
        });
    });
    updateAvatarDisplay();
}

async function saveAvatarPreference() {
    try {
        // Use the current selectedAvatar from window object
        const avatarId = window.selectedAvatar;
        if (!avatarId) {
            console.log('No avatar selected');
            return;
        }

        console.log('Saving avatar preference:', avatarId);

        // Save to Supabase user_profiles table
        if (currentUser) {
            const { error } = await window.supabaseClient
                .from('user_profiles')
                .upsert({
                    id: currentUser.id,
                    ai_avatar: avatarId,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error saving avatar preference:', error);
                showError('Failed to save avatar preference');
                return;
            }

            console.log('Avatar preference saved successfully');
            showSuccess('Avatar preference saved!');
            
            // Update local userData
            if (userData) {
                userData.ai_avatar = avatarId;
            }
            if (window.userData) {
                window.userData.ai_avatar = avatarId;
            }
            
                            // Force TTS to update voice selection for new avatar
                if (window.textToSpeech) {
                    console.log('Updating TTS voice for new avatar:', avatarId);
                    // Trigger voice selection update
                    window.textToSpeech.forceVoiceUpdate();
                }
        }
    } catch (error) {
        console.error('Error in saveAvatarPreference:', error);
        showError('Failed to save avatar preference');
    }
}

// Chat
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const message = chatInput.value.trim();
    if (!message) return;
    clearDashboardError();
    await addMessage('user', message);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    showTypingIndicator();
    // Check if user is asking for a diagram or image
    const diagramKeywords = ['diagram', 'image', 'picture', 'flowchart', 'figure', 'graph', 'chart'];
    const isDiagramRequest = diagramKeywords.some(word => message.toLowerCase().includes(word));
    if (isDiagramRequest) {
        // Try to find a relevant book image first
        try {
            const imgRes = await fetch(`${window.TUTOR_CONFIG?.apiBaseUrl || ''}/api/book-images?keyword=${encodeURIComponent(message)}`);
            const imgData = await imgRes.json();
            if (imgData.images && imgData.images.length > 0) {
                removeTypingIndicator();
                const img = imgData.images[0];
                await addMessage('ai', `<img src='${img.imgPath.replace(/\\/g, '/')}' alt='Book Diagram' class='max-w-full max-h-80 rounded shadow mb-2'><div class='text-xs text-gray-300'>From book: <b>${img.file}</b>, page ${img.page}</div>`);
                return;
            }
        } catch (e) {
            // If image search fails, fallback to GPT
        }
    }
    // Get AI response as before
    try {
        // Get the current avatar from user profile or global variable
        const currentAvatar = window.userData?.ai_avatar || window.selectedAvatar || selectedAvatar || 'roy-sir';
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message, 
                avatar: currentAvatar, 
                userId: currentUser.id 
            })
        });
        if (!response.ok) throw new Error('Chat API error: ' + response.status);
        const data = await response.json();
        removeTypingIndicator();
        await addMessage('ai', data.response);
        speakText(data.response);
    } catch (error) {
        removeTypingIndicator();
        await addMessage('ai', 'Error connecting to AI server.');
    }
}

function handleQuickAction(event) {
    const button = event.currentTarget;
    const text = button.textContent.trim();
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = text;
        sendChatMessage();
    }
}

// Voice
function updateVoiceButton() {
    const voiceToggle = document.getElementById('voiceToggle');
    if (!voiceToggle) return;
    if (isRecording) {
        voiceToggle.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        voiceToggle.classList.add('listening');
    } else {
        voiceToggle.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceToggle.classList.remove('listening');
    }
}

// Utility: Show error
function showDashboardError(msg) {
    const errDiv = document.getElementById('dashboardError');
    if (errDiv) {
        errDiv.textContent = msg;
        errDiv.classList.remove('hidden');
    }
    console.error(msg);
}
function clearDashboardError() {
    const errorEl = document.getElementById('dashboardError');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }
}

// Enhanced error handling
function showError(message, duration = 5000) {
    const existing = document.querySelector('.error-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 glass-effect p-4 rounded-xl text-red-400 font-medium flex items-center space-x-2 z-50 error-toast';
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showSuccess(message, duration = 3000) {
    const existing = document.querySelector('.success-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 glass-effect p-4 rounded-xl text-green-400 font-medium flex items-center space-x-2 z-50 success-toast';
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Attach chat and voice event listeners on DOMContentLoaded

document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('sendButton');
    const chatInput = document.getElementById('chatInput');
    const voiceButton = document.getElementById('voiceButton');
    if (sendButton) sendButton.onclick = sendMessage;
    if (chatInput) chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    if (voiceButton) voiceButton.onclick = toggleVoiceRecording;
});

if (window.mermaid) {
    window.mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true
        },
        securityLevel: 'loose'
    });
} 

// Show profile popup
function showProfilePopup() {
    console.log('Opening profile popup...');
    console.log('User data:', userData);
    console.log('Current user:', currentUser);
    
    // Check if currentUser is available
    if (!currentUser) {
        console.error('Current user not available');
        alert('Please log in again to access your profile.');
        return;
    }
    
    // Load fresh user data from Supabase
    loadUserData().then(() => {
        // Populate popup fields with current user data
        const nameField = document.getElementById('popupProfileName');
        const classField = document.getElementById('popupProfileClass');
        const boardField = document.getElementById('popupProfileBoard');
        const emailField = document.getElementById('popupProfileEmail');
        const mobileField = document.getElementById('popupProfileMobile');
        
        if (nameField) nameField.value = window.userData?.full_name || '';
        if (classField) classField.value = window.userData?.class || '';
        if (boardField) boardField.value = window.userData?.board || '';
        if (emailField) emailField.value = (currentUser && currentUser.email) || '';
        if (mobileField) mobileField.value = window.userData?.mobile || 'Not set';
        
        // Show popup
        const popup = document.getElementById('profilePopupOverlay');
        if (popup) {
            popup.classList.remove('hidden');
            
            // Add click outside to close functionality
            popup.addEventListener('click', function(e) {
                if (e.target === popup) {
                    closeProfilePopup();
                }
            });
        }
    });
}

// Close profile popup
function closeProfilePopup() {
    const popup = document.getElementById('profilePopupOverlay');
    if (popup) {
        popup.classList.add('hidden');
    }
}

// Save profile from popup
async function saveProfileFromPopup() {
    try {
        const name = document.getElementById('popupProfileName')?.value || '';
        const classValue = document.getElementById('popupProfileClass')?.value || '';
        const board = document.getElementById('popupProfileBoard')?.value || '';
        
        if (!window.currentUser) {
            showError('User not authenticated');
            return;
        }
        
        // Update user data
        const { error } = await window.supabaseClient
            .from('user_profiles')
            .upsert({
                id: window.currentUser.id,
                full_name: name,
                class: classValue,
                board: board,
                updated_at: new Date().toISOString()
            });
        
        if (error) {
            console.error('Error updating profile:', error);
            showError('Failed to update profile');
            return;
        }
        
        // Update local userData
        window.userData = { ...window.userData, full_name: name, class: classValue, board: board };
        
        // Update display
        updateUserDisplay(window.userData);
        
        // Close popup
        closeProfilePopup();
        
        showSuccess('Profile updated successfully!');
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showError('Failed to save profile. Please try again.');
    }
}

// Show contact us popup
function showContactUs() {
    // Populate contact form with user data
    const nameField = document.getElementById('contactUsName');
    const emailField = document.getElementById('contactUsEmail');
    const mobileField = document.getElementById('contactUsMobile');
    
    if (nameField) nameField.value = window.userData?.full_name || (currentUser && currentUser.email) || '';
    if (emailField) emailField.value = (currentUser && currentUser.email) || '';
    if (mobileField) mobileField.value = window.userData?.mobile || 'Not set';
    
    // Show popup
    const popup = document.getElementById('contactUsPopupOverlay');
    if (popup) {
        popup.classList.remove('hidden');
        
        // Add click outside to close functionality
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                closeContactUsPopup();
            }
        });
    }
}

// Close contact us popup
function closeContactUsPopup() {
    const popup = document.getElementById('contactUsPopupOverlay');
    if (popup) {
        popup.classList.add('hidden');
    }
} 

    // Setup small TTS controls below avatar
    function setupSmallTTSControls() {
        const playBtn = document.getElementById('tts-play-small');
        const stopBtn = document.getElementById('tts-stop-small');
        
        if (playBtn && stopBtn) {
            playBtn.addEventListener('click', () => {
                if (window.textToSpeech) {
                    window.textToSpeech.playLastMessage();
                }
            });
            
            stopBtn.addEventListener('click', () => {
                if (window.textToSpeech) {
                    window.textToSpeech.stop();
                }
            });
        }
    }

    // Replace placeholder functions with actual implementations
    window.toggleVoiceRecording = toggleVoiceRecording;
    window.closeSidebar = closeSidebar;
    window.closeMobileSidebar = closeMobileSidebar;
    window.showSection = showSection;
    
    console.log('✅ All global functions assigned successfully');
    window.openMobileSidebar = function() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('mobileSidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            
            // Prevent body scroll on mobile
            if (window.isMobile) {
                document.body.style.overflow = 'hidden';
            }
        }
    };
    
    window.playTTS = function() {
        if (window.textToSpeech) {
            window.textToSpeech.playLastMessage();
        }
    };
    
    window.stopTTS = function() {
        if (window.textToSpeech) {
            window.textToSpeech.stop();
        }
    };
    
    window.handleAvatarSelection = function(language) {
        const englishCard = document.querySelector('[onclick="handleAvatarSelection(\'english\')"]');
        const hindiCard = document.querySelector('[onclick="handleAvatarSelection(\'hindi\')"]');
        
        // Remove selected class from both
        englishCard?.classList.remove('selected');
        hindiCard?.classList.remove('selected');
        
        // Add selected class to chosen language
        if (language === 'english') {
            englishCard?.classList.add('selected');
            selectedAvatar = 'roy-sir';
        } else if (language === 'hindi') {
            hindiCard?.classList.add('selected');
            selectedAvatar = 'ms-sapana';
        }
        
        // Update avatar display
        updateAvatarDisplay();
        
        // Save preference
        saveAvatarPreference();
    };
    
    window.downloadApp = function() {
        // For now, just show a message
        showSuccess('APK download will be available soon!');
    };
    
    window.scrollToTop = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.forceShowTrialOverlay = function() {
        const overlay = document.getElementById('trialExpiredOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    };
    
    window.upgradeToPremium = function() {
        window.location.href = 'payment.html';
    };
    
    window.closeTrialOverlay = function() {
        const overlay = document.getElementById('trialExpiredOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    };
    
    // Subject manager functions
    window.showSubjectManager = function() {
        if (window.subjectManager && window.subjectManager.showSubjectManager) {
            return window.subjectManager.showSubjectManager();
        }
    };
    
    window.addNewSubject = function() {
        if (window.subjectManager && window.subjectManager.addNewSubject) {
            return window.subjectManager.addNewSubject();
        }
    };
    
    window.saveChatMessage = function(message, response) {
        if (window.subjectManager && window.subjectManager.saveChatMessage) {
            return window.subjectManager.saveChatMessage(message, response);
        }
    };
// Functions are already made globally accessible at the top of the file