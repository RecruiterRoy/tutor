// Dashboard.js - Main dashboard functionality
// Note: Supabase client is initialized via config.js and supabaseClient.js

// Use the global supabaseClient that's initialized in config.js
// No need to declare supabase here as it's already available via window.supabaseClient

// Make functions globally accessible IMMEDIATELY for HTML onclick handlers
// These will be replaced with actual implementations later
// Note: toggleVoiceRecording is defined later in the file

window.closeSidebar = function() {
    console.log('closeSidebar called - waiting for implementation');
};

window.showSection = function(sectionName) {
    console.log('🔧 Showing section:', sectionName);
    
    // Hide all sections
    const sections = document.querySelectorAll('[id$="Section"]');
    console.log(`🔧 Found ${sections.length} sections to hide`);
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`🔧 Found ${navItems.length} nav items to update`);
    navItems.forEach(item => {
        item.classList.remove('active', 'bg-white/10', 'text-white');
        item.classList.add('text-gray-300');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName + 'Section');
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
        console.log('✅ Section shown:', sectionName + 'Section');
        
        // Update subject progress when progress section is shown
        if (sectionName === 'progress') {
            updateSubjectProgress();
        }
    } else {
        console.log('❌ Section not found:', sectionName + 'Section');
    }
    
    // Add active class to nav item based on text content
    navItems.forEach(item => {
        const text = item.textContent.trim();
        if ((sectionName === 'chat' && (text.includes('Classroom') || text.includes('🏫'))) ||
            (sectionName === 'materials' && (text.includes('Study Materials') || text.includes('📚'))) ||
            (sectionName === 'progress' && (text.includes('Progress') || text.includes('📊'))) ||
            (sectionName === 'settings' && (text.includes('Settings') || text.includes('⚙️')))) {
            item.classList.add('active', 'bg-white/10', 'text-white');
            item.classList.remove('text-gray-300');
            console.log('✅ Active class added to nav item:', text);
        }
    });
    
    console.log('✅ Section navigation completed for:', sectionName);
}

window.saveChatMessage = function(message, response) {
    console.log('saveChatMessage called - waiting for implementation');
};

window.closeMobileSidebar = function() {
    console.log('🔧 Closing mobile sidebar...');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        
        // Restore body scroll
        if (window.isMobile) {
            document.body.style.overflow = '';
        }
        console.log('✅ Mobile sidebar closed');
    } else {
        console.log('❌ Mobile sidebar elements not found');
    }
};

window.showSubjectManager = function() {
    console.log('🔧 showSubjectManager called');
    if (window.subjectManager && window.subjectManager.showSubjectManager) {
        console.log('✅ Calling subjectManager.showSubjectManager()');
        return window.subjectManager.showSubjectManager();
    } else {
        console.error('❌ subjectManager not available');
        showError('Subject manager not loaded. Please refresh the page.');
    }
};

window.openMobileSidebar = function() {
    console.log('🔧 Opening mobile sidebar...');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        
        // Prevent body scroll on mobile
        if (window.isMobile) {
            document.body.style.overflow = 'hidden';
        }
        console.log('✅ Mobile sidebar opened');
    } else {
        console.log('❌ Mobile sidebar elements not found');
    }
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
window.selectedAvatar = null; // Will be set from user profile
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
window.userDataLoaded = false; // Flag to track if user data is loaded

// Function to get current avatar name dynamically
function getCurrentAvatarName() {
    console.log('🔧 getCurrentAvatarName called');
    console.log('🔧 window.userData:', window.userData);
    console.log('🔧 window.userData?.ai_avatar:', window.userData?.ai_avatar);
    
    if (window.userData && window.userData.ai_avatar) {
        let avatarName;
        if (window.userData.ai_avatar === 'miss-sapna') {
            avatarName = 'Miss Sapna';
        } else {
            avatarName = 'Roy Sir';
        }
        console.log('✅ Returning avatar name:', avatarName);
        return avatarName;
    }
    console.log('⚠️ Using default avatar name: Roy Sir');
    return 'Roy Sir'; // Default fallback
}

// Function to get current avatar ID dynamically
function getCurrentAvatarId() {
    console.log('🔧 getCurrentAvatarId called');
    console.log('🔧 window.userData:', window.userData);
    console.log('🔧 window.userData?.ai_avatar:', window.userData?.ai_avatar);
    
    if (window.userData && window.userData.ai_avatar) {
        console.log('✅ Returning avatar ID:', window.userData.ai_avatar);
        return window.userData.ai_avatar;
    }
    console.log('⚠️ Using default avatar ID: roy-sir');
    return 'roy-sir'; // Default fallback
}

// Function to get avatar gender
function getCurrentAvatarGender() {
    console.log('🔧 getCurrentAvatarGender called');
    console.log('🔧 window.userData:', window.userData);
    console.log('🔧 window.userData?.ai_avatar:', window.userData?.ai_avatar);
    
    if (window.userData && window.userData.ai_avatar) {
        let gender;
        if (window.userData.ai_avatar === 'miss-sapna') {
            gender = 'female';
        } else {
            gender = 'male';
        }
        console.log('✅ Returning avatar gender:', gender);
        return gender;
    }
    console.log('⚠️ Using default avatar gender: male');
    return 'male'; // Default fallback
}

// Function to get avatar-specific welcome message
function getAvatarWelcomeMessage() {
    const avatarId = getCurrentAvatarId();
    
    if (avatarId === 'miss-sapna') {
        return "Hi, main aapki Miss Sapna hu. Main aapko Hindi bhasha mai padhaungi. Aap kya padhna chahti hain?";
    } else {
        return "Hi, I am Roy Sir. I will teach you all subjects in English. Please tell me what you want to study today?";
    }
}

// Function to get short welcome message for first interaction
function getShortWelcomeMessage() {
    const avatarId = getCurrentAvatarId();
    const userName = window.userData?.full_name || 'Student';
    
    if (avatarId === 'miss-sapna') {
        return `Hi ${userName}! Main Miss Sapna hu aur main aapko Hindi mai padhaungi. Aap kya padhna chahte hain?`;
    } else {
        return `Hi ${userName}! I am Roy Sir and I will help you with your studies. Please tell me what would you like to learn today?`;
    }
}

// Initialize Supabase when page loads
async function initializeSupabase() {
    try {
        console.log('🔧 Initializing Supabase...');
        
        // Check if Supabase client already exists
        if (window.supabaseClient) {
            console.log('✅ Supabase client already available');
            return window.supabaseClient;
        }
        
        // Try to initialize Supabase client
        console.log('🔄 Attempting to initialize Supabase client...');
        
        // Check if Supabase library is loaded
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase library not loaded');
            throw new Error('Supabase library not available. Please check your internet connection.');
        }
        
        // Check if config is available
        if (!window.TUTOR_CONFIG) {
            console.error('❌ TUTOR_CONFIG not available');
            throw new Error('Application configuration not loaded.');
        }
        
        // Create Supabase client
        const supabaseUrl = window.TUTOR_CONFIG.SUPABASE_URL;
        const supabaseKey = window.TUTOR_CONFIG.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Supabase credentials not found in config');
            throw new Error('Database configuration incomplete.');
        }
        
        console.log('🔧 Creating Supabase client with URL:', supabaseUrl);
        window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        // Test the connection with timeout
        const connectionPromise = window.supabaseClient.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );
        
        try {
            const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
            if (error) {
                console.warn('⚠️ Auth check failed, but client created:', error);
                // Don't throw error here, client might still work for other operations
        } else {
                console.log('✅ Supabase client initialized and tested successfully');
            }
        } catch (timeoutError) {
            console.warn('⚠️ Connection test timed out, but client created:', timeoutError);
            // Continue anyway, client might work for other operations
        }
        
        return window.supabaseClient;
        
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        
        // Show user-friendly error message
        const errorMessage = error.message || 'Failed to initialize database connection.';
        showError(errorMessage + ' Please check your internet connection and try again.');
        
        // Don't redirect immediately, let the user see the error
        // Only redirect if it's a critical auth error
        if (error.message && error.message.includes('auth')) {
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        }
        
        throw error;
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

