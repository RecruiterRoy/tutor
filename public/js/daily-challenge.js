// Daily Challenge System
// Handles quiz questions, points calculation, and UI updates

class DailyChallenge {
    constructor() {
        this.currentQuestion = null;
        this.userStats = {
            total_points: 0,
            current_streak: 0,
            total_correct: 0,
            total_attempted: 0
        };
        this.init();
    }

    async init() {
        console.log('🎯 Initializing Daily Challenge...');
        await this.loadChallenge();
        await this.loadUserStats();
        this.setupEventListeners();
    }

    async loadChallenge() {
        try {
            console.log('📝 Loading daily challenge...');
            
            const response = await fetch('/api/daily-challenge?action=get_challenge&user_id=' + (window.userData?.id || 'anonymous'), {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.currentQuestion = data.data;
                this.displayQuestion();
                console.log('✅ Challenge loaded:', this.currentQuestion.question);
            } else {
                throw new Error(data.error || 'Failed to load challenge');
            }
        } catch (error) {
            console.error('❌ Error loading challenge:', error);
            this.displayError('Failed to load today\'s challenge. Please try again.');
        }
    }

    displayQuestion() {
        const questionElement = document.getElementById('challengeQuestion');
        if (questionElement && this.currentQuestion) {
            questionElement.innerHTML = `
                <div class="text-white/90 text-sm mb-2 leading-relaxed">
                    <strong>Today's Challenge:</strong><br>
                    ${this.currentQuestion.question}
                </div>
            `;
        }
    }

    displayError(message) {
        const questionElement = document.getElementById('challengeQuestion');
        if (questionElement) {
            questionElement.innerHTML = `
                <div class="text-red-400 text-sm mb-2 leading-relaxed">
                    ⚠️ ${message}
                </div>
            `;
        }
    }

    async loadUserStats() {
        try {
            const response = await fetch('/api/daily-challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get_stats',
                    user_id: window.userData?.id || 'anonymous'
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.userStats = data.data;
                    this.updateStatsDisplay();
                }
            }
        } catch (error) {
            console.error('❌ Error loading user stats:', error);
        }
    }

    updateStatsDisplay() {
        // Update total points display
        const totalPointsElement = document.getElementById('totalPoints');
        if (totalPointsElement) {
            totalPointsElement.textContent = `${this.userStats.total_points} pts`;
        }

        // Update streak display
        const streakElement = document.getElementById('challengeStreak');
        if (streakElement) {
            streakElement.textContent = `${this.userStats.current_streak} days`;
        }

        // Update rankings
        const indiaRankElement = document.getElementById('indiaRank');
        if (indiaRankElement) {
            indiaRankElement.textContent = this.userStats.india_rank || '00';
        }

        const cityRankElement = document.getElementById('cityRank');
        if (cityRankElement) {
            cityRankElement.textContent = this.userStats.city_rank || '00';
        }
    }

    setupEventListeners() {
        const submitBtn = document.getElementById('submitChallengeBtn');
        const answerInput = document.getElementById('challengeAnswer');

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAnswer());
        }

        if (answerInput) {
            answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submitAnswer();
                }
            });
        }
    }

    async submitAnswer() {
        const answerInput = document.getElementById('challengeAnswer');
        const submitBtn = document.getElementById('submitChallengeBtn');
        
        if (!answerInput || !submitBtn) {
            console.error('❌ Challenge elements not found');
            return;
        }

        const answer = answerInput.value.trim();
        if (!answer) {
            this.showFeedback('Please enter an answer!', 'error');
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            console.log('📤 Submitting answer:', answer);
            
            const response = await fetch('/api/daily-challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit_answer',
                    user_id: window.userData?.id || 'anonymous',
                    answer: answer
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.handleAnswerResult(data.data);
            } else {
                throw new Error(data.error || 'Failed to submit answer');
            }
        } catch (error) {
            console.error('❌ Error submitting answer:', error);
            this.showFeedback('Failed to submit answer. Please try again.', 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }

    handleAnswerResult(result) {
        console.log('📊 Answer result:', result);

        // Update user stats
        this.userStats = result.userStats;
        this.updateStatsDisplay();

        // Show feedback
        this.showFeedback(result.message, result.isCorrect ? 'success' : 'info');

        // Show reward animation if correct
        if (result.isCorrect) {
            this.showRewardAnimation(result.pointsEarned);
        }

        // Show stats
        this.showStats();

        // Clear input
        const answerInput = document.getElementById('challengeAnswer');
        if (answerInput) {
            answerInput.value = '';
        }

        // Update question for next day
        setTimeout(() => {
            this.loadChallenge();
        }, 3000);
    }

    showFeedback(message, type) {
        const feedbackElement = document.getElementById('challengeFeedback');
        if (!feedbackElement) return;

        // Set message and styling
        feedbackElement.textContent = message;
        feedbackElement.className = `text-sm font-semibold px-3 py-2 rounded-lg mt-2 transform transition-all duration-500`;

        // Apply type-specific styling
        switch (type) {
            case 'success':
                feedbackElement.classList.add('text-green-400', 'bg-green-400/10');
                break;
            case 'error':
                feedbackElement.classList.add('text-red-400', 'bg-red-400/10');
                break;
            case 'info':
                feedbackElement.classList.add('text-blue-400', 'bg-blue-400/10');
                break;
        }

        // Show feedback
        feedbackElement.classList.remove('hidden');
        feedbackElement.style.display = 'block';

        // Hide after 5 seconds
        setTimeout(() => {
            feedbackElement.classList.add('hidden');
            feedbackElement.style.display = 'none';
        }, 5000);
    }

    showRewardAnimation(points) {
        const rewardElement = document.getElementById('challengeReward');
        if (!rewardElement) return;

        // Update points in animation
        const pointsElement = rewardElement.querySelector('.text-yellow-300');
        if (pointsElement) {
            pointsElement.textContent = `Awesome! +${points} points!`;
        }

        // Show animation
        rewardElement.classList.remove('hidden');
        rewardElement.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            rewardElement.classList.add('hidden');
            rewardElement.style.display = 'none';
        }, 3000);
    }

    showStats() {
        const statsElement = document.getElementById('challengeStats');
        if (statsElement) {
            statsElement.classList.remove('hidden');
            statsElement.style.display = 'block';
        }
    }
}

// Initialize daily challenge when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded, initializing daily challenge...');
    
    // Wait for DOM elements to be available
    const initChallenge = () => {
        const questionElement = document.getElementById('challengeQuestion');
        if (questionElement) {
            console.log('✅ Challenge elements found, initializing...');
            window.dailyChallenge = new DailyChallenge();
        } else {
            console.log('⏳ Waiting for challenge elements...');
            setTimeout(initChallenge, 500);
        }
    };
    
    // Start initialization immediately, then retry if needed
    initChallenge();
});

// Also try to initialize after page load as backup
window.addEventListener('load', () => {
    if (!window.dailyChallenge) {
        console.log('🔄 Backup initialization of daily challenge...');
        const questionElement = document.getElementById('challengeQuestion');
        if (questionElement) {
            window.dailyChallenge = new DailyChallenge();
        }
    }
});

// Make functions globally available
window.DailyChallenge = DailyChallenge;
