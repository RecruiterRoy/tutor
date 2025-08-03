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
        // Load voices
        this.loadVoices();
        
        // Voices might load asynchronously
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
        
        // Set voice based on current avatar
        if (this.voices.length > 0) {
            this.detectLanguageAndSetVoice('');
        }

        // Update voice selector UI
        this.updateVoiceSelector();
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

        // Only speak AI responses
        if (options.role !== 'ai' && this.autoStart) {
            return; // Don't auto-speak user messages
        }

        // Stop any ongoing speech
        this.stop();

        // Update current AI response tracking
        if (options.role === 'ai') {
            this.currentAIResponse = text;
        }

        this.currentText = text;
        this.pausedAt = 0;
        this.isPaused = false;

        // Set voice based on avatar BEFORE creating utterance
        const language = this.detectLanguageAndSetVoice(text);
        
        // Create utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Set properties
        this.currentUtterance.voice = this.currentVoice;
        this.currentUtterance.rate = this.rate;
        this.currentUtterance.pitch = this.pitch;
        this.currentUtterance.volume = this.volume;
        this.currentUtterance.lang = language;

        // Event handlers
        this.currentUtterance.onstart = () => {
            this.isSpeaking = true;
            this.isPaused = false;
            this.updateControls();
            console.log('TTS started speaking');
        };

        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            this.isPaused = false;
            this.currentUtterance = null;
            this.lastSpokenResponse = this.currentAIResponse; // Mark this response as spoken
            this.updateControls();
            console.log('TTS finished speaking');
        };

        this.currentUtterance.onpause = () => {
            this.isPaused = true;
            this.updateControls();
            console.log('TTS paused');
        };

        this.currentUtterance.onresume = () => {
            this.isPaused = false;
            this.updateControls();
            console.log('TTS resumed');
        };

        this.currentUtterance.onerror = (event) => {
            console.error('TTS error:', event);
            this.isSpeaking = false;
            this.isPaused = false;
            this.updateControls();
        };

        // Start speaking
        this.synth.speak(this.currentUtterance);
        this.showControls();
        this.updateControls();
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
        const currentAvatar = window.selectedAvatar || 'roy-sir';
        console.log('TTS Voice Selection - Current Avatar:', currentAvatar);

        if (currentAvatar === 'ms-sapana') {
            // Simplified Hindi voice selection
            let hindiVoice = this.voices.find(voice =>
                voice.lang.includes('hi-IN') || voice.lang.includes('hi')
            );
            
            if (!hindiVoice) {
                hindiVoice = this.voices.find(voice =>
                    voice.lang.includes('IN')
                );
            }
            
            if (hindiVoice) {
                this.currentVoice = hindiVoice;
                console.log('✅ Ms. Sapana using Hindi voice:', hindiVoice.name);
                return 'hi-IN';
            } else {
                console.warn('❌ No Hindi voice found, using default');
                return 'hi-IN';
            }
        } else {
            // Simplified English voice selection
            let englishVoice = this.voices.find(voice =>
                voice.lang.includes('en-IN')
            );
            
            if (!englishVoice) {
                englishVoice = this.voices.find(voice =>
                    voice.lang.includes('en-US') || voice.lang.includes('en-GB')
                );
            }
            
            if (englishVoice) {
                this.currentVoice = englishVoice;
                console.log('✅ Roy Sir using English voice:', englishVoice.name);
                return 'en-IN';
            } else {
                console.warn('❌ No English voice found, using default');
                return 'en-IN';
            }
        }
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
        console.log('Forcing voice update for current avatar:', window.selectedAvatar);
        this.detectLanguageAndSetVoice('');
        console.log('Voice updated to:', this.currentVoice?.name || 'No voice selected');
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
    }

    getVoicesInfo() {
        return {
            total: this.voices.length,
            hindi: this.voices.filter(v => v.lang.includes('hi')).length,
            english: this.voices.filter(v => v.lang.includes('en')).length,
            current: this.currentVoice?.name || 'None'
        };
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

// Force voice update after a short delay to ensure avatar is loaded
setTimeout(() => {
    if (window.textToSpeech) {
        window.textToSpeech.forceVoiceUpdate();
    }
}, 2000); 
