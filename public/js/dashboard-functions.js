// Dashboard Functions - Additional functionality

// Camera and Microphone functionality
let cameraStream = null;
let micStream = null;
let recognition = null;

// Initialize speech recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            const micStatus = document.getElementById('micStatus');
            const micButton = document.getElementById('micButton');
            if (micStatus) micStatus.textContent = 'Listening...';
            if (micButton) micButton.style.backgroundColor = '#ef4444';
        };
        
        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value = finalTranscript;
                    sendMessage();
                }
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            const micStatus = document.getElementById('micStatus');
            const micButton = document.getElementById('micButton');
            if (micStatus) micStatus.textContent = 'Click microphone to speak';
            if (micButton) micButton.style.backgroundColor = '';
        };
        
        recognition.onend = function() {
            const micStatus = document.getElementById('micStatus');
            const micButton = document.getElementById('micButton');
            if (micStatus) micStatus.textContent = 'Click microphone to speak';
            if (micButton) micButton.style.backgroundColor = '';
        };
    }
}

// Toggle microphone
function toggleMic() {
    if (!recognition) {
        initSpeechRecognition();
    }
    
    if (recognition && recognition.state === 'inactive') {
        recognition.start();
    } else if (recognition && recognition.state === 'recording') {
        recognition.stop();
    }
}

// Toggle camera
async function toggleCamera() {
    const cameraContainer = document.getElementById('cameraContainer');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraButton = document.getElementById('cameraButton');
    
    if (cameraStream) {
        // Stop camera
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        if (cameraContainer) cameraContainer.classList.add('hidden');
        if (cameraButton) cameraButton.innerHTML = '<span class="text-lg">📹</span>';
    } else {
        // Start camera
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            if (cameraVideo) cameraVideo.srcObject = cameraStream;
            if (cameraContainer) cameraContainer.classList.remove('hidden');
            if (cameraButton) cameraButton.innerHTML = '<span class="text-lg">📷</span>';
        } catch (error) {
            console.error('Camera error:', error);
            showError('Could not access camera. Please check permissions.');
        }
    }
}

// Daily Challenge functionality
let currentQuestion = null;
let selectedAnswer = null;

const sampleQuestions = [
    {
        question: "What is the capital of India?",
        options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
        correct: 1
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Venus", "Jupiter"],
        correct: 1
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correct: 1
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 1
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Ag", "Au", "Fe", "Cu"],
        correct: 1
    }
];

function loadTodayQuestion() {
    const today = new Date().toDateString();
    const questionIndex = Math.abs(today.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % sampleQuestions.length;
    currentQuestion = sampleQuestions[questionIndex];
    displayQuestion();
}

function displayQuestion() {
    if (!currentQuestion) return;
    
    const quizQuestion = document.getElementById('quizQuestion');
    const optionsContainer = document.getElementById('quizOptions');
    const quizContainer = document.getElementById('quizContainer');
    const quizResult = document.getElementById('quizResult');
    
    if (quizQuestion) quizQuestion.textContent = currentQuestion.question;
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors';
            button.textContent = option;
            button.onclick = () => selectAnswer(index);
            optionsContainer.appendChild(button);
        });
    }
    
    if (quizContainer) quizContainer.classList.remove('hidden');
    if (quizResult) quizResult.classList.add('hidden');
}

function selectAnswer(index) {
    selectedAnswer = index;
    const buttons = document.querySelectorAll('#quizOptions button');
    buttons.forEach((btn, i) => {
        btn.classList.remove('bg-blue-100', 'border-blue-500');
        if (i === index) {
            btn.classList.add('bg-blue-100', 'border-blue-500');
        }
    });
}

