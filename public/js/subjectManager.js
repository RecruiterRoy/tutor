// Subject Management System
// Handles subject selection, chat history, progress tracking, and AI suggestions

class SubjectManager {
    constructor() {
        this.currentSubject = null;
        this.userSubjects = [];
        this.subjectChatHistory = {};
        this.subjectProgress = {};
        this.availableSubjects = this.getAvailableSubjects();
        this.currentUser = null;
        this.userClass = null;
        this.userBoard = null;
    }

    // Get available subjects based on class and board
    getAvailableSubjects() {
        const subjects = {
            // Core subjects in specific order
            'Hindi': { icon: '🇮🇳', color: 'bg-red-500', category: 'Language', order: 1 },
            'English': { icon: '🇬🇧', color: 'bg-blue-500', category: 'Language', order: 2 },
            'Maths': { icon: '🔢', color: 'bg-green-500', category: 'Core', order: 3 },
            'Mathematics': { icon: '🔢', color: 'bg-green-500', category: 'Core', order: 3 },
            'Environmental Science (EVS)': { icon: '🌍', color: 'bg-emerald-500', category: 'Science', order: 4 },
            'EVS': { icon: '🌍', color: 'bg-emerald-500', category: 'Science', order: 4 },
            'Social Studies': { icon: '🏛️', color: 'bg-orange-500', category: 'Social', order: 5 },
            'Social Science': { icon: '🏛️', color: 'bg-orange-500', category: 'Social', order: 5 },
            'Science': { icon: '🔬', color: 'bg-purple-500', category: 'Science', order: 6 },
            'Computers': { icon: '💻', color: 'bg-indigo-500', category: 'Technology', order: 7 },
            'Computer Science': { icon: '💻', color: 'bg-indigo-500', category: 'Technology', order: 7 },
            'GK': { icon: '🧠', color: 'bg-rose-500', category: 'General', order: 8 },
            'General Knowledge': { icon: '🧠', color: 'bg-rose-500', category: 'General', order: 8 },
            'Others': { icon: '➕', color: 'bg-gray-500', category: 'Custom', order: 9 }
        };
        
        return subjects;
    }

    // Initialize the subject manager
    async initialize(user, userClass, userBoard) {
        this.currentUser = user;
        this.userClass = userClass;
        this.userBoard = userBoard;
        
        // Load user's subjects from database
        await this.loadUserSubjects();
        
        // Render subject buttons
        this.renderSubjectButtons();
        
        // Load current subject if any
        if (this.currentSubject) {
            await this.loadSubjectChatHistory(this.currentSubject);
            await this.loadSubjectRecall(this.currentSubject);
        }
    }

    // Load user's selected subjects from database
    async loadUserSubjects() {
        try {
            if (!this.currentUser) return;

            const { data, error } = await window.supabaseClient
                .from('user_subjects')
                .select('*')
                .eq('user_id', this.currentUser.id);

            if (error) {
                console.error('Error loading user subjects:', error);
                // No default subjects - user must add manually
                this.userSubjects = [];
                return;
            }

            if (data && data.length > 0) {
                this.userSubjects = data.map(item => item.subject_name);
            } else {
                // No subjects found - user must add manually
                this.userSubjects = [];
            }

            // Load subject progress
            await this.loadSubjectProgress();

        } catch (error) {
            console.error('Error in loadUserSubjects:', error);
            this.userSubjects = [];
        }
    }

    // No default subjects - user must add manually
    // Removed createDefaultSubjects and getDefaultSubjectsForClass methods

