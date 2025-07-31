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
        
        // Find Hindi and English voices
        const hindiVoices = this.voices.filter(voice => 
            voice.lang.includes('hi') || voice.lang.includes('IN')
        );
        const englishVoices = this.voices.filter(voice => 
            voice.lang.includes('en-IN') || voice.lang.includes('en-US')
        );

        // Set default voice
        if (hindiVoices.length > 0) {
            this.currentVoice = hindiVoices[0];
        } else if (englishVoices.length > 0) {
            this.currentVoice = englishVoices[0];
        } else if (this.voices.length > 0) {
            this.currentVoice = this.voices[0];
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
        // Check if controls already exist
        if (document.getElementById('tts-controls')) return;

        // Find the avatar section in chat
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        // Create TTS controls container
        const ttsControls = document.createElement('div');
        ttsControls.id = 'tts-controls';
        ttsControls.className = 'tts-controls flex items-center justify-center gap-2 mt-4 p-3 bg-gray-800 rounded-lg';
        ttsControls.style.display = 'none'; // Hidden by default

        ttsControls.innerHTML = `
            <button id="tts-play" class="tts-btn bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors">
                ▶️ Play
            </button>
            <button id="tts-pause" class="tts-btn bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg transition-colors" style="display: none;">
                ⏸️ Pause
            </button>
            <button id="tts-stop" class="tts-btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors">
                ⏹️ Stop
            </button>
            <div class="tts-status text-white text-sm ml-2">
                Ready
            </div>
        `;

        // Insert after the last AI message or at the end of chat
        chatMessages.appendChild(ttsControls);
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
    }

    loadSettings() {
        // Load TTS settings from localStorage
        const settings = localStorage.getItem('tts-settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.autoStart = parsed.autoStart !== undefined ? parsed.autoStart : true;
            this.rate = parsed.rate || 1.0;
            this.pitch = parsed.pitch || 1.0;
            this.volume = parsed.volume || 1.0;
            this.language = parsed.language || 'hi-IN';
        }
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

        this.currentText = text;
        this.pausedAt = 0;
        this.isPaused = false;

        // Create utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Set properties
        this.currentUtterance.voice = this.currentVoice;
        this.currentUtterance.rate = this.rate;
        this.currentUtterance.pitch = this.pitch;
        this.currentUtterance.volume = this.volume;
        this.currentUtterance.lang = this.detectLanguageAndSetVoice(text);

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
            // Resume from where it was paused
            this.synth.resume();
        } else if (this.currentText && !this.isSpeaking) {
            // Start speaking the current text from beginning
            this.speak(this.currentText, { role: 'ai' });
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
    }

    detectLanguageAndSetVoice(text) {
        // Simple language detection
        const hindiPattern = /[\u0900-\u097F]/;
        const isHindi = hindiPattern.test(text);
        
        const targetLang = isHindi ? 'hi-IN' : 'en-IN';
        
        // Find appropriate voice
        const targetVoices = this.voices.filter(voice => 
            voice.lang.includes(targetLang) || 
            (isHindi && voice.lang.includes('hi')) ||
            (!isHindi && voice.lang.includes('en'))
        );
        
        if (targetVoices.length > 0) {
            this.currentVoice = targetVoices[0];
        }
        
        return targetLang;
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