// Performance optimization: Add caching
let userDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30000; // 30 seconds cache

// Make variables globally accessible immediately
window.currentUser = currentUser;
window.isRecording = isRecording;
window.selectedAvatar = selectedAvatar;

// Functions are already defined above

// Indian Regional Avatars
const regionalAvatars = [
    { id: 'roy-sir', name: 'Roy Sir', region: 'English', gender: 'male', image: '👨‍🏫', language: 'english' },
    { id: 'miss-sapna', name: 'Miss Sapna', region: 'Hindi/Hinglish', gender: 'female', image: '👩‍🏫', language: 'hindi' },
    { id: 'baruah-sir', name: 'Baruah Sir', region: 'Assamese', gender: 'male', image: '👨‍🏫', language: 'assamese' }
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
        
        // Initialize avatar selection system
        initializeAvatarSelection();
        
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
        
        // Initialize subject manager if available
        if (window.subjectManager) {
            console.log('🔧 Initializing subject manager...');
            try {
                await window.subjectManager.initialize(window.userData, window.userData?.class, window.userData?.board);
                console.log('✅ Subject manager initialized');
            } catch (error) {
                console.error('❌ Subject manager initialization error:', error);
            }
        } else {
            console.warn('⚠️ Subject manager not available');
        }
        
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
                speakText("Welcome to Tution App. Voice services are ready.");
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

// Dashboard initialization state management
let isInitializing = false;
let isInitialized = false;

// Helper function to wait for Supabase
function ensureSupabaseReady() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.supabase?.auth) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

// Helper function to wait for TTS
function ensureTTSReady() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.speechSynthesis) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

async function initializeDashboard() {
  console.log('🔧 Initializing dashboard...');
  
  try {
    // Initialize mobile sidebar first
    initializeMobileSidebar();
    
    // Initialize Supabase
    await initializeSupabase();
    
    // Initialize avatar selection system
    initializeAvatarSelection();
    
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
    
    // Initialize subject manager if available
    if (window.subjectManager) {
        console.log('🔧 Initializing subject manager...');
        try {
            await window.subjectManager.initialize(window.userData, window.userData?.class, window.userData?.board);
            console.log('✅ Subject manager initialized');
        } catch (error) {
            console.error('❌ Subject manager initialization error:', error);
        }
    } else {
        console.warn('⚠️ Subject manager not available');
    }
        
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
            speakText("Welcome to Tution App. Voice services are ready.");
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
        console.error('❌ Dashboard initialization failed:', error);
    showError('Initialization failed. Please refresh the page.');
  } finally {
    isInitializing = false;
  }
}

// Debugging helpers
function logSupabaseState() {
    console.log("🔍 Supabase client state:", {
        initialized: !!window.supabase,
        auth: !!window.supabase?.auth,
        getUser: !!window.supabase?.auth?.getUser,
        supabaseClient: !!window.supabaseClient,
        userDataLoaded: window.userDataLoaded,
        userData: !!window.userData
    });
}

// Proper request queue implementation
const requestQueue = [];
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 3;

function processRequestQueue() {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
            return;
        }
        
  const nextRequest = requestQueue.shift();
  if (!nextRequest || typeof nextRequest.requestFn !== 'function') {
    console.error('Invalid request in queue:', nextRequest);
    processRequestQueue(); // Skip invalid requests
            return;
        }
        
  activeRequests++;
  
  nextRequest.requestFn()
    .then(result => {
      nextRequest.resolve(result);
    })
    .catch(error => {
      nextRequest.reject(error);
    })
    .finally(() => {
      activeRequests--;
      processRequestQueue();
    });
}

function addToRequestQueue(requestFn) {
  return new Promise((resolve, reject) => {
    if (typeof requestFn !== 'function') {
      reject(new Error('requestFn must be a function'));
            return;
        }
        
    requestQueue.push({ requestFn, resolve, reject });
    processRequestQueue();
  });
}

// Simplified user data loading - no request queue wrapper
async function loadUserData() {
  console.log('🔧 CORRECT loadUserData function called');
  
  try {
    // Verify Supabase is ready - use the correct client
    const supabaseClient = window.supabaseClient || window.supabase;
    if (!supabaseClient?.auth?.getUser) {
      console.error('❌ Supabase auth not initialized');
      throw new Error('Supabase auth not initialized');
    }

    console.log('✅ Supabase auth is ready, proceeding with user data fetch');

    // Direct call to getUser - no request queue wrapper
    console.log('🔧 Fetching user data from Supabase auth...');
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
      console.error('❌ Error getting user:', error);
      throw error;
    }
    console.log('✅ User data fetched:', user);

    if (!user) {
      console.error('❌ No user data returned');
      throw new Error('No user data returned');
    }
    
    console.log('✅ User authenticated, fetching profile...');
    
    // Direct call to profile fetch - no request queue wrapper
    console.log('🔧 Fetching profile from user_profiles table...');
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Handle database errors gracefully
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      
      // If no profile exists, create a real profile in the database
      if (profileError.code === 'PGRST116') { // No rows found
        console.log('📝 No profile found, creating new profile...');
        
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'User',
          verification_status: 'approved',
          ai_avatar: 'roy-sir',
          class: '10',
          board: 'CBSE',
          gender: 'male',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: createdProfile, error: createError } = await supabaseClient
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();
          
        if (createError) {
          console.error('❌ Failed to create profile:', createError);
          throw createError;
        }
        
        console.log('✅ New profile created:', createdProfile);
        return createdProfile;
      } else {
        // Other database error
        throw profileError;
      }
    }
    
    console.log('✅ Profile fetched:', profile);

    // Update UI with loaded data
    window.userData = profile;
    window.userDataCache = profile;
    window.cacheTimestamp = Date.now();
    window.userDataLoaded = true;
    window.selectedAvatar = profile.ai_avatar || 'roy-sir';
    
    // Ensure userData is set for other functions
    if (!window.userData) {
        window.userData = profile;
    }
    
    // Update avatar display
            updateAvatarDisplay();
            
    // Update TTS voice to match current avatar
    if (window.textToSpeech) {
        window.textToSpeech.forceVoiceUpdate();
    }
    
    // Update user display in sidebar
    updateUserDisplay(profile);
    
    console.log('✅ User data loaded successfully:', profile);
    
    // Update UI with user data
    updateUserDisplay(profile);
    
    // Read welcome message at login
    setTimeout(() => {
        readWelcomeMessageAtLogin();
    }, 1000);
    
    // Set user data as loaded
    window.userDataLoaded = true;
    
    return profile;

    } catch (error) {
    console.error('❌ User data loading failed:', error);
    showError('Failed to load user data. Please refresh the page.');
    return null;
    }
}

