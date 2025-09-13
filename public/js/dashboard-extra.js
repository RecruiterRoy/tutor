// Essential Dashboard Functions

// Camera and Microphone
function toggleCamera() {
    console.log('Camera toggle clicked');
    showSuccess('Camera functionality coming soon!');
}

function toggleMic() {
    console.log('Microphone toggle clicked');
    showSuccess('Microphone functionality coming soon!');
}

// Daily Challenge
function checkAnswer() {
    console.log('Checking answer...');
    showSuccess('Correct! You earned 10 points!');
}

function loadNewQuiz() {
    console.log('Loading new quiz...');
    showSuccess('New quiz loaded!');
}

// Assessment
function startAssessment(marks, minutes) {
    console.log(`Starting ${marks}-mark test for ${minutes} minutes`);
    showSuccess(`Starting ${marks}-mark test for ${minutes} minutes`);
}

function startSubjectTest() {
    const subject = document.getElementById('subjectSelect').value;
    if (!subject) {
        showError('Please select a subject first.');
        return;
    }
    showSuccess(`Starting ${subject} test`);
}

function viewResults() {
    showSuccess('Loading your test results...');
}

// Profile
function saveProfile() {
    showSuccess('Profile saved successfully!');
}

// Upgrade
function showUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.classList.remove('hidden');
}

function closeUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.classList.add('hidden');
}

function proceedToPayment() {
    window.location.href = 'payment.html?plan=premium&amount=99&duration=monthly';
}

// Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('hidden');
}

function showSection(sectionId) {
    // Hide all sections
    const sections = ['chatSection', 'dailyChallengeSection', 'materialsSection', 'progressSection', 'assessmentSection', 'profileSection', 'settingsSection'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.classList.add('hidden');
        }
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.sidebar-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the corresponding nav item
    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Hide sidebar on mobile after selection
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

// Chat
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            addMessage('Thank you for your message! I\'m here to help you learn.', 'ai');
        }, 1000);
    }
}

function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble message-${sender}`;
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add enter key listener for chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    console.log('Dashboard extra functions loaded');
});

