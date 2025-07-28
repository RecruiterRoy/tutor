class LearningProgress {
    constructor() {
        this.subjects = {
            'mathematics': { icon: '📐', color: '#FF5252' },
            'science': { icon: '🔬', color: '#4CAF50' },
            'english': { icon: '📚', color: '#2196F3' },
            'hindi': { icon: '📖', color: '#FF9800' },
            'social_studies': { icon: '🌍', color: '#9C27B0' },
            'computer_science': { icon: '💻', color: '#607D8B' }
        };
        this.progressData = {};
        this.recentTopics = [];
        this.loadProgress();
    }

    async loadProgress() {
        try {
            if (!window.currentUser || !window.currentUser.id) {
                console.warn('User not available, skipping progress load');
                return;
            }

            // Load progress from Supabase
            const { data: progress, error } = await window.supabaseClient
                .from('learning_progress')
                .select('*')
                .eq('user_id', window.currentUser.id);

            if (error) throw error;

            this.progressData = progress.reduce((acc, item) => {
                acc[item.subject] = {
                    completion: item.completion_percentage,
                    strengths: item.strengths,
                    weaknesses: item.areas_for_improvement,
                    lastStudied: item.last_studied
                };
                return acc;
            }, {});

            // Load recent topics
            if (!window.currentUser || !window.currentUser.id) {
                console.warn('User not available, skipping recent sessions load');
                this.recentTopics = [];
            } else {
                const { data: recent, error: recentError } = await window.supabaseClient
                    .from('study_sessions')
                    .select('topic, subject, studied_at')
                    .eq('user_id', window.currentUser.id)
                    .order('studied_at', { ascending: false })
                    .limit(5);

                if (recentError) throw recentError;
                this.recentTopics = recent;
            }

            if (recentError) throw recentError;
            this.recentTopics = recent;

            this.renderDashboard();
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    renderDashboard() {
        const container = document.getElementById('learning-progress');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Add subject cards
        const subjectsGrid = document.createElement('div');
        subjectsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6';

        Object.entries(this.subjects).forEach(([subject, meta]) => {
            const progress = this.progressData[subject] || { completion: 0, strengths: [], weaknesses: [] };
            const card = this.createSubjectCard(subject, meta, progress);
            subjectsGrid.appendChild(card);
        });

        container.appendChild(subjectsGrid);

        // Add recent topics
        const recentSection = this.createRecentTopicsSection();
        container.appendChild(recentSection);

        // Add learning style preferences
        const preferencesSection = this.createPreferencesSection();
        container.appendChild(preferencesSection);
    }

    createSubjectCard(subject, meta, progress) {
        const card = document.createElement('div');
        card.className = 'bg-white/10 backdrop-blur-lg rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer';
        card.style.borderLeft = `4px solid ${meta.color}`;

        card.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                    <span>${meta.icon}</span>
                    ${subject.replace('_', ' ').toUpperCase()}
                </h3>
                <span class="text-sm text-white/70">
                    ${progress.lastStudied ? 'Last studied: ' + new Date(progress.lastStudied).toLocaleDateString() : 'Not started'}
                </span>
            </div>
            
            <div class="mb-3">
                <div class="w-full bg-white/10 rounded-full h-2">
                    <div class="bg-gradient-to-r from-${meta.color}/50 to-${meta.color} h-2 rounded-full transition-all"
                         style="width: ${progress.completion}%"></div>
                </div>
                <span class="text-sm text-white/70">${progress.completion}% Complete</span>
            </div>

            ${progress.strengths.length > 0 ? `
                <div class="mb-2">
                    <span class="text-sm text-green-400">Strengths:</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                        ${progress.strengths.map(s => `
                            <span class="px-2 py-1 bg-green-500/20 rounded-full text-xs text-white">${s}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${progress.weaknesses.length > 0 ? `
                <div>
                    <span class="text-sm text-orange-400">Areas to Focus:</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                        ${progress.weaknesses.map(w => `
                            <span class="px-2 py-1 bg-orange-500/20 rounded-full text-xs text-white">${w}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        card.addEventListener('click', () => this.openSubjectDetails(subject));
        return card;
    }

    createRecentTopicsSection() {
        const section = document.createElement('div');
        section.className = 'bg-white/10 backdrop-blur-lg rounded-lg p-4 mb-6';
        
        section.innerHTML = `
            <h3 class="text-lg font-semibold text-white mb-3">Recently Studied Topics</h3>
            <div class="space-y-2">
                ${this.recentTopics.map(topic => `
                    <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div class="flex items-center gap-2">
                            <span>${this.subjects[topic.subject]?.icon || '📚'}</span>
                            <span class="text-white">${topic.topic}</span>
                        </div>
                        <span class="text-sm text-white/70">
                            ${new Date(topic.studied_at).toLocaleDateString()}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;

        return section;
    }

    createPreferencesSection() {
        const section = document.createElement('div');
        section.className = 'bg-white/10 backdrop-blur-lg rounded-lg p-4';
        
        section.innerHTML = `
            <h3 class="text-lg font-semibold text-white mb-3">Learning Preferences</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-white text-sm mb-2">Preferred Learning Style</label>
                    <select class="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white">
                        <option value="visual">Visual Learning</option>
                        <option value="auditory">Auditory Learning</option>
                        <option value="reading">Reading/Writing</option>
                        <option value="kinesthetic">Kinesthetic Learning</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-white text-sm mb-2">Study Session Duration</label>
                    <select class="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-white text-sm mb-2">Preferred Language</label>
                    <select class="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white">
                        <option value="hi">हिंदी (Hindi)</option>
                        <option value="en">English</option>
                        <option value="hi-en">Hinglish</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-white text-sm mb-2">Accessibility Options</label>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2 text-white text-sm">
                            <input type="checkbox" class="rounded text-blue-500">
                            Dyslexia-friendly font
                        </label>
                        <label class="flex items-center gap-2 text-white text-sm">
                            <input type="checkbox" class="rounded text-blue-500">
                            High contrast mode
                        </label>
                        <label class="flex items-center gap-2 text-white text-sm">
                            <input type="checkbox" class="rounded text-blue-500">
                            Screen reader support
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for preferences
        const inputs = section.querySelectorAll('select, input');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.updatePreferences(input));
        });

        return section;
    }

    async updatePreferences(input) {
        try {
            const { data, error } = await window.supabase
                .from('user_preferences')
                .upsert({
                    user_id: window.currentUser.id,
                    preference_key: input.name || input.id,
                    preference_value: input.type === 'checkbox' ? input.checked : input.value
                });

            if (error) throw error;
            
            // Update UI based on preferences
            if (input.name === 'font-dyslexic') {
                document.body.classList.toggle('font-dyslexic', input.checked);
            } else if (input.name === 'high-contrast') {
                document.body.classList.toggle('high-contrast', input.checked);
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    }

    async openSubjectDetails(subject) {
        // Implementation for subject details view
        // This will be implemented in the next phase
    }
}

// Initialize learning progress
const learningProgress = new LearningProgress();
window.learningProgress = learningProgress;

window.renderLearningProgress = function() {
    if (!window.learningProgress) {
        window.learningProgress = new LearningProgress();
    } else {
        window.learningProgress.loadProgress();
    }
}; 