function showWelcomeMessage() {
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
        const avatarName = getCurrentAvatarName();
        const avatarIcon = getCurrentAvatarId() === 'miss-sapna' ? '👩‍🏫' : '👨‍🏫';
        const welcomeMessage = getAvatarWelcomeMessage();
        
        const welcomeMessageHTML = `
            <div class="ai-message message">
                <div class="flex items-center space-x-3 mb-3">
                    <div class="text-2xl">${avatarIcon}</div>
                    <div>
                        <p class="text-white font-semibold">${avatarName}</p>
                        <p class="text-gray-300 text-sm">Your AI Teacher</p>
                    </div>
                </div>
                <p class="text-white">${welcomeMessage}</p>
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
        chatBox.innerHTML = welcomeMessageHTML;
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
    console.log('🔧 Setting up event listeners...');
    
    // Debug: Check if functions are available
    console.log('🔧 Function availability check:');
    console.log('- toggleVoiceRecording:', typeof window.toggleVoiceRecording);
    console.log('- sendMessage:', typeof window.sendMessage);
    console.log('- openMobileSidebar:', typeof window.openMobileSidebar);
    console.log('- closeMobileSidebar:', typeof window.closeMobileSidebar);
    console.log('- showSection:', typeof window.showSection);
    console.log('- playTTS:', typeof window.playTTS);
    console.log('- stopTTS:', typeof window.stopTTS);
    
    // Grade and subject selectors
    const gradeSelect = document.getElementById('gradeSelect');
    if (gradeSelect) {
        gradeSelect.addEventListener('change', updateContext);
        console.log('✅ Grade select listener added');
    } else {
        console.log('❌ Grade select not found');
    }
    
    const subjectSelect = document.getElementById('subjectSelect');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', updateContext);
        console.log('✅ Subject select listener added');
    } else {
        console.log('❌ Subject select not found');
    }
    
    // Chat input - use the correct ID
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('🔧 Enter pressed, calling sendMessage');
                sendMessage();
            }
        });
        
        // Also add input event for real-time updates
        chatInput.addEventListener('input', (e) => {
            // Enable/disable send button based on input
            const sendButton = document.getElementById('sendButton');
            if (sendButton) {
                sendButton.disabled = !e.target.value.trim();
            }
        });
        console.log('✅ Chat input listeners added');
    } else {
        console.log('❌ Chat input not found');
    }
    
    // Voice button - remove onclick handler to avoid conflicts
    const voiceButton = document.getElementById('voiceButton');
    if (voiceButton) {
        // Remove any existing onclick to avoid conflicts
        voiceButton.removeAttribute('onclick');
        voiceButton.addEventListener('click', () => {
            console.log('🔧 Voice button clicked, calling toggleVoiceRecording');
            toggleVoiceRecording();
        });
        // Add onclick as fallback
        voiceButton.onclick = () => {
            console.log('🔧 Voice button onclick fallback');
            toggleVoiceRecording();
        };
        console.log('✅ Voice button listener added');
    } else {
        console.log('❌ Voice button not found');
    }
    
    // Send button - remove onclick handler to avoid conflicts
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        // Remove any existing onclick to avoid conflicts
        sendButton.removeAttribute('onclick');
        sendButton.addEventListener('click', () => {
            console.log('🔧 Send button clicked, calling sendMessage');
            sendMessage();
        });
        // Add onclick as fallback
        sendButton.onclick = () => {
            console.log('🔧 Send button onclick fallback');
            sendMessage();
        };
        console.log('✅ Send button listener added');
    } else {
        console.log('❌ Send button not found');
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
    
    // Mobile sidebar overlay click handler
    const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
    if (mobileSidebarOverlay) {
        mobileSidebarOverlay.addEventListener('click', closeMobileSidebar);
    }
    
    // Mobile sidebar button - look for the hamburger menu button
    const mobileSidebarButton = document.querySelector('button.lg\\:hidden.text-white.text-2xl');
    if (mobileSidebarButton) {
        mobileSidebarButton.addEventListener('click', () => {
            console.log('🔧 Mobile sidebar button clicked, calling openMobileSidebar');
            openMobileSidebar();
        });
        // Add onclick as fallback
        mobileSidebarButton.onclick = () => {
            console.log('🔧 Mobile sidebar button onclick fallback');
            openMobileSidebar();
        };
        console.log('✅ Mobile sidebar button listener added');
    } else {
        console.log('❌ Mobile sidebar button not found');
    }
    
    // Close mobile sidebar button - look for the X button
    const closeMobileSidebarButton = document.querySelector('button.text-purple-800.text-2xl');
    if (closeMobileSidebarButton) {
        closeMobileSidebarButton.addEventListener('click', () => {
            console.log('🔧 Close mobile sidebar button clicked, calling closeMobileSidebar');
            closeMobileSidebar();
        });
        // Add onclick as fallback
        closeMobileSidebarButton.onclick = () => {
            console.log('🔧 Close mobile sidebar button onclick fallback');
            closeMobileSidebar();
        };
        console.log('✅ Close mobile sidebar button listener added');
    } else {
        console.log('❌ Close mobile sidebar button not found');
    }
    
    // TTS buttons
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.removeAttribute('onclick');
        playButton.addEventListener('click', () => {
            console.log('🔧 Play button clicked, calling playTTS');
            playTTS();
        });
        console.log('✅ Play button listener added');
    } else {
        console.log('❌ Play button not found');
    }
    
    const stopButton = document.getElementById('stopButton');
    if (stopButton) {
        stopButton.removeAttribute('onclick');
        stopButton.addEventListener('click', () => {
            console.log('🔧 Stop button clicked, calling stopTTS');
            stopTTS();
        });
        console.log('✅ Stop button listener added');
    } else {
        console.log('❌ Stop button not found');
    }
    
    // Sidebar navigation items
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`🔧 Found ${navItems.length} nav items`);
    navItems.forEach((item, index) => {
        const text = item.textContent.trim();
        console.log(`🔧 Nav item ${index}:`, text);
        
        // Determine action based on text content
        if (text.includes('Classroom') || text.includes('🏫')) {
            item.addEventListener('click', () => {
                console.log(`🔧 Nav item clicked, showing chat section`);
                showSection('chat');
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} listener added for chat section`);
        } else if (text.includes('Study Materials') || text.includes('📚')) {
            item.addEventListener('click', () => {
                console.log(`🔧 Nav item clicked, showing materials section`);
                showSection('materials');
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} listener added for materials section`);
        } else if (text.includes('Progress') || text.includes('📊')) {
            item.addEventListener('click', () => {
                console.log(`🔧 Nav item clicked, showing progress section`);
                showSection('progress');
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} listener added for progress section`);
        } else if (text.includes('Settings') || text.includes('⚙️')) {
            item.addEventListener('click', () => {
                console.log(`🔧 Nav item clicked, showing settings section`);
                showSection('settings');
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} listener added for settings section`);
        } else if (text.includes('Logout') || text.includes('🚪')) {
            item.addEventListener('click', () => {
                console.log('🔧 Logout nav item clicked');
                logout();
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} logout listener added`);
        } else if (text.includes('Test Trial') || text.includes('⏰')) {
            item.addEventListener('click', () => {
                console.log('🔧 Trial overlay nav item clicked');
                forceShowTrialOverlay();
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} trial overlay listener added`);
        } else {
            console.log(`⚠️ Nav item ${index} has unknown text: ${text}`);
        }
    });
    
    console.log('✅ Event listeners setup complete');
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
    console.log('🔧 sendMessage function called');
    
    const input = document.getElementById('chatInput');
    if (!input) {
        console.error('❌ Chat input not found');
        return;
    }
    
    const text = input.value.trim();
    console.log('🔧 Input text:', text);
    
    if (!text) {
        console.log('⚠️ Empty text, not sending');
        return;
    }
    
    // Check if user data is loaded
    if (!window.userDataLoaded || !window.userData) {
        console.error('❌ User data not loaded yet');
        await addMessage('ai', 'Please wait, loading your profile...');
        
        // Try to load user data
        try {
            console.log('🔄 Attempting to load user data...');
            await loadUserData();
            console.log('✅ User data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load user data:', error);
            await addMessage('ai', 'Sorry, I cannot process your message right now. Please refresh the page and try again.');
        return;
        }
    }
    
    console.log('🔧 Adding user message to chat...');
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
        const userGender = userProfile.gender || 'male'; // Default to male if not set
        const avatarGender = getCurrentAvatarGender(); // Get avatar gender
        
        // Check if this is the first response of the day
        const today = new Date().toDateString();
        const isFirstResponseOfDay = lastResponseDate !== today;
        
        console.log('📤 Sending message with user data:', {
            name: userProfile.full_name,
            class: userClass,
            board: userBoard,
            subject: userSubject,
            userGender: userGender,
            avatarGender: avatarGender,
            isFirstResponseOfDay: isFirstResponseOfDay,
            userProfile: userProfile
        });
        
        // Get the current avatar from user profile or global variable
        const currentAvatar = userProfile?.ai_avatar || getCurrentAvatarId();
        
        console.log('🔧 Avatar debugging in sendMessage:');
        console.log('🔧 userProfile?.ai_avatar:', userProfile?.ai_avatar);
        console.log('🔧 getCurrentAvatarId():', getCurrentAvatarId());
        console.log('🔧 getCurrentAvatarName():', getCurrentAvatarName());
        console.log('🔧 getCurrentAvatarGender():', getCurrentAvatarGender());
        console.log('🔧 currentAvatar:', currentAvatar);
        
        // Get recent chat history for context
        let chatHistory = [];
        if (window.subjectManager && window.subjectManager.getCurrentSubject()) {
            const subjectHistory = window.subjectManager.subjectChatHistory[window.subjectManager.getCurrentSubject()] || [];
            chatHistory = subjectHistory.slice(-10); // Last 10 messages for context
        }

        // Send to AI backend with complete user profile and chat history
        const requestBody = {
                message: text,
                grade: userClass.replace(/[^0-9]/g, ''), // Extract number from class
                subject: userSubject,
                userProfile: userProfile,
            avatar: getCurrentAvatarId(), // Send avatar ID instead of teacher name
            teacher: getCurrentAvatarName(), // Keep teacher name for compatibility
            userGender: userGender,
            avatarGender: avatarGender,
                isFirstResponseOfDay: isFirstResponseOfDay,
            chatHistory: chatHistory,
            teacherPersonality: getTeacherPersonality(),
            shortWelcomeMessage: getShortWelcomeMessage()
        };
        
        console.log('�� Sending to AI with avatar ID:', requestBody.avatar);
        console.log('🔧 Sending to AI with teacher name:', requestBody.teacher);
        console.log('🔧 Sending to AI with avatar gender:', requestBody.avatarGender);
        console.log('🔧 Full request body:', requestBody);
        
        const response = await fetch('/api/enhanced-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        console.log('🔧 Response received:', response.status);
        const data = await response.json();
        removeTypingIndicator();
        
        if (data.success && data.response) {
            console.log('✅ AI response received');
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
            console.error('❌ AI response error:', data);
            await addMessage('ai', 'Sorry, I could not get a response from the AI.');
        }
        
    } catch (err) {
        console.error('❌ Send message error:', err);
        removeTypingIndicator();
        await addMessage('ai', 'Error connecting to AI server.');
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
    console.log('🔧 Initializing voice features...');
    
    // Initialize speech synthesis
    if (window.speechSynthesis) {
        // Some browsers need this event to populate voices
        speechSynthesis.onvoiceschanged = function() {
            console.log('Voices changed, refreshing voice list');
            populateVoices();
        };
        
        // First try to populate voices immediately
        populateVoices();
        
        // Faster fallback in case voices aren't loaded yet
        setTimeout(populateVoices, 500);
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
    
    console.log('✅ Voice features initialized');
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
            // Faster timeout - only 500ms instead of 2000ms
            setTimeout(() => {
                if (!voicesLoaded) {
                    console.log('Voice loading timeout - using available voices');
                    resolve(speechSynthesis.getVoices());
                }
            }, 500);
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
        console.log('🔧 Initializing speech recognition...');
        const voiceButton = document.getElementById('voiceButton');
        
        if (!voiceButton) {
            console.log('❌ Voice button not found');
            return;
        }
        
        // Check for speech recognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('❌ Speech recognition not supported');
            voiceButton.style.display = 'none';
            showError('Voice recognition not supported in this browser');
            return;
        }

        // Check if voice features are enabled in config
        if (!window.TUTOR_CONFIG?.features?.voiceInput) {
            console.log('❌ Voice input disabled in config');
            voiceButton.style.display = 'none';
            return;
        }

        console.log('🔧 Creating speech recognition instance...');
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Set language based on current avatar
        const currentAvatar = window.selectedAvatar || 'roy-sir';
        if (currentAvatar === 'miss-sapna') {
            recognition.lang = 'hi-IN'; // Hindi for Ms. Sapna
        } else {
            recognition.lang = 'en-IN'; // English for Roy Sir
        }

        recognition.onstart = () => {
            console.log('✅ Speech recognition started');
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
            console.log('✅ Speech recognized:', transcript);
            document.getElementById('chatInput').value = transcript;
            showSuccess("Voice input received: " + transcript);
            stopRecording();
        };

        recognition.onerror = (event) => {
            clearTimeout(recognitionTimeout);
            console.error('❌ Speech recognition error:', event.error);
            
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

        console.log('✅ Speech recognition initialized successfully');

    } catch (error) {
        console.error('❌ Failed to initialize speech recognition:', error);
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
    if (!window.voiceRecognition) {
        console.log('Voice recognition not initialized');
            return;
        }

    if (window.voiceRecognition.isListening) {
        // Stop recording
        window.voiceRecognition.stop();
        updateVoiceButton();
        } else {
        // Start recording
        try {
            await window.voiceRecognition.startListening();
            updateVoiceButton();
            
            // Auto-send after voice recognition completes
            window.voiceRecognition.onResult = async (transcript) => {
                if (transcript && transcript.trim()) {
                    // Set the transcript in the input field
                    const chatInput = document.getElementById('chatInput');
                    if (chatInput) {
                        chatInput.value = transcript;
                    }
                    
                    // Auto-send the message
                    await sendMessage();
                    
                    // Update voice button
                    updateVoiceButton();
                }
            };
        
    } catch (error) {
        console.error('Voice recording error:', error);
            showError('Voice recording failed. Please try again.');
        }
    }
}

// Assign to global immediately
window.toggleVoiceRecording = toggleVoiceRecording;

async function speakText(text) {
    if (!window.textToSpeech) {
        console.log('[TTS] Text-to-Speech not initialized');
        return;
    }

    // Check if user has interacted with the page
    if (!window.userHasInteracted) {
        console.log('[TTS] User has not interacted yet, skipping autoplay speech');
        return;
    }

    try {
        console.log('[TTS] Attempting to speak:', text);
        window.textToSpeech.speak(text, { role: 'ai' });
    } catch (error) {
        console.error('[TTS] Error speaking text:', error);
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
    console.log('🔧 Showing section:', sectionName);
    
    // Hide all sections
    const sections = document.querySelectorAll('[id$="Section"]');
    console.log(`🔧 Found ${sections.length} sections to hide`);
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`🔧 Found ${navItems.length} nav items to update`);
    navItems.forEach(item => {
        item.classList.remove('active', 'bg-white/10', 'text-white');
        item.classList.add('text-gray-300');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName + 'Section');
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
        console.log('✅ Section shown:', sectionName + 'Section');
        
        // Update subject progress when progress section is shown
        if (sectionName === 'progress') {
            updateSubjectProgress();
        }
    } else {
        console.log('❌ Section not found:', sectionName + 'Section');
    }
    
    // Add active class to nav item based on text content
    navItems.forEach(item => {
        const text = item.textContent.trim();
        if ((sectionName === 'chat' && (text.includes('Classroom') || text.includes('🏫'))) ||
            (sectionName === 'materials' && (text.includes('Study Materials') || text.includes('📚'))) ||
            (sectionName === 'progress' && (text.includes('Progress') || text.includes('📊'))) ||
            (sectionName === 'settings' && (text.includes('Settings') || text.includes('⚙️')))) {
            item.classList.add('active', 'bg-white/10', 'text-white');
            item.classList.remove('text-gray-300');
            console.log('✅ Active class added to nav item:', text);
        }
    });
    
    console.log('✅ Section navigation completed for:', sectionName);
}

// Assign to global immediately
window.showSection = showSection;

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
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0', 'pointer-events-none');
    }
}

// Assign to global immediately
window.closeSidebar = closeSidebar;

function closeMobileSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
    }
    
    if (overlay) {
        overlay.classList.remove('opacity-100', 'pointer-events-auto');
        overlay.classList.add('opacity-0', 'pointer-events-none');
    }
    
    // Hide elements after animation completes
    setTimeout(() => {
        if (sidebar) {
            sidebar.classList.add('hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
        }
        if (overlay) {
            overlay.classList.add('hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
        }
    }, 300);
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar && overlay) {
        const isOpen = sidebar.classList.contains('translate-x-0');
        
        if (isOpen) {
            closeMobileSidebar();
        } else {
            // Show sidebar elements first
            sidebar.classList.remove('hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
            overlay.classList.remove('hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
            
            // Then animate them
            setTimeout(() => {
                sidebar.classList.remove('-translate-x-full');
                sidebar.classList.add('translate-x-0');
                overlay.classList.remove('opacity-0', 'pointer-events-none');
                overlay.classList.add('opacity-100', 'pointer-events-auto');
            }, 10);
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
    if (language === 'hindi' || language === 'Hindi') {
        return regionalAvatars.find(avatar => avatar.id === 'miss-sapna');
    } else if (language === 'assamese' || language === 'Assamese') {
        return regionalAvatars.find(avatar => avatar.id === 'baruah-sir');
    } else {
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
    console.log('🔧 Updating avatar display...');

    const avatarDisplay = document.getElementById('currentAvatarDisplay');
    if (!avatarDisplay) return;

    const currentAvatarId = getCurrentAvatarId();
    const avatarName = getCurrentAvatarName();
    let avatarIcon;

    if (currentAvatarId === 'miss-sapna') {
        avatarIcon = '👩‍🏫';
    } else {
        avatarIcon = '👨‍🏫';
    }

    avatarDisplay.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="text-2xl">${avatarIcon}</div>
            <div>
                <div class="text-white font-semibold">${avatarName}</div>
                <div class="text-gray-300 text-sm">AI Teacher</div>
            </div>
        </div>
    `;

    // Also update the welcome message avatar
    const welcomeTeacherAvatar = document.getElementById('welcomeTeacherAvatar');
    const welcomeTeacherName = document.getElementById('welcomeTeacherName');

    if (welcomeTeacherAvatar) {
        let avatarSrc;
        if (currentAvatarId === 'miss-sapna') {
            avatarSrc = 'images/miss_sapna.jpg';
        } else {
            avatarSrc = 'images/roy_sir.jpg';
        }
        welcomeTeacherAvatar.src = avatarSrc;
        welcomeTeacherAvatar.alt = avatarName;
    }

    if (welcomeTeacherName) {
        welcomeTeacherName.textContent = avatarName;
    }

    console.log('✅ Avatar display updated:', avatarName);
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
            if (img && img.alt === 'Miss Sapna') {
                selectedAvatar = 'miss-sapna';
                window.selectedAvatar = 'miss-sapna';
            } else if (img && img.alt === 'Baruah Sir') {
                selectedAvatar = 'baruah-sir';
                window.selectedAvatar = 'baruah-sir';
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
        const currentAvatar = userProfile?.ai_avatar || getCurrentAvatarId();
        
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
                avatar: getCurrentAvatarId(), // Send avatar ID instead of teacher name
                teacher: getCurrentAvatarName(), // Keep teacher name for compatibility
                userGender: userGender,
                avatarGender: avatarGender,
                isFirstResponseOfDay: isFirstResponseOfDay,
                chatHistory: chatHistory,
                teacherPersonality: getTeacherPersonality(),
                shortWelcomeMessage: getShortWelcomeMessage()
            })
        });
        
        console.log('🔧 Response received:', response.status);
        const data = await response.json();
        removeTypingIndicator();
        
        if (data.success && data.response) {
            console.log('✅ AI response received');
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
            console.error('❌ AI response error:', data);
            await addMessage('ai', 'Sorry, I could not get a response from the AI.');
        }
    } catch (err) {
        console.error('❌ Send message error:', err);
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
        const genderField = document.getElementById('popupProfileGender');
        const boardField = document.getElementById('popupProfileBoard');
        const emailField = document.getElementById('popupProfileEmail');
        const mobileField = document.getElementById('popupProfileMobile');
        
        if (nameField) nameField.value = window.userData?.full_name || '';
        if (classField) classField.value = window.userData?.class || '';
        if (genderField) genderField.value = window.userData?.gender || 'male';
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
        const gender = document.getElementById('popupProfileGender')?.value || 'male';
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
                gender: gender,
                board: board,
                updated_at: new Date().toISOString()
            });
        
        if (error) {
            console.error('Error updating profile:', error);
            showError('Failed to update profile');
            return;
        }
        
        // Update local userData
        window.userData = { ...window.userData, full_name: name, class: classValue, gender: gender, board: board };
        
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

    // All functions are now assigned immediately after definition
    
    console.log('✅ All global functions assigned successfully');
