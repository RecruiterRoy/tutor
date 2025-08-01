// Enhanced Dashboard JavaScript with all fixes

// Global variables
let currentUser = null;
let userData = null;
let selectedAvatar = 'roy-sir'; // Default avatar
let isRecording = false;
let recognition = null;
let chatHistory = [];
let todayChatLoaded = false;

// Initialize Supabase
async function initializeSupabase() {
    try {
        if (!window.supabaseClient) {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            window.supabaseClient = createClient(window.supabaseUrl, window.supabaseKey);
        }
        console.log('✅ Supabase initialized');
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
    }
}

// Initialize Dashboard
async function initializeDashboard() {
    try {
        await initializeSupabase();
        
        // Get current user
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            window.location.href = '/login.html';
            return;
        }
        
        if (!user) {
            console.log('No user found, redirecting to login');
            window.location.href = '/login.html';
            return;
        }
        
        currentUser = user;
        console.log('✅ User authenticated:', currentUser.email);
        
        // Load user data and preferences
        await loadUserData();
        await loadUserPreferences();
        
        // Initialize UI
        setupEventListeners();
        populateAvatarGrid();
        initializeVoiceFeatures();
        
        // Load today's chat history
        await loadTodayChatHistory();
        
        showWelcomeMessage();
        
        // Load books
        await loadBooks();
        
        console.log('✅ Dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        showDashboardError('Failed to initialize dashboard');
    }
}

// Load user data from Supabase
async function loadUserData() {
    try {
        if (!currentUser) return;
        
        const { data, error } = await window.supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error loading user data:', error);
            return;
        }
        
        userData = data || {};
        
        // Set default avatar based on language preference
        if (!userData.ai_avatar) {
            const defaultAvatar = getDefaultAvatarForLanguage(userData.preferred_language || 'english');
            userData.ai_avatar = defaultAvatar?.id || 'roy-sir';
            selectedAvatar = userData.ai_avatar;
            
            // Save to Supabase
            await window.supabaseClient
                .from('user_profiles')
                .upsert({
                    id: currentUser.id,
                    ai_avatar: userData.ai_avatar
                });
        } else {
            selectedAvatar = userData.ai_avatar;
        }
        
        // Update global variable for TTS
        window.selectedAvatar = selectedAvatar;
        
        // Update display
        updateUserDisplay(userData);
        updateAvatarDisplay();
        
        console.log('✅ User data loaded:', userData);
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
    }
}

