class TextToSpeech {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.isSpeaking = false;
        this.language = 'hi-IN'; // Default to Hindi
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
        
        this.initializeVoices();
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
                englishGroup.appendChild(option);
            });
            voiceSelector.appendChild(englishGroup);
        }
    }

    // Speak text
    speak(text, options = {}) {
        if (!this.synth) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Stop any ongoing speech
        this.stop();

        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice and options
        utterance.voice = options.voice || this.currentVoice;
        utterance.rate = options.rate || this.rate;
        utterance.pitch = options.pitch || this.pitch;
        utterance.volume = options.volume || this.volume;
        
        // Auto-detect language if not specified
        if (!options.voice) {
            utterance.voice = this.detectLanguageAndSetVoice(text);
        }

        // Set up event handlers
        utterance.onstart = () => {
            this.isStarting = true;
            this.updateSpeechUI('speaking');
            console.log('Speech started');
        };

        utterance.onend = () => {
            this.isStarting = false;
            this.updateSpeechUI('stopped');
            console.log('Speech ended');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isStarting = false;
            this.updateSpeechUI('error');
        };

        // Start speaking
        this.synth.speak(utterance);
    }

    // Stop speaking
    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.updateSpeechUI('stopped');
        }
    }

    // Pause speaking
    pause() {
        if (this.synth) {
            this.synth.pause();
            this.updateSpeechUI('paused');
        }
    }

    // Resume speaking
    resume() {
        if (this.synth) {
            this.synth.resume();
            this.updateSpeechUI('speaking');
        }
    }

    // Detect language and set appropriate voice
    detectLanguageAndSetVoice(text) {
        // Simple language detection based on Unicode ranges
        const hindiPattern = /[\u0900-\u097F]/;
        const isHindi = hindiPattern.test(text);
        
        if (isHindi) {
            const hindiVoice = this.voices.find(voice => 
                voice.lang.includes('hi') || voice.name.toLowerCase().includes('hindi')
            );
            return hindiVoice || this.currentVoice;
        } else {
            const englishVoice = this.voices.find(voice => 
                voice.lang.includes('en-IN')
            );
            return englishVoice || this.currentVoice;
        }
    }

    // Set voice by name
    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.currentVoice = voice;
        }
    }

    // Set speech rate
    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(10, rate));
    }

    // Set speech pitch
    setPitch(pitch) {
        this.pitch = Math.max(0, Math.min(2, pitch));
    }

    // Set speech volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Update UI based on speech status
    updateSpeechUI(status) {
        const speakButton = document.getElementById('speak-button');
        const speechStatus = document.getElementById('speech-status');
        
        if (!speakButton) return;

        switch (status) {
            case 'speaking':
                speakButton.classList.add('speaking');
                speakButton.innerHTML = `
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                    <span class="ml-2">Speaking...</span>
                `;
                if (speechStatus) speechStatus.textContent = 'बोल रहा हूं... / Speaking...';
                break;
                
            case 'stopped':
                speakButton.classList.remove('speaking');
                speakButton.innerHTML = `
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    </svg>
                    <span class="ml-2">Speak</span>
                `;
                if (speechStatus) speechStatus.textContent = '';
                break;
                
            case 'paused':
                if (speechStatus) speechStatus.textContent = 'रुका हुआ / Paused';
                break;
                
            case 'error':
                speakButton.classList.remove('speaking');
                if (speechStatus) speechStatus.textContent = 'Error in speech';
                break;
        }
    }

    // Get available voices info
    getVoicesInfo() {
        return this.voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            default: voice.default,
            localService: voice.localService
        }));
    }
}

// Initialize text-to-speech
const textToSpeech = new TextToSpeech();
window.textToSpeech = textToSpeech; 