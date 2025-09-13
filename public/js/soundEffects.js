/**
 * Sound Effects System
 * Provides audio feedback for quiz answers and balloon bursts
 */
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isEnabled = true;
        this.init();
    }

    async init() {
        try {
            // Initialize audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load sound effects
            await this.loadSounds();
            
            console.log('🔊 Sound Effects System initialized');
        } catch (error) {
            console.error('❌ Error initializing sound effects:', error);
            this.isEnabled = false;
        }
    }

    async loadSounds() {
        // Create crowd clapping sound (correct answer)
        this.sounds.crowdClap = this.createCrowdClapSound();
        
        // Create crowd cheering sound (balloon burst)
        this.sounds.crowdCheer = this.createCrowdCheerSound();
        
        // Create "oooo" sound (wrong answer)
        this.sounds.crowdOoo = this.createCrowdOooSound();
    }

    // Create crowd clapping sound for correct answers
    createCrowdClapSound() {
        const duration = 2.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < data.length; i++) {
                const time = i / sampleRate;
                
                // Create multiple clap sounds with different timing
                let clap = 0;
                for (let clapIndex = 0; clapIndex < 8; clapIndex++) {
                    const clapTime = 0.2 + clapIndex * 0.2;
                    const clapDuration = 0.1;
                    
                    if (time >= clapTime && time < clapTime + clapDuration) {
                        const clapProgress = (time - clapTime) / clapDuration;
                        const clapAmplitude = Math.sin(clapProgress * Math.PI) * 0.3;
                        clap += clapAmplitude * (Math.random() * 0.5 + 0.5);
                    }
                }
                
                // Add some crowd noise
                const crowdNoise = (Math.random() - 0.5) * 0.1;
                
                data[i] = Math.max(-1, Math.min(1, clap + crowdNoise));
            }
        }
        
        return buffer;
    }

    // Create crowd cheering sound for balloon burst
    createCrowdCheerSound() {
        const duration = 3.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < data.length; i++) {
                const time = i / sampleRate;
                
                // Create "yeeeeee" sound
                let cheer = 0;
                if (time < 2.5) {
                    const frequency = 800 + Math.sin(time * 2) * 200;
                    const amplitude = Math.sin(time * Math.PI / 2.5) * 0.4;
                    cheer += Math.sin(2 * Math.PI * frequency * time) * amplitude;
                }
                
                // Add clapping
                let clap = 0;
                for (let clapIndex = 0; clapIndex < 12; clapIndex++) {
                    const clapTime = 0.5 + clapIndex * 0.15;
                    const clapDuration = 0.08;
                    
                    if (time >= clapTime && time < clapTime + clapDuration) {
                        const clapProgress = (time - clapTime) / clapDuration;
                        const clapAmplitude = Math.sin(clapProgress * Math.PI) * 0.25;
                        clap += clapAmplitude * (Math.random() * 0.5 + 0.5);
                    }
                }
                
                // Add crowd noise
                const crowdNoise = (Math.random() - 0.5) * 0.15;
                
                data[i] = Math.max(-1, Math.min(1, cheer + clap + crowdNoise));
            }
        }
        
        return buffer;
    }

    // Create "oooo" sound for wrong answers
    createCrowdOooSound() {
        const duration = 1.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < data.length; i++) {
                const time = i / sampleRate;
                
                // Create "oooo" sound
                const frequency = 400 + Math.sin(time * 3) * 100;
                const amplitude = Math.sin(time * Math.PI / 1.5) * 0.3;
                const ooo = Math.sin(2 * Math.PI * frequency * time) * amplitude;
                
                // Add some crowd noise
                const crowdNoise = (Math.random() - 0.5) * 0.1;
                
                data[i] = Math.max(-1, Math.min(1, ooo + crowdNoise));
            }
        }
        
        return buffer;
    }

    // Play sound effect
    playSound(soundName) {
        if (!this.isEnabled || !this.audioContext || !this.sounds[soundName]) {
            return;
        }

        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundName];
            source.connect(this.audioContext.destination);
            source.start();
            
            console.log(`🔊 Playing sound: ${soundName}`);
        } catch (error) {
            console.error('❌ Error playing sound:', error);
        }
    }

    // Play correct answer sound
    playCorrectAnswer() {
        this.playSound('crowdClap');
    }

    // Play balloon burst sound
    playBalloonBurst() {
        this.playSound('crowdCheer');
    }

    // Play wrong answer sound
    playWrongAnswer() {
        this.playSound('crowdOoo');
    }

    // Toggle sound on/off
    toggleSound() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('soundEffectsEnabled', this.isEnabled.toString());
        console.log(`🔊 Sound effects ${this.isEnabled ? 'enabled' : 'disabled'}`);
    }

    // Load sound preferences
    loadPreferences() {
        const enabled = localStorage.getItem('soundEffectsEnabled');
        if (enabled !== null) {
            this.isEnabled = enabled === 'true';
        }
    }
}

// Initialize Sound Effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.soundEffects = new SoundEffects();
    window.soundEffects.loadPreferences();
    console.log('✅ Sound Effects ready');
});

// Export for use in other modules
window.SoundEffects = SoundEffects;
