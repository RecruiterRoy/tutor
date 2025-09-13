/**
 * Balloon Burst Animation System
 * Creates scaling balloon animations based on daily streak
 */
class BalloonAnimation {
    constructor() {
        this.isAnimating = false;
        this.balloonContainer = null;
        console.log('🎈 Balloon Animation System initialized');
    }

    /**
     * Trigger balloon burst animation based on streak
     * @param {number} streak - Current daily streak (1-30+)
     */
    triggerBalloonBurst(streak = 1) {
        if (this.isAnimating) return;
        
        console.log('🎈 Triggering balloon burst animation with streak:', streak);
        
        // Play balloon burst sound
        if (window.soundEffects) {
            window.soundEffects.playBalloonBurst();
        }
        
        // Create balloon container
        const balloonContainer = document.createElement('div');
        balloonContainer.className = 'fixed inset-0 pointer-events-none z-50';
        document.body.appendChild(balloonContainer);
        
        this.isAnimating = true;
        this.createBalloonAnimation(streak);
    }

    createBalloonAnimation(streak) {
        // Calculate balloon size and animation duration based on streak
        const balloonSize = this.calculateBalloonSize(streak);
        const animationDuration = this.calculateAnimationDuration(streak);
        const particleCount = this.calculateParticleCount(streak);
        
        // Create balloon container
        this.balloonContainer = document.createElement('div');
        this.balloonContainer.className = 'balloon-animation-container';
        this.balloonContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(this.balloonContainer);
        
        // Create balloon
        const balloon = this.createBalloon(balloonSize, streak);
        this.balloonContainer.appendChild(balloon);
        
        // Animate balloon appearance, burst, and cleanup
        this.animateBalloonSequence(balloon, balloonSize, animationDuration, particleCount, streak);
    }

    calculateBalloonSize(streak) {
        // Start at 80px, scale up to full screen (min(100vw, 100vh)) by day 30
        const minSize = 80;
        const maxSizePercent = 90; // 90% of screen size at day 30
        
        const progress = Math.min(streak / 30, 1); // Cap at day 30
        const sizePercent = 8 + (maxSizePercent - 8) * progress; // Start at 8% screen size
        
        return `${sizePercent}vmin`; // Use vmin for responsive sizing
    }

    calculateAnimationDuration(streak) {
        // Start at 5 seconds, scale to 20 seconds by day 30
        const minDuration = 5000;
        const maxDuration = 20000;
        
        const progress = Math.min(streak / 30, 1);
        return minDuration + (maxDuration - minDuration) * progress;
    }

    calculateParticleCount(streak) {
        // Start with 20 particles, scale to 150 by day 30
        const minParticles = 20;
        const maxParticles = 150;
        
        const progress = Math.min(streak / 30, 1);
        return Math.floor(minParticles + (maxParticles - minParticles) * progress);
    }

