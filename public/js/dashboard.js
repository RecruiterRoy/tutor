import { createClient } from '@supabase/supabase-js';
import { PDFProcessor } from '../utils/pdfExtractor.js';
import { getSupabaseClient } from './supabaseClient.js';

// Initialize Supabase - will be set by server
let supabase = null;

// Initialize Supabase when page loads
async function initializeSupabase() {
    try {
        supabase = await getSupabaseClient();
        console.log('Supabase initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        alert('Failed to initialize database connection. Please try again.');
        window.location.href = '/login';
    }
}

// Initialize PDF Processor for local books
const pdfProcessor = new PDFProcessor();

// Global state
let currentUser = null;
let recognition;
let isRecording = false;
let recognitionTimeout;
let isAmbientListening = false;
let currentGrade = null;
let currentSubject = null;
let selectedAvatar = 'professor';
let conversationHistory = [];
let synth = window.speechSynthesis;
let selectedVoice = null;
let voiceRate = 1.0;
let voicePitch = 1.0;
let preWarmedRecognition = null;
let voicesLoaded = false;

// Indian Regional Avatars
const regionalAvatars = [
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeSupabase();
        
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
            console.warn('Text-to-speech not supported');
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            initSpeechRecognition();
        } else {
            const voiceButton = document.getElementById('voiceButton');
            if(voiceButton) voiceButton.style.display = 'none';
            console.warn('Speech recognition not supported');
        }

        // --- Keep existing initialization logic ---
        const { data: { user }, error } = await supabase.auth.getUser();
    
        if (error || !user) {
            console.log('No authenticated user, redirecting to login');
            window.location.href = '/login';
            return;
        }
    
        currentUser = user;
        await loadUserData();
        setupEventListeners();
        populateAvatarGrid();
        loadUserPreferences();
        await loadBooks();
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

    } catch (error) {
        console.error('Initialization error:', error);
        showError("Failed to initialize some features");
    }
});

async function initializeDashboard() {
    if (!supabase) {
        console.error('Supabase not initialized');
        return;
    }
    
    // Check authentication
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        console.log('No authenticated user, redirecting to login');
        window.location.href = '/login';
        return;
    }
    
    currentUser = user;
    await loadUserData();
    setupEventListeners();
    populateAvatarGrid();
    loadUserPreferences();
    await loadBooks();
    
    // Show welcome message
    showWelcomeMessage();
}