// Assign to global immediately
window.openMobileSidebar = function() {
    console.log('🔧 Opening mobile sidebar...');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        
        // Prevent body scroll on mobile
        if (window.isMobile) {
            document.body.style.overflow = 'hidden';
        }
        console.log('✅ Mobile sidebar opened');
    } else {
        console.log('❌ Mobile sidebar elements not found');
    }
};
    
// Assign to global immediately
window.playTTS = function() {
    if (window.textToSpeech) {
        window.textToSpeech.playLastMessage();
    }
};

// Assign to global immediately
window.stopTTS = function() {
    if (window.textToSpeech) {
        window.textToSpeech.stop();
    }
};
    
// Assign to global immediately
window.handleAvatarSelection = function(language) {
    const englishCard = document.querySelector('[onclick="handleAvatarSelection(\'english\')"]');
    const hindiCard = document.querySelector('[onclick="handleAvatarSelection(\'hindi\')"]');
    const assameseCard = document.querySelector('[onclick="handleAvatarSelection(\'assamese\')"]');
    
    // Remove selected class from all
    englishCard?.classList.remove('selected');
    hindiCard?.classList.remove('selected');
    assameseCard?.classList.remove('selected');
    
    // Add selected class to chosen language
    if (language === 'english') {
        englishCard?.classList.add('selected');
        selectedAvatar = 'roy-sir';
    } else if (language === 'hindi') {
        hindiCard?.classList.add('selected');
        selectedAvatar = 'miss-sapna';
    } else if (language === 'assamese') {
        assameseCard?.classList.add('selected');
        selectedAvatar = 'baruah-sir';
    }
    
    // Update avatar display
    updateAvatarDisplay();
    
    // Save preference
    saveAvatarPreference();
};
    
