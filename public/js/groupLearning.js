class GroupLearning {
    constructor() {
        this.currentGroup = null;
        this.activeMembers = new Set();
        this.sharedNotes = [];
        this.initializeRealtime();
    }

    async initializeRealtime() {
        try {
            if (!window.currentUser || !window.currentUser.id) {
                console.log('User not available, skipping realtime initialization');
                return;
            }
            
            // Subscribe to presence changes
            const presenceChannel = window.supabaseClient.channel('online-users');
            
            presenceChannel
                .on('presence', { event: 'join' }, ({ newPresences }) => {
                    newPresences.forEach(presence => {
                        this.activeMembers.add(presence.user_id);
                    });
                    this.updateActiveUsers();
                })
                .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                    leftPresences.forEach(presence => {
                        this.activeMembers.delete(presence.user_id);
                    });
                    this.updateActiveUsers();
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await presenceChannel.track({ 
                            user_id: window.currentUser.id,
                            username: window.currentUser.username,
                            timestamp: new Date().toISOString()
                        });
                    }
                });

            // Subscribe to shared notes changes
            const notesChannel = window.supabaseClient.channel('shared-notes');
            
            notesChannel
                .on('INSERT', { event: '*', schema: 'public', table: 'shared_notes' }, 
                    payload => this.handleNewNote(payload.new))
                .on('UPDATE', { event: '*', schema: 'public', table: 'shared_notes' }, 
                    payload => this.handleNoteUpdate(payload.new))
                .subscribe();

        } catch (error) {
            console.error('Error initializing realtime:', error);
        }
    }

    async createGroup(name, description) {
        try {
            if (!window.currentUser || !window.currentUser.id) {
                throw new Error('User not available');
            }
            
            const { data, error } = await window.supabaseClient
                .from('study_groups')
                .insert({
                    name,
                    description,
                    created_by: window.currentUser.id
                })
                .select()
                .single();

            if (error) throw error;

            this.currentGroup = data;
            this.renderGroupInterface();
            return data;
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    }

    async joinGroup(groupId) {
        try {
            if (!window.currentUser || !window.currentUser.id) {
                throw new Error('User not authenticated');
            }
            
            const { data, error } = await window.supabaseClient
                .from('group_members')
                .insert({
                    group_id: groupId,
                    user_id: window.currentUser.id
                })
                .select()
                .single();

            if (error) throw error;

            await this.loadGroupData(groupId);
            this.renderGroupInterface();
            return data;
        } catch (error) {
            console.error('Error joining group:', error);
            throw error;
        }
    }

    async loadGroupData(groupId) {
        try {
                         // Load group details
             const { data: group, error: groupError } = await window.supabaseClient
                 .from('study_groups')
                .select(`
                    *,
                    group_members (
                        user_id,
                        joined_at
                    ),
                    shared_notes (
                        *
                    )
                `)
                .eq('id', groupId)
                .single();

            if (groupError) throw groupError;

            this.currentGroup = group;
            this.sharedNotes = group.shared_notes;

            // Update UI
            this.renderGroupInterface();
        } catch (error) {
            console.error('Error loading group data:', error);
            throw error;
        }
    }

    async shareNote(content, topic) {
                 try {
             const { data, error } = await window.supabaseClient
                 .from('shared_notes')
                .insert({
                    group_id: this.currentGroup.id,
                    user_id: window.currentUser.id,
                    content,
                    topic
                })
                .select()
                .single();

            if (error) throw error;

            this.sharedNotes.push(data);
            this.renderNotes();
            return data;
        } catch (error) {
            console.error('Error sharing note:', error);
            throw error;
        }
    }

    async shareAIResponse(response, topic) {
        try {
            const { data, error } = await window.supabaseClient
                .from('shared_ai_responses')
                .insert({
                    group_id: this.currentGroup.id,
                    user_id: window.currentUser.id,
                    response,
                    topic
                })
                .select()
                .single();

            if (error) throw error;

            this.renderSharedResponses();
            return data;
        } catch (error) {
            console.error('Error sharing AI response:', error);
            throw error;
        }
    }

    renderGroupInterface() {
        const container = document.getElementById('group-learning');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-white">
                        ${this.currentGroup ? this.currentGroup.name : 'Study Groups'}
                    </h2>
                    ${!this.currentGroup ? `
                        <button onclick="groupLearning.showCreateGroupModal()"
                                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                            Create Group
                        </button>
                    ` : ''}
                </div>

                ${this.currentGroup ? this.renderActiveGroup() : this.renderGroupList()}
            </div>
        `;
    }

    renderActiveGroup() {
        return `
            <div class="space-y-6">
                <!-- Active Members -->
                <div class="bg-white/5 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-3">Active Members</h3>
                    <div class="flex flex-wrap gap-2" id="active-members">
                        ${Array.from(this.activeMembers).map(userId => `
                            <div class="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span class="text-white text-sm">User ${userId}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Shared Notes -->
                <div class="bg-white/5 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-3">Shared Notes</h3>
                    <div class="space-y-3" id="shared-notes">
                        ${this.sharedNotes.map(note => `
                            <div class="bg-white/10 rounded-lg p-3">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-white font-medium">${note.topic}</span>
                                    <span class="text-sm text-white/70">
                                        ${new Date(note.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p class="text-white/90">${note.content}</p>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="groupLearning.showAddNoteModal()"
                            class="mt-3 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                        Add Note
                    </button>
                </div>

                <!-- Collaborative Features -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onclick="groupLearning.startGroupDiscussion()"
                            class="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-center">
                        Start Group Discussion
                    </button>
                    <button onclick="groupLearning.shareLastAIResponse()"
                            class="p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg text-center">
                        Share Last AI Response
                    </button>
                </div>
            </div>
        `;
    }

    renderGroupList() {
        // Implementation for group list
        // This will be added in the next phase
    }

    updateActiveUsers() {
        const container = document.getElementById('active-members');
        if (!container) return;

        container.innerHTML = Array.from(this.activeMembers).map(userId => `
            <div class="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-white text-sm">User ${userId}</span>
            </div>
        `).join('');
    }

    handleNewNote(note) {
        this.sharedNotes.push(note);
        this.renderNotes();
    }

    handleNoteUpdate(note) {
        const index = this.sharedNotes.findIndex(n => n.id === note.id);
        if (index !== -1) {
            this.sharedNotes[index] = note;
            this.renderNotes();
        }
    }

    renderNotes() {
        const container = document.getElementById('shared-notes');
        if (!container) return;

        container.innerHTML = this.sharedNotes.map(note => `
            <div class="bg-white/10 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-white font-medium">${note.topic}</span>
                    <span class="text-sm text-white/70">
                        ${new Date(note.created_at).toLocaleString()}
                    </span>
                </div>
                <p class="text-white/90">${note.content}</p>
            </div>
        `).join('');
    }

    async startGroupDiscussion() {
        // Implementation for group discussion
        // This will be added in the next phase
    }

    async shareLastAIResponse() {
        if (window.lastAIResponse) {
            await this.shareAIResponse(window.lastAIResponse, 'AI Response');
        }
    }

    showCreateGroupModal() {
        // Implementation for create group modal
        // This will be added in the next phase
    }

    showAddNoteModal() {
        // Implementation for add note modal
        // This will be added in the next phase
    }
}

// Initialize group learning
const groupLearning = new GroupLearning();
window.groupLearning = groupLearning; 