async function loadUserData() {
    try {
        clearDashboardError();
        // Get user profile from profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            showDashboardError('Error loading profile: ' + error.message);
            return;
        }
        
        if (profile) {
            // Populate welcome section
            const welcomeMessage = document.getElementById('welcomeMessage');
            const userInfo = document.getElementById('userInfo');
            const userAvatar = document.getElementById('userAvatar');
            const userInitials = document.getElementById('userInitials');
            const userName = document.getElementById('userName');
            const userClass = document.getElementById('userClass');
            
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome back, ${profile.full_name || 'Student'}!`;
            }
            
            if (userInfo) {
                userInfo.textContent = `Class ${profile.class_level || 'N/A'} • ${profile.board || 'N/A'}`;
            }
            
            if (userAvatar) {
                userAvatar.innerHTML = `<i class="fas fa-user"></i>`;
            }
            
            if (userInitials) {
                const initials = (profile.full_name || 'S').split(' ').map(n => n[0]).join('').toUpperCase();
                userInitials.textContent = initials;
            }
            
            if (userName) {
                userName.textContent = profile.full_name || 'Student';
            }
            
            if (userClass) {
                userClass.textContent = `Class ${profile.class_level || 'N/A'}`;
            }
            
            // Populate profile modal fields
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profilePhone = document.getElementById('profilePhone');
            const profileClass = document.getElementById('profileClass');
            const learningStyle = document.getElementById('learningStyle');
            const preferredLanguage = document.getElementById('preferredLanguage');
            
            if (profileName) profileName.value = profile.full_name || '';
            if (profileEmail) profileEmail.value = currentUser.email || '';
            if (profilePhone) profilePhone.value = profile.phone || '';
            if (profileClass) profileClass.value = `Class ${profile.class_level || 'N/A'}`;
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
                updateAvatarDisplay();
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
        const userClass = currentUser?.user_metadata?.class || 
                         document.getElementById('userClass')?.textContent?.replace('Class ', '') || 
                         '10'; // Default fallback
        
        // Extract class number (e.g., "Class 10" -> "10")
        const classNumber = userClass.toString().replace(/[^\d]/g, '');
        
        // Use the filtered endpoint with class parameter
        const response = await fetch(`/api/fs/books?grade=${classNumber}`);
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
    document.getElementById('gradeSelect').addEventListener('change', updateContext);
    document.getElementById('subjectSelect').addEventListener('change', updateContext);
    
    // Message input
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Voice button
    document.getElementById('voiceButton').addEventListener('click', toggleVoiceRecording);
    
    // Accessibility options
    document.getElementById('dyslexicFont').addEventListener('change', updateAccessibility);
    document.getElementById('highContrast').addEventListener('change', updateAccessibility);
    document.getElementById('screenReader').addEventListener('change', updateAccessibility);

    // Profile modal
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfile = document.getElementById('closeProfile');
    const saveProfile = document.getElementById('saveProfile');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            profileModal.classList.remove('hidden');
        });
    }
    
    if (closeProfile) {
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
    avatarGrid.innerHTML = '';
    
    regionalAvatars.forEach(avatar => {
        const avatarElement = document.createElement('div');
        avatarElement.className = 'avatar-option p-2 text-center';
        avatarElement.innerHTML = `
            <div class="text-3xl mb-2">${avatar.image}</div>
            <div class="text-xs text-white">${avatar.name}</div>
        `;
        avatarElement.onclick = () => selectAvatar(avatar.id);
        avatarGrid.appendChild(avatarElement);
    });
}

function selectAvatar(avatarId) {
    selectedAvatar = avatarId;
    
    // Update visual selection
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    event.target.closest('.avatar-option').classList.add('selected');
    
    // Update user display
    const avatar = regionalAvatars.find(a => a.id === avatarId);
    if (avatar) {
        document.getElementById('userAvatar').innerHTML = avatar.image;
    }
}

async function updateContext() {
    currentGrade = document.getElementById('gradeSelect').value;
    currentSubject = document.getElementById('subjectSelect').value;
    
    // Update user preferences
    if (currentUser) {
        await supabase.from('user_preferences').upsert({
            user_id: currentUser.id,
            preference_key: 'current_grade',
            preference_value: currentGrade
        });
        
        await supabase.from('user_preferences').upsert({
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
    // Add user message to chat
    await addMessage('user', text);
    input.value = '';
    showTypingIndicator();
    try {
        // Get user class/subject from profile or UI
        const userClass = currentUser?.user_metadata?.class || document.getElementById('userClass')?.textContent || '';
        const userSubject = window.currentSubject || '';
        // Send to GPT backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                class: userClass,
                subject: userSubject,
                userId: currentUser?.id
            })
        });
        const data = await response.json();
        removeTypingIndicator();
        if (data.response) {
            await addMessage('ai', data.response);
        } else {
            await addMessage('ai', 'Sorry, I could not get a response from the AI.');
        }
    } catch (err) {
        removeTypingIndicator();
        await addMessage('ai', 'Error connecting to AI server.');
    }
}

async function addMessage(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-${role} p-4 rounded-2xl mb-4`;
    
    // Process Mermaid diagrams
    let processedContent = content;
    const hasMermaid = content.includes('```mermaid');
    
    if (hasMermaid) {
        processedContent = content.replace(/```mermaid([\s\S]*?)```/g, 
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
        speakText(content);
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
        await fetch('/api/study-session', {
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
        console.warn('Speech synthesis not supported');
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
                    console.warn('Voice loading timeout');
                    resolve(speechSynthesis.getVoices());
                }
            }, 2000);
        }
    });
}

function loadVoiceSettings() {
    const voiceRate = document.getElementById('voiceRate');
    const voicePitch = document.getElementById('voicePitch');
    
    voiceRate.value = localStorage.getItem('voiceRate') || 1;
    voicePitch.value = localStorage.getItem('voicePitch') || 1;
}

function setupVoiceSettingsListeners() {
    const voiceSelect = document.getElementById('voiceSelect');
    const voiceRate = document.getElementById('voiceRate');
    const voicePitch = document.getElementById('voicePitch');
    const voiceButton = document.getElementById('voiceButton');

    voiceSelect.addEventListener('change', () => {
        const voices = window.speechSynthesis.getVoices();
        selectedVoice = voices.find(v => v.name === voiceSelect.value);
        localStorage.setItem('selectedVoice', voiceSelect.value);
    });

    voiceRate.addEventListener('change', () => {
        localStorage.setItem('voiceRate', voiceRate.value);
    });

    voicePitch.addEventListener('change', () => {
        localStorage.setItem('voicePitch', voicePitch.value);
    });

    voiceButton.addEventListener('click', toggleVoiceRecording);
}