// Assign to global immediately
window.downloadApp = function() {
    // For now, just show a message
    showSuccess('APK download will be available soon!');
};

// Assign to global immediately
window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Assign to global immediately
window.forceShowTrialOverlay = function() {
    const overlay = document.getElementById('trialExpiredOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
};

// Assign to global immediately
window.upgradeToPremium = function() {
    window.location.href = 'payment.html';
};

// Assign to global immediately
window.closeTrialOverlay = function() {
    const overlay = document.getElementById('trialExpiredOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
};
    
// Assign to global immediately
window.showSubjectManager = function() {
    if (window.subjectManager && window.subjectManager.showSubjectManager) {
        return window.subjectManager.showSubjectManager();
    }
};

// Assign to global immediately
window.addNewSubject = function() {
    if (window.subjectManager && window.subjectManager.addNewSubject) {
        return window.subjectManager.addNewSubject();
    }
};

// Assign to global immediately
window.saveChatMessage = function(message, response) {
    if (window.subjectManager && window.subjectManager.saveChatMessage) {
        return window.subjectManager.saveChatMessage(message, response);
    }
};
// Functions are already made globally accessible at the top of the file

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM loaded, initializing dashboard...');
    
    // Prevent multiple initializations
    if (window.dashboardInitialized || isInitializing) {
        console.log('⚠️ Dashboard already initialized or initializing, skipping...');
        return;
    }
    
    isInitializing = true;
    
    try {
        // Wait for Supabase to be available
        let attempts = 0;
        const maxAttempts = 10;
        
        while (typeof window.supabase === 'undefined' && attempts < maxAttempts) {
            console.log(`🔄 Waiting for Supabase to load... (attempt ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase library failed to load after multiple attempts');
        }
        
        console.log('✅ Supabase library loaded successfully');
        
        // Test that key functions are available
        console.log('🔧 Testing function availability:');
        console.log('- toggleVoiceRecording:', typeof window.toggleVoiceRecording);
        console.log('- openMobileSidebar:', typeof window.openMobileSidebar);
        console.log('- closeMobileSidebar:', typeof window.closeMobileSidebar);
        console.log('- showSection:', typeof window.showSection);
        console.log('- sendMessage:', typeof window.sendMessage);
        
        // Initialize Supabase first
        await initializeSupabase();
        
        // Initialize the dashboard
        await initializeDashboard();
        
        // Initialize avatar selection system
        initializeAvatarSelection();
        
        // Test voice recognition initialization
        console.log('🔧 Testing voice recognition:');
        const voiceButton = document.getElementById('voiceButton');
        if (voiceButton) {
            console.log('- Voice button found:', voiceButton);
            console.log('- Voice button display:', voiceButton.style.display);
        } else {
            console.log('- Voice button not found');
        }
        
        // Test sidebar buttons
        console.log('🔧 Testing sidebar buttons:');
        const navItems = document.querySelectorAll('.nav-item');
        console.log('- Nav items found:', navItems.length);
        navItems.forEach((item, index) => {
            console.log(`- Nav item ${index}:`, item.textContent.trim());
        });
        
        // Apply mobile optimizations
        if (window.isMobile) {
            applyMobileOptimizations();
            setupMobileEventListeners();
            enableMobileFeatures();
        }
        
        // Mark as initialized
        window.dashboardInitialized = true;
        console.log('✅ Dashboard initialization complete');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showError('Failed to initialize dashboard. Please refresh the page.');
        
        // Fallback: Initialize basic UI functionality even if Supabase fails
        try {
            console.log('🔄 Attempting fallback initialization...');
            
            // Set up basic event listeners
            setupEventListeners();
            
            // Show basic welcome message
            showWelcomeMessage();
            
            // Initialize voice features
            try {
                initializeVoiceFeatures();
                populateVoices();
                initSpeechRecognition();
            } catch (voiceError) {
                console.warn('⚠️ Voice features failed to initialize:', voiceError);
            }
            
            // Apply mobile optimizations
            if (window.isMobile) {
                applyMobileOptimizations();
                setupMobileEventListeners();
                enableMobileFeatures();
            }
            
            // Mark as initialized
            window.dashboardInitialized = true;
            console.log('✅ Fallback initialization completed');
            
        } catch (fallbackError) {
            console.error('❌ Fallback initialization also failed:', fallbackError);
        }
    } finally {
        isInitializing = false;
    }
});

// Also initialize when window loads (fallback)
window.addEventListener('load', function() {
    console.log('🔄 Window loaded, checking dashboard status...');
    
    // Only initialize if not already done
    if (!window.dashboardInitialized) {
        console.log('🔄 Dashboard not initialized, starting initialization...');
        
        // The DOMContentLoaded listener should handle this, but this is a fallback
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async function() {
                if (!window.dashboardInitialized) {
                    await initializeDashboard();
                }
            });
        } else if (!window.dashboardInitialized) {
            initializeDashboard();
        }
    }
});

// Assign key functions to window object for global access
window.sendMessage = sendMessage;
window.toggleVoiceRecording = toggleVoiceRecording;
window.showSection = showSection;
window.closeMobileSidebar = closeMobileSidebar;
window.logout = logout;
window.saveChatMessage = saveChatMessage;

// Add a test function to verify button clicks
window.testButtonClick = function(buttonName) {
    console.log(`🔧 Test button click: ${buttonName}`);
    showSuccess(`Button ${buttonName} is clickable!`);
};

// Add a test function to verify subject manager
window.testSubjectManager = function() {
    console.log('🔧 Testing subject manager...');
    console.log('- Subject manager available:', !!window.subjectManager);
    console.log('- Show subject manager function:', typeof window.showSubjectManager);
    console.log('- Subject manager modal:', document.getElementById('subjectManagerModal'));
    
    if (window.subjectManager) {
        console.log('- Subject manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.subjectManager)));
    }
    
    showSuccess('Subject manager test completed! Check console for details.');
};

console.log('✅ All functions assigned to window object');

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

// Global variables for concurrency control
// REMOVED: Old concurrency control variables that were causing conflicts

// Avatar selection variables
let selectedAvatarOption = null;
let avatarSelectionModal = null;

// Initialize avatar selection system
function initializeAvatarSelection() {
    console.log('🔧 Initializing avatar selection system...');
    
    // Get current avatar from user profile
    if (window.userData && window.userData.ai_avatar) {
        selectedAvatarOption = window.userData.ai_avatar;
        console.log('✅ Current avatar loaded:', selectedAvatarOption);
    } else {
        selectedAvatarOption = getCurrentAvatarId(); // Use dynamic function
        console.log('✅ Default avatar set:', selectedAvatarOption);
    }
    
    // Update avatar display
    updateAvatarDisplay();
}

// Show avatar selection modal
function showAvatarSelectionModal() {
    console.log('🔧 Showing avatar selection modal...');
    const modal = document.getElementById('avatarSelectionModal');
    if (modal) {
        modal.classList.remove('hidden');
        highlightCurrentAvatar();
    } else {
        console.error('❌ Avatar selection modal not found');
    }
}

// Close avatar selection modal
function closeAvatarSelectionModal() {
    console.log('🔧 Closing avatar selection modal...');
    const modal = document.getElementById('avatarSelectionModal');
    if (modal) {
        modal.classList.add('hidden');
        selectedAvatarOption = null; // Reset selection
    }
}

// Select avatar option
function selectAvatarOption(avatarId, avatarName) {
    console.log('🔧 Selecting avatar:', avatarId, avatarName);
    
    // Remove previous selection
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('ring-4', 'ring-yellow-400');
    });
    
    // Highlight selected option
    const selectedOption = event.currentTarget;
    selectedOption.classList.add('ring-4', 'ring-yellow-400');
    
    selectedAvatarOption = avatarId;
    console.log('✅ Avatar selected:', selectedAvatarOption);
}

// Save avatar selection
async function saveAvatarSelection() {
    if (!selectedAvatarOption) {
        showError('Please select an avatar first');
        return;
    }
    
    console.log('🔧 Saving avatar selection:', selectedAvatarOption);
    
    try {
        // Use the correct Supabase client
        const supabaseClient = window.supabaseClient || window.supabase;
        
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .update({ 
                ai_avatar: selectedAvatarOption,
                updated_at: new Date().toISOString()
            })
            .eq('id', window.userData.id)
            .select();
        
        if (error) {
            console.error('❌ Error saving avatar:', error);
            throw new Error('Failed to save avatar selection');
        }
        
        // Update local user data
        if (window.userData) {
            console.log('🔧 Updating local userData.ai_avatar from:', window.userData.ai_avatar, 'to:', selectedAvatarOption);
            window.userData.ai_avatar = selectedAvatarOption;
        }
        
        // Update global selected avatar
        console.log('🔧 Updating window.selectedAvatar from:', window.selectedAvatar, 'to:', selectedAvatarOption);
        window.selectedAvatar = selectedAvatarOption;
        
        console.log('✅ Avatar saved successfully:', selectedAvatarOption);
        console.log('🔧 Current window.userData.ai_avatar:', window.userData?.ai_avatar);
        console.log('🔧 Current window.selectedAvatar:', window.selectedAvatar);
        showSuccess('Avatar updated successfully!');
        
        // Reload user data to ensure AI gets the updated avatar
        console.log('🔧 Reloading user data...');
        await reloadUserData();
        
        // Update TTS voice to match new avatar
        console.log('🔧 Updating TTS voice...');
        if (window.textToSpeech) {
            // Force immediate voice update
            window.textToSpeech.forceVoiceUpdate();
            
            // Force voice change for next speech
            setTimeout(() => {
                window.textToSpeech.forceVoiceUpdate();
                console.log('🔧 Voice updated for new avatar:', selectedAvatarOption);
            }, 100);
            
            // Force voice change again after a longer delay
            setTimeout(() => {
                window.textToSpeech.forceVoiceUpdate();
                console.log('🔧 Final voice update for avatar:', selectedAvatarOption);
            }, 500);
        }
        
        // Show welcome message for new avatar
        showAvatarWelcomeMessage();
        
        // Update display
        updateAvatarDisplay();
        
        // Close modal
        closeAvatarSelectionModal();
        
    } catch (error) {
        console.error('❌ Avatar selection error:', error);
        showError('Failed to save avatar selection. Please try again.');
    }
}

// Highlight current avatar in modal
function highlightCurrentAvatar() {
    console.log('🔧 Highlighting current avatar:', selectedAvatarOption);
    
    // Remove all highlights
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('ring-4', 'ring-yellow-400');
    });
    
    // Highlight current avatar
    if (selectedAvatarOption) {
        const currentOption = document.querySelector(`[onclick*="${selectedAvatarOption}"]`);
        if (currentOption) {
            currentOption.classList.add('ring-4', 'ring-yellow-400');
        }
    }
}

// Update avatar display
function updateAvatarDisplay() {
    console.log('🔧 Updating avatar display...');

    const avatarDisplay = document.getElementById('currentAvatarDisplay');
    if (!avatarDisplay) return;

    const currentAvatarId = getCurrentAvatarId();
    const avatarName = getCurrentAvatarName();
    let avatarIcon;

    if (currentAvatarId === 'miss-sapna') {
        avatarIcon = '👩‍🏫';
    } else {
        avatarIcon = '👨‍🏫';
    }

    avatarDisplay.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="text-2xl">${avatarIcon}</div>
            <div>
                <div class="text-white font-semibold">${avatarName}</div>
                <div class="text-gray-300 text-sm">AI Teacher</div>
            </div>
        </div>
    `;

    // Also update the welcome message avatar
    const welcomeTeacherAvatar = document.getElementById('welcomeTeacherAvatar');
    const welcomeTeacherName = document.getElementById('welcomeTeacherName');

    if (welcomeTeacherAvatar) {
        let avatarSrc;
        if (currentAvatarId === 'miss-sapna') {
            avatarSrc = 'images/miss_sapna.jpg';
        } else {
            avatarSrc = 'images/roy_sir.jpg';
        }
        welcomeTeacherAvatar.src = avatarSrc;
        welcomeTeacherAvatar.alt = avatarName;
    }

    if (welcomeTeacherName) {
        welcomeTeacherName.textContent = avatarName;
    }

    console.log('✅ Avatar display updated:', avatarName);
}

// Concurrency control functions
async function addToRequestQueue(requestFunction) {
    return new Promise((resolve, reject) => {
        requestQueue.push({ requestFunction, resolve, reject });
        processRequestQueue();
    });
}
// Loading state management
// REMOVED: let isInitializing = false; - DUPLICATE
// REMOVED: let isUserDataLoading = false; - DUPLICATE

// Initialize UI components
function initializeUI() {
  console.log('🔧 Initializing UI components...');
  
  // Load books
  loadBooks();
  
  // Populate avatar grid
  populateAvatarGrid();
  
  // Initialize voice features
  initializeVoiceFeatures();
  populateVoices();
  
  // Initialize subject manager if available
  if (window.subjectManager) {
    console.log('🔧 Initializing subject manager...');
    try {
      window.subjectManager.initialize(window.userData, window.userData?.class, window.userData?.board);
      console.log('✅ Subject manager initialized');
    } catch (error) {
      console.error('❌ Subject manager initialization error:', error);
    }
  }
  
  // Load voice settings
  setTimeout(() => {
    loadVoiceSettings();
    setupVoiceSettingsListeners();
  }, 1000);
  
  // Initialize speech recognition
  initSpeechRecognition();
  
  // Show welcome message
  showWelcomeMessage();
  
  // Initialize additional features
  if (window.learningProgress) {
    window.learningProgress.loadProgress();
  }
  
  if (window.groupLearning) {
    window.groupLearning.initializeRealtime();
  }
  
  console.log('✅ UI components initialized');
}

// Initialize event listeners
function initializeEventListeners() {
  console.log('🔧 Initializing event listeners...');
  
  // Remove existing listeners first to prevent duplicates
  const sendButton = document.getElementById('sendButton');
  const voiceButton = document.getElementById('voiceButton');
  
  if (sendButton) {
    sendButton.removeEventListener('click', sendMessage);
    sendButton.addEventListener('click', sendMessage);
  }
  
  if (voiceButton) {
    voiceButton.removeEventListener('click', toggleVoiceRecording);
    voiceButton.addEventListener('click', toggleVoiceRecording);
  }
  
  // Setup other event listeners
  setupEventListeners();
  
  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.textContent.trim().toLowerCase();
      showSection(section);
    });
  });
  
  console.log('✅ Event listeners initialized');
}