function checkAnswer() {
    if (selectedAnswer === null) {
        showError('Please select an answer first.');
        return;
    }
    
    const isCorrect = selectedAnswer === currentQuestion.correct;
    const resultMessage = document.getElementById('resultMessage');
    const quizContainer = document.getElementById('quizContainer');
    const quizResult = document.getElementById('quizResult');
    
    if (isCorrect) {
        if (resultMessage) {
            resultMessage.className = 'p-4 rounded-lg text-center bg-green-100 text-green-800';
            resultMessage.innerHTML = `
                <div class="text-2xl mb-2">🎉</div>
                <div class="font-semibold">Correct!</div>
                <div>You earned 10 points!</div>
            `;
        }
        updateUserPoints(10);
        showBalloonAnimation();
    } else {
        if (resultMessage) {
            resultMessage.className = 'p-4 rounded-lg text-center bg-red-100 text-red-800';
            resultMessage.innerHTML = `
                <div class="text-2xl mb-2">😔</div>
                <div class="font-semibold">Incorrect!</div>
                <div>The correct answer was: ${currentQuestion.options[currentQuestion.correct]}</div>
            `;
        }
    }
    
    if (quizContainer) quizContainer.classList.add('hidden');
    if (quizResult) quizResult.classList.remove('hidden');
    loadLeaderboards();
}

function loadNewQuiz() {
    selectedAnswer = null;
    loadTodayQuestion();
}

function showBalloonAnimation() {
    const balloons = ['🎈', '🎉', '⭐', '🏆'];
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const balloon = document.createElement('div');
            balloon.className = 'fixed text-4xl animate-bounce';
            balloon.textContent = balloons[Math.floor(Math.random() * balloons.length)];
            balloon.style.left = Math.random() * window.innerWidth + 'px';
            balloon.style.top = window.innerHeight + 'px';
            balloon.style.zIndex = '9999';
            document.body.appendChild(balloon);
            
            setTimeout(() => {
                balloon.remove();
            }, 3000);
        }, i * 200);
    }
}

async function updateUserPoints(points) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Update user statistics
        const { data: stats, error: statsError } = await supabase
            .from('user_statistics')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (statsError && statsError.code === 'PGRST116') {
            // Create new stats record
            await supabase.from('user_statistics').insert({
                user_id: user.id,
                total_points: points,
                current_streak: 1,
                longest_streak: 1,
                quizzes_taken: 1,
                correct_answers: 1,
                total_questions: 1,
                accuracy_percentage: 100
            });
        } else if (stats) {
            // Update existing stats
            const newTotalPoints = (stats.total_points || 0) + points;
            const newCorrectAnswers = (stats.correct_answers || 0) + 1;
            const newTotalQuestions = (stats.total_questions || 0) + 1;
            const newAccuracy = Math.round((newCorrectAnswers / newTotalQuestions) * 100);
            
            await supabase
                .from('user_statistics')
                .update({
                    total_points: newTotalPoints,
                    current_streak: (stats.current_streak || 0) + 1,
                    longest_streak: Math.max((stats.longest_streak || 0), (stats.current_streak || 0) + 1),
                    quizzes_taken: (stats.quizzes_taken || 0) + 1,
                    correct_answers: newCorrectAnswers,
                    total_questions: newTotalQuestions,
                    accuracy_percentage: newAccuracy,
                    last_quiz_date: new Date().toISOString()
                })
                .eq('user_id', user.id);
        }
        
        updateSidebarPoints();
        loadProfileStats();
        
    } catch (error) {
        console.error('Error updating points:', error);
    }
}

