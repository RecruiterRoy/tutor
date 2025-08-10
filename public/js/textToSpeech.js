class TextToSpeech {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.currentText = '';
        this.pausedAt = 0;
        this.autoStart = true; // Auto-start TTS for AI responses
        this.language = 'hi-IN'; // Default to Hindi
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
        this.currentAIResponse = ''; // Track the current AI response text
        this.lastSpokenResponse = ''; // Track the last response that was spoken
        
        this.initializeVoices();
        this.setupControls();
        this.loadSettings();
    }

    initializeVoices() {
        console.log('🔧 TTS: Initializing voices...');
        
        // Load voices immediately
        this.loadVoices();
        
        // Voices might load asynchronously
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                console.log('🔧 TTS: Voices changed, reloading...');
                this.loadVoices();
            };
        }
        
        // Force load voices multiple times to ensure they load
        setTimeout(() => {
            if (this.voices.length === 0) {
                console.log('🔧 TTS: First retry - forcing voice reload...');
                this.loadVoices();
            }
        }, 500);
        
        setTimeout(() => {
            if (this.voices.length === 0) {
                console.log('🔧 TTS: Second retry - forcing voice reload...');
                this.loadVoices();
            }
        }, 1000);
        
        setTimeout(() => {
            if (this.voices.length === 0) {
                console.log('🔧 TTS: Third retry - forcing voice reload...');
                this.loadVoices();
            }
        }, 2000);
    }

    loadVoices() {
        try {
            this.voices = this.synth.getVoices();
            console.log('🔧 TTS: Loaded voices:', this.voices.length);
            console.log('🔧 TTS: Available voices:', this.voices.map(v => `${v.name} (${v.lang})`));
            
            // If no voices available, try alternative method
            if (this.voices.length === 0) {
                console.log('🔧 TTS: No voices found, trying alternative method...');
                // Try to get voices using a different approach
                if (typeof speechSynthesis !== 'undefined' && speechSynthesis.getVoices) {
                    this.voices = speechSynthesis.getVoices();
                    console.log('🔧 TTS: Alternative method found voices:', this.voices.length);
                }
            }
            
            // Set voice based on current avatar
            if (this.voices.length > 0) {
                this.detectLanguageAndSetVoice('');
            } else {
                console.warn('🔧 TTS: Still no voices available after all attempts');
            }

            // Update voice selector UI
            this.updateVoiceSelector();
        } catch (error) {
            console.error('🔧 TTS: Error loading voices:', error);
        }
    }

    setupControls() {
        // Create TTS controls if they don't exist
        this.createTTSControls();
        
        // Add event listeners
        this.addEventListeners();
    }

    createTTSControls() {
        // Remove TTS controls from chat header - they should only be in settings
        // This method is now deprecated as controls are handled in settings only
        console.log('TTS controls are now managed in settings only');
    }

    addEventListeners() {
        // Play button
        const playBtn = document.getElementById('tts-play');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.play());
        }

        // Pause button
        const pauseBtn = document.getElementById('tts-pause');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }

        // Stop button
        const stopBtn = document.getElementById('tts-stop');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }

        // Speed control
        const speedSlider = document.getElementById('tts-speed');
        const speedValue = document.getElementById('tts-speed-value');
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.setRate(value);
                speedValue.textContent = value.toFixed(2) + 'x';
            });
        }

        // Pitch control
        const pitchSlider = document.getElementById('tts-pitch');
        const pitchValue = document.getElementById('tts-pitch-value');
        if (pitchSlider && pitchValue) {
            pitchSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.setPitch(value);
                pitchValue.textContent = value.toFixed(2) + 'x';
            });
        }
    }

    loadSettings() {
        // Load TTS settings from localStorage
        const settings = localStorage.getItem('tts-settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.autoStart = parsed.autoStart !== undefined ? parsed.autoStart : true;
            this.rate = parsed.rate || 1.0; // Default to 1.0x
            this.pitch = parsed.pitch || 1.0;
            this.volume = parsed.volume || 1.0;
            this.language = parsed.language || 'hi-IN';
        } else {
            // Set defaults for new users
            this.rate = 1.0; // Default to 1.0x
            this.pitch = 1.0;
            this.volume = 1.0;
            this.language = 'hi-IN';
        }
        
        // Force update sliders to reflect current values
        setTimeout(() => {
            const speedSlider = document.getElementById('tts-speed');
            const speedValue = document.getElementById('tts-speed-value');
            const pitchSlider = document.getElementById('tts-pitch');
            const pitchValue = document.getElementById('tts-pitch-value');
            
            if (speedSlider && speedValue) {
                speedSlider.value = this.rate;
                speedValue.textContent = this.rate.toFixed(2) + 'x';
            }
            if (pitchSlider && pitchValue) {
                pitchSlider.value = this.pitch;
                pitchValue.textContent = this.pitch.toFixed(2) + 'x';
            }
        }, 100);
    }

    saveSettings() {
        const settings = {
            autoStart: this.autoStart,
            rate: this.rate,
            pitch: this.pitch,
            volume: this.volume,
            language: this.language
        };
        localStorage.setItem('tts-settings', JSON.stringify(settings));
    }

    // Main speak function - called when AI responds
    speak(text, options = {}) {
        if (!this.synth) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Respect TTS enable/disable flags and autoplay constraints
        if (options.role === 'ai') {
            const isDisabled = (typeof window !== 'undefined') && (window.ttsDisabled === true || localStorage.getItem('ttsEnabled') === 'false');
            if (isDisabled) {
                console.log('[TTS] Skipping AI speech because TTS is disabled');
                return;
            }
            // If user hasn't interacted yet (mobile autoplay policy), queue on first interaction
            if (typeof window !== 'undefined' && !window.userHasInteracted) {
                console.log('[TTS] Waiting for first user interaction to unlock audio');
                const unlock = () => {
                    document.removeEventListener('click', unlock);
                    document.removeEventListener('keydown', unlock);
                    try { this.synth.resume(); } catch (_) {}
                    this.speak(text, { role: 'ai' });
                };
                document.addEventListener('click', unlock, { once: true });
                document.addEventListener('keydown', unlock, { once: true });
                return;
            }
        }

        // Force auto-start for Miss Sapna
        const currentAvatar = window.selectedAvatar || 'miss-sapna';
        if (currentAvatar === 'miss-sapna') {
            this.autoStart = true;
        }

        // Only speak AI responses
        if (options.role !== 'ai' && this.autoStart) {
            return; // Don't auto-speak user messages
        }

        // Stop any ongoing speech immediately
        this.stop();

        // Update current AI response tracking
        if (options.role === 'ai') {
            this.currentAIResponse = text;
        }

        this.currentText = text;
        this.pausedAt = 0;
        this.isPaused = false;

        // Create utterance immediately
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Set voice based on avatar (optimized)
        const language = this.detectLanguageAndSetVoice(text);
        this.currentUtterance.voice = this.currentVoice;
        this.currentUtterance.rate = this.rate;
        this.currentUtterance.pitch = this.pitch;
        this.currentUtterance.volume = this.volume;
        this.currentUtterance.lang = language;

        // Event handlers (minimal)
        this.currentUtterance.onstart = () => {
            this.isSpeaking = true;
            this.isPaused = false;
            this.updateControls();
        };

        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            this.isPaused = false;
            this.currentUtterance = null;
            this.lastSpokenResponse = this.currentAIResponse;
            this.updateControls();
        };

        this.currentUtterance.onpause = () => {
            this.isPaused = true;
            this.updateControls();
        };

        this.currentUtterance.onresume = () => {
            this.isPaused = false;
            this.updateControls();
        };

        this.currentUtterance.onerror = (event) => {
            console.error('TTS error:', event);
            this.isSpeaking = false;
            this.isPaused = false;
            this.updateControls();
        };

        // Start speaking immediately
        this.synth.speak(this.currentUtterance);
        this.showControls();
    }

    play() {
        if (this.isPaused && this.currentUtterance) {
            // Resume from where it was paused (same response)
            this.synth.resume();
        } else if (this.currentAIResponse && !this.isSpeaking) {
            // Check if this is the same response as last spoken
            if (this.currentAIResponse === this.lastSpokenResponse && this.pausedAt > 0) {
                // Resume from where it was stopped (same response)
                this.speak(this.currentAIResponse, { role: 'ai' });
            } else {
                // Start from beginning (new response or first time)
                this.speak(this.currentAIResponse, { role: 'ai' });
            }
        }
    }

    pause() {
        if (this.isSpeaking && !this.isPaused) {
            this.synth.pause();
        }
    }

    stop() {
        if (this.isSpeaking || this.isPaused) {
            this.synth.cancel();
            this.isSpeaking = false;
            this.isPaused = false;
            this.currentUtterance = null;
            this.pausedAt = 0;
            this.updateControls();
        }
    }

    showControls() {
        const controls = document.getElementById('tts-controls');
        if (controls) {
            controls.style.display = 'flex';
        }
    }

    hideControls() {
        const controls = document.getElementById('tts-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    }

    updateControls() {
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');
        const status = document.querySelector('.tts-status');
        const speedSlider = document.getElementById('tts-speed');
        const speedValue = document.getElementById('tts-speed-value');
        const pitchSlider = document.getElementById('tts-pitch');
        const pitchValue = document.getElementById('tts-pitch-value');

        if (!playBtn || !pauseBtn || !stopBtn || !status) return;

        if (this.isSpeaking && !this.isPaused) {
            // Speaking
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            stopBtn.style.display = 'inline-block';
            status.textContent = 'Speaking...';
        } else if (this.isPaused) {
            // Paused
            playBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            status.textContent = 'Paused';
        } else {
            // Stopped/Ready
            playBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            status.textContent = this.currentText ? 'Ready to play' : 'No text to speak';
        }

        // Update slider values to match current settings
        if (speedSlider && speedValue) {
            speedSlider.value = this.rate;
            speedValue.textContent = this.rate.toFixed(2) + 'x';
        }
        if (pitchSlider && pitchValue) {
            pitchSlider.value = this.pitch;
            pitchValue.textContent = this.pitch.toFixed(2) + 'x';
        }
    }

    detectLanguageAndSetVoice(text) {
        // Get current avatar from userData or fallback to window.selectedAvatar
        const currentAvatar = (window.userData && window.userData.ai_avatar) || window.selectedAvatar || 'roy-sir';

        // If no voices available, try to load them
        if (this.voices.length === 0) {
            this.loadVoices();
            if (this.voices.length === 0) {
                this.currentVoice = null;
                return 'en-US';
            }
        }

        // Use any available voice as fallback
        const fallbackVoice = this.voices[0];

        if (currentAvatar === 'miss-sapna') {
            // Fast Hindi voice selection for Miss Sapna
            let hindiVoice = this.voices.find(voice =>
                voice.name.toLowerCase().includes('google') && 
                voice.lang.includes('hi-IN')
            ) || this.voices.find(voice =>
                voice.lang.includes('hi-IN') || voice.lang.includes('hi')
            ) || this.voices.find(voice =>
                voice.lang.includes('IN')
            );
            
            if (hindiVoice) {
                this.currentVoice = hindiVoice;
                return 'hi-IN';
            } else {
                this.currentVoice = fallbackVoice;
                return fallbackVoice?.lang || 'en-US';
            }
        } else {
            // Fast English voice selection for Roy Sir
            let englishVoice = this.voices.find(voice =>
                voice.name.toLowerCase().includes('ravi') && 
                voice.lang.includes('en-IN')
            ) || this.voices.find(voice =>
                voice.lang.includes('en-IN')
            ) || this.voices.find(voice =>
                voice.lang.includes('en-US') || voice.lang.includes('en-GB')
            );
            
            if (englishVoice) {
                this.currentVoice = englishVoice;
                return englishVoice.lang;
            } else {
                this.currentVoice = fallbackVoice;
                return fallbackVoice?.lang || 'en-US';
            }
        }
    }

    findBestVoiceForLanguage(language, gender) {
        console.log(`🔍 Finding best voice for ${language} (${gender})`);
        
        // Priority order for voice selection
        const priorities = {
            'hindi': [
                { lang: 'hi-IN', gender: 'female' },
                { lang: 'hi', gender: 'female' },
                { lang: 'IN', gender: 'female' },
                { lang: 'IN', gender: 'any' }
            ],
            'assamese': [
                { lang: 'as-IN', gender: 'male' },
                { lang: 'as', gender: 'male' },
                { lang: 'hi-IN', gender: 'male' }, // Hindi as fallback
                { lang: 'bn-IN', gender: 'male' }, // Bengali as fallback
                { lang: 'IN', gender: 'male' },
                { lang: 'IN', gender: 'any' }
            ],
            'english': [
                { lang: 'en-IN', gender: 'male' },
                { lang: 'en-US', gender: 'male' },
                { lang: 'en-GB', gender: 'male' },
                { lang: 'en', gender: 'male' },
                { lang: 'en', gender: 'any' }
            ]
        };

        const languagePriorities = priorities[language] || [];
        
        for (const priority of languagePriorities) {
            const matchingVoices = this.voices.filter(voice => {
                const langMatch = voice.lang.includes(priority.lang);
                const genderMatch = priority.gender === 'any' || 
                    (priority.gender === 'male' && voice.name.toLowerCase().includes('male')) ||
                    (priority.gender === 'female' && voice.name.toLowerCase().includes('female'));
                
                return langMatch && genderMatch;
            });
            
            if (matchingVoices.length > 0) {
                console.log(`✅ Found ${matchingVoices.length} voices for ${language} (${priority.lang}, ${priority.gender})`);
                return matchingVoices[0]; // Return the first matching voice
            }
        }
        
        console.log(`❌ No suitable voice found for ${language}`);
        return null;
    }

    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.currentVoice = voice;
            this.language = voice.lang;
            this.saveSettings();
        }
    }

    setRate(rate) {
        this.rate = rate;
        if (this.currentUtterance) {
            this.currentUtterance.rate = rate;
        }
        this.saveSettings();
    }

    setPitch(pitch) {
        this.pitch = pitch;
        if (this.currentUtterance) {
            this.currentUtterance.pitch = pitch;
        }
        this.saveSettings();
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.currentUtterance) {
            this.currentUtterance.volume = volume;
        }
        this.saveSettings();
    }

    setAutoStart(enabled) {
        this.autoStart = enabled;
        this.saveSettings();
    }

    forceVoiceUpdate() {
        // Force update voice selection based on current avatar
        const currentAvatar = (window.userData && window.userData.ai_avatar) || window.selectedAvatar || 'roy-sir';
        console.log('Forcing voice update for current avatar:', currentAvatar);
        
        // Stop any ongoing speech first
        this.stop();
        
        // Force voice change
        this.detectLanguageAndSetVoice('');
        console.log('Voice updated to:', this.currentVoice?.name || 'No voice selected');
        
        // Log the voice details for debugging
        if (this.currentVoice) {
            console.log('🔧 Current voice details:', {
                name: this.currentVoice.name,
                lang: this.currentVoice.lang,
                avatar: currentAvatar
            });
        }
    }

    updateVoiceSelector() {
        const voiceSelector = document.getElementById('voice-selector');
        if (!voiceSelector) return;

        voiceSelector.innerHTML = '';
        
        // Group voices by language
        const hindiVoices = this.voices.filter(voice => 
            voice.lang.includes('hi') || voice.name.toLowerCase().includes('hindi')
        );
        const englishVoices = this.voices.filter(voice => 
            voice.lang.includes('en-IN') || voice.lang.includes('en-US')
        );
        const assameseVoices = this.voices.filter(voice => 
            voice.lang.includes('as') || voice.name.toLowerCase().includes('assamese')
        );

        // Add Hindi voices
        if (hindiVoices.length > 0) {
            const hindiGroup = document.createElement('optgroup');
            hindiGroup.label = 'हिंदी (Hindi)';
            hindiVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.name === this.currentVoice?.name) {
                    option.selected = true;
                }
                hindiGroup.appendChild(option);
            });
            voiceSelector.appendChild(hindiGroup);
        }

        // Add English voices
        if (englishVoices.length > 0) {
            const englishGroup = document.createElement('optgroup');
            englishGroup.label = 'English';
            englishVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.name === this.currentVoice?.name) {
                    option.selected = true;
                }
                englishGroup.appendChild(option);
            });
            voiceSelector.appendChild(englishGroup);
        }

        // Add Assamese voices
        if (assameseVoices.length > 0) {
            const assameseGroup = document.createElement('optgroup');
            assameseGroup.label = 'অসমীয়া (Assamese)';
            assameseVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.name === this.currentVoice?.name) {
                    option.selected = true;
                }
                assameseGroup.appendChild(option);
            });
            voiceSelector.appendChild(assameseGroup);
        }

        // If no Assamese voices found, show a message
        if (assameseVoices.length === 0) {
            console.log('⚠️ No Assamese voices found. Consider installing Assamese language pack.');
            // Try to suggest installing Assamese voices
            this.suggestAssameseVoiceInstallation();
        }
    }

    suggestAssameseVoiceInstallation() {
        console.log('🔧 Suggesting Assamese voice installation...');
        
        // Check if we can detect any Indian voices that might work
        const indianVoices = this.voices.filter(voice => 
            voice.lang.includes('IN') && 
            (voice.name.toLowerCase().includes('hindi') || voice.name.toLowerCase().includes('bengali'))
        );
        
        if (indianVoices.length > 0) {
            console.log('✅ Found Indian voices that might work for Assamese:', indianVoices.map(v => v.name));
            // Use the first Indian voice as fallback for Assamese
            this.currentVoice = indianVoices[0];
            console.log('✅ Using Indian voice as Assamese fallback:', indianVoices[0].name);
        } else {
            console.log('⚠️ No suitable Indian voices found for Assamese fallback');
        }
    }

    getVoicesInfo() {
        return {
            total: this.voices.length,
            hindi: this.voices.filter(v => v.lang.includes('hi')).length,
            english: this.voices.filter(v => v.lang.includes('en')).length,
            assamese: this.voices.filter(v => v.lang.includes('as')).length,
            current: this.currentVoice?.name || 'None'
        };
    }

    checkAndSuggestLanguagePacks() {
        console.log('🔧 Checking available voices for language support...');
        
        const voiceInfo = this.getVoicesInfo();
        console.log('🔧 Voice availability:', voiceInfo);
        
        if (voiceInfo.hindi === 0) {
            console.log('⚠️ No Hindi voices found. Consider installing Hindi language pack.');
        }
        
        if (voiceInfo.assamese === 0) {
            console.log('⚠️ No Assamese voices found. Consider installing Assamese language pack.');
            console.log('💡 To install Assamese voices:');
            console.log('   1. Go to Windows Settings > Time & Language > Language');
            console.log('   2. Add Assamese (India) language');
            console.log('   3. Install language pack');
        }
        
        if (voiceInfo.total === 0) {
            console.error('❌ No voices available at all. Speech synthesis may not be supported.');
        }
        
        return voiceInfo;
    }

    // New method to get voice recommendations
    getVoiceRecommendations() {
        const recommendations = {
            missSapna: this.findBestVoiceForLanguage('hindi', 'female'),
            baruahSir: this.findBestVoiceForLanguage('assamese', 'male'),
            roySir: this.findBestVoiceForLanguage('english', 'male')
        };
        
        console.log('🔧 Voice recommendations:');
        console.log('   - Miss Sapna:', recommendations.missSapna?.name || 'Using fallback');
        console.log('   - Baruah Sir:', recommendations.baruahSir?.name || 'Using fallback');
        console.log('   - Roy Sir:', recommendations.roySir?.name || 'Using fallback');
        
        return recommendations;
    }
}

// Initialize TTS
const textToSpeech = new TextToSpeech();
window.textToSpeech = textToSpeech;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = textToSpeech;
}

console.log('✅ Text-to-Speech initialized successfully');

// Check language packs after initialization
setTimeout(() => {
    if (window.textToSpeech) {
        window.textToSpeech.checkAndSuggestLanguagePacks();
        window.textToSpeech.getVoiceRecommendations();
    }
}, 1000);

// Force voice update after a short delay to ensure avatar is loaded
setTimeout(() => {
    if (window.textToSpeech) {
        window.textToSpeech.forceVoiceUpdate();
    }
}, 2000); 

