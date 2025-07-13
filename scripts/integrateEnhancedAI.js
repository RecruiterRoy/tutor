// Enhanced AI Integration for Dashboard
// This script adds enhanced AI features to the existing dashboard

console.log('🚀 Integrating Enhanced AI Features...');

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedAI();
});

function initializeEnhancedAI() {
    // Initialize Enhanced AI Service
    if (typeof EnhancedAIService !== 'undefined') {
        window.enhancedAI = new EnhancedAIService();
        
        // Get user info from existing dashboard
        const userGrade = localStorage.getItem('userGrade') || '6';
        const userSubject = localStorage.getItem('userSubject') || 'Mathematics';
        
        // Initialize with user's grade and subject
        window.enhancedAI.initialize(userGrade, userSubject);
        
        // Add enhanced features to existing chat
        enhanceExistingChat();
        
        // Add proactive reminders
        setupProactiveReminders();
        
        // Add lesson plan button
        addLessonPlanButton();
        
        console.log('✅ Enhanced AI Features Integrated');
    } else {
        console.log('⚠️ EnhancedAIService not loaded, retrying...');
        setTimeout(initializeEnhancedAI, 1000);
    }
}

function enhanceExistingChat() {
    // Override existing sendMessage function if it exists
    if (window.sendMessage) {
        const originalSendMessage = window.sendMessage;
        
        window.sendMessage = async function(message) {
            try {
                // Use enhanced AI service
                const response = await window.enhancedAI.sendMessage(message, 'chat');
                
                if (response.success) {
                    // Display response using existing UI
                    displayMessage('assistant', response.response);
                    
                    // Show knowledge bank info if available
                    if (response.knowledgeResults && response.knowledgeResults.books.length > 0) {
                        showKnowledgeBankInfo(response.knowledgeResults);
                    }
                } else {
                    // Fallback to original function
                    originalSendMessage(message);
                }
            } catch (error) {
                console.error('Enhanced AI failed, using fallback:', error);
                originalSendMessage(message);
            }
        };
    }
}

function showKnowledgeBankInfo(knowledgeResults) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'knowledge-bank-info';
    infoDiv.innerHTML = `
        <div class="kb-info-content">
            <h4>📚 Available Resources</h4>
            ${knowledgeResults.books.length > 0 ? `
                <p><strong>Textbooks:</strong> ${knowledgeResults.books.length} relevant books found</p>
            ` : ''}
            ${knowledgeResults.images.length > 0 ? `
                <p><strong>Images:</strong> ${knowledgeResults.images.length} visual resources available</p>
            ` : ''}
            ${knowledgeResults.syllabus ? `
                <p><strong>Syllabus:</strong> CBSE curriculum guidelines available</p>
            ` : ''}
        </div>
    `;
    
    // Add to chat area
    const chatArea = document.querySelector('.chat-messages') || document.querySelector('#chat-messages');
    if (chatArea) {
        chatArea.appendChild(infoDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.remove();
            }
        }, 5000);
    }
}

function setupProactiveReminders() {
    // Check for reminders every minute
    setInterval(() => {
        if (window.enhancedAI) {
            window.enhancedAI.showProactiveReminders();
        }
    }, 60000);
    
    // Check immediately on page load
    setTimeout(() => {
        if (window.enhancedAI) {
            window.enhancedAI.showProactiveReminders();
        }
    }, 2000);
}

function addLessonPlanButton() {
    // Find existing buttons area
    const buttonArea = document.querySelector('.chat-controls') || 
                      document.querySelector('.input-area') || 
                      document.querySelector('.chat-input-container');
    
    if (buttonArea) {
        const lessonPlanBtn = document.createElement('button');
        lessonPlanBtn.className = 'lesson-plan-btn';
        lessonPlanBtn.innerHTML = '📋 Lesson Plan';
        lessonPlanBtn.onclick = showLessonPlan;
        
        buttonArea.appendChild(lessonPlanBtn);
    }
}

async function showLessonPlan() {
    if (!window.enhancedAI) return;
    
    try {
        const lessonPlan = await window.enhancedAI.createLessonPlan();
        if (lessonPlan) {
            displayLessonPlan(lessonPlan);
        }
    } catch (error) {
        console.error('Error showing lesson plan:', error);
    }
}

function displayLessonPlan(lessonPlan) {
    const modal = document.createElement('div');
    modal.className = 'lesson-plan-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📋 Lesson Plan - ${lessonPlan.grade} ${lessonPlan.subject}</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="plan-summary">
                    <p><strong>Total Weeks:</strong> ${lessonPlan.totalWeeks}</p>
                    <p><strong>Teaching Weeks:</strong> ${lessonPlan.teachingWeeks}</p>
                    <p><strong>Revision Weeks:</strong> ${lessonPlan.revisionWeeks}</p>
                    <p><strong>Exam Month:</strong> ${lessonPlan.examMonth}</p>
                </div>
                
                <div class="weekly-schedule">
                    <h3>Weekly Schedule (First 8 weeks)</h3>
                    ${lessonPlan.weeklySchedule.slice(0, 8).map(week => `
                        <div class="week-item">
                            <h4>Week ${week.week}</h4>
                            <p><strong>Book:</strong> ${week.book}</p>
                            <p><strong>Chapters:</strong> ${week.chapters.map(ch => ch.chapterName).join(', ')}</p>
                            <p><strong>Activities:</strong> ${week.activities.join(', ')}</p>
                            ${week.assessment ? `<p><strong>Assessment:</strong> ${week.assessment}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div class="assessment-schedule">
                    <h3>Assessment Schedule</h3>
                    ${lessonPlan.assessmentSchedule.map(assessment => `
                        <div class="assessment-item">
                            <p><strong>Week ${assessment.week}:</strong> ${assessment.type}</p>
                            <p>Topics: ${assessment.topics}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Add CSS for enhanced features
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    .knowledge-bank-info {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        margin: 10px 0;
        font-size: 14px;
    }
    
    .kb-info-content h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
    }
    
    .kb-info-content p {
        margin: 4px 0;
        font-size: 13px;
    }
    
    .lesson-plan-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
        font-size: 14px;
        transition: transform 0.2s;
    }
    
    .lesson-plan-btn:hover {
        transform: translateY(-2px);
    }
    
    .lesson-plan-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        border-radius: 10px;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        width: 90%;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .modal-header h2 {
        margin: 0;
        color: #333;
    }
    
    .modal-header button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .plan-summary {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    
    .plan-summary p {
        margin: 5px 0;
        font-size: 14px;
    }
    
    .week-item {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        border-left: 4px solid #667eea;
    }
    
    .week-item h4 {
        margin: 0 0 10px 0;
        color: #333;
    }
    
    .week-item p {
        margin: 5px 0;
        font-size: 13px;
    }
    
    .assessment-item {
        background: #fff3cd;
        padding: 10px;
        border-radius: 5px;
        margin: 5px 0;
        border-left: 4px solid #ffc107;
    }
    
    .assessment-item p {
        margin: 3px 0;
        font-size: 13px;
    }
`;

document.head.appendChild(enhancedStyles);

console.log('🎯 Enhanced AI Integration Script Loaded'); 
