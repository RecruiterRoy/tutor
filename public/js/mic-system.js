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
        
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Mobile-optimized settings
        recognition.continuous = false;
        recognition.interimResults = false; // CRITICAL: Only final results
        recognition.lang = isMobile ? 'en-IN' : 'en-US'; // Use Indian English for better mobile recognition
        recognition.maxAlternatives = 1;
        
        // Mobile-specific optimizations
        if (isMobile) {
            // Shorter timeout for mobile
            recognition.grammars = null; // Clear any grammars for mobile
        }
        
        console.log(`🎤 Created recognition for ${isMobile ? 'mobile' : 'desktop'} with lang: ${recognition.lang}`);
        
        return recognition;
    }

    // Start recording (short press)
    async startRecording() {
        if (this.isListening) {
            console.log('🎤 Already listening');
            return;
        }

        console.log('🎤 Starting recording...');
        
        // Request permission first
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            console.error('❌ Microphone permission denied');
            alert('Please allow microphone access to use speech-to-text feature.');
            return;
        }
        
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
            console.log('🎤 Speech result received, processing...');
            
            // Process only final results to avoid repetition
            let finalTranscript = '';
            
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            // Only process if we have a final result
            if (finalTranscript.trim()) {
                console.log('📝 Final transcript:', finalTranscript);
                
                // Clean up the transcript (remove extra spaces, duplicates)
                const cleanedTranscript = this.cleanTranscript(finalTranscript);
                console.log('🧹 Cleaned transcript:', cleanedTranscript);
                
                // Update input field
                this.updateInputField(cleanedTranscript);
                
                // Send the transcript
                this.sendTranscript(cleanedTranscript);
            } else {
                console.log('⏳ No final result yet, waiting...');
            }
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

    // Setup long press functionality for mic button
    setupLongPress(micButton) {
        if (!micButton) {
            console.log('⚠️ Mic button not found, skipping long press setup');
            return;
        }
        
        console.log('🔧 Setting up long press for mic button...');
        
        let pressTimer = null;
        let recordingStarted = false;
        let pressStartTime = 0;
        
        const handlePress = (e) => {
            e.preventDefault();
            pressStartTime = Date.now();
            console.log('🎤 Press detected');
            
            pressTimer = setTimeout(() => {
                console.log('🎤 Long press detected - starting recording');
                recordingStarted = true;
                this.startRecording();
            }, 500);
        };
        
        const handleRelease = (e) => {
            e.preventDefault();
            const pressDuration = Date.now() - pressStartTime;
            
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            
            if (pressDuration > 500 && recordingStarted) {
                // Long press - stop recording
                console.log('🎤 Long press release - stopping recording');
                this.stopRecording();
                recordingStarted = false;
            } else if (recordingStarted) {
                // Short press - switch to short press mode
                console.log('🎤 Short press - switching to short press mode');
            }
        };
        
        // Safe event listener removal
        const safeRemoveEventListener = (element, event, handler) => {
            if (element && typeof element.removeEventListener === 'function') {
                try {
                    element.removeEventListener(event, handler);
                } catch (error) {
                    console.log('⚠️ Error removing event listener:', error);
                }
            }
        };
        
        // Safe event listener addition
        const safeAddEventListener = (element, event, handler, options) => {
            if (element && typeof element.addEventListener === 'function') {
                try {
                    element.addEventListener(event, handler, options);
                } catch (error) {
                    console.log('⚠️ Error adding event listener:', error);
                }
            }
        };
        
        // Remove any existing listeners safely
        safeRemoveEventListener(micButton, 'touchstart', handlePress);
        safeRemoveEventListener(micButton, 'touchend', handleRelease);
        safeRemoveEventListener(micButton, 'mousedown', handlePress);
        safeRemoveEventListener(micButton, 'mouseup', handleRelease);
        
        // Add new listeners safely
        safeAddEventListener(micButton, 'touchstart', handlePress, { passive: false });
        safeAddEventListener(micButton, 'touchend', handleRelease, { passive: false });
        safeAddEventListener(micButton, 'mousedown', handlePress, { passive: false });
        safeAddEventListener(micButton, 'mouseup', handleRelease, { passive: false });

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

    // Update mic button appearance for both desktop and mobile
    updateMicButton(isRecording) {
        // Desktop button
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
        
        // Mobile button
        const voiceButtonMobile = document.getElementById('voiceButtonMobile');
        const voiceIconMobile = document.getElementById('voiceIconMobile');
        
        if (voiceButtonMobile && voiceIconMobile) {
            if (isRecording) {
                voiceButtonMobile.classList.add('bg-red-500', 'animate-pulse');
                voiceButtonMobile.classList.remove('bg-purple-600');
                voiceIconMobile.textContent = '🔴';
            } else {
                voiceButtonMobile.classList.remove('bg-red-500', 'animate-pulse');
                voiceButtonMobile.classList.add('bg-purple-600');
                voiceIconMobile.textContent = '🎤';
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

    // Clean transcript to remove repetitions and fix common issues
    cleanTranscript(transcript) {
        if (!transcript || typeof transcript !== 'string') {
            return '';
        }
        
        // Remove extra whitespace and normalize
        let cleaned = transcript.trim().toLowerCase();
        
        // Split into words
        const words = cleaned.split(/\s+/);
        const cleanedWords = [];
        
        // Remove consecutive duplicate words
        let lastWord = '';
        for (const word of words) {
            if (word !== lastWord && word.length > 0) {
                cleanedWords.push(word);
                lastWord = word;
            }
        }
        
        // Join back and capitalize first letter
        const result = cleanedWords.join(' ');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    // Get current status
    getStatus() {
        return {
            isListening: this.isListening,
            isAvailable: this.isAvailable()
        };
    }
}

// Initialize mic system when DOM is ready (singleton pattern)
document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple instances
    if (window.micSystem) {
        console.log('🎤 Mic system already initialized');
        return;
    }
    
    console.log('🎤 Initializing new mic system...');
    window.micSystem = new MicSystem();
    
    // Setup both desktop and mobile mic buttons
    const setupMicButtons = () => {
        const desktopMicButton = document.getElementById('voiceButton');
        const mobileMicButton = document.getElementById('voiceButtonMobile');
        
        let setupCount = 0;
        
        if (desktopMicButton && window.micSystem) {
            window.micSystem.setupLongPress(desktopMicButton);
            console.log('✅ Desktop mic button setup complete');
            setupCount++;
        }
        
        if (mobileMicButton && window.micSystem) {
            window.micSystem.setupLongPress(mobileMicButton);
            console.log('✅ Mobile mic button setup complete');
            setupCount++;
        }
        
        if (setupCount === 0) {
            console.log('⚠️ No voice buttons found, will retry...');
            // Retry after a delay
            setTimeout(() => {
                setupMicButtons();
            }, 1000);
        } else {
            console.log(`✅ ${setupCount} mic button(s) setup complete`);
        }
    };
    
    setupMicButtons();
});

// Make functions globally available
window.MicSystem = MicSystem;
