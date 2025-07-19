class VoiceRecognition {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.currentSpeaker = null;
        this.groupMode = false;
        this.speakerProfiles = new Map();
        this.conversationHistory = [];
        
        this.setupRecognition();
        this.loadVoices();
    }

    setupRecognition() {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = 'en-US'; // Default language

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.groupMode) {
                this.recognition.start(); // Keep listening in group mode
            }
            this.updateUI();
        };

        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const transcript = result[0].transcript;
                if (this.groupMode) {
                    this.handleGroupDiscussion(transcript);
                } else {
                    this.handleSingleUserInput(transcript);
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.updateUI('error');
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
        try {
            this.groupMode = groupMode;
            if (groupMode) {
                await this.initializeGroupMode();
            }
            
            // Set language based on user preference
            const { data: prefs } = await window.supabase
                .from('user_preferences')
                .select('preference_value')
                .eq('user_id', window.currentUser.id)
                .eq('preference_key', 'preferred_language')
                .single();

            if (prefs?.preference_value) {
                this.recognition.lang = prefs.preference_value;
            }

            this.recognition.start();
            this.updateUI('listening');
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.updateUI('error');
        }
    }

    async initializeGroupMode() {
        try {
            // Load speaker profiles
            const { data: profiles, error } = await window.supabase
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
            const { data, error } = await window.supabase
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
            // Process with AI tutor
            const response = await this.processWithAI(transcript);
            
            // Speak response
            await this.speakResponse(response);

            // Update UI
            this.updateUI('processed', { transcript, response });
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
        const statusIndicator = document.getElementById('voice-status');
        if (!statusIndicator) return;

        // Update status indicator
        statusIndicator.className = `w-3 h-3 rounded-full ${
            state === 'listening' ? 'bg-green-500 animate-pulse' :
            state === 'processing' ? 'bg-yellow-500 animate-pulse' :
            state === 'error' ? 'bg-red-500' :
            'bg-gray-500'
        }`;

        // Update status text for screen readers
        statusIndicator.setAttribute('aria-label', 
            state === 'listening' ? 'Voice recognition active' :
            state === 'processing' ? 'Processing voice input' :
            state === 'error' ? 'Voice recognition error' :
            'Voice recognition inactive'
        );

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

    stop() {
        this.recognition.stop();
        this.synthesis.cancel();
        this.isListening = false;
        this.updateUI();
    }
}

// Initialize voice recognition
const voiceRecognition = new VoiceRecognition();
export default voiceRecognition; 