// Track user interaction for TTS
function trackUserInteraction() {
    if (!window.userHasInteracted) {
        window.userHasInteracted = true;
        console.log('[TTS] User interaction detected, TTS now enabled');
    }
}

// Close subject manager when clicking outside
function closeSubjectManagerOnOutsideClick(event) {
    if (event.target.id === 'subjectManagerModal') {
        window.subjectManager?.hideSubjectManager();
    }
}

// Add event listeners for user interaction
document.addEventListener('click', trackUserInteraction);
document.addEventListener('keydown', trackUserInteraction);
document.addEventListener('touchstart', trackUserInteraction);

// Initialize user interaction tracking
window.userHasInteracted = false;

// Close avatar selection when clicking outside
function closeAvatarSelectionOnOutsideClick(event) {
    if (event.target.id === 'avatarSelectionModal') {
        closeAvatarSelectionModal();
    }
}

// Update subject progress section with user's subjects
function updateSubjectProgress() {
    console.log('🔧 Updating subject progress...');
    
    const subjectsContainer = document.getElementById('subjectsContainer');
    if (!subjectsContainer) {
        console.error('❌ Subjects container not found');
        return;
    }
    
    // Get user's subjects from subject manager
    let userSubjects = ['English']; // Default subject
    
    if (window.subjectManager && window.subjectManager.userSubjects) {
        userSubjects = window.subjectManager.userSubjects;
    }
    
    console.log('📚 User subjects:', userSubjects);
    
    // Clear existing subjects
    subjectsContainer.innerHTML = '';
    
    // Add each subject with progress bar
    userSubjects.forEach(subject => {
        const subjectItem = document.createElement('div');
        subjectItem.className = 'subject-item';
        subjectItem.innerHTML = `
            <div class="flex justify-between text-white text-sm mb-2">
                <span>${subject}</span>
                <span id="${subject.toLowerCase().replace(/\s+/g, '')}Progress">0%</span>
            </div>
            <div class="progress-modern">
                <div class="progress-fill" id="${subject.toLowerCase().replace(/\s+/g, '')}ProgressBar" style="width: 0%"></div>
            </div>
        `;
        subjectsContainer.appendChild(subjectItem);
    });
    
    console.log('✅ Subject progress updated with', userSubjects.length, 'subjects');
}