async function loadLeaderboards() {
    try {
        // Load All India leaderboard
        const { data: allIndiaData } = await supabase
            .from('user_statistics')
            .select('total_points, user_profiles!inner(full_name, city, state)')
            .order('total_points', { ascending: false })
            .limit(10);
        
        const allIndiaLeaderboard = document.getElementById('allIndiaLeaderboard');
        if (allIndiaLeaderboard) {
            allIndiaLeaderboard.innerHTML = '';
            
            if (allIndiaData && allIndiaData.length > 0) {
                allIndiaData.forEach((entry, index) => {
                    const div = document.createElement('div');
                    div.className = 'flex justify-between items-center p-2 bg-white rounded';
                    div.innerHTML = `
                        <span class="font-medium">${index + 1}. ${entry.user_profiles?.full_name || 'Anonymous'}</span>
                        <span class="text-sm text-gray-600">${entry.total_points} pts</span>
                    `;
                    allIndiaLeaderboard.appendChild(div);
                });
            } else {
                allIndiaLeaderboard.innerHTML = '<p class="text-gray-500 text-center">No data available</p>';
            }
        }
        
        // Load City leaderboard (using user's city)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('city')
                .eq('id', user.id)
                .single();
            
            if (userProfile?.city) {
                const { data: cityData } = await supabase
                    .from('user_statistics')
                    .select('total_points, user_profiles!inner(full_name, city)')
                    .eq('user_profiles.city', userProfile.city)
                    .order('total_points', { ascending: false })
                    .limit(10);
                
                const cityLeaderboard = document.getElementById('cityLeaderboard');
                if (cityLeaderboard) {
                    cityLeaderboard.innerHTML = '';
                    
                    if (cityData && cityData.length > 0) {
                        cityData.forEach((entry, index) => {
                            const div = document.createElement('div');
                            div.className = 'flex justify-between items-center p-2 bg-white rounded';
                            div.innerHTML = `
                                <span class="font-medium">${index + 1}. ${entry.user_profiles?.full_name || 'Anonymous'}</span>
                                <span class="text-sm text-gray-600">${entry.total_points} pts</span>
                            `;
                            cityLeaderboard.appendChild(div);
                        });
                    } else {
                        cityLeaderboard.innerHTML = '<p class="text-gray-500 text-center">No data available</p>';
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Error loading leaderboards:', error);
    }
}

async function updateSidebarPoints() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: stats } = await supabase
            .from('user_statistics')
            .select('total_points')
            .eq('user_id', user.id)
            .single();
        
        if (stats) {
            const pointsElement = document.querySelector('#userName').nextElementSibling;
            if (pointsElement) {
                pointsElement.textContent = `${stats.total_points || 0} points`;
            }
        }
    } catch (error) {
        console.error('Error updating sidebar points:', error);
    }
}

async function loadProfileStats() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: stats } = await supabase
            .from('user_statistics')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        const totalPoints = document.getElementById('totalPoints');
        const currentStreak = document.getElementById('currentStreak');
        const quizzesTaken = document.getElementById('quizzesTaken');
        const accuracy = document.getElementById('accuracy');
        
        if (stats) {
            if (totalPoints) totalPoints.textContent = stats.total_points || '00';
            if (currentStreak) currentStreak.textContent = stats.current_streak || '00';
            if (quizzesTaken) quizzesTaken.textContent = stats.quizzes_taken || '00';
            if (accuracy) accuracy.textContent = `${stats.accuracy_percentage || 0}%`;
        } else {
            if (totalPoints) totalPoints.textContent = '00';
            if (currentStreak) currentStreak.textContent = '00';
            if (quizzesTaken) quizzesTaken.textContent = '00';
            if (accuracy) accuracy.textContent = '00%';
        }
    } catch (error) {
        console.error('Error loading profile stats:', error);
    }
}

// Assessment functionality
function startAssessment(marks, minutes) {
    const userClass = getUserClass();
    showSuccess(`Starting ${marks}-mark test for ${minutes} minutes. Class: ${userClass}`);
    // Implementation for assessment test would go here
}

function startSubjectTest() {
    const subject = document.getElementById('subjectSelect').value;
    if (!subject) {
        showError('Please select a subject first.');
        return;
    }
    showSuccess(`Starting ${subject} test. Class: ${getUserClass()}`);
    // Implementation for subject-specific test would go here
}

function viewResults() {
    showSuccess('Loading your test results...');
    // Implementation for viewing results would go here
}

function getUserClass() {
    const classElement = document.getElementById('userClass');
    return classElement ? classElement.textContent : 'Class 10';
}

// Profile functionality
async function saveProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const profileData = {
            full_name: document.getElementById('profileName').value,
            school_name: document.getElementById('profileSchool').value,
            class: document.getElementById('profileClass').value,
            board: document.getElementById('profileBoard').value,
            city: document.getElementById('profileCity').value,
            state: document.getElementById('profileState').value,
            updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('user_profiles')
            .update(profileData)
            .eq('id', user.id);
        
        if (error) {
            showError('Failed to save profile. Please try again.');
        } else {
            showSuccess('Profile saved successfully!');
            updateUserInterface(profileData);
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showError('Failed to save profile. Please try again.');
    }
}

// Upgrade modal functions
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

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('hidden');
}

// Show section
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
    
    // Load specific content when sections are shown
    if (sectionId === 'dailyChallengeSection') {
        loadTodayQuestion();
        loadLeaderboards();
    } else if (sectionId === 'profileSection') {
        loadProfileStats();
    }
}

// Send message function
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

// Add message to chat
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

// Initialize features when page loads
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
    
    console.log('Dashboard functions loaded successfully');
});

