// TextToSpeech.js - Enhanced TTS with voice management
if (typeof window.TextToSpeech === 'undefined' && typeof window.TextToSpeechClass === 'undefined') {
    window.TextToSpeechClass = class TextToSpeech {
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
            this._queuedSpeakText = null; // Queue text if voices not ready
            
            this.initializeVoices();
            this.setupControls();
            this.loadSettings();
        }

        initializeVoices() {
            console.log('🔧 TTS: Initializing voices...');
            
            // Force immediate voice loading with aggressive approach
            this.loadVoices();
            
            // Try multiple immediate loads to force browser voice cache
            for (let i = 0; i < 3; i++) {
                setTimeout(() => this.loadVoices(), i * 10);
            }
            
            // Voices might load asynchronously
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => {
                    console.log('🔧 TTS: Voices changed, reloading...');
                    this.loadVoices();
                };
            }
            
            // Force load voices with faster retries for immediate response
            setTimeout(() => {
                if (this.voices.length === 0) {
                    console.log('🔧 TTS: Fast retry 1 - forcing voice reload...');
                    this.loadVoices();
                }
            }, 100); // Reduced from 500ms to 100ms
            
            setTimeout(() => {
                if (this.voices.length === 0) {
                    console.log('🔧 TTS: Fast retry 2 - forcing voice reload...');
                    this.loadVoices();
                }
            }, 250); // Reduced from 1000ms to 250ms
            
            setTimeout(() => {
                if (this.voices.length === 0) {
                    console.log('🔧 TTS: Fast retry 3 - forcing voice reload...');
                    this.loadVoices();
                }
            }, 500); // Reduced from 2000ms to 500ms
        }

        // Load available voices with fallback
        loadVoices() {
            console.log('🔧 TTS: Loading voices...');
            
            try {
                // Get available voices
                const voices = window.speechSynthesis.getVoices();
                console.log('🔧 TTS: Loaded voices:', voices.length);
                
                if (voices.length === 0) {
                    console.log('⚠️ TTS: No voices available, speech synthesis may not be supported');
                    console.log('💡 This is common on mobile browsers. TTS will be disabled.');
                    this.voices = [];
                    this.voice = null;
                    
                    // Show user-friendly message
                    if (window.isMobile) {
                        console.log('📱 Mobile device detected - TTS may be limited');
                        // You can add a UI notification here if needed
                    }
                    return;
                }
                
                // Store voices for later use
                this.voices = voices;
                
                // Try to find Indian English Male voices for Roy Sir
                let indianEnglishMaleVoices = voices.filter(voice => 
                    voice.lang === 'en-IN' && voice.name.toLowerCase().includes('male')
                );
                console.log('🔧 TTS: Indian English Male voices for Roy Sir:', indianEnglishMaleVoices.length);
                
                // If no Indian English Male voices, try any Indian English voice
                if (indianEnglishMaleVoices.length === 0) {
                    indianEnglishMaleVoices = voices.filter(voice => voice.lang === 'en-IN');
                    console.log('🔧 TTS: Indian English voices (any gender):', indianEnglishMaleVoices.length);
                }
                
                // If still no Indian English voices, try any English voice
                if (indianEnglishMaleVoices.length === 0) {
                    indianEnglishMaleVoices = voices.filter(voice => voice.lang.startsWith('en-'));
                    console.log('🔧 TTS: Any English voices:', indianEnglishMaleVoices.length);
                }
                
                // Final fallback: use any available voice
                if (indianEnglishMaleVoices.length === 0 && voices.length > 0) {
                    indianEnglishMaleVoices = [voices[0]];
                    console.log('🔧 TTS: Using fallback voice:', voices[0].name);
                }
                
                // Set the voice
                if (indianEnglishMaleVoices.length > 0) {
                    this.voice = indianEnglishMaleVoices[0];
                    console.log('✅ TTS: Voice set to:', this.voice.name, this.voice.lang);
                } else {
                    console.log('⚠️ TTS: No suitable voices found, TTS will use default voice');
                    this.voice = null;
                }
                
            } catch (error) {
                console.error('❌ TTS: Error loading voices:', error);
                this.voice = null;
            }
            
            // Set up voice change listener for mobile devices
            if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged) {
                window.speechSynthesis.onvoiceschanged = () => {
                    console.log('🔧 TTS: Voices changed, reloading...');
                    this.loadVoices();
                };
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
                // OPTIMIZED: Skip user interaction check for immediate TTS
                // Modern browsers allow TTS without user interaction for AI responses
                if (typeof window !== 'undefined' && !window.userHasInteracted) {
                    console.log('[TTS] Attempting immediate TTS without waiting for interaction');
                    // Try immediate TTS, fallback to queue if blocked
                    try {
                        this.synth.resume();
                        window.userHasInteracted = true; // Mark as interacted to prevent future delays
                    } catch (error) {
                        console.log('[TTS] Immediate TTS failed, using fallback:', error);
                    }
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

            // Ensure voices are loaded; if not, queue and retry when available
            if (!this.voices || this.voices.length === 0) {
                console.log('🔧 TTS: Voices not ready, queuing speak and retrying...');
                this._queuedSpeakText = { text, options };
                const retry = () => {
                    try { this.loadVoices(); } catch (_) {}
                    const q = this._queuedSpeakText; this._queuedSpeakText = null;
                    if (q) {
                        this.speak(q.text, q.options);
                    }
                };
                if (typeof this.synth.onvoiceschanged !== 'function' || this.synth.onvoiceschanged === null) {
                    this.synth.onvoiceschanged = retry;
                }
                // Fast fallback timeout for immediate response
                setTimeout(() => {
                    if (this.voices.length === 0) retry();
                }, 100); // Reduced from 700ms to 100ms for immediate response
                return;
            }

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

            // Some devices require resume before speak
            try { if (this.synth.paused) this.synth.resume(); } catch (_) {}
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
                // Fast English voice selection for Roy Sir - prioritize Microsoft Ravi (male)
                let englishVoice = this.voices.find(voice =>
                    voice.name.toLowerCase().includes('ravi') && 
                    voice.lang.includes('en-IN')
                ) || this.voices.find(voice =>
                    voice.name.toLowerCase().includes('heera') && 
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
            
            // If no voices available, return null immediately
            if (!this.voices || this.voices.length === 0) {
                console.log(`⚠️ No voices available for ${language}`);
                return null;
            }
            
            // Priority order for voice selection
            const priorities = {
                'hindi': [
                    { lang: 'hi-IN', gender: 'female' },
                    { lang: 'hi', gender: 'female' },
                    { lang: 'IN', gender: 'female' },
                    { lang: 'IN', gender: 'any' },
                    { lang: 'any', gender: 'any' } // Final fallback
                ],
                'assamese': [
                    { lang: 'as-IN', gender: 'male' },
                    { lang: 'as', gender: 'male' },
                    { lang: 'hi-IN', gender: 'male' }, // Hindi as fallback
                    { lang: 'bn-IN', gender: 'male' }, // Bengali as fallback
                    { lang: 'IN', gender: 'male' },
                    { lang: 'IN', gender: 'any' },
                    { lang: 'any', gender: 'any' } // Final fallback
                ],
                'english': [
                    // Try Google's natural-sounding Indian English voices first
                    { lang: 'en-IN', gender: 'male', priority: 'google' },
                    { lang: 'en-IN', gender: 'male' },
                    { lang: 'en-IN', gender: 'any' },
                    // Fallback to other English voices
                    { lang: 'en-US', gender: 'male' },
                    { lang: 'en-GB', gender: 'male' },
                    { lang: 'en', gender: 'male' },
                    { lang: 'en', gender: 'any' },
                    { lang: 'any', gender: 'any' } // Final fallback
                ]
            };

            const languagePriorities = priorities[language] || [];
            
            for (const priority of languagePriorities) {
                const matchingVoices = this.voices.filter(voice => {
                    // For 'any' language, accept any voice
                    const langMatch = priority.lang === 'any' || voice.lang.includes(priority.lang);
                    const genderMatch = priority.gender === 'any' || 
                        (priority.gender === 'male' && (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('ravi') || voice.name.toLowerCase().includes('david') || voice.name.toLowerCase().includes('james'))) ||
                        (priority.gender === 'female' && (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('heera') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('sarah')));
                    
                    return langMatch && genderMatch;
                });
                
                if (matchingVoices.length > 0) {
                    console.log(`✅ Found ${matchingVoices.length} voices for ${language} (${priority.lang}, ${priority.gender})`);
                    
                    // For English male voices, prioritize Google's natural-sounding voices
                    if (language === 'english' && priority.gender === 'male') {
                        // Look for Google's natural-sounding Indian English voices
                        const googleVoice = matchingVoices.find(voice => 
                            voice.name.toLowerCase().includes('google') || 
                            voice.name.toLowerCase().includes('natural') ||
                            voice.name.toLowerCase().includes('premium') ||
                            voice.name.toLowerCase().includes('enhanced')
                        );
                        
                        if (googleVoice) {
                            console.log(`🎯 Found Google natural voice: ${googleVoice.name}`);
                            return googleVoice;
                        }
                        
                        // Look for voices that don't sound mechanical (avoid Microsoft Ravi)
                        const naturalVoice = matchingVoices.find(voice => 
                            !voice.name.toLowerCase().includes('microsoft') &&
                            !voice.name.toLowerCase().includes('ravi') &&
                            (voice.name.toLowerCase().includes('google') || 
                             voice.name.toLowerCase().includes('natural') ||
                             voice.name.toLowerCase().includes('premium'))
                        );
                        
                        if (naturalVoice) {
                            console.log(`🎯 Found natural-sounding voice: ${naturalVoice.name}`);
                            return naturalVoice;
                        }
                    }
                    
                    return matchingVoices[0]; // Return the first matching voice
                }
            }
            
            // If no specific voice found, return the first available voice as ultimate fallback
            if (this.voices.length > 0) {
                console.log(`⚠️ Using fallback voice for ${language}: ${this.voices[0].name}`);
                return this.voices[0];
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
            
            // Special handling for Roy Sir to ensure male voice
            if (currentAvatar === 'roy-sir' && this.currentVoice) {
                // Check if current voice is female, if so, try to find a male voice
                if (this.currentVoice.name.toLowerCase().includes('female') || 
                    this.currentVoice.name.toLowerCase().includes('heera') ||
                    this.currentVoice.name.toLowerCase().includes('zira')) {
                    
                    console.log('🔧 Roy Sir detected female voice, searching for male voice...');
                    
                    // Try to find Microsoft Ravi specifically
                    const raviVoice = this.voices.find(voice =>
                        voice.name.toLowerCase().includes('ravi') && 
                        voice.lang.includes('en-IN')
                    );
                    
                    if (raviVoice) {
                        this.currentVoice = raviVoice;
                        console.log('✅ Found and set Microsoft Ravi for Roy Sir');
                    } else {
                        // Fallback to any male English voice
                        const maleVoice = this.voices.find(voice =>
                            voice.lang.includes('en-IN') && 
                            (voice.name.toLowerCase().includes('ravi') || 
                             voice.name.toLowerCase().includes('david') ||
                             voice.name.toLowerCase().includes('james'))
                        );
                        
                        if (maleVoice) {
                            this.currentVoice = maleVoice;
                            console.log('✅ Found and set male voice for Roy Sir:', maleVoice.name);
                        }
                    }
                }
            }
            
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
                roySir: this.findBestVoiceForLanguage('english', 'male')
            };
            
            console.log('🔧 Voice recommendations:');
            console.log('   - Miss Sapna:', recommendations.missSapna?.name || 'Using fallback');
            console.log('   - Roy Sir:', recommendations.roySir?.name || 'Using fallback');
            
            // Debug: Show all available English voices
            const englishVoices = this.voices.filter(voice => 
                voice.lang.includes('en-IN') || voice.lang.includes('en-US') || voice.lang.includes('en-GB')
            );
            console.log('🔧 Available English voices:', englishVoices.map(v => `${v.name} (${v.lang})`));
            
            return recommendations;
        }
    }

    // Initialize TTS
    const textToSpeech = new window.TextToSpeechClass();
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
            
            // Automatically check for better Roy Sir voices
            console.log('🔍 Automatically checking for better Roy Sir voices...');
            const voices = window.textToSpeech.voices;
            
            // Find all Indian English male voices
            const indianEnglishMaleVoices = voices.filter(voice => 
                voice.lang.includes('en-IN') && 
                (voice.name.toLowerCase().includes('male') || 
                 voice.name.toLowerCase().includes('google') ||
                 voice.name.toLowerCase().includes('natural') ||
                 voice.name.toLowerCase().includes('premium'))
            );
            
            console.log('🎯 Available Indian English Male voices for Roy Sir:');
            indianEnglishMaleVoices.forEach((voice, index) => {
                console.log(`${index + 1}. ${voice.name} (${voice.lang})`);
            });
            
            // Show current voice being used
            const currentVoice = window.textToSpeech.currentVoice;
            console.log('🎤 Current voice for Roy Sir:', currentVoice?.name || 'None selected');
            
            // Suggest better alternatives if Microsoft Ravi is being used
            if (currentVoice && currentVoice.name.toLowerCase().includes('microsoft') && currentVoice.name.toLowerCase().includes('ravi')) {
                console.log('⚠️ Microsoft Ravi detected - this voice sounds mechanical');
                const betterVoices = indianEnglishMaleVoices.filter(voice => 
                    !voice.name.toLowerCase().includes('microsoft') && 
                    !voice.name.toLowerCase().includes('ravi')
                );
                if (betterVoices.length > 0) {
                    console.log('💡 Better alternatives available:');
                    betterVoices.slice(0, 3).forEach((voice, index) => {
                        console.log(`   ${index + 1}. ${voice.name} (${voice.lang})`);
                    });
                }
            }
        }
    }, 2000);

    // Function to find and test better voices for Roy Sir
    function findBetterRoySirVoice() {
        console.log('🔍 Finding better voices for Roy Sir...');
        
        if (!window.textToSpeech || !window.textToSpeech.voices) {
            console.log('❌ TTS not initialized');
            return;
        }
        
        const voices = window.textToSpeech.voices;
        
        // Find all Indian English male voices
        const indianEnglishMaleVoices = voices.filter(voice => 
            voice.lang.includes('en-IN') && 
            (voice.name.toLowerCase().includes('male') || 
             voice.name.toLowerCase().includes('google') ||
             voice.name.toLowerCase().includes('natural') ||
             voice.name.toLowerCase().includes('premium'))
        );
        
        console.log('🎯 Available Indian English Male voices:');
        indianEnglishMaleVoices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.lang})`);
        });
        
        // Test the first few voices
        const testVoices = indianEnglishMaleVoices.slice(0, 3);
        testVoices.forEach((voice, index) => {
            setTimeout(() => {
                console.log(`🎤 Testing voice ${index + 1}: ${voice.name}`);
                const utterance = new SpeechSynthesisUtterance("Hello, I am Roy Sir. How can I help you today?");
                utterance.voice = voice;
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                speechSynthesis.speak(utterance);
            }, (index + 1) * 3000); // Test each voice 3 seconds apart
        });
        
        return indianEnglishMaleVoices;
    }

    // Make the function globally available
    window.findBetterRoySirVoice = findBetterRoySirVoice; 
}