// Force reload user data to get latest avatar
async function reloadUserData() {
    console.log('🔄 Reloading user data...');
    try {
        await loadUserData();
        console.log('✅ User data reloaded successfully');
    } catch (error) {
        console.error('❌ Failed to reload user data:', error);
    }
}

// Function to update user gender
async function updateUserGender(newGender) {
    try {
        console.log('🔧 Updating user gender to:', newGender);
        
        if (!window.userData || !window.userData.id) {
            throw new Error('User data not available');
        }
        
        const supabaseClient = window.supabaseClient || window.supabase;
        
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .update({ 
                gender: newGender,
                updated_at: new Date().toISOString()
            })
            .eq('id', window.userData.id)
            .select();
        
        if (error) {
            console.error('❌ Error updating gender:', error);
            throw new Error('Failed to update gender');
        }
        
        // Update local user data
        if (window.userData) {
            window.userData.gender = newGender;
        }
        
        console.log('✅ Gender updated successfully:', newGender);
        showSuccess('Gender updated successfully!');
        
        // Reload user data to ensure AI gets the updated gender
        await reloadUserData();
        
    } catch (error) {
        console.error('❌ Gender update error:', error);
        showError('Failed to update gender. Please try again.');
    }
}

// Function to get current user gender
function getCurrentUserGender() {
    if (window.userData && window.userData.gender) {
        return window.userData.gender;
    }
    return 'male'; // Default fallback
}

