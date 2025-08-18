// Fixed Mic System (STT)
// Prevents repeating sounds and garbled text issues

class MicSystem {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.isListening = false;
        this.currentTranscript = '';
        this.finalTranscript = '';
        this.silenceTimer = null;
        this.silenceTimeout = 4000; // 4 seconds of silence
        this.isLongPress = false;
        this.longPressTimer = null;
        this.init();
    }

    init() {
        console.log('🎤 Initializing Mic System...');
        
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('❌ Speech recognition not supported');
            return;
        }

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        // Set up event handlers
        this.setupEventHandlers();
        
        console.log('✅ Mic System initialized');
    }

    setupEventHandlers() {
        // Start event
        this.recognition.onstart = () => {
            console.log('🎤 Speech recognition started');
            this.isListening = true;
            this.currentTranscript = '';
            this.finalTranscript = '';
            this.updateMicButton(true);
        };

        // Result event - FIXED: Collect complete transcript properly
        this.recognition.onresult = (event) => {
            console.log('🎤 Speech result received');
            
            // FIXED: Only use the latest result to prevent repetition
            const lastResult = event.results[event.results.length - 1];
            const transcript = lastResult[0].transcript;
            
            if (lastResult.isFinal) {
                // Final result - add to final transcript
                this.finalTranscript = transcript;
                this.currentTranscript = transcript;
            } else {
                // Interim result - update current transcript
                this.currentTranscript = transcript;
            }
            
            // Update input field with current transcript
            this.updateInputField(this.currentTranscript);
            
            // Reset silence timer
            this.resetSilenceTimer();
        };

        // Error event
        this.recognition.onerror = (event) => {
            console.error('🎤 Speech recognition error:', event.error);
            this.isListening = false;
            this.updateMicButton(false);
            
            if (event.error === 'no-speech') {
                console.log('🎤 No speech detected');
            } else if (event.error === 'audio-capture') {
                console.error('🎤 Microphone not found');
            } else if (event.error === 'not-allowed') {
                console.error('🎤 Microphone permission denied');
            }
        };

        // End event
        this.recognition.onend = () => {
            console.log('🎤 Speech recognition ended');
            this.isListening = false;
            this.updateMicButton(false);
            
            // If we have a final transcript, send it
            if (this.finalTranscript.trim()) {
                this.sendTranscript();
            }
        };
    }

    // Start recording (short press)
    startRecording() {
        if (this.isListening) {
            console.log('🎤 Already listening');
            return;
        }

        console.log('🎤 Starting recording (short press)');
        this.isLongPress = false;
        
        // Clear all transcripts and input fields
        this.currentTranscript = '';
        this.finalTranscript = '';
        this.updateInputField('');
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('❌ Error starting speech recognition:', error);
        }
    }

    // Stop recording
    stopRecording() {
        if (!this.isListening) {
            console.log('🎤 Not currently listening');
            return;
        }

        console.log('🎤 Stopping recording');
        this.clearSilenceTimer();
        
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('❌ Error stopping speech recognition:', error);
        }
    }

    // Setup long press functionality
    setupLongPress(micButton) {
        if (!micButton) return;

        let pressTimer = null;
        const longPressDelay = 500; // 500ms for long press

        const handlePress = (e) => {
            e.preventDefault();
            console.log('🎤 Mic button pressed');
            
            this.isLongPress = false;
            pressTimer = setTimeout(() => {
                this.isLongPress = true;
                console.log('🎤 Long press detected');
            }, longPressDelay);
        };

        const handleRelease = (e) => {
            e.preventDefault();
            console.log('🎤 Mic button released');
            
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }

            if (this.isLongPress) {
                // Long press: stop recording
                this.stopRecording();
            } else {
                // Short press: start recording
                this.startRecording();
            }
        };

        // Remove existing listeners
        micButton.removeEventListener('touchstart', handlePress);
        micButton.removeEventListener('touchend', handleRelease);
        micButton.removeEventListener('mousedown', handlePress);
        micButton.removeEventListener('mouseup', handleRelease);

        // Add new listeners
        micButton.addEventListener('touchstart', handlePress, { passive: false });
        micButton.addEventListener('touchend', handleRelease, { passive: false });
        micButton.addEventListener('mousedown', handlePress, { passive: false });
        micButton.addEventListener('mouseup', handleRelease, { passive: false });

        console.log('✅ Long press setup complete');
    }

    // Reset silence timer
    resetSilenceTimer() {
        this.clearSilenceTimer();
        
        this.silenceTimer = setTimeout(() => {
            console.log('🎤 Silence detected, stopping recording');
            this.stopRecording();
        }, this.silenceTimeout);
    }

    // Clear silence timer
    clearSilenceTimer() {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    }

    // Update input field with transcript
    updateInputField(transcript) {
        // Update desktop input
        const desktopInput = document.getElementById('chatInput');
        if (desktopInput) {
            desktopInput.value = transcript;
        }

        // Update mobile input
        const mobileInput = document.getElementById('chatInputMobile');
        if (mobileInput) {
            mobileInput.value = transcript;
        }

        console.log('📝 Updated input field:', transcript);
    }

    // Send transcript to chat
    sendTranscript() {
        const transcript = this.finalTranscript.trim();
        if (!transcript) {
            console.log('🎤 No transcript to send');
            return;
        }

        console.log('📤 Sending transcript:', transcript);

        // Clear input fields
        this.updateInputField('');

        // Send message using existing chat system
        if (typeof window.sendMessage === 'function') {
            window.sendMessage(transcript);
        } else if (typeof window.gptService?.sendMessage === 'function') {
            window.gptService.sendMessage(transcript);
        } else {
            console.error('❌ No sendMessage function available');
        }
    }

    // Update mic button appearance
    updateMicButton(isRecording) {
        const voiceButton = document.getElementById('voiceButton');
        const voiceIcon = document.getElementById('voiceIcon');
        
        if (voiceButton && voiceIcon) {
            if (isRecording) {
                voiceButton.classList.add('bg-red-500', 'animate-pulse');
                voiceButton.classList.remove('bg-gray-700/50');
                voiceIcon.textContent = '🔴';
            } else {
                voiceButton.classList.remove('bg-red-500', 'animate-pulse');
                voiceButton.classList.add('bg-gray-700/50');
                voiceIcon.textContent = 'Mic';
            }
        }
    }

    // Request microphone permission
    async requestPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('✅ Microphone permission granted');
            return true;
        } catch (error) {
            console.error('❌ Microphone permission denied:', error);
            return false;
        }
    }

    // Check if microphone is available
    isAvailable() {
        return this.recognition !== null;
    }

    // Get current status
    getStatus() {
        return {
            isListening: this.isListening,
            isRecording: this.isRecording,
            currentTranscript: this.currentTranscript,
            finalTranscript: this.finalTranscript
        };
    }
}

// Initialize mic system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.micSystem = new MicSystem();
    
    // Setup mic button if available
    const micButton = document.getElementById('voiceButton');
    if (micButton && window.micSystem) {
        window.micSystem.setupLongPress(micButton);
    }
});

// Make functions globally available
window.MicSystem = MicSystem;
