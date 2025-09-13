// dailyChallenge.js - Daily Challenge functionality for tution.app

class DailyChallenge {
    constructor() {
        this.currentQuestion = null;
        this.userScore = 0;
        this.leaderboard = [];
        this.isInitialized = false;
    }

    async initialize() {
        console.log('🎉 Initializing Daily Challenge...');
        
        try {
            // Load user's current score
            this.userScore = parseInt(localStorage.getItem('dailyChallengeScore') || '0');
            
            // Load today's question
            await this.loadTodaysQuestion();
            
            // Load leaderboard
            await this.loadLeaderboard();
            
            this.isInitialized = true;
            console.log('✅ Daily Challenge initialized');
            
            // Update UI
            this.updateUI();
            
        } catch (error) {
            console.error('❌ Error initializing Daily Challenge:', error);
        }
    }

    async loadTodaysQuestion() {
        try {
            console.log('📝 Loading today\'s question...');
            
            const response = await fetch('/api/daily-challenge', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.currentQuestion = data.question;
                console.log('✅ Today\'s question loaded:', this.currentQuestion.question);
            } else {
                throw new Error(data.error || 'Failed to load question');
            }
            
        } catch (error) {
            console.error('❌ Error loading today\'s question:', error);
            // Create a fallback question
            this.currentQuestion = {
                question: "What is the capital of India?",
                options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
                correctAnswer: 1,
                explanation: "Delhi is the capital of India.",
                subject: "General Knowledge",
                difficulty: "Easy"
            };
        }
    }

    async loadLeaderboard() {
        try {
            console.log('🏆 Loading leaderboard...');
            
            const response = await fetch('/api/daily-challenge/leaderboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.leaderboard = data.leaderboard;
                console.log('✅ Leaderboard loaded:', this.leaderboard.length, 'entries');
            } else {
                throw new Error(data.error || 'Failed to load leaderboard');
            }
            
        } catch (error) {
            console.error('❌ Error loading leaderboard:', error);
            // Create a fallback leaderboard
            this.leaderboard = [
                { name: "Top Student", score: 150, rank: 1 },
                { name: "Math Wizard", score: 120, rank: 2 },
                { name: "Science Pro", score: 100, rank: 3 },
                { name: "History Buff", score: 80, rank: 4 },
                { name: "Geography Expert", score: 60, rank: 5 }
            ];
        }
    }

    async submitAnswer(selectedOption) {
        try {
            console.log('📤 Submitting answer:', selectedOption);
            
            if (!this.currentQuestion) {
                throw new Error('No question available');
            }

            const isCorrect = selectedOption === this.currentQuestion.correctAnswer;
            
            if (isCorrect) {
                this.userScore += 10;
                localStorage.setItem('dailyChallengeScore', this.userScore.toString());
                console.log('✅ Correct answer! Score:', this.userScore);
            } else {
                console.log('❌ Wrong answer. Correct answer was:', this.currentQuestion.correctAnswer);
            }

            // Update UI
            this.updateUI();
            
            // Show result
            this.showResult(isCorrect, selectedOption);
            
            return isCorrect;
            
        } catch (error) {
            console.error('❌ Error submitting answer:', error);
            return false;
        }
    }

    showResult(isCorrect, selectedOption) {
        const resultDiv = document.getElementById('challengeResult');
        if (!resultDiv) return;

        const correctAnswer = this.currentQuestion.options[this.currentQuestion.correctAnswer];
        
        resultDiv.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-4xl mb-4">${isCorrect ? '🎉' : '😔'}</div>
                    <h3 class="text-xl font-bold mb-2">${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p class="text-gray-600 mb-4">
                        ${isCorrect ? 'Great job! You earned 10 points.' : `The correct answer was: ${correctAnswer}`}
                    </p>
                    <div class="bg-gray-100 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">Explanation:</h4>
                        <p class="text-gray-700">${this.currentQuestion.explanation}</p>
                    </div>
                    <button onclick="dailyChallenge.loadTodaysQuestion()" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Next Question
                    </button>
                </div>
            </div>
        `;
        
        resultDiv.classList.remove('hidden');
    }

    updateUI() {
        // Update question display
        this.updateQuestionDisplay();
        
        // Update score display
        this.updateScoreDisplay();
        
        // Update leaderboard display
        this.updateLeaderboardDisplay();
        
        // Update challenge star
        this.updateChallengeStar();
    }

    updateQuestionDisplay() {
        const questionContainer = document.getElementById('dailyQuestion');
        if (!questionContainer || !this.currentQuestion) return;

        questionContainer.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-lg">
                <div class="mb-4">
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${this.currentQuestion.subject}</span>
                    <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2">${this.currentQuestion.difficulty}</span>
                </div>
                <h3 class="text-lg font-semibold mb-4">${this.currentQuestion.question}</h3>
                <div class="space-y-3">
                    ${this.currentQuestion.options.map((option, index) => `
                        <button onclick="dailyChallenge.submitAnswer(${index})" 
                                class="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                            ${String.fromCharCode(65 + index)}. ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('userChallengeScore');
        if (scoreElement) {
            scoreElement.textContent = this.userScore;
        }
    }

    updateLeaderboardDisplay() {
        const leaderboardContainer = document.getElementById('challengeLeaderboard');
        if (!leaderboardContainer) return;

        leaderboardContainer.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-lg">
                <h3 class="text-lg font-semibold mb-4">🏆 Leaderboard</h3>
                <div class="space-y-2">
                    ${this.leaderboard.map((entry, index) => `
                        <div class="flex items-center justify-between p-3 ${index < 3 ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'} rounded-lg">
                            <div class="flex items-center space-x-3">
                                <span class="text-lg">${this.getRankEmoji(entry.rank)}</span>
                                <span class="font-medium">${entry.name}</span>
                            </div>
                            <span class="font-bold text-blue-600">${entry.score} pts</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateChallengeStar() {
        const desktopStar = document.getElementById('challengeStar');
        const mobileStar = document.getElementById('mobileChallengeStar');
        
        // Show star if user has points
        if (this.userScore > 0) {
            if (desktopStar) desktopStar.classList.remove('hidden');
            if (mobileStar) mobileStar.classList.remove('hidden');
        } else {
            if (desktopStar) desktopStar.classList.add('hidden');
            if (mobileStar) mobileStar.classList.add('hidden');
        }
    }

    getRankEmoji(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏅';
        }
    }

    resetScore() {
        this.userScore = 0;
        localStorage.removeItem('dailyChallengeScore');
        this.updateUI();
        console.log('🔄 Score reset');
    }
}

// Initialize Daily Challenge
if (typeof window.dailyChallenge === 'undefined') {
    window.dailyChallenge = new DailyChallenge();
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.dailyChallenge) {
        window.dailyChallenge.initialize();
    }
});

console.log('✅ Daily Challenge module loaded');