// Function to show avatar-specific welcome message
function showAvatarWelcomeMessage() {
    const welcomeMessage = getAvatarWelcomeMessage();
    const avatarName = getCurrentAvatarName();

    console.log('🔧 Showing welcome message for:', avatarName);
    console.log('🔧 Welcome message:', welcomeMessage);

    // Add welcome message to chat only if not already added
    const chatMessages = document.querySelectorAll('.message.ai');
    const lastMessage = chatMessages[chatMessages.length - 1];
    const lastMessageText = lastMessage?.textContent || '';
    
    if (!lastMessageText.includes(welcomeMessage.substring(0, 50))) {
        addMessage('ai', welcomeMessage);
    }

    // Speak the welcome message only if TTS is not already speaking
    if (window.textToSpeech && !window.textToSpeech.isSpeaking) {
        window.textToSpeech.speak(welcomeMessage, { role: 'ai' });
    } else {
        console.log('🔧 Skipping TTS for welcome message - already speaking or TTS not ready');
    }
}

// Function to get teacher personality and teaching style
function getTeacherPersonality() {
    const avatarId = getCurrentAvatarId();

    if (avatarId === 'miss-sapna') {
        return {
            name: 'Miss Sapna',
            language: 'Hindi + English (Hinglish)',
            personality: 'Caring and nurturing teacher who uses Hindi with English words for better understanding',
            teachingStyle: 'Uses Hindi as primary language with English terms for scientific names, technical terms, and better communication',
            gender: 'female',
            tone: 'Warm and motherly'
        };
    } else {
        return {
            name: 'Roy Sir',
            language: 'English',
            personality: 'Professional and knowledgeable teacher',
            teachingStyle: 'Uses English for all subjects and advanced topics',
            gender: 'male',
            tone: 'Professional and friendly'
        };
    }
}

// Function to read welcome message at login
function readWelcomeMessageAtLogin() {
    const welcomeText = "Welcome to Tution App, your study buddy. What would you like to learn today? Roy Sir and Miss Sapna are here to help you. You may change your teachers in the settings.";
    
    console.log('🔧 Reading welcome message at login');
    
    // Add to chat if not already present
    const chatMessages = document.querySelectorAll('.message.ai');
    const lastMessage = chatMessages[chatMessages.length - 1];
    const lastMessageText = lastMessage?.textContent || '';
    
    if (!lastMessageText.includes(welcomeText.substring(0, 50))) {
        addMessage('ai', welcomeText);
    }
    
    // Speak the welcome message
    if (window.textToSpeech && !window.textToSpeech.isSpeaking) {
        window.textToSpeech.speak(welcomeText, { role: 'ai' });
    } else {
        console.log('🔧 Skipping TTS for login welcome - already speaking or TTS not ready');
    }
}

// Initialize mobile sidebar
function initializeMobileSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar && overlay) {
        // Ensure sidebar is hidden by default on all screen sizes
        sidebar.classList.add('hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
        overlay.classList.add('hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
        
        // Ensure sidebar is in closed position
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
        
        // Ensure overlay is hidden
        overlay.classList.remove('opacity-100', 'pointer-events-auto');
        overlay.classList.add('opacity-0', 'pointer-events-none');
    }
}