    // Render subject buttons
    renderSubjectButtons() {
        // Render for chat area (small buttons) - show all user-added subjects
        const chatGrid = document.getElementById('subjectButtonsGrid');
        if (chatGrid) {
            chatGrid.innerHTML = '';

            // Show all user-added subjects in chat view
            this.userSubjects.forEach(subject => {
                // Get subject info or use default if not found
                let subjectInfo = this.availableSubjects[subject];
                if (!subjectInfo) {
                    subjectInfo = {
                        icon: '📚',
                        color: 'bg-gray-500',
                        category: 'Other'
                    };
                }

                const button = document.createElement('button');
                button.className = `subject-button px-2 py-1 rounded text-white text-xs font-medium transition-all duration-200 hover:scale-105 ${subjectInfo.color} ${this.currentSubject === subject ? 'ring-1 ring-white ring-opacity-50' : ''}`;
                button.innerHTML = `
                    <div class="text-xs">${subjectInfo.icon} ${subject}</div>
                `;
                button.onclick = () => this.selectSubject(subject);
                chatGrid.appendChild(button);
            });
        }

        // Render for progress area (full buttons) - show all user-added subjects
        const progressGrid = document.getElementById('subjectButtonsGridProgress');
        if (progressGrid) {
            progressGrid.innerHTML = '';

            // Show all user subjects in progress view
            this.userSubjects.forEach(subject => {
                // Get subject info or use default if not found
                let subjectInfo = this.availableSubjects[subject];
                if (!subjectInfo) {
                    subjectInfo = {
                        icon: '📚',
                        color: 'bg-gray-500',
                        category: 'Other'
                    };
                }

                const button = document.createElement('button');
                button.className = `subject-button p-3 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 ${subjectInfo.color} ${this.currentSubject === subject ? 'ring-2 ring-white ring-opacity-50' : ''}`;
                button.innerHTML = `
                    <div class="text-lg mb-1">${subjectInfo.icon}</div>
                    <div class="text-xs">${subject}</div>
                    <div class="text-xs opacity-75 mt-1">${this.subjectProgress[subject] || 0}%</div>
                `;
                button.onclick = () => this.selectSubject(subject);
                progressGrid.appendChild(button);
            });
        }
    }

    // Select a subject
    async selectSubject(subjectName) {
        try {
            console.log('Selecting subject:', subjectName);
            
            // Prevent rapid subject changes
            if (this.lastSubjectChange && Date.now() - this.lastSubjectChange < 2000) {
                console.log('Subject change blocked - too frequent');
                return;
            }
            this.lastSubjectChange = Date.now();
            
            // Prevent automatic changes to English unless explicitly requested
            if (this.currentSubject && this.currentSubject !== subjectName && subjectName === 'English') {
                console.log('Preventing automatic change to English - user must explicitly select');
                return;
            }
            
            // If switching to a different subject, ask for confirmation
            if (this.currentSubject && this.currentSubject !== subjectName) {
                const confirmed = confirm(`Do you want to switch from ${this.currentSubject} to ${subjectName}? Your current conversation will be saved.`);
                if (!confirmed) {
                    return;
                }
            }
            
            this.currentSubject = subjectName;
            
            // Update UI immediately
            this.updateCurrentSubjectDisplay();
            this.renderSubjectButtons();
            
            // Update chat interface to show subject context
            this.updateChatInterface(subjectName);
            
            // Load chat history for this subject
            await this.loadSubjectChatHistory(subjectName);
            
            // Load subject recall and next topic
            await this.loadSubjectRecall(subjectName);
            
            // Save current subject to database
            await this.saveCurrentSubject(subjectName);
            
            // Show success message
            if (window.showSuccess) {
                window.showSuccess(`Switched to ${subjectName}!`);
            }
            
        } catch (error) {
            console.error('Error selecting subject:', error);
            if (window.showError) {
                window.showError('Failed to switch subject. Please try again.');
            }
        }
    }

    // Update current subject display
    updateCurrentSubjectDisplay() {
        // Update chat area display
        const chatNameElement = document.getElementById('currentSubjectName');
        if (chatNameElement) {
            chatNameElement.textContent = this.currentSubject || 'Select Subject';
        }
        
        // Update progress area display
        const progressNameElement = document.getElementById('currentSubjectNameProgress');
        const progressElement = document.getElementById('subjectProgressDisplay');
        
        if (progressNameElement) {
            progressNameElement.textContent = this.currentSubject || 'Select a subject to start learning';
        }
        
        if (progressElement) {
            const progress = this.subjectProgress[this.currentSubject] || 0;
            progressElement.innerHTML = `
                <div class="text-xs text-gray-300">Progress</div>
                <div class="text-sm text-green-400 font-semibold">${progress}%</div>
            `;
        }
    }

