// Voice Commands System
// "Hey Tutor, start math lesson" - Hands-free learning

class VoiceCommands {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        this.wakeWord = 'hey tutor';
        this.commands = this.setupCommands();
        this.continuousMode = false;
        
        this.init();
    }

    init() {
        if (!this.isSupported) {
            console.log('❌ Speech recognition not supported');
            return;
        }

        // DISABLED: Using new mic-system.js instead
        console.log('🎤 Voice commands disabled - using new mic system');
        // this.setupSpeechRecognition();
        // this.setupWakeWordDetection();
        // this.loadSettings();
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            console.log('🎤 Voice recognition started');
            this.isListening = true;
            this.updateUI();
        };
        
        this.recognition.onend = () => {
            console.log('🎤 Voice recognition ended');
            this.isListening = false;
            this.updateUI();
            
            // Restart if in continuous mode
            if (this.continuousMode) {
                setTimeout(() => {
                    this.startListening();
                }, 1000);
            }
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error);
            this.handleError(event.error);
        };
    }

    setupWakeWordDetection() {
        // Simple wake word detection
        this.wakeWordDetected = false;
    }

    setupCommands() {
        return {
            // Learning commands
            'start math lesson': {
                action: () => this.startSubjectLesson('mathematics'),
                description: 'Start a mathematics lesson',
                examples: ['start math lesson', 'begin math', 'teach me math']
            },
            'start science lesson': {
                action: () => this.startSubjectLesson('science'),
                description: 'Start a science lesson',
                examples: ['start science lesson', 'begin science', 'teach me science']
            },
            'start english lesson': {
                action: () => this.startSubjectLesson('english'),
                description: 'Start an English lesson',
                examples: ['start english lesson', 'begin english', 'teach me english']
            },
            'start hindi lesson': {
                action: () => this.startSubjectLesson('hindi'),
                description: 'Start a Hindi lesson',
                examples: ['start hindi lesson', 'begin hindi', 'teach me hindi']
            },
            'start social studies lesson': {
                action: () => this.startSubjectLesson('social_studies'),
                description: 'Start a social studies lesson',
                examples: ['start social studies lesson', 'begin social studies', 'teach me social studies']
            },
            
            // Daily challenge commands
            'start daily challenge': {
                action: () => this.startDailyChallenge(),
                description: 'Start today\'s daily challenge',
                examples: ['start daily challenge', 'begin challenge', 'daily challenge']
            },
            'show my progress': {
                action: () => this.showProgress(),
                description: 'Show learning progress',
                examples: ['show my progress', 'check progress', 'how am I doing']
            },
            
            // Navigation commands
            'go to chat': {
                action: () => this.navigateToChat(),
                description: 'Navigate to chat section',
                examples: ['go to chat', 'open chat', 'chat section']
            },
            'go to progress': {
                action: () => this.navigateToProgress(),
                description: 'Navigate to progress section',
                examples: ['go to progress', 'show progress', 'progress section']
            },
            'go to settings': {
                action: () => this.navigateToSettings(),
                description: 'Navigate to settings',
                examples: ['go to settings', 'open settings', 'settings']
            },
            
            // Control commands
            'stop listening': {
                action: () => this.stopListening(),
                description: 'Stop voice recognition',
                examples: ['stop listening', 'stop voice', 'quiet']
            },
            'start listening': {
                action: () => this.startListening(),
                description: 'Start voice recognition',
                examples: ['start listening', 'listen to me', 'voice on']
            },
            'what can you do': {
                action: () => this.showHelp(),
                description: 'Show available voice commands',
                examples: ['what can you do', 'help', 'show commands']
            },
            
            // Study session commands
            'start study session': {
                action: () => this.startStudySession(),
                description: 'Start a focused study session',
                examples: ['start study session', 'begin studying', 'study mode']
            },
            'end study session': {
                action: () => this.endStudySession(),
                description: 'End current study session',
                examples: ['end study session', 'stop studying', 'study complete']
            },
            'take a break': {
                action: () => this.takeBreak(),
                description: 'Take a study break',
                examples: ['take a break', 'break time', 'pause studying']
            },
            
            // Video commands
            'show me a video': {
                action: () => this.showVideo(),
                description: 'Show educational video',
                examples: ['show me a video', 'play video', 'educational video']
            },
            'next video': {
                action: () => this.nextVideo(),
                description: 'Show next video',
                examples: ['next video', 'next lesson', 'another video']
            },
            
            // Quiz commands
            'start quiz': {
                action: () => this.startQuiz(),
                description: 'Start a quiz',
                examples: ['start quiz', 'begin quiz', 'test me']
            },
            'repeat question': {
                action: () => this.repeatQuestion(),
                description: 'Repeat the current question',
                examples: ['repeat question', 'say that again', 'what was the question']
            }
        };
    }

    handleSpeechResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Check for wake word
        if (finalTranscript.includes(this.wakeWord)) {
            this.wakeWordDetected = true;
            this.speak('Hello! I\'m listening. How can I help you?');
            return;
        }
        
        // Process commands if wake word was detected
        if (this.wakeWordDetected && finalTranscript) {
            this.processCommand(finalTranscript);
            this.wakeWordDetected = false;
        }
        
        // Update UI with interim results
        this.updateInterimResults(interimTranscript);
    }

    processCommand(transcript) {
        console.log('🎤 Processing command:', transcript);
        
        // Find matching command
        const command = this.findMatchingCommand(transcript);
        
        if (command) {
            this.speak(`Executing: ${command.description}`);
            command.action();
        } else {
            this.speak('I didn\'t understand that command. Say "what can you do" for help.');
        }
    }

    findMatchingCommand(transcript) {
        for (const [key, command] of Object.entries(this.commands)) {
            // Check exact match
            if (transcript.includes(key)) {
                return command;
            }
            
            // Check examples
            for (const example of command.examples) {
                if (transcript.includes(example)) {
                    return command;
                }
            }
        }
        
        return null;
    }

    // Command actions
    startSubjectLesson(subject) {
        const subjects = {
            'mathematics': 'math',
            'science': 'science',
            'english': 'English',
            'hindi': 'Hindi',
            'social_studies': 'social studies'
        };
        
        const subjectName = subjects[subject];
        this.speak(`Starting ${subjectName} lesson. Let me prepare the content for you.`);
        
        // Navigate to chat and start lesson
        setTimeout(() => {
            this.navigateToChat();
            
            setTimeout(() => {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value = `Start a ${subjectName} lesson for me.`;
                    chatInput.dispatchEvent(new Event('input'));
                    
                    const sendButton = document.getElementById('sendButton');
                    if (sendButton) {
                        sendButton.click();
                    }
                }
            }, 1000);
        }, 2000);
    }

    startDailyChallenge() {
        this.speak('Starting daily challenge. Let me load today\'s questions.');
        
        setTimeout(() => {
            const challengeBtn = document.getElementById('dailyChallengeBtn');
            if (challengeBtn) {
                challengeBtn.click();
            }
        }, 2000);
    }

    showProgress() {
        this.speak('Showing your learning progress.');
        
        setTimeout(() => {
            this.navigateToProgress();
        }, 1000);
    }

    navigateToChat() {
        const chatTab = document.querySelector('[data-section="chat"]');
        if (chatTab) {
            chatTab.click();
            this.speak('Navigated to chat section.');
        }
    }

    navigateToProgress() {
        const progressTab = document.querySelector('[data-section="progress"]');
        if (progressTab) {
            progressTab.click();
            this.speak('Navigated to progress section.');
        }
    }

    navigateToSettings() {
        const settingsTab = document.querySelector('[data-section="settings"]');
        if (settingsTab) {
            settingsTab.click();
            this.speak('Navigated to settings.');
        }
    }

    startListening() {
        if (!this.isListening) {
            this.startListening();
            this.speak('Voice recognition started. Say "Hey Tutor" to activate.');
        }
    }

    stopListening() {
        if (this.isListening) {
            this.recognition.stop();
            this.speak('Voice recognition stopped.');
        }
    }

    showHelp() {
        const helpText = 'Here are some things you can say: Start math lesson, show my progress, go to chat, start daily challenge, take a break, and more.';
        this.speak(helpText);
        
        // Show help modal
        this.showHelpModal();
    }

    startStudySession() {
        this.speak('Starting focused study session. I\'ll track your progress and remind you to take breaks.');
        
        // Mark study start
        if (window.smartNotifications) {
            window.smartNotifications.markStudyStart();
        }
        
        // Start session timer
        this.startSessionTimer();
    }

    endStudySession() {
        this.speak('Ending study session. Great work!');
        
        // Mark study end
        if (window.smartNotifications) {
            window.smartNotifications.markStudyEnd();
        }
        
        // Stop session timer
        this.stopSessionTimer();
    }

    takeBreak() {
        this.speak('Taking a break. Remember to stretch and rest your eyes.');
        
        // Show break modal
        if (window.smartNotifications) {
            window.smartNotifications.showBreakModal();
        }
    }

    showVideo() {
        this.speak('Showing educational video. Let me find a relevant video for you.');
        
        // Trigger video search
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = 'Show me an educational video related to my current subject.';
                chatInput.dispatchEvent(new Event('input'));
                
                const sendButton = document.getElementById('sendButton');
                if (sendButton) {
                    sendButton.click();
                }
            }
        }, 2000);
    }

    nextVideo() {
        this.speak('Loading next video for you.');
        
        // Trigger next video
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = 'Show me the next educational video.';
                chatInput.dispatchEvent(new Event('input'));
                
                const sendButton = document.getElementById('sendButton');
                if (sendButton) {
                    sendButton.click();
                }
            }
        }, 1000);
    }

    startQuiz() {
        this.speak('Starting quiz. Get ready to test your knowledge!');
        
        // Start quiz
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = 'Start a quiz to test my knowledge.';
                chatInput.dispatchEvent(new Event('input'));
                
                const sendButton = document.getElementById('sendButton');
                if (sendButton) {
                    sendButton.click();
                }
            }
        }, 2000);
    }

    repeatQuestion() {
        this.speak('Repeating the current question.');
        
        // Repeat last question
        const lastQuestion = localStorage.getItem('lastQuestion');
        if (lastQuestion) {
            this.speak(lastQuestion);
        } else {
            this.speak('No question to repeat. Start a quiz first.');
        }
    }

    // Utility methods
    speak(text) {
        if (this.synthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            this.synthesis.speak(utterance);
        }
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    handleError(error) {
        let message = 'Voice recognition error occurred.';
        
        switch (error) {
            case 'no-speech':
                message = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                message = 'Audio capture error. Please check your microphone.';
                break;
            case 'not-allowed':
                message = 'Microphone access denied. Please allow microphone access.';
                break;
            case 'network':
                message = 'Network error. Please check your connection.';
                break;
        }
        
        this.speak(message);
    }

    updateUI() {
        const voiceButton = document.getElementById('voiceCommandBtn');
        if (voiceButton) {
            if (this.isListening) {
                voiceButton.classList.add('listening');
                voiceButton.innerHTML = '🎤 Listening...';
            } else {
                voiceButton.classList.remove('listening');
                voiceButton.innerHTML = '🎤 Voice';
            }
        }
    }

    updateInterimResults(transcript) {
        const interimElement = document.getElementById('voiceInterim');
        if (interimElement) {
            interimElement.textContent = transcript;
        }
    }

    showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto">
                <h3 class="text-lg font-semibold mb-4">Voice Commands</h3>
                <div class="space-y-3">
                    ${Object.entries(this.commands).map(([command, info]) => `
                        <div class="border-b pb-2">
                            <div class="font-semibold text-blue-600">"${command}"</div>
                            <div class="text-sm text-gray-600">${info.description}</div>
                            <div class="text-xs text-gray-500">Examples: ${info.examples.join(', ')}</div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.closest('.fixed').remove()" class="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    startSessionTimer() {
        this.sessionStartTime = Date.now();
        this.sessionTimer = setInterval(() => {
            const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000 / 60);
            console.log(`Study session duration: ${duration} minutes`);
        }, 60000); // Update every minute
    }

    stopSessionTimer() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    loadSettings() {
        this.continuousMode = localStorage.getItem('voiceContinuousMode') === 'true';
        this.wakeWord = localStorage.getItem('voiceWakeWord') || 'hey tutor';
    }

    saveSettings() {
        localStorage.setItem('voiceContinuousMode', this.continuousMode.toString());
        localStorage.setItem('voiceWakeWord', this.wakeWord);
    }

    // Public methods
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    toggleContinuousMode() {
        this.continuousMode = !this.continuousMode;
        this.saveSettings();
        
        if (this.continuousMode) {
            this.speak('Continuous mode enabled. I\'ll keep listening for commands.');
        } else {
            this.speak('Continuous mode disabled. Say "Hey Tutor" to activate.');
        }
    }

    setWakeWord(word) {
        this.wakeWord = word.toLowerCase();
        this.saveSettings();
        this.speak(`Wake word changed to "${word}".`);
    }
}

// Initialize voice commands
let voiceCommands;

document.addEventListener('DOMContentLoaded', () => {
    voiceCommands = new VoiceCommands();
    
    // Make it globally available
    window.voiceCommands = voiceCommands;
});

console.log('🎤 Voice Commands System loaded');