// Load user preferences
async function loadUserPreferences() {
    try {
        if (!currentUser) return;
        
        const { data, error } = await window.supabaseClient
            .from('user_preferences')
            .select('*')
            .eq('user_id', currentUser.id);
        
        if (error) {
            console.error('Error loading preferences:', error);
            return;
        }
        
        // Apply preferences
        if (data && data.length > 0) {
            data.forEach(pref => {
                if (pref.preference_key === 'auto_tts') {
                    if (window.textToSpeech) {
                        window.textToSpeech.setAutoStart(pref.preference_value === 'true');
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

// Show welcome message
function showWelcomeMessage() {
    const welcomeMessage = `Namaste! I'm ${selectedAvatar === 'ms-sapana' ? 'Ms. Sapana' : 'Roy Sir'}, your personal tutor. How can I help you today?`;
    addMessage('ai', welcomeMessage);
}

// Load books
async function loadBooks() {
    try {
        const { data, error } = await window.supabaseClient
            .from('books')
            .select('*')
            .order('class', { ascending: true });
        
        if (error) {
            console.error('Error loading books:', error);
            return;
        }
        
        // Populate books section
        const booksContainer = document.getElementById('booksContainer');
        if (booksContainer && data) {
            booksContainer.innerHTML = '';
            data.forEach(book => {
                const bookCard = document.createElement('div');
                bookCard.className = 'book-card glass-card p-4 cursor-pointer hover:bg-white/10 transition-colors';
                bookCard.onclick = () => openBook(book.id, book.title);
                bookCard.innerHTML = `
                    <h3 class="text-white font-semibold">${book.title}</h3>
                    <p class="text-gray-300 text-sm">Class ${book.class}</p>
                `;
                booksContainer.appendChild(bookCard);
            });
        }
        
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Open book
function openBook(bookId, bookName) {
    console.log('Opening book:', bookName);
    // Implementation for opening book
}

// Setup event listeners
function setupEventListeners() {
    // Send button
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Voice button
    const voiceButton = document.getElementById('voiceButton');
    if (voiceButton) {
        voiceButton.addEventListener('click', toggleVoiceRecording);
    }
    
    // Navigation buttons
    const navButtons = document.querySelectorAll('[data-section]');
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const section = e.target.closest('[data-section]').dataset.section;
            showSection(section);
        });
    });
}

// Populate avatar grid
function populateAvatarGrid() {
    const avatarGrid = document.getElementById('avatarGrid');
    if (!avatarGrid) return;
    
    const regionalAvatars = [
        // Specific Teacher Avatars (based on language preference)
        { id: 'ms-sapana', name: 'Ms. Sapana', region: 'Hindi/Hinglish', gender: 'female', image: '👩‍🏫', language: 'hindi' },
        { id: 'roy-sir', name: 'Roy Sir', region: 'English', gender: 'male', image: '👨‍🏫', language: 'english' },
        
        // North India
        { id: 'punjabi-male', name: 'Punjabi Male', region: 'Punjab', gender: 'male', image: '👨‍🦱' },
        { id: 'punjabi-female', name: 'Punjabi Female', region: 'Punjab', gender: 'female', image: '👩‍🦱' },
        { id: 'haryanvi-male', name: 'Haryanvi Male', region: 'Haryana', gender: 'male', image: '👨‍💼' },
        { id: 'haryanvi-female', name: 'Haryanvi Female', region: 'Haryana', gender: 'female', image: '👩‍💼' },
        
        // Central India
        { id: 'mp-male', name: 'MP Male', region: 'Madhya Pradesh', gender: 'male', image: '👨‍🌾' },
        { id: 'mp-female', name: 'MP Female', region: 'Madhya Pradesh', gender: 'female', image: '👩‍🌾' },
        { id: 'chhattisgarh-male', name: 'Chhattisgarh Male', region: 'Chhattisgarh', gender: 'male', image: '👨‍🏭' },
        { id: 'chhattisgarh-female', name: 'Chhattisgarh Female', region: 'Chhattisgarh', gender: 'female', image: '👩‍🏭' },
        
        // East India
        { id: 'bengali-male', name: 'Bengali Male', region: 'West Bengal', gender: 'male', image: '👨‍🎓' },
        { id: 'bengali-female', name: 'Bengali Female', region: 'West Bengal', gender: 'female', image: '👩‍🎓' },
        { id: 'bihar-male', name: 'Bihar Male', region: 'Bihar', gender: 'male', image: '👨‍⚖️' },
        { id: 'bihar-female', name: 'Bihar Female', region: 'Bihar', gender: 'female', image: '👩‍⚖️' },
        { id: 'odisha-male', name: 'Odisha Male', region: 'Odisha', gender: 'male', image: '👨‍🔬' },
        { id: 'odisha-female', name: 'Odisha Female', region: 'Odisha', gender: 'female', image: '👩‍🔬' },
        
        // West India
        { id: 'gujarati-male', name: 'Gujarati Male', region: 'Gujarat', gender: 'male', image: '👨‍💻' },
        { id: 'gujarati-female', name: 'Gujarati Female', region: 'Gujarat', gender: 'female', image: '👩‍💻' },
        { id: 'marathi-male', name: 'Marathi Male', region: 'Maharashtra', gender: 'male', image: '👨‍🎨' },
        { id: 'marathi-female', name: 'Marathi Female', region: 'Maharashtra', gender: 'female', image: '👩‍🎨' },
        
        // South India
        { id: 'tamil-male', name: 'Tamil Male', region: 'Tamil Nadu', gender: 'male', image: '👨‍🏫' },
        { id: 'tamil-female', name: 'Tamil Female', region: 'Tamil Nadu', gender: 'female', image: '👩‍🏫' },
        { id: 'telugu-male', name: 'Telugu Male', region: 'Telangana/AP', gender: 'male', image: '👨‍⚕️' },
        { id: 'telugu-female', name: 'Telugu Female', region: 'Telangana/AP', gender: 'female', image: '👩‍⚕️' },
        { id: 'kannada-male', name: 'Kannada Male', region: 'Karnataka', gender: 'male', image: '👨‍🎭' },
        { id: 'kannada-female', name: 'Kannada Female', region: 'Karnataka', gender: 'female', image: '👩‍🎭' },
        { id: 'malayalam-male', name: 'Malayalam Male', region: 'Kerala', gender: 'male', image: '👨‍🌴' },
        { id: 'malayalam-female', name: 'Malayalam Female', region: 'Kerala', gender: 'female', image: '👩‍🌴' }
    ];
    
    avatarGrid.innerHTML = '';
    regionalAvatars.forEach(avatar => {
        const avatarCard = document.createElement('div');
        avatarCard.className = `avatar-card glass-card p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${selectedAvatar === avatar.id ? 'ring-2 ring-purple-400 bg-purple-600/30' : 'hover:bg-white/10'}`;
        avatarCard.onclick = (e) => selectAvatar(avatar.id, e);
        
        avatarCard.innerHTML = `
            <div class="text-4xl mb-2">${avatar.image}</div>
            <h3 class="text-white font-semibold text-sm">${avatar.name}</h3>
            <p class="text-gray-300 text-xs">${avatar.region}</p>
        `;
        
        avatarGrid.appendChild(avatarCard);
    });
}

// Select avatar
async function selectAvatar(avatarId, event) {
    try {
        selectedAvatar = avatarId;
        window.selectedAvatar = avatarId; // Update global variable for TTS
        
        // Update UI
        updateAvatarDisplay();
        
        // Save to Supabase
        await saveAvatarPreference();
        
        // Update context
        await updateContext();
        
        console.log('✅ Avatar selected:', avatarId);
        
    } catch (error) {
        console.error('❌ Error selecting avatar:', error);
    }
}

// Update context with new avatar
async function updateContext() {
    const teacherName = selectedAvatar === 'ms-sapana' ? 'Ms. Sapana' : 'Roy Sir';
    const contextMessage = `Context updated: You are now ${teacherName}. Please respond accordingly.`;
    console.log(contextMessage);
}

// Send message
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput?.value?.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get teacher name based on selected avatar
        const teacherName = selectedAvatar === 'ms-sapana' ? 'Ms. Sapana' : 'Roy Sir';
        
        // Send to AI
        const response = await fetch('/api/enhanced-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                userProfile: userData,
                teacher: teacherName
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response
        addMessage('ai', data.response);
        
        // Save chat to database
        await saveChatToDatabase(message, data.response);
        
        // Save study session
        await saveStudySession(message, data.response);
        
    } catch (error) {
        console.error('❌ Error sending message:', error);
        removeTypingIndicator();
        const errorMessage = 'Sorry, I encountered an error. Please try again.';
        addMessage('ai', errorMessage);
        // Save error message to database as well
        await saveChatToDatabase(message, errorMessage);
    }
}

// Add message to chat
function addMessage(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user-message' : 'ai-message'} mb-4`;
    
    const avatar = role === 'user' ? '👤' : (selectedAvatar === 'ms-sapana' ? '👩‍🏫' : '👨‍🏫');
    const name = role === 'user' ? (userData?.full_name || 'You') : (selectedAvatar === 'ms-sapana' ? 'Ms. Sapana' : 'Roy Sir');
    
    messageDiv.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="text-2xl">${avatar}</div>
            <div class="flex-1">
                <div class="text-white font-semibold text-sm mb-1">${name}</div>
                <div class="text-gray-200 text-sm leading-relaxed">${content}</div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Auto-speak AI responses
    if (role === 'ai' && window.textToSpeech) {
        window.textToSpeech.speak(content, { role: 'ai' });
    }
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message ai-message mb-4';
    typingDiv.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="text-2xl">${selectedAvatar === 'ms-sapana' ? '👩‍🏫' : '👨‍🏫'}</div>
            <div class="flex-1">
                <div class="text-white font-semibold text-sm mb-1">${selectedAvatar === 'ms-sapana' ? 'Ms. Sapana' : 'Roy Sir'}</div>
                <div class="text-gray-200 text-sm">Typing...</div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Save study session
async function saveStudySession(question, answer) {
    try {
        if (!currentUser) return;
        
        await window.supabaseClient
            .from('chat_history')
            .insert({
                user_id: currentUser.id,
                question: question,
                answer: answer,
                teacher: selectedAvatar === 'ms-sapana' ? 'Ms. Sapana' : 'Roy Sir',
                timestamp: new Date().toISOString()
            });
        
    } catch (error) {
        console.error('Error saving study session:', error);
    }
}

// Initialize voice features
function initializeVoiceFeatures() {
    // Initialize speech recognition
    initSpeechRecognition();
    
    // Initialize voice selection
    initVoiceSelection();
}

// Initialize speech recognition
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    
    recognition.onstart = () => {
        console.log('Speech recognition started');
        isRecording = true;
        updateVoiceButton();
    };
    
    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update input field with interim results
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = finalTranscript + interimTranscript;
        }
        
        // If we have a final result, send the message
        if (finalTranscript) {
            setTimeout(() => {
                sendMessage();
            }, 500);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isRecording = false;
        updateVoiceButton();
    };
    
    recognition.onend = () => {
        console.log('Speech recognition ended');
        isRecording = false;
        updateVoiceButton();
    };
}

// Toggle voice recording
async function toggleVoiceRecording() {
    if (!recognition) {
        console.error('Speech recognition not available');
        return;
    }
    
    if (isRecording) {
        recognition.stop();
    } else {
        try {
            // Pause TTS if speaking
            if (window.textToSpeech && window.textToSpeech.isSpeaking) {
                window.textToSpeech.pause();
            }
            
            recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
        }
    }
}

// Update voice button
function updateVoiceButton() {
    const voiceButton = document.getElementById('voiceButton');
    if (!voiceButton) return;
    
    if (isRecording) {
        voiceButton.innerHTML = '🎤 Recording...';
        voiceButton.classList.add('recording');
    } else {
        voiceButton.innerHTML = '🎤';
        voiceButton.classList.remove('recording');
    }
}

// Initialize voice selection
async function initVoiceSelection() {
    // Voice selection is now handled by avatar selection
    console.log('Voice selection initialized - tied to avatar selection');
}

// Show section
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Hide all sections
    const sections = ['chat', 'books', 'progress', 'settings'];
    sections.forEach(section => {
        const sectionEl = document.getElementById(`${section}Section`);
        if (sectionEl) {
            sectionEl.classList.add('hidden');
        }
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`${sectionName}Section`);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('[data-section]');
    navItems.forEach(item => {
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    console.log('Section navigation completed for:', sectionName);
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('hidden');
    }
}

// Update user display
function updateUserDisplay(profile) {
    const userNameElements = document.querySelectorAll('#userName, #userName2');
    const userClassElements = document.querySelectorAll('#userClass, #userClass2');
    const userAvatarElements = document.querySelectorAll('#userAvatar, #userAvatar2');
    
    userNameElements.forEach(el => {
        if (el) el.textContent = profile?.full_name || 'Student';
    });
    
    userClassElements.forEach(el => {
        if (el) el.textContent = profile?.class || 'Class';
    });
    
    userAvatarElements.forEach(el => {
        if (el) el.textContent = selectedAvatar === 'ms-sapana' ? '👩‍🏫' : '👨‍🏫';
    });
}

// Save preferences
async function savePreferences() {
    try {
        if (!currentUser) return;
        
        const autoTTS = document.getElementById('autoTTS')?.checked || false;
        
        await window.supabaseClient
            .from('user_preferences')
            .upsert({
                user_id: currentUser.id,
                preference_key: 'auto_tts',
                preference_value: autoTTS.toString()
            });
        
        if (window.textToSpeech) {
            window.textToSpeech.setAutoStart(autoTTS);
        }
        
        showSuccess('Preferences saved successfully!');
        
    } catch (error) {
        console.error('Error saving preferences:', error);
        showError('Failed to save preferences');
    }
}

// Get default avatar for language
function getDefaultAvatarForLanguage(language) {
    const languageLower = language.toLowerCase();
    
    if (languageLower.includes('hindi') || languageLower.includes('hi') || languageLower.includes('hinglish')) {
        return { id: 'ms-sapana', name: 'Ms. Sapana', region: 'Hindi/Hinglish', gender: 'female', image: '👩‍🏫', language: 'hindi' };
    } else if (languageLower.includes('english') || languageLower.includes('en')) {
        return { id: 'roy-sir', name: 'Roy Sir', region: 'English', gender: 'male', image: '👨‍🏫', language: 'english' };
    } else {
        // Default to Roy Sir for English
        return { id: 'roy-sir', name: 'Roy Sir', region: 'English', gender: 'male', image: '👨‍🏫', language: 'english' };
    }
}

// Save avatar preference
async function saveAvatarPreference() {
    try {
        if (currentUser && selectedAvatar) {
            await window.supabaseClient.from('user_profiles').upsert({ 
                id: currentUser.id, 
                ai_avatar: selectedAvatar 
            });
            console.log('Avatar preference saved:', selectedAvatar);
            
            // Update global variable for TTS to use
            window.selectedAvatar = selectedAvatar;
        }
    } catch (error) {
        console.error('Error saving avatar preference:', error);
    }
}

// Update avatar display
function updateAvatarDisplay() {
    const avatarCards = document.querySelectorAll('.avatar-card');
    avatarCards.forEach(card => {
        const avatarId = card.onclick.toString().match(/selectAvatar\('([^']+)'/)?.[1];
        if (avatarId === selectedAvatar) {
            card.classList.add('ring-2', 'ring-purple-400', 'bg-purple-600/30');
            card.classList.remove('hover:bg-white/10');
        } else {
            card.classList.remove('ring-2', 'ring-purple-400', 'bg-purple-600/30');
            card.classList.add('hover:bg-white/10');
        }
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
        
        if (nameField) nameField.value = userData?.full_name || '';
        if (classField) classField.value = userData?.class || '';
        if (boardField) boardField.value = userData?.board || '';
        if (emailField) emailField.value = (currentUser && currentUser.email) || '';
        if (mobileField) mobileField.value = userData?.mobile || 'Not set';
        
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
        
        if (!currentUser) {
            showError('User not authenticated');
            return;
        }
        
        // Update user data
        const { error } = await window.supabaseClient
            .from('user_profiles')
            .upsert({
                id: currentUser.id,
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
        userData = { ...userData, full_name: name, class: classValue, board: board };
        
        // Update display
        updateUserDisplay(userData);
        
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
    
    if (nameField) nameField.value = userData?.full_name || (currentUser && currentUser.email) || '';
    if (emailField) emailField.value = (currentUser && currentUser.email) || '';
    if (mobileField) mobileField.value = userData?.mobile || 'Not set';
    
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

// Utility functions
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

// Chat persistence functions
async function loadTodayChatHistory() {
    try {
        if (!currentUser || !currentUser.id) {
            console.log('No user logged in, skipping chat history load');
            return;
        }

        // Get today's date in user's timezone
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        console.log('Loading chat history for today:', startOfDay.toISOString(), 'to', endOfDay.toISOString());

        const { data: chatData, error } = await window.supabaseClient
            .from('chat_history')
            .select('*')
            .eq('user_id', currentUser.id)
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString())
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading chat history:', error);
            return;
        }

        if (chatData && chatData.length > 0) {
            console.log(`Loaded ${chatData.length} chat messages from today`);
            
            // Clear existing chat display
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
            }

            // Load chat history into memory and display
            chatHistory = [];
            for (const chat of chatData) {
                chatHistory.push({
                    user: chat.user_message,
                    ai: chat.ai_response,
                    timestamp: chat.created_at
                });
                
                // Display the messages
                await addMessage('user', chat.user_message);
                await addMessage('ai', chat.ai_response);
            }

            // Scroll to bottom
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            todayChatLoaded = true;
            console.log('Today\'s chat history loaded successfully');
        } else {
            console.log('No chat history found for today');
            todayChatLoaded = true;
        }
    } catch (error) {
        console.error('Error in loadTodayChatHistory:', error);
        todayChatLoaded = true; // Mark as loaded even if there's an error
    }
}

async function saveChatToDatabase(userMessage, aiResponse) {
    try {
        if (!currentUser || !currentUser.id) {
            console.log('No user logged in, skipping chat save');
            return;
        }

        // Get current subject and grade
        const userClass = userData?.class || userData?.class_level || '';
        const currentSubject = window.currentSubject || '';

        const { error } = await window.supabaseClient
            .from('chat_history')
            .insert({
                user_id: currentUser.id,
                user_message: userMessage,
                ai_response: aiResponse,
                subject: currentSubject,
                grade: userClass,
                teacher_name: selectedAvatar === 'ms-sapana' ? 'Ms. Sapana' : 'Roy Sir',
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error saving chat to database:', error);
        } else {
            console.log('Chat message saved to database successfully');
        }
    } catch (error) {
        console.error('Error in saveChatToDatabase:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Initialize Mermaid if available
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