    // Load chat history for a subject
    async loadSubjectChatHistory(subjectName) {
        try {
            if (!this.currentUser) return;

            const { data, error } = await window.supabaseClient
                .from('subject_chat_history')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('subject', subjectName)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error loading chat history:', error);
                return;
            }

            this.subjectChatHistory[subjectName] = data || [];
            
            // Display chat history in chat interface
            this.displayChatHistory(subjectName);

        } catch (error) {
            console.error('Error in loadSubjectChatHistory:', error);
        }
    }

    // Display chat history in chat interface
    displayChatHistory(subjectName) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        // Clear current chat
        chatMessages.innerHTML = '';

        const history = this.subjectChatHistory[subjectName] || [];
        
        if (history.length === 0) {
            // Show welcome message for new subject
            this.showSubjectWelcomeMessage(subjectName);
            return;
        }

        // Display chat history
        history.forEach(message => {
            this.addMessageToChat(message.role, message.content, false);
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Show welcome message for a subject
    showSubjectWelcomeMessage(subjectName) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const subjectInfo = this.availableSubjects[subjectName];
        const icon = subjectInfo ? subjectInfo.icon : '📚';
        
        const welcomeMessage = `
            <div class="message message-ai">
                <div class="message-bubble">
                    <div class="flex items-center space-x-3 mb-3">
                        <div class="text-2xl">${icon}</div>
                        <div>
                            <p class="text-white font-semibold">Welcome to ${subjectName}!</p>
                            <p class="text-gray-300 text-sm">Let's start learning together.</p>
                        </div>
                    </div>
                    <p class="text-white">Hello! I'm here to help you with ${subjectName}. What would you like to learn today?</p>
                </div>
            </div>
        `;
        
        chatMessages.innerHTML = welcomeMessage;
    }

    // Load subject recall and next topic
    async loadSubjectRecall(subjectName) {
        try {
            const recallSection = document.getElementById('subjectRecallSection');
            const recallContent = document.getElementById('subjectRecall');
            const nextTopicContent = document.getElementById('nextTopic');
            
            if (!recallSection || !recallContent || !nextTopicContent) return;

            // Get subject progress
            const progress = this.subjectProgress[subjectName] || 0;
            const chatHistory = this.subjectChatHistory[subjectName] || [];

            if (progress === 0 || chatHistory.length === 0) {
                recallSection.classList.add('hidden');
                return;
            }

            // Show recall section
            recallSection.classList.remove('hidden');

            // Create context from recent chat history for continuity
            const recentMessages = chatHistory.slice(-8); // Last 8 messages (4 exchanges)
            const contextSummary = recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

            // Generate interactive recall and next topic using AI
            const apiBase = (window.location.protocol === 'file:') ? 'https://tution.app' : '';
            const response = await fetch(apiBase + '/api/enhanced-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `You are now teaching ${subjectName}. Based on our recent conversation, provide a helpful recap and next steps.

Recent conversation context:
${contextSummary}

Please provide:
1. A brief 2-3 line recap of what we covered (be specific about topics)
2. An engaging question to check understanding
3. What we should learn next (suggest the next logical topic)

Make it conversational and encouraging, like a real teacher would. Keep it concise but helpful.`,
                    grade: this.userClass,
                    subject: subjectName,
                    userProfile: window.userData,
                    teacher: this.getTeacherNameFromAvatar(window.userData?.ai_avatar || window.selectedAvatar),
                    action: 'subject_recall',
                    chatHistory: recentMessages
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const content = data.response;
                    
                    // Parse the response into sections
                    const lines = content.split('\n').filter(line => line.trim());
                    let recall = '';
                    let question = '';
                    let nextTopic = '';
                    
                    lines.forEach(line => {
                        if (line.toLowerCase().includes('recap') || line.toLowerCase().includes('covered') || line.toLowerCase().includes('learned')) {
                            recall = line.replace(/^.*?:/, '').trim();
                        } else if (line.toLowerCase().includes('question') || line.includes('?')) {
                            question = line.trim();
                        } else if (line.toLowerCase().includes('next') || line.toLowerCase().includes('learn') || line.toLowerCase().includes('should')) {
                            nextTopic = line.trim();
                        }
                    });
                    
                    if (!recall) recall = content.split('\n')[0] || content;
                    if (!nextTopic) nextTopic = 'Continue with the next chapter';
                    
                    recallContent.innerHTML = recall;
                    if (question) {
                        recallContent.innerHTML += `<br><br><strong>Quick Check:</strong> ${question}`;
                    }
                    nextTopicContent.innerHTML = nextTopic;
                }
            }

        } catch (error) {
            console.error('Error loading subject recall:', error);
            // Show a simple fallback message
            if (recallContent) {
                recallContent.innerHTML = `Welcome back to ${subjectName}! Let's continue learning.`;
            }
            if (nextTopicContent) {
                nextTopicContent.innerHTML = 'Ready to learn more!';
            }
        }
    }

    // Save current subject to database
    async saveCurrentSubject(subjectName) {
        try {
            if (!this.currentUser) return;

            const { error } = await window.supabaseClient
                .from('user_profiles')
                .update({ current_subject: subjectName })
                .eq('id', this.currentUser.id);

            if (error) {
                console.error('Error saving current subject:', error);
            }

        } catch (error) {
            console.error('Error in saveCurrentSubject:', error);
        }
    }

    // Update chat interface for subject context
    updateChatInterface(subjectName) {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.placeholder = `Ask me anything about ${subjectName}...`;
        }

        // Update global subject variable
        window.currentSubject = subjectName;
    }

    // Save chat message to subject history
    async saveChatMessage(subjectName, userMessage, aiResponse) {
        try {
            if (!this.currentUser) return;

            // Save user message
            const userMessageData = {
                user_id: this.currentUser.id,
                subject: subjectName,
                role: 'user',
                content: userMessage,
                created_at: new Date().toISOString()
            };

            const { error: userError } = await window.supabaseClient
                .from('subject_chat_history')
                .insert(userMessageData);

            if (userError) {
                console.error('Error saving user message:', userError);
            }

            // Save AI response
            const aiMessageData = {
                user_id: this.currentUser.id,
                subject: subjectName,
                role: 'ai',
                content: aiResponse,
                created_at: new Date().toISOString()
            };

            const { error: aiError } = await window.supabaseClient
                .from('subject_chat_history')
                .insert(aiMessageData);

            if (aiError) {
                console.error('Error saving AI message:', aiError);
            }

            // Update local chat history
            if (!this.subjectChatHistory[subjectName]) {
                this.subjectChatHistory[subjectName] = [];
            }
            this.subjectChatHistory[subjectName].push(userMessageData, aiMessageData);

            // Update progress
            await this.updateSubjectProgress(subjectName);

        } catch (error) {
            console.error('Error in saveChatMessage:', error);
        }
    }

    // Update subject progress
    async updateSubjectProgress(subjectName) {
        try {
            const chatHistory = this.subjectChatHistory[subjectName] || [];
            const messageCount = chatHistory.length;
            
            // Simple progress calculation based on message count
            // This can be enhanced with more sophisticated logic later
            const progress = Math.min(Math.floor(messageCount / 2), 100);
            
            this.subjectProgress[subjectName] = progress;

            // Save to database
            if (this.currentUser) {
                const { error } = await window.supabaseClient
                    .from('user_subjects')
                    .update({ progress: progress })
                    .eq('user_id', this.currentUser.id)
                    .eq('subject_name', subjectName);

                if (error) {
                    console.error('Error updating subject progress:', error);
                }
            }

            // Update UI
            this.renderSubjectButtons();
            this.updateCurrentSubjectDisplay();

        } catch (error) {
            console.error('Error in updateSubjectProgress:', error);
        }
    }

    // Load subject progress from database
    async loadSubjectProgress() {
        try {
            if (!this.currentUser) return;

            const { data, error } = await window.supabaseClient
                .from('user_subjects')
                .select('subject_name, progress')
                .eq('user_id', this.currentUser.id);

            if (error) {
                console.error('Error loading subject progress:', error);
                return;
            }

            data.forEach(item => {
                this.subjectProgress[item.subject_name] = item.progress || 0;
            });

        } catch (error) {
            console.error('Error in loadSubjectProgress:', error);
        }
    }

    // Show subject manager modal
    showSubjectManager() {
        const modal = document.getElementById('subjectManagerModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.populateSubjectManager();
        }
    }

    // Hide subject manager modal
    hideSubjectManager() {
        const modal = document.getElementById('subjectManagerModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Populate subject manager modal
    populateSubjectManager() {
        this.populateAvailableSubjects();
        this.populateSelectedSubjects();
    }

    // Populate available subjects
    populateAvailableSubjects() {
        const grid = document.getElementById('availableSubjectsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Sort subjects by order
        const sortedSubjects = Object.entries(this.availableSubjects)
            .filter(([subjectName, subjectInfo]) => !this.userSubjects.includes(subjectName))
            .sort((a, b) => (a[1].order || 999) - (b[1].order || 999));

        sortedSubjects.forEach(([subjectName, subjectInfo]) => {
            const button = document.createElement('button');
            button.className = `subject-select-button p-3 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 ${subjectInfo.color}`;
            button.innerHTML = `
                <div class="text-lg mb-1">${subjectInfo.icon}</div>
                <div class="text-xs">${subjectName}</div>
            `;
            button.onclick = () => this.addSubject(subjectName);
            grid.appendChild(button);
        });
    }

    // Populate selected subjects
    populateSelectedSubjects() {
        const grid = document.getElementById('selectedSubjectsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Sort selected subjects by order
        const sortedSubjects = this.userSubjects
            .map(subjectName => {
                let subjectInfo = this.availableSubjects[subjectName];
                if (!subjectInfo) {
                    subjectInfo = {
                        icon: '📚',
                        color: 'bg-gray-500',
                        category: 'Other',
                        order: 999
                    };
                }
                return { subjectName, subjectInfo };
            })
            .sort((a, b) => (a.subjectInfo.order || 999) - (b.subjectInfo.order || 999));

        sortedSubjects.forEach(({ subjectName, subjectInfo }) => {
            const button = document.createElement('button');
            button.className = `subject-remove-button p-3 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 ${subjectInfo.color} relative`;
            button.innerHTML = `
                <div class="text-lg mb-1">${subjectInfo.icon}</div>
                <div class="text-xs">${subjectName}</div>
                <div class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">×</div>
            `;
            button.onclick = () => this.removeSubject(subjectName);
            grid.appendChild(button);
        });
    }

    // Add subject
    addSubject(subjectName) {
        // Handle "Others" option - show custom subject input
        if (subjectName === 'Others') {
            this.showCustomSubjectInput();
            return;
        }
        
        if (!this.userSubjects.includes(subjectName)) {
            this.userSubjects.push(subjectName);
            this.populateSubjectManager();
            
            // Show immediate feedback
            if (window.showSuccess) {
                window.showSuccess(`${subjectName} added!`);
            }
        }
    }
    
    // Show custom subject input modal
    showCustomSubjectInput() {
        const customSubjectName = prompt('Enter your custom subject name:');
        if (customSubjectName && customSubjectName.trim()) {
            const trimmedName = customSubjectName.trim();
            
            // Check if subject already exists
            if (this.userSubjects.includes(trimmedName)) {
                if (window.showError) {
                    window.showError(`${trimmedName} is already added!`);
                }
                return;
            }
            
            // Add custom subject
            this.userSubjects.push(trimmedName);
            
            // Add to available subjects for this user
            this.availableSubjects[trimmedName] = {
                icon: '📚',
                color: 'bg-purple-500',
                category: 'Custom',
                order: 999 // High order to appear at the end
            };
            
            this.populateSubjectManager();
            
            // Show success message
            if (window.showSuccess) {
                window.showSuccess(`${trimmedName} added as custom subject!`);
            }
        }
    }

    // Remove subject
    removeSubject(subjectName) {
        const index = this.userSubjects.indexOf(subjectName);
        if (index > -1) {
            this.userSubjects.splice(index, 1);
            this.populateSubjectManager();
            
            // Show immediate feedback
            if (window.showSuccess) {
                window.showSuccess(`${subjectName} removed!`);
            }
        }
    }

    // Save subject changes with improved workflow
    async saveSubjectChanges() {
        try {
            console.log('🔄 Starting subject save process...');
            
            // Show loading state
            const saveButton = document.querySelector('#subjectManagerModal button[onclick*="saveSubjectChanges"]');
            if (saveButton) {
                saveButton.textContent = 'Saving...';
                saveButton.disabled = true;
            }
            
            // Get current user
            if (!this.currentUser) {
                if (window.currentUser) {
                    this.currentUser = window.currentUser;
                } else {
                    const { data: { user }, error } = await window.supabaseClient.auth.getUser();
                    if (user && !error) {
                        this.currentUser = user;
                    } else {
                        throw new Error('User session expired. Please log in again.');
                    }
                }
            }

            console.log('✅ User verified, saving subjects:', this.userSubjects);

            // Remove old subjects
            const { error: deleteError } = await window.supabaseClient
                .from('user_subjects')
                .delete()
                .eq('user_id', this.currentUser.id);

            if (deleteError) {
                throw new Error('Failed to delete old subjects: ' + deleteError.message);
            }

            console.log('✅ Old subjects deleted');

            // Add new subjects
            const subjectsToInsert = this.userSubjects.map(subject => ({
                user_id: this.currentUser.id,
                subject_name: subject,
                is_active: true,
                progress: this.subjectProgress[subject] || 0,
                created_at: new Date().toISOString()
            }));

            const { error: insertError } = await window.supabaseClient
                .from('user_subjects')
                .insert(subjectsToInsert);

            if (insertError) {
                throw new Error('Failed to insert new subjects: ' + insertError.message);
            }

            console.log('✅ New subjects inserted');
            
            // Reload subjects from database
            await this.loadUserSubjects();
            
            // Update UI
            this.renderSubjectButtons();
            this.updateCurrentSubjectDisplay();
            
            // Update subject progress section
            if (window.updateSubjectProgress) {
                window.updateSubjectProgress();
            }
            
            // Hide modal
            this.hideSubjectManager();
            
            // Show success message
            if (window.showSuccess) {
                window.showSuccess(`Successfully saved ${this.userSubjects.length} subjects!`);
            }

        } catch (error) {
            console.error('❌ Error in saveSubjectChanges:', error);
            if (window.showError) {
                window.showError(error.message);
            }
        } finally {
            // Reset button state
            const saveButton = document.querySelector('#subjectManagerModal button[onclick*="saveSubjectChanges"]');
            if (saveButton) {
                saveButton.textContent = 'Save Changes';
                saveButton.disabled = false;
            }
        }
    }

    // Add message to chat (helper function)
    addMessageToChat(role, content, saveToHistory = true) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role}`;
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <p class="text-white">${content}</p>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Save to subject history if needed
        if (saveToHistory && this.currentSubject) {
            this.saveChatMessage(this.currentSubject, role === 'user' ? content : '', role === 'ai' ? content : '');
        }
    }

    // Get current subject
    getCurrentSubject() {
        return this.currentSubject;
    }

    // Get user subjects
    getUserSubjects() {
        return this.userSubjects;
    }

    // Helper to get teacher name from avatar
    getTeacherNameFromAvatar(avatarId) {
        switch (avatarId) {
            case 'miss-sapna':
                return 'Miss Sapna';
            case 'roy-sir':
            default:
                return 'Roy Sir';
        }
    }
}

// Global subject manager instance
window.subjectManager = new SubjectManager();

// Global functions for HTML onclick handlers
window.showSubjectManager = () => window.subjectManager.showSubjectManager();
window.hideSubjectManager = () => window.subjectManager.hideSubjectManager();
window.saveSubjectChanges = async () => {
    console.log('Global saveSubjectChanges called');
    if (window.subjectManager) {
        await window.subjectManager.saveSubjectChanges();
    } else {
        console.error('Subject manager not found');
    }
}; 