function initSpeechRecognition() {
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported');
            document.getElementById('voiceButton').style.display = 'none';
            return;
        }

        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.lang = document.getElementById('preferredLanguage').value || 'en-US';

        recognition.onstart = () => {
            console.log('Speech recognition started');
            isRecording = true;
            document.getElementById('voiceIcon').textContent = '🔴';
            document.getElementById('voiceButton').classList.add('voice-recording');
            
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
            showSuccess("Voice input received");
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
                default:
                    errorMessage += event.error;
            }
            
            showError(errorMessage);
        };

        recognition.onend = () => {
            clearTimeout(recognitionTimeout);
            stopRecording();
        };

    } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        document.getElementById('voiceButton').style.display = 'none';
        showError('Voice input not available in this browser');
    }
}

async function toggleVoiceRecording() {
    if (isRecording) {
        recognition.stop();
        return;
    }

    try {
        // First check microphone permissions
        const permission = await navigator.permissions.query({ name: 'microphone' });
        if (permission.state === 'denied') {
            showError('Microphone access blocked. Please enable it in browser settings.');
            return;
        }

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        // Initialize fresh recognition instance
        initSpeechRecognition();
        recognition.start();
        
    } catch (error) {
        console.error('Microphone error:', error);
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
        const voices = await loadVoices();
        console.log(`[TTS] ${voices.length} voices loaded.`);
        
        const voiceSelect = document.getElementById('voiceSelect');
        const selectedVoiceName = voiceSelect.value;
        console.log(`[TTS] Selected voice from dropdown: ${selectedVoiceName}`);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = parseFloat(document.getElementById('voiceRate').value) || 1;
        utterance.pitch = parseFloat(document.getElementById('voicePitch').value) || 1;

        // Select voice if available
        if (selectedVoiceName && voices.length > 0) {
            const selectedVoice = voices.find(v => v.name === selectedVoiceName);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang;
                console.log(`[TTS] Assigned voice: ${selectedVoice.name} (${selectedVoice.lang})`);
            } else {
                console.warn(`[TTS] Selected voice '${selectedVoiceName}' not found. Using fallback.`);
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
        const voices = await loadVoices();
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
            console.warn("Could not find 'Microsoft Ravi' or 'Google Hindi'. Please check your system's installed voices.");
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
        const { error } = await supabase.auth.signInWithOAuth({
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
        const { error } = await supabase.auth.signInWithOAuth({
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
    if (!supabase) return;
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        window.location.href = '/';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
}

// UI Functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
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
    }
    
    // Add active class to nav item
    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active', 'bg-white/10', 'text-white');
        activeNavItem.classList.remove('text-gray-300');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar.classList.contains('sidebar-hidden')) {
        sidebar.classList.remove('sidebar-hidden');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('sidebar-hidden');
        overlay.classList.add('hidden');
    }
}

// Close sidebar when clicking overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('mobileOverlay');
    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }
});

function updateUserDisplay(profile) {
    const userNameElement = document.getElementById('userName');
    const userClassElement = document.getElementById('userClass');
    const userAvatarElement = document.getElementById('userAvatar');
    const userInitialsElement = document.getElementById('userInitials');
    
    if (userNameElement) {
        userNameElement.textContent = profile.full_name || profile.name || 'Student';
    }
    
    if (userClassElement) {
        userClassElement.textContent = `Class ${profile.grade || '10'}`;
    }
    
    if (userAvatarElement && profile.avatar_id) {
        const avatar = regionalAvatars.find(a => a.id === profile.avatar_id);
        if (avatar) {
            userAvatarElement.innerHTML = avatar.image;
        }
    }
    
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
        
        await supabase.from('user_preferences').upsert({
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

// Export functions for global access
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.sendMessage = sendMessage;
window.startVoiceInput = toggleVoiceRecording;
window.toggleAmbient = toggleAmbient;
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
        
        const { error } = await supabase
            .from('profiles')
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
    const avatarOptions = document.querySelectorAll('.avatar-option');
    
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
    
    // Update avatar option selection
    avatarOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.avatar === selectedAvatar) {
            option.classList.add('selected');
        }
    });
}

// Setup avatar selection
function setupAvatarSelection() {
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedAvatar = option.dataset.avatar;
            updateAvatarDisplay();
            saveAvatarPreference();
        });
    });
    updateAvatarDisplay();
}

async function saveAvatarPreference() {
    try {
        await supabase.from('profiles').upsert({ id: currentUser.id, ai_avatar: selectedAvatar });
    } catch (error) {
        console.error('Error saving avatar preference:', error);
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
            const imgRes = await fetch(`/api/book-images?keyword=${encodeURIComponent(message)}`);
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
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, avatar: selectedAvatar, userId: currentUser.id })
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

