// Completely Rewritten Mic System (STT)
// Simple, reliable speech-to-text without repetition

class MicSystem {
    constructor() {
        this.isListening = false;
        this.isLongPress = false;
        this.init();
    }

    init() {
        console.log('🎤 Initializing Simple Mic System...');
        
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('❌ Speech recognition not supported');
            return;
        }
        
        console.log('✅ Mic System initialized');
    }

    // Create a new recognition instance each time
    createRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Simple settings - NO interim results
        recognition.continuous = false;
        recognition.interimResults = false; // CRITICAL: Only final results
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        return recognition;
    }

    // Start recording (short press)
    startRecording() {
        if (this.isListening) {
            console.log('🎤 Already listening');
            return;
        }

        console.log('🎤 Starting recording...');
        this.isListening = true;
        this.updateMicButton(true);
        
        // Clear input fields
        this.updateInputField('');
        
        // Create new recognition instance
        const recognition = this.createRecognition();
        
        // Set up event handlers
        recognition.onstart = () => {
            console.log('🎤 Speech recognition started');
        };

        recognition.onresult = (event) => {
            console.log('🎤 Final result received');
            
            // Get the final transcript
            const transcript = event.results[0][0].transcript;
            console.log('📝 Transcript:', transcript);
            
            // Update input field
            this.updateInputField(transcript);
            
            // Send the transcript
            this.sendTranscript(transcript);
        };

        recognition.onerror = (event) => {
            console.error('🎤 Speech recognition error:', event.error);
            this.isListening = false;
            this.updateMicButton(false);
        };

        recognition.onend = () => {
            console.log('🎤 Speech recognition ended');
            this.isListening = false;
            this.updateMicButton(false);
        };
        
        // Start recognition
        try {
            recognition.start();
        } catch (error) {
            console.error('❌ Error starting speech recognition:', error);
            this.isListening = false;
            this.updateMicButton(false);
        }
    }

    // Stop recording
    stopRecording() {
        if (!this.isListening) {
            console.log('🎤 Not currently listening');
            return;
        }

        console.log('🎤 Stopping recording');
        this.isListening = false;
        this.updateMicButton(false);
    }

    // Setup long press functionality
    setupLongPress(micButton) {
        if (!micButton) return;

        let pressTimer = null;
        const longPressDelay = 500;

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
    sendTranscript(transcript) {
        if (!transcript || !transcript.trim()) {
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
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    // Get current status
    getStatus() {
        return {
            isListening: this.isListening,
            isAvailable: this.isAvailable()
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