    createBalloon(size, streak) {
        const balloon = document.createElement('div');
        balloon.className = 'celebration-balloon';
        
        // Create balloon gradient colors based on streak
        const balloonColor = this.getBalloonColor(streak);
        
        balloon.style.cssText = `
            width: ${size};
            height: ${size};
            background: ${balloonColor};
            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
            position: relative;
            transform: scale(0);
            box-shadow: 
                inset -10px -10px 30px rgba(0,0,0,0.1),
                inset 10px 10px 30px rgba(255,255,255,0.2),
                0 0 50px rgba(255,255,255,0.3);
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
        `;
        
        // Add balloon string
        const balloonString = document.createElement('div');
        balloonString.style.cssText = `
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            height: 30px;
            background: linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.2));
        `;
        balloon.appendChild(balloonString);
        
        // Add shine effect
        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: 15%;
            left: 20%;
            width: 25%;
            height: 25%;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
            border-radius: 50%;
            filter: blur(3px);
        `;
        balloon.appendChild(shine);
        
        return balloon;
    }

    getBalloonColor(streak) {
        // Different colors for different streak milestones
        if (streak >= 30) return 'radial-gradient(circle at 30% 30%, #ffd700, #ff6b35, #ff1744)'; // Gold/Orange/Red
        if (streak >= 21) return 'radial-gradient(circle at 30% 30%, #9c27b0, #673ab7, #3f51b5)'; // Purple/Blue
        if (streak >= 14) return 'radial-gradient(circle at 30% 30%, #4caf50, #00bcd4, #2196f3)'; // Green/Cyan/Blue  
        if (streak >= 7) return 'radial-gradient(circle at 30% 30%, #ff9800, #ff5722, #e91e63)'; // Orange/Red/Pink
        return 'radial-gradient(circle at 30% 30%, #2196f3, #9c27b0, #ff1744)'; // Default Blue/Purple/Red
    }

    async animateBalloonSequence(balloon, size, duration, particleCount, streak) {
        // Phase 1: Balloon appears and grows
        await this.animateBalloonAppearance(balloon);
        
        // Phase 2: Balloon floats briefly
        await this.animateBalloonFloat(balloon, duration * 0.3);
        
        // Phase 3: Balloon burst
        this.animateBalloonBurst(balloon, particleCount, streak);
        
        // Phase 4: Cleanup after animation
        setTimeout(() => {
            this.cleanup();
        }, duration);
    }

    animateBalloonAppearance(balloon) {
        return new Promise(resolve => {
            balloon.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            balloon.style.transform = 'scale(1)';
            
            setTimeout(resolve, 800);
        });
    }

    animateBalloonFloat(balloon, duration) {
        return new Promise(resolve => {
            balloon.style.transition = 'transform 2s ease-in-out infinite alternate';
            balloon.style.transform = 'scale(1) translateY(-10px) rotate(2deg)';
            
            setTimeout(() => {
                balloon.style.transform = 'scale(1) translateY(10px) rotate(-2deg)';
                setTimeout(resolve, duration);
            }, 100);
        });
    }

    animateBalloonBurst(balloon, particleCount, streak) {
        // Create burst effect
        balloon.style.transition = 'all 0.3s ease-out';
        balloon.style.transform = 'scale(1.2)';
        balloon.style.opacity = '0.8';
        
        setTimeout(() => {
            // Balloon disappears
            balloon.style.transform = 'scale(0)';
            balloon.style.opacity = '0';
            
            // Create particle explosion
            this.createParticleExplosion(particleCount, streak);
        }, 300);
    }

    createParticleExplosion(particleCount, streak) {
        const particles = ['❤️', '😊', '😃', '🌟', '⭐', '✨', '💫', '🎉', '🎊', '💖', '💕', '🔥'];
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                this.createParticle(particles, center, streak);
            }, i * 50); // Stagger particle creation
        }
    }

    createParticle(particles, center, streak) {
        const particle = document.createElement('div');
        const emoji = particles[Math.floor(Math.random() * particles.length)];
        
        // Larger particles for higher streaks
        const particleSize = 16 + (streak / 30) * 20; // 16px to 36px
        
        particle.textContent = emoji;
        particle.style.cssText = `
            position: fixed;
            font-size: ${particleSize}px;
            pointer-events: none;
            z-index: 10001;
            left: ${center.x}px;
            top: ${center.y}px;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(particle);
        
        // Animate particle
        this.animateParticle(particle, center, streak);
    }

    animateParticle(particle, center, streak) {
        // Calculate random direction and distance
        const angle = Math.random() * 2 * Math.PI;
        const distance = 200 + Math.random() * 400 + (streak * 10); // Further spread for higher streaks
        const gravity = 0.5 + Math.random() * 0.5;
        
        const endX = center.x + Math.cos(angle) * distance;
        const endY = center.y + Math.sin(angle) * distance;
        
        // Initial burst outward
        particle.animate([
            { 
                transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
                opacity: 1 
            },
            { 
                transform: `translate(${endX - center.x}px, ${endY - center.y - 100}px) scale(1) rotate(360deg)`,
                opacity: 1,
                offset: 0.7
            },
            { 
                transform: `translate(${endX - center.x}px, ${endY - center.y + 200}px) scale(0.5) rotate(720deg)`,
                opacity: 0 
            }
        ], {
            duration: 2000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        }).onfinish = () => {
            particle.remove();
        };
    }

    cleanup() {
        if (this.balloonContainer) {
            this.balloonContainer.remove();
            this.balloonContainer = null;
        }
        this.isAnimating = false;
        console.log('🎈 Balloon animation cleanup completed');
    }

    // Public method to trigger animation
    celebrate(streak) {
        this.triggerBalloonBurst(streak);
    }

    // Check if animation is currently running
    isActive() {
        return this.isAnimating;
    }
}

// Initialize and export
window.BalloonAnimation = BalloonAnimation;
window.balloonAnimation = new BalloonAnimation();

console.log('✅ Balloon Animation System loaded');
