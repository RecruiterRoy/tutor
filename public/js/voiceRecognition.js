class VoiceRecognition {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isStarting = false; // Flag to prevent multiple simultaneous start attempts
        this.currentSpeaker = null;
        this.groupMode = false;
        this.speakerProfiles = new Map();
        this.conversationHistory = [];
        
        this.setupRecognition();
        this.loadVoices();
    }

    setupRecognition() {
        // Enhanced settings for better sensitivity and performance
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3; // Increased for better accuracy
        
        // Set language based on device and user preference
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const userLanguage = window.selectedAvatar === 'miss-sapna' ? 'hi-IN' : 'en-US';
        
        this.recognition.lang = isMobile ? userLanguage : 'en-US';
        
        // Mobile-specific settings - optimized for better performance
        if (isMobile) {
            this.recognition.continuous = false; // Better for mobile
            this.recognition.interimResults = true; // Enable for better responsiveness
            this.recognition.maxAlternatives = 2; // Reduced for mobile efficiency
        }

        // Enhanced error handling and recovery
        this.recognition.onstart = () => {
            this.isListening = true;
            this.isStarting = false; // Reset starting flag when actually started
            this.updateUI('listening');
            
            // Pause TTS when voice recognition starts to prevent feedback
            if (window.textToSpeech && window.textToSpeech.isSpeaking) {
                // Don't pause welcome messages - let them finish
                if (!window.textToSpeech.currentText || !window.textToSpeech.currentText.includes('Welcome to Tution App')) {
                    window.textToSpeech.pause();
                }
            }
            
            console.log('✅ Voice recognition started - listening for speech...');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.isStarting = false; // Reset starting flag when ended
            if (this.groupMode) {
                this.recognition.start(); // Keep listening in group mode
            }
            this.updateUI('idle');
            
            // Resume TTS after voice recognition ends
            if (window.textToSpeech && window.textToSpeech.isPaused) {
                setTimeout(() => {
                    window.textToSpeech.play();
                }, 500); // Reduced delay for faster response
            }
        };

        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            
            // Handle both final and interim results for better responsiveness
            if (result.isFinal) {
                const transcript = result[0].transcript.trim();
                if (transcript.length > 0) {
                    console.log('Final transcript:', transcript);
                    if (this.groupMode) {
                        this.handleGroupDiscussion(transcript);
                    } else {
                        this.handleSingleUserInput(transcript);
                    }
                }
            } else {
                // Show interim results for better user feedback
                const interimTranscript = result[0].transcript.trim();
                if (interimTranscript.length > 0) {
                    this.updateUI('processing', { transcript: interimTranscript });
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.isStarting = false; // Reset flags on error
            this.updateUI('error');
            
            // Enhanced error handling with automatic recovery
            switch (event.error) {
                case 'not-allowed':
                    if (window.showError) {
                        window.showError('Microphone access denied. Please allow microphone access and try again.');
                    }
                    break;
                case 'no-speech':
                    // Don't show error for no-speech, just restart quietly
                    console.log('No speech detected, restarting recognition...');
                    setTimeout(() => {
                        if (!this.isListening && !this.isStarting) {
                            this.startListening();
                        }
                    }, 1000);
                    break;
                case 'audio-capture':
                    if (window.showError) {
                        window.showError('Audio capture error. Please check your microphone.');
                    }
                    break;
                case 'network':
                    if (window.showError) {
                        window.showError('Network error. Please check your internet connection.');
                    }
                    break;
                case 'service-not-allowed':
                    if (window.showError) {
                        window.showError('Speech recognition service not available.');
                    }
                    break;
                default:
                    // For other errors, try to restart automatically
                    console.log('Recovering from error:', event.error);
                    setTimeout(() => {
                        if (!this.isListening && !this.isStarting) {
                            this.startListening();
                        }
                    }, 2000);
            }
        };
        
        // Add speech start/end detection for better responsiveness
        this.recognition.onspeechstart = () => {
            console.log('Speech detected - processing...');
            this.updateUI('processing');
        };
        
        this.recognition.onspeechend = () => {
            console.log('Speech ended - finalizing...');
        };
    }

    async loadVoices() {
        // Wait for voices to be loaded
        if (this.synthesis.getVoices().length === 0) {
            await new Promise(resolve => {
                this.synthesis.onvoiceschanged = resolve;
            });
        }

        this.voices = this.synthesis.getVoices();
        // Select Hindi and English voices
        this.hindiVoice = this.voices.find(voice => voice.lang.includes('hi-IN'));
        this.englishVoice = this.voices.find(voice => voice.lang.includes('en-US'));
    }

    async startListening(groupMode = false) {
        console.log('🔧 startListening called');
        
        // Prevent multiple simultaneous calls
        if (this.isStarting) {
            console.log('Already starting recognition, skipping...');
            return;
        }
        
        // If already listening, just return
        if (this.isListening) {
            console.log('Already listening, skipping...');
            return;
        }
        
        this.isStarting = true;
        console.log('🔧 Set isStarting to true');
        
        try {
            // Force stop any existing recognition first
            console.log('Stopping any existing recognition...');
            await this.stop();
            
            // Wait a bit to ensure cleanup
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Create new recognition instance
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.setupRecognition();
            
            // Check microphone permissions
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    } 
                });
                this.audioStream = stream;
            } catch (permissionError) {
                console.error('Microphone permission denied:', permissionError);
                this.isStarting = false;
                if (window.showError) {
                    window.showError('Microphone access denied. Please allow microphone permissions.');
                }
                return;
            }

            // Set listening state and start
            this.isListening = true;
            this.groupMode = groupMode;
            
            console.log('🔧 Starting recognition...');
            this.recognition.start();
            this.updateUI('listening');
            console.log('✅ Voice recognition started successfully');
            
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.isListening = false;
            this.updateUI('error');
        } finally {
            // Always reset the starting flag
            this.isStarting = false;
            console.log('🔧 Reset isStarting to false');
        }
    }

    async initializeGroupMode() {
        try {
            // Load speaker profiles
                    if (!window.groupLearning || !window.groupLearning.currentGroup || !window.groupLearning.currentGroup.id) {
            console.log('Group not available, skipping speaker profiles load');
            return [];
        }
        
        const { data: profiles, error } = await window.supabaseClient
            .from('speaker_profiles')
            .select('*')
            .eq('group_id', window.groupLearning.currentGroup.id);

            if (error) throw error;

            this.speakerProfiles = new Map(
                profiles.map(profile => [profile.user_id, profile])
            );

            // Initialize speaker diarization
            await this.initializeDiarization();
        } catch (error) {
            console.error('Error initializing group mode:', error);
            throw error;
        }
    }

    async initializeDiarization() {
        // Initialize WebRTC audio processing for speaker identification
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
        } catch (error) {
            console.error('Error initializing audio processing:', error);
            throw error;
        }
    }

    async handleGroupDiscussion(transcript) {
        try {
            // Identify current speaker
            const speakerFeatures = await this.extractSpeakerFeatures();
            const speakerId = await this.identifySpeaker(speakerFeatures);
            
            // Add to conversation history
            this.conversationHistory.push({
                speaker: speakerId,
                text: transcript,
                timestamp: new Date().toISOString()
            });

            // Update UI with speaker's contribution
            this.updateGroupDiscussionUI(speakerId, transcript);

            // Process with AI tutor if needed
            if (this.shouldProcessWithAI(transcript)) {
                const response = await this.processWithAI(transcript, speakerId);
                await this.speakResponse(response);
            }

            // Share with group if relevant
            if (window.groupLearning) {
                await window.groupLearning.shareGroupDiscussionUpdate({
                    speaker: speakerId,
                    text: transcript,
                    type: 'discussion'
                });
            }
        } catch (error) {
            console.error('Error handling group discussion:', error);
        }
    }

    async extractSpeakerFeatures() {
        // Extract audio features for speaker identification
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        this.analyser.getFloatFrequencyData(dataArray);
        
        // Process the frequency data to extract speaker features
        const features = {
            averageFrequency: dataArray.reduce((a, b) => a + b) / bufferLength,
            frequencyRange: Math.max(...dataArray) - Math.min(...dataArray),
            energyDistribution: this.calculateEnergyDistribution(dataArray)
        };

        return features;
    }

    calculateEnergyDistribution(frequencyData) {
        const bands = [0, 500, 1000, 2000, 4000, 8000]; // Frequency bands in Hz
        const distribution = [];
        
        for (let i = 0; i < bands.length - 1; i++) {
            const bandStart = Math.floor(bands[i] * frequencyData.length / this.audioContext.sampleRate);
            const bandEnd = Math.floor(bands[i + 1] * frequencyData.length / this.audioContext.sampleRate);
            const bandData = frequencyData.slice(bandStart, bandEnd);
            const energy = bandData.reduce((a, b) => a + Math.pow(10, b/10), 0);
            distribution.push(energy);
        }

        return distribution;
    }

    async identifySpeaker(features) {
        // Compare features with stored speaker profiles
        let bestMatch = null;
        let minDistance = Infinity;

        for (const [userId, profile] of this.speakerProfiles.entries()) {
            const distance = this.calculateFeatureDistance(features, profile.features);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = userId;
            }
        }

        // If confidence is low, treat as new speaker
        if (minDistance > this.SPEAKER_THRESHOLD) {
            return await this.createNewSpeakerProfile(features);
        }

        return bestMatch;
    }

    calculateFeatureDistance(features1, features2) {
        // Calculate Euclidean distance between feature vectors
        const dist1 = Math.pow(features1.averageFrequency - features2.averageFrequency, 2);
        const dist2 = Math.pow(features1.frequencyRange - features2.frequencyRange, 2);
        const dist3 = features1.energyDistribution.reduce((sum, val, i) => {
            return sum + Math.pow(val - features2.energyDistribution[i], 2);
        }, 0);

        return Math.sqrt(dist1 + dist2 + dist3);
    }

    async createNewSpeakerProfile(features) {
        try {
                    if (!window.currentUser || !window.currentUser.id || !window.groupLearning || !window.groupLearning.currentGroup || !window.groupLearning.currentGroup.id) {
            throw new Error('User or group not available');
        }
        
        const { data, error } = await window.supabaseClient
            .from('speaker_profiles')
            .insert({
                group_id: window.groupLearning.currentGroup.id,
                user_id: window.currentUser.id,
                    features: features
                })
                .select()
                .single();

            if (error) throw error;

            this.speakerProfiles.set(data.user_id, data);
            return data.user_id;
        } catch (error) {
            console.error('Error creating speaker profile:', error);
            throw error;
        }
    }

    async handleSingleUserInput(transcript) {
        try {
            console.log('Voice input received:', transcript);
            
            // Clean and validate transcript
            const cleanTranscript = transcript.trim();
            if (cleanTranscript.length === 0) {
                console.log('Empty transcript received, ignoring');
                return;
            }
            
            // Detect language and recommend avatar switch if needed
            const detectedLanguage = this.detectLanguage(cleanTranscript);
            const currentAvatar = (window.userData && window.userData.ai_avatar) || window.selectedAvatar || 'roy-sir';
            
            // Language-based avatar recommendations
            if (detectedLanguage === 'hi-IN' && currentAvatar === 'roy-sir') {
                console.log('🔍 Hindi detected but Roy Sir is active - recommending Miss Sapna');
                if (window.showSuccess) {
                    window.showSuccess('I detected Hindi. For better Hindi support, consider switching to Miss Sapna in settings. I\'ll continue in English for now.');
                }
            } else if (detectedLanguage === 'en-US' && currentAvatar === 'miss-sapna') {
                console.log('🔍 English detected but Miss Sapna is active - recommending Roy Sir');
                if (window.showSuccess) {
                    window.showSuccess('I detected English. For better English support, consider switching to Roy Sir in settings. I\'ll continue in Hindi for now.');
                }
            }
            
            // Update chat input with transcript
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = cleanTranscript;
                // Trigger input event to update any listeners
                chatInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            // Show success message with reduced delay
            if (window.showSuccess) {
                window.showSuccess('Voice input: ' + cleanTranscript);
            }
            
            // Update UI
            this.updateUI('processed', { transcript: cleanTranscript });
            
            // Auto-send the message after a shorter delay for better responsiveness
            setTimeout(() => {
                // Use the sendMessage function directly instead of clicking button
                if (typeof window.sendMessage === 'function') {
                    window.sendMessage();
                } else {
                    // Fallback to button click only if sendMessage function not available
                    const sendButton = document.getElementById('sendButton');
                    if (sendButton) {
                        sendButton.click();
                    }
                }
            }, 800); // Reduced from 1500ms to 800ms
            
        } catch (error) {
            console.error('Error handling user input:', error);
            this.updateUI('error');
        }
    }

    async processWithAI(transcript, speakerId = null) {
        try {
            // Get conversation context
            const context = this.getConversationContext(speakerId);

            // Process with GPT service
            const response = await window.gptService.processQuery(transcript, context);

            // Store in conversation history
            this.conversationHistory.push({
                speaker: 'ai',
                text: response,
                timestamp: new Date().toISOString()
            });

            return response;
        } catch (error) {
            console.error('Error processing with AI:', error);
            throw error;
        }
    }

    getConversationContext(speakerId = null) {
        // Get recent conversation history
        const recentHistory = this.conversationHistory.slice(-5);
        
        // Add group context if in group mode
        if (this.groupMode && speakerId) {
            const speakerProfile = this.speakerProfiles.get(speakerId);
            if (speakerProfile) {
                recentHistory.push({
                    type: 'context',
                    speaker: speakerId,
                    profile: speakerProfile
                });
            }
        }

        return recentHistory;
    }

    async speakResponse(text) {
        return new Promise((resolve, reject) => {
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Select voice based on content language
                utterance.voice = this.detectLanguage(text).includes('hi') ? 
                    this.hindiVoice : this.englishVoice;

                utterance.onend = resolve;
                utterance.onerror = reject;
                
                this.synthesis.speak(utterance);
            } catch (error) {
                reject(error);
            }
        });
    }

    detectLanguage(text) {
        // Simple language detection based on character sets
        const hindiPattern = /[\u0900-\u097F]/;
        return hindiPattern.test(text) ? 'hi-IN' : 'en-US';
    }

    updateUI(state = 'idle', data = null) {
        // Update mic button visual state
        const voiceButton = document.getElementById('voiceButton');
        const voiceIcon = document.getElementById('voiceIcon');
        
        console.log('🔧 updateUI called with state:', state);
        console.log('🔧 voiceButton found:', !!voiceButton);
        console.log('🔧 voiceIcon found:', !!voiceIcon);
        
        if (voiceButton && voiceIcon) {
            if (state === 'listening') {
                // Red background when listening
                voiceButton.classList.remove('bg-gray-700/50', 'text-gray-400', 'bg-yellow-500');
                voiceButton.classList.add('bg-red-500', 'text-white');
                voiceIcon.textContent = '🔴'; // Red circle to show listening
                voiceButton.title = 'Listening... Click to stop';
                console.log('🔧 Mic button set to listening (red)');
            } else if (state === 'processing') {
                // Yellow background when processing
                voiceButton.classList.remove('bg-gray-700/50', 'text-gray-400', 'bg-red-500');
                voiceButton.classList.add('bg-yellow-500', 'text-white');
                voiceIcon.textContent = '⏳'; // Hourglass to show processing
                voiceButton.title = 'Processing voice input...';
                console.log('🔧 Mic button set to processing (yellow)');
            } else if (state === 'error') {
                // Red background for error
                voiceButton.classList.remove('bg-gray-700/50', 'text-gray-400', 'bg-yellow-500');
                voiceButton.classList.add('bg-red-500', 'text-white');
                voiceIcon.textContent = '❌'; // X mark for error
                voiceButton.title = 'Voice recognition error. Click to try again.';
                console.log('🔧 Mic button set to error (red)');
            } else {
                // Default state (idle)
                voiceButton.classList.remove('bg-red-500', 'bg-yellow-500', 'text-white');
                voiceButton.classList.add('bg-gray-700/50', 'text-gray-400');
                voiceIcon.textContent = '🎤'; // Default mic icon
                voiceButton.title = 'Click to start voice input';
                console.log('🔧 Mic button set to idle (gray)');
            }
        } else {
            console.log('❌ Voice button elements not found');
        }

        // Update status indicator if it exists
        const statusIndicator = document.getElementById('voice-status');
        if (statusIndicator) {
            statusIndicator.className = `w-3 h-3 rounded-full ${
                state === 'listening' ? 'bg-green-500 animate-pulse' :
                state === 'processing' ? 'bg-yellow-500 animate-pulse' :
                state === 'error' ? 'bg-red-500' :
                'bg-gray-500'
            }`;

            statusIndicator.setAttribute('aria-label', 
                state === 'listening' ? 'Voice recognition active' :
                state === 'processing' ? 'Processing voice input' :
                state === 'error' ? 'Voice recognition error' :
                'Voice recognition inactive'
            );
        }

        // Update group discussion UI if needed
        if (this.groupMode && data) {
            this.updateGroupDiscussionUI(data.speakerId, data.transcript);
        }
    }

    updateGroupDiscussionUI(speakerId, transcript) {
        const discussionContainer = document.getElementById('group-discussion');
        if (!discussionContainer) return;

        const speakerProfile = this.speakerProfiles.get(speakerId);
        const speakerName = speakerProfile?.name || `Speaker ${speakerId}`;

        const messageElement = document.createElement('div');
        messageElement.className = 'flex items-start gap-3 mb-4';
        messageElement.innerHTML = `
            <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <span class="text-white text-sm">${speakerName[0]}</span>
                </div>
            </div>
            <div class="flex-grow">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-white">${speakerName}</span>
                    <span class="text-sm text-white/70">${new Date().toLocaleTimeString()}</span>
                </div>
                <p class="text-white/90">${transcript}</p>
            </div>
        `;

        discussionContainer.appendChild(messageElement);
        discussionContainer.scrollTop = discussionContainer.scrollHeight;
    }

    async stop() {
        console.log('🔧 Stopping voice recognition...');
        
        try {
            // Force stop recognition regardless of state
            if (this.recognition) {
                try {
                    this.recognition.stop();
                    console.log('Recognition stop() called');
                } catch (stopError) {
                    console.log('Recognition stop error (expected):', stopError);
                }
                
                try {
                    this.recognition.abort();
                    console.log('Recognition abort() called');
                } catch (abortError) {
                    console.log('Recognition abort error (expected):', abortError);
                }
                
                // Nullify the recognition instance to force cleanup
                this.recognition = null;
            }
            
            if (this.synthesis) {
                this.synthesis.cancel();
            }
            
            // Clean up audio stream
            if (this.audioStream) {
                this.audioStream.getTracks().forEach(track => track.stop());
                this.audioStream = null;
            }
            
            // Clean up audio context if exists
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }
        } catch (error) {
            console.log('Error stopping voice recognition:', error);
        }
        
        // Always reset state
        this.isListening = false;
        this.isStarting = false; // Also reset the starting flag
        this.groupMode = false;
        this.updateUI('idle');
        console.log('✅ Voice recognition stopped and reset');
    }
}

// Initialize voice recognition
const voiceRecognition = new VoiceRecognition();
window.voiceRecognition = voiceRecognition;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = voiceRecognition;
}

console.log('✅ Voice Recognition initialized successfully'); 
