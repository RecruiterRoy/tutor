// Dashboard.js - Main dashboard functionality
// Note: Supabase client is initialized via config.js and supabaseClient.js

// Use the global supabaseClient that's initialized in config.js
// No need to declare supabase here as it's already available via window.supabaseClient

// Global variable declarations to prevent redeclaration errors
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// Proper APK detection (Capacitor/Android or file protocol)
window.isAPK = (window.location.protocol === 'file:'
  || navigator.userAgent.includes('Capacitor')
  || navigator.userAgent.includes('Android'));
window.ttsEnabled = true;
window.isRecording = false;
window.currentUser = null;
window.selectedAvatar = 'miss-sapna'; // Default to Miss Sapna
window.userData = null;
// Do not override the TTS instance created by textToSpeech.js
if (typeof window.textToSpeech === 'undefined') {
    window.textToSpeech = null;
}
window.voiceRecognition = null;

// Make functions globally accessible IMMEDIATELY for HTML onclick handlers
// These will be replaced with actual implementations later
// Note: toggleVoiceRecording is defined later in the file

window.closeSidebar = function() {
    // This is for desktop sidebar - redirect to mobile sidebar for now
    closeMobileSidebar();
};

window.showSection = function(sectionName) {
    console.log('🔧 Showing section:', sectionName);
    
    // First, hide ALL sections and chat containers
    const allSections = document.querySelectorAll('[id$="Section"]');
    console.log(`🔧 Found ${allSections.length} sections to hide`);
    allSections.forEach(section => {
        section.classList.add('hidden');
        section.style.display = 'none';
        section.style.zIndex = '1';
        section.style.position = 'absolute';
        section.style.top = '-9999px';
    });
    
    // Hide all chat containers
    const chatBox = document.querySelector('.chat-box-container');
    const mainChatArea = document.querySelector('.chat-area');
    const chatContainer = document.querySelector('.chat-container');
    
    if (chatBox) {
        chatBox.classList.add('hidden');
        chatBox.style.display = 'none';
        chatBox.style.zIndex = '1';
        chatBox.style.position = 'absolute';
        chatBox.style.top = '-9999px';
    }
    
    if (mainChatArea) {
        mainChatArea.style.display = 'none';
        mainChatArea.style.zIndex = '1';
        mainChatArea.style.position = 'absolute';
        mainChatArea.style.top = '-9999px';
    }
    
    if (chatContainer) {
        chatContainer.style.display = 'none';
        chatContainer.style.zIndex = '1';
        chatContainer.style.position = 'absolute';
        chatContainer.style.top = '-9999px';
    }
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`🔧 Found ${navItems.length} nav items to update`);
    navItems.forEach(item => {
        item.classList.remove('active', 'bg-white/10', 'text-white');
        item.classList.add('text-gray-300');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName + 'Section');
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
        selectedSection.style.display = 'block';
        selectedSection.style.zIndex = '10';
        selectedSection.style.position = 'relative';
        selectedSection.style.top = '0';
        // Ensure mobile scrollability
        selectedSection.style.overflowY = 'auto';
        selectedSection.style.maxHeight = '100vh';
        selectedSection.style.webkitOverflowScrolling = 'touch';
        console.log('✅ Section shown:', sectionName + 'Section');
        
        // Update subject progress when progress section is shown
        if (sectionName === 'progress') {
            updateSubjectProgress();
        }
    } else if (sectionName === 'chat') {
        // Handle chat section specially since it doesn't have a Section ID
        if (chatBox) {
            chatBox.classList.remove('hidden');
            chatBox.style.display = 'flex';
            chatBox.style.zIndex = '10';
            chatBox.style.position = 'relative';
            chatBox.style.top = '0';
            console.log('✅ Chat section shown');
        }
        
        if (mainChatArea) {
            mainChatArea.style.display = 'block';
            mainChatArea.style.zIndex = '10';
            mainChatArea.style.position = 'relative';
            mainChatArea.style.top = '0';
            console.log('✅ Main chat area shown');
        }
        
        if (chatContainer) {
            chatContainer.style.display = 'flex';
            chatContainer.style.zIndex = '10';
            chatContainer.style.position = 'relative';
            chatContainer.style.top = '0';
            console.log('✅ Chat container shown');
        }
    } else {
        console.log('❌ Section not found:', sectionName + 'Section');
    }
    
    // Add active class to nav item based on text content
    navItems.forEach(item => {
        const text = item.textContent.trim();
        if ((sectionName === 'chat' && (text.includes('Classroom') || text.includes('🏫'))) ||
            (sectionName === 'materials' && (text.includes('Study Materials') || text.includes('📚'))) ||
            (sectionName === 'progress' && (text.includes('Progress') || text.includes('📊'))) ||
            (sectionName === 'settings' && (text.includes('Settings') || text.includes('⚙️')))) {
            item.classList.add('active', 'bg-white/10', 'text-white');
            item.classList.remove('text-gray-300');
            console.log('✅ Active class added to nav item:', text);
        }
    });
    
    console.log('✅ Section navigation completed for:', sectionName);
    // Notify listeners that a section is shown (for rebinding buttons)
    try {
        document.dispatchEvent(new CustomEvent('section:shown', { detail: { sectionName } }));
    } catch (_) {}
}

window.saveChatMessage = function(message, response) {
    console.log('saveChatMessage called - waiting for implementation');
};

// Legacy alias only (avoid wrapper recursion)
window.closeSidebar = function() { try { closeMobileSidebar(); } catch (_) {} };

window.showSubjectManager = function() {
    console.log('🔧 showSubjectManager called');
    if (window.subjectManager && window.subjectManager.showSubjectManager) {
        console.log('✅ Calling subjectManager.showSubjectManager()');
        return window.subjectManager.showSubjectManager();
    } else {
        console.error('❌ subjectManager not available');
        showError('Subject manager not loaded. Please refresh the page.');
        // Try to load subjectManager
        if (typeof loadSubjectManager === 'function') {
            loadSubjectManager();
        }
    }
};

window.showTrialInfo = function() {
    console.log('⏰ Trial info clicked');
    showSuccess('Trial information feature coming soon!');
};

window.openMobileSidebar = function() {
    console.log('🔧 Opening mobile sidebar...');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100');
        overlay.style.removeProperty('display');
        overlay.style.removeProperty('visibility');
        overlay.style.pointerEvents = 'auto';
        overlay.classList.add('pointer-events-auto');
        
        // Prevent body scroll on mobile
        if (window.isMobile) {
            document.body.style.overflow = 'hidden';
        }
        // Allow repeated opens
        sidebar.dataset.transitioning = 'false';
        console.log('✅ Mobile sidebar opened');
    } else {
        console.log('❌ Mobile sidebar elements not found');
    }
};

window.playTTS = function() {
    console.log('playTTS called - waiting for implementation');
};

window.stopTTS = function() {
    console.log('stopTTS called - waiting for implementation');
};



window.handleAvatarSelection = function(language) {
    console.log('handleAvatarSelection called - waiting for implementation:', language);
};

// Camera Scan Functions
if (!window.startCameraScan) {
    window.startCameraScan = function() {
        console.log('📸 Starting camera scan');
        
        // Check if user has opted to not show tips
        const hideCameraTips = localStorage.getItem('hideCameraTips');
        
        if (!hideCameraTips) {
            showCameraTips();
        } else {
            openCameraModal();
        }
    };
}

function showCameraTips() {
    const tipsModal = document.createElement('div');
    tipsModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        backdrop-filter: blur(5px);
    `;
    
    tipsModal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
            <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">📸 Camera Tips for Better OCR Results</h3>
            <div style="text-align: left; color: rgba(255, 255, 255, 0.9); margin-bottom: 1.5rem; line-height: 1.6;">
                <div style="margin-bottom: 0.5rem;"><strong>💡 Bright, even lighting</strong> - Avoid shadows and glare</div>
                <div style="margin-bottom: 0.5rem;"><strong>📷 Sharp focus</strong> - Hold camera steady, 90° to page</div>
                <div style="margin-bottom: 0.5rem;"><strong>🎯 High contrast</strong> - Black text on white background</div>
                <div style="margin-bottom: 0.5rem;"><strong>📏 Proper distance</strong> - Keep text large and readable</div>
                <div style="margin-bottom: 0.5rem;"><strong>🔍 Clean surface</strong> - Avoid wrinkles and reflections</div>
                <div style="margin-bottom: 0.5rem;"><strong>✍️ Clear text</strong> - Printed text works better than handwriting</div>
            </div>
            <div style="margin-bottom: 1.5rem; text-align: left;">
                <label style="color: white; display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="dontShowAgain" style="margin-right: 0.5rem;">
                    Don't show this warning again
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="closeTipsAndOpenCamera()" style="
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">Start Camera</button>
                <button onclick="closeTipsModal()" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(tipsModal);
}

function closeTipsAndOpenCamera() {
    const dontShowAgain = document.getElementById('dontShowAgain').checked;
    if (dontShowAgain) {
        localStorage.setItem('hideCameraTips', 'true');
    }
    
    // Remove tips modal
    const tipsModal = document.querySelector('div[style*="z-index: 10001"]');
    if (tipsModal) {
        tipsModal.remove();
    }
    
    // Open camera modal
    openCameraModal();
}

function closeTipsModal() {
    const tipsModal = document.querySelector('div[style*="z-index: 10001"]');
    if (tipsModal) {
        tipsModal.remove();
    }
}

window.openCameraModal = function() {
    const modal = document.getElementById('cameraScanModal');
    modal.classList.remove('hidden');
    
    // Hide re-analyze button for new scan
    const reAnalyzeBtn = document.getElementById('reAnalyzeBtn');
    if (reAnalyzeBtn) {
        reAnalyzeBtn.classList.add('hidden');
    }
    
    // Start camera
    startCamera();
}

window.closeCameraModal = function() {
    console.log('📸 Closing camera modal');
    const modal = document.getElementById('cameraScanModal');
    modal.classList.add('hidden');
    
    // Stop camera stream
    stopCamera();
    
    // Reset UI
    resetCameraUI();
};

window.capturePhoto = function() {
    console.log('📷 Capturing photo');
    const canvas = document.getElementById('photoCanvas');
    const video = document.getElementById('cameraView');
    
    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Show retake button, hide capture
    document.getElementById('captureBtn').classList.add('hidden');
    document.getElementById('retakeBtn').classList.remove('hidden');
    
    // Process the image
    processCapturedImage();
};

window.retakePhoto = function() {
    console.log('🔄 Retaking photo');
    resetCameraUI();
    startCamera();
};

window.sendToChat = function() {
    // Use edited text if available, otherwise use the displayed text
    const textToSend = (window.editedExtractedText && window.editedExtractedText.trim()) || document.getElementById('extractedText').textContent.trim();
    
    // Add the scanned question to chat input and send it through existing chat system
    const chatInput = document.getElementById('chatInput');
    const chatInputMobile = document.getElementById('chatInputMobile');
    if (chatInputMobile) chatInputMobile.value = textToSend;
    if (chatInput) chatInput.value = textToSend;
    // Trigger the existing send message function
    sendMessage();
    
    // Close modal
    closeCameraModal();
};

// Camera helper functions
let cameraStream = null;

async function startCamera() {
    try {
        // Check if camera permission is already granted
        const permissions = await navigator.permissions.query({ name: 'camera' });
        
        if (permissions.state === 'denied') {
            showPermissionModal('camera', 'Camera access is required to scan problems. Please enable camera permissions in your browser settings.');
            return;
        }
        
        // Mobile-optimized camera settings for better performance
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        const constraints = {
            video: { 
                facingMode: 'environment', // Use back camera on mobile
                width: isMobile ? { ideal: 1280, min: 640 } : { ideal: 1920, min: 1280 },
                height: isMobile ? { ideal: 720, min: 480 } : { ideal: 1080, min: 720 },
                aspectRatio: { ideal: 4/3 }, // Better for document scanning
                focusMode: 'continuous', // Auto-focus for better text clarity
                exposureMode: 'continuous',
                whiteBalanceMode: 'continuous',
                // Mobile-specific optimizations
                frameRate: isMobile ? { ideal: 15, max: 30 } : { ideal: 30, max: 60 }
            } 
        };
        
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        const video = document.getElementById('cameraView');
        video.srcObject = cameraStream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
        });
        
        console.log('✅ Camera started with enhanced settings');
    } catch (err) {
        console.error('❌ Camera error:', err);
        if (err.name === 'NotAllowedError') {
            showPermissionModal('camera', 'Camera access denied. Please allow camera permissions to scan problems.');
        } else {
            alert('Camera error: ' + err.message);
        }
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function resetCameraUI() {
    document.getElementById('captureBtn').classList.remove('hidden');
    document.getElementById('retakeBtn').classList.add('hidden');
    document.getElementById('processingStatus').classList.add('hidden');
    document.getElementById('scanResults').classList.add('hidden');
    document.getElementById('cameraContainer').classList.remove('hidden');
    
    // Clear edited text and image data
    window.editedExtractedText = null;
    window.originalExtractedText = null;
    window.capturedImageData = null;
    
    // Hide re-analyze button
    const reAnalyzeBtn = document.getElementById('reAnalyzeBtn');
    if (reAnalyzeBtn) {
        reAnalyzeBtn.classList.add('hidden');
    }
}

async function processCapturedImage() {
    const canvas = document.getElementById('photoCanvas');
    const video = document.getElementById('cameraView');
    
    // Set canvas to match video dimensions for better quality
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas with better quality
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get high-quality image data
    const imageData = canvas.toDataURL('image/png', 1.0); // Use PNG for better quality
    
    // Show processing status
    document.getElementById('processingStatus').classList.remove('hidden');
    // Reset progress once per processing cycle
    const statusText = document.getElementById('statusText');
    if (statusText) statusText.textContent = 'Processing image... 0%';
    document.getElementById('cameraContainer').classList.add('hidden');
    
    try {
        // Extract text using enhanced OCR
        updateStatus('Extracting text from image...');
        const extractedText = await extractTextFromImage(imageData);
        
        // Store original extracted text for comparison
        window.originalExtractedText = extractedText;
        window.editedExtractedText = null; // Clear any previous edits
        
        // Show results with confidence indicator
        updateStatus('Processing complete! 100%');
        const resultsElement = document.getElementById('extractedText');
        resultsElement.textContent = extractedText;
        
        // Add confidence indicator if available
        if (window.lastOCRConfidence) {
            const confidenceElement = document.createElement('div');
            confidenceElement.className = 'text-sm text-gray-500 mt-2';
            confidenceElement.textContent = `OCR Confidence: ${window.lastOCRConfidence.toFixed(1)}%`;
            resultsElement.parentNode.appendChild(confidenceElement);
        }
        
        document.getElementById('processingStatus').classList.add('hidden');
        document.getElementById('scanResults').classList.remove('hidden');
        
    } catch (error) {
        console.error('❌ Processing error:', error);
        updateStatus('Error processing image. Please try again.');
        setTimeout(() => {
            resetCameraUI();
        }, 2000);
    }
}

function updateStatus(message) {
    document.getElementById('statusText').textContent = message;
}

// OCR using Tesseract.js (client-side, free)
async function extractTextFromImage(imageData) {
    // Load Tesseract.js dynamically
    if (!window.Tesseract) {
        await loadTesseract();
    }
    
    try {
        // Preprocess image for better OCR
        const processedImage = await preprocessImage(imageData);
        
        // Mobile-optimized OCR with faster processing
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Use multiple language combinations for better accuracy
        const languages = ['eng+equ', 'eng+hin+equ', 'eng+hin+ben+equ', 'eng'];
        let bestResult = null;
        let bestConfidence = 0;
        
        for (const lang of languages) {
            try {
                console.log(`🔍 Trying OCR with language: ${lang}`);
                
                const result = await Tesseract.recognize(
                    processedImage,
                    lang,
                    { 
                        logger: m => {
                            if (m.status === 'recognizing text') {
                            // Clamp to 99% until finalize to show 100% only once
                            const pct = Math.min(99, Math.round(m.progress * 100));
                            updateStatus(`Processing... ${pct}%`);
                            }
                        },
                        errorHandler: err => console.error('OCR Error:', err)
                    }
                );
                
                // Calculate average confidence
                const avgConfidence = result.data.words.reduce((sum, word) => sum + word.confidence, 0) / result.data.words.length;
                
                console.log(`✅ OCR completed for ${lang}:`, result.data.text);
                console.log(`📊 Confidence: ${avgConfidence.toFixed(1)}%`);
                
                if (avgConfidence > bestConfidence) {
                    bestConfidence = avgConfidence;
                    bestResult = result;
                }
                
                // If we get good confidence (>60%), stop trying other languages
                if (avgConfidence > 60) {
                    console.log(`✅ High confidence achieved with ${lang}, stopping`);
                    break;
                }
                
            } catch (error) {
                console.warn(`OCR failed for language ${lang}:`, error);
                continue;
            }
        }
        
        if (bestResult) {
            console.log(`OCR completed with confidence: ${bestConfidence.toFixed(1)}%`);
            window.lastOCRConfidence = bestConfidence;
            return bestResult.data.text.trim();
        } else {
            throw new Error('All OCR attempts failed');
        }
        
    } catch (error) {
        console.error('OCR extraction failed:', error);
        return '';
    }
}

// Mobile-optimized image preprocessing for better OCR
async function preprocessImage(imageData) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Optimize canvas size for mobile
            const maxSize = isMobile ? 1024 : 2048;
            let { width, height } = img;
            
            // Scale down large images for mobile performance
            if (isMobile && (width > maxSize || height > maxSize)) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw original image with scaling if needed
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get image data for processing
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Apply preprocessing filters (simplified for mobile)
            for (let i = 0; i < data.length; i += 4) {
                // Convert to grayscale
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                
                // Apply contrast enhancement (reduced for mobile)
                const enhanced = Math.min(255, Math.max(0, (gray - 128) * (isMobile ? 1.2 : 1.5) + 128));
                
                // Apply threshold for better text separation
                const threshold = enhanced > 128 ? 255 : 0;
                
                data[i] = threshold;     // Red
                data[i + 1] = threshold; // Green
                data[i + 2] = threshold; // Blue
                data[i + 3] = 255;       // Alpha
            }
            
            // Put processed image data back
            ctx.putImageData(imageData, 0, 0);
            
            // Convert back to blob
            canvas.toBlob(resolve, 'image/png');
        };
        
        img.src = imageData;
    });
}

// Load Tesseract.js from CDN
async function loadTesseract() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/tesseract.js@4/dist/tesseract.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// AI Analysis using Anthropic Claude (cost: ~$0.01-0.03 per image)
async function analyzeWithAI(imageData, extractedText) {
    try {
        // Use edited text if available, otherwise use original
        const textToAnalyze = window.editedExtractedText || extractedText;
        
        // Get conversation context (last 5 messages)
        const conversationContext = getConversationContext();
        
        // Call Supabase Edge Function to protect API key
        const { data, error } = await supabase.functions.invoke('analyze-question', {
            body: {
                imageData: imageData,
                extractedText: textToAnalyze,
                userId: window.userData?.id || null,
                conversationContext: conversationContext
            }
        });
        
        if (error) throw error;
        
        // Check if AI needs more context (literature questions)
        if (data.needsMoreContext) {
            return handleLiteratureContextRequest(data.solution, textToAnalyze);
        }
        
        return data.solution;
        
    } catch (error) {
        console.error('AI analysis error:', error);
        return 'Sorry, I could not analyze this problem. Please try typing it instead.';
    }
}

// Get conversation context (last 5 messages)
function getConversationContext() {
    const chatMessages = document.querySelectorAll('#chatBox .message');
    const context = [];
    
    // Get last 5 messages
    for (let i = Math.max(0, chatMessages.length - 5); i < chatMessages.length; i++) {
        const message = chatMessages[i];
        const role = message.classList.contains('user-message') ? 'user' : 'assistant';
        const content = message.querySelector('.message-content')?.textContent || '';
        if (content.trim()) {
            context.push({ role, content: content.trim() });
        }
    }
    
    return context;
}

// Handle literature context requests
function handleLiteratureContextRequest(aiResponse, extractedText) {
    // Show modal asking for more context
    const contextModal = document.createElement('div');
    contextModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10002;
        backdrop-filter: blur(5px);
    `;
    
    contextModal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
            <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">📚 Literature Question Detected</h3>
            <div style="text-align: left; color: rgba(255, 255, 255, 0.9); margin-bottom: 1.5rem; line-height: 1.6;">
                <p><strong>Question:</strong> ${extractedText}</p>
                <p style="margin-top: 1rem;"><strong>AI Response:</strong> ${aiResponse}</p>
                <p style="margin-top: 1rem; color: #ffd700;">📸 Please take additional photos of the story context to provide a better answer.</p>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="continueWithLiteratureContext()" style="
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">📸 Add More Photos</button>
                <button onclick="closeContextModal()" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">Use Current Answer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(contextModal);
    
    // Store context for later use
    window.literatureContext = {
        question: extractedText,
        initialResponse: aiResponse,
        additionalImages: []
    };
}

window.continueWithLiteratureContext = function() {
    // Close context modal
    const contextModal = document.querySelector('div[style*="z-index: 10002"]');
    if (contextModal) {
        contextModal.remove();
    }
    
    // Show camera again for additional photos
    document.getElementById('cameraContainer').classList.remove('hidden');
    document.getElementById('scanResults').classList.add('hidden');
    document.getElementById('processingStatus').classList.add('hidden');
    
    // Update capture button to add to context
    const captureBtn = document.getElementById('captureBtn');
    captureBtn.innerHTML = '<span>📸</span><span>Add to Context</span>';
    captureBtn.onclick = addToLiteratureContext;
    
    // Show instruction
    const instruction = document.createElement('div');
    instruction.id = 'contextInstruction';
    instruction.style.cssText = `
        background: rgba(255, 215, 0, 0.2);
        border: 1px solid #ffd700;
        color: #ffd700;
        padding: 0.5rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
    `;
    instruction.textContent = '📚 Take photos of the story context (characters, plot, setting)';
    
    const cameraContainer = document.getElementById('cameraContainer');
    cameraContainer.insertBefore(instruction, cameraContainer.firstChild);
};

window.addToLiteratureContext = function() {
    const canvas = document.getElementById('photoCanvas');
    const video = document.getElementById('cameraView');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Add to context
    if (!window.literatureContext.additionalImages) {
        window.literatureContext.additionalImages = [];
    }
    window.literatureContext.additionalImages.push(imageData);
    
    // Show success message
    const instruction = document.getElementById('contextInstruction');
    instruction.style.background = 'rgba(76, 175, 80, 0.2)';
    instruction.style.borderColor = '#4caf50';
    instruction.style.color = '#4caf50';
    instruction.textContent = `✅ Context photo ${window.literatureContext.additionalImages.length} added! Take more or analyze.`;
    
    // Show analyze button
    const analyzeBtn = document.createElement('button');
    analyzeBtn.id = 'analyzeWithContextBtn';
    analyzeBtn.className = 'btn-modern w-full mt-3';
    analyzeBtn.innerHTML = '<span>🤖</span><span>Analyze with Context</span>';
    analyzeBtn.onclick = analyzeWithLiteratureContext;
    
    const controls = document.querySelector('#cameraScanModal .flex.space-x-3');
    controls.appendChild(analyzeBtn);
};

async function analyzeWithLiteratureContext() {
    try {
        updateStatus('Analyzing with literature context...');
        
        const { data, error } = await supabase.functions.invoke('analyze-question', {
            body: {
                imageData: window.literatureContext.additionalImages[0], // Use first context image
                extractedText: window.literatureContext.question,
                additionalImages: window.literatureContext.additionalImages,
                userId: window.userData?.id || null,
                isLiteratureContext: true
            }
        });
        
        if (error) throw error;
        
        // Show enhanced result
        document.getElementById('extractedText').textContent = window.literatureContext.question;
        document.getElementById('aiSolution').textContent = data.solution;
        
        document.getElementById('processingStatus').classList.add('hidden');
        document.getElementById('scanResults').classList.remove('hidden');
        
        // Reset camera UI
        resetCameraUI();
        
    } catch (error) {
        console.error('Literature analysis error:', error);
        updateStatus('Error analyzing with context. Please try again.');
    }
}

window.closeContextModal = function() {
    const contextModal = document.querySelector('div[style*="z-index: 10002"]');
    if (contextModal) {
        contextModal.remove();
    }
    
    // Use the initial response
    document.getElementById('extractedText').textContent = window.literatureContext.question;
    document.getElementById('aiSolution').textContent = window.literatureContext.initialResponse;
    
    document.getElementById('processingStatus').classList.add('hidden');
    document.getElementById('scanResults').classList.remove('hidden');
    
    // Reset camera UI
    resetCameraUI();
};

// Text editing functions for camera scan
window.editExtractedText = function() {
    const extractedTextDiv = document.getElementById('extractedText');
    const editTextArea = document.getElementById('editTextArea');
    const textEditor = document.getElementById('textEditor');
    
    // Get current text and populate editor
    const currentText = extractedTextDiv.textContent;
    textEditor.value = currentText;
    
    // Show editor, hide display
    extractedTextDiv.classList.add('hidden');
    editTextArea.classList.remove('hidden');
    
    // Focus on textarea
    textEditor.focus();
    textEditor.setSelectionRange(0, textEditor.value.length);
};

window.saveEditedText = function() {
    const extractedTextDiv = document.getElementById('extractedText');
    const editTextArea = document.getElementById('editTextArea');
    const textEditor = document.getElementById('textEditor');
    
    // Update the displayed text
    extractedTextDiv.textContent = textEditor.value;
    
    // Store the edited text for AI analysis
    window.editedExtractedText = textEditor.value;
    
    // Hide editor, show display
    extractedTextDiv.classList.remove('hidden');
    editTextArea.classList.add('hidden');
    
    // Show re-analyze button if text was changed
    if (textEditor.value !== window.originalExtractedText) {
        showReAnalyzeButton();
    }
    
    // Show success message
    if (window.showSuccess) {
        window.showSuccess('Text updated successfully!');
    }
};

window.cancelEdit = function() {
    const extractedTextDiv = document.getElementById('extractedText');
    const editTextArea = document.getElementById('editTextArea');
    
    // Hide editor, show display (text remains unchanged)
    extractedTextDiv.classList.remove('hidden');
    editTextArea.classList.add('hidden');
};

// Show re-analyze button when text is edited
function showReAnalyzeButton() {
    const reAnalyzeBtn = document.getElementById('reAnalyzeBtn');
    if (reAnalyzeBtn) {
        reAnalyzeBtn.classList.remove('hidden');
    }
}

// Re-analyze with edited text
window.reAnalyzeWithEditedText = async function() {
    try {
        const reAnalyzeBtn = document.getElementById('reAnalyzeBtn');
        const aiSolution = document.getElementById('aiSolution');
        
        // Show loading state
        reAnalyzeBtn.textContent = '🔄 Analyzing...';
        reAnalyzeBtn.disabled = true;
        aiSolution.textContent = 'Analyzing with updated text...';
        
        // Re-analyze with edited text
        const newSolution = await analyzeWithAI(window.capturedImageData, window.editedExtractedText);
        
        // Update AI solution
        aiSolution.textContent = newSolution;
        
        // Reset button
        reAnalyzeBtn.textContent = '🔄 Re-analyze';
        reAnalyzeBtn.disabled = false;
        
        // Show success message
        if (window.showSuccess) {
            window.showSuccess('Re-analyzed with updated text!');
        }
        
    } catch (error) {
        console.error('Error re-analyzing:', error);
        const aiSolution = document.getElementById('aiSolution');
        aiSolution.textContent = 'Error re-analyzing. Please try again.';
        
        // Reset button
        const reAnalyzeBtn = document.getElementById('reAnalyzeBtn');
        if (reAnalyzeBtn) {
            reAnalyzeBtn.textContent = '🔄 Re-analyze';
            reAnalyzeBtn.disabled = false;
        }
    }
};

// Permission modal function
function showPermissionModal(permissionType, message) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10003;
        backdrop-filter: blur(5px);
    `;
    
    const icon = permissionType === 'camera' ? '📸' : '🎤';
    const title = permissionType === 'camera' ? 'Camera Permission Required' : 'Microphone Permission Required';
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
            <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">${icon} ${title}</h3>
            <p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 1.5rem; line-height: 1.6;">
                ${message}
            </p>
            <div style="text-align: left; color: rgba(255, 255, 255, 0.8); margin-bottom: 1.5rem; font-size: 0.9rem;">
                <div style="margin-bottom: 0.5rem;"><strong>To enable permissions:</strong></div>
                <div style="margin-bottom: 0.5rem;">1. Click the lock/info icon in your browser's address bar</div>
                <div style="margin-bottom: 0.5rem;">2. Find "${permissionType === 'camera' ? 'Camera' : 'Microphone'}" in the permissions list</div>
                <div style="margin-bottom: 0.5rem;">3. Change it from "Block" to "Allow"</div>
                <div style="margin-bottom: 0.5rem;">4. Refresh the page and try again</div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="closePermissionModal()" style="
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">Got it</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

window.closePermissionModal = function() {
    const modal = document.querySelector('div[style*="z-index: 10003"]');
    if (modal) {
        modal.remove();
    }
};

window.downloadApp = function() {
    console.log('📱 Download App called');
    
    // Show download modal with progress
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
            <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">📱 Downloading tution.app</h3>
            <p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 1.5rem;">
                Your download will start automatically...
            </p>
            <div style="
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 1rem;
            ">
                <div id="progress-bar" style="
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    transition: width 0.3s ease;
                "></div>
            </div>
            <p id="download-status" style="color: #4ecdc4; font-size: 0.9rem;">Preparing download...</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Simulate download progress
    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const status = document.getElementById('download-status');
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        
        if (progress < 30) {
            status.textContent = 'Preparing download...';
        } else if (progress < 60) {
            status.textContent = 'Downloading APK file...';
        } else if (progress < 90) {
            status.textContent = 'Almost done...';
        } else {
            status.textContent = 'Download complete!';
            clearInterval(interval);
            
            // Trigger actual download after 1 second
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = '/tution.app.v1.1.apk';
                link.download = 'tution.app.v1.1.apk';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Close modal after download
                setTimeout(() => {
                    modal.remove();
                }, 2000);
            }, 1000);
        }
    }, 200);
};

window.scrollToTop = function() {
    console.log('scrollToTop called - waiting for implementation');
};

window.forceShowTrialOverlay = function() {
    console.log('forceShowTrialOverlay called - waiting for implementation');
};

window.upgradeToPremium = function() {
    console.log('upgradeToPremium called - waiting for implementation');
};

window.closeTrialOverlay = function() {
    console.log('closeTrialOverlay called - waiting for implementation');
};

// Make variables globally accessible immediately
window.currentUser = null;
window.isRecording = false;
window.selectedAvatar = null; // Will be set from user profile
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
window.userDataLoaded = false; // Flag to track if user data is loaded

// Function to get current avatar name dynamically
function getCurrentAvatarName() {
    console.log('🔧 getCurrentAvatarName called');
    console.log('🔧 window.userData:', window.userData);
    console.log('🔧 window.userData?.ai_avatar:', window.userData?.ai_avatar);
    
    if (window.userData && window.userData.ai_avatar) {
        let avatarName;
        if (window.userData.ai_avatar === 'miss-sapna') {
            avatarName = 'Miss Sapna';
        } else {
            avatarName = 'Roy Sir';
        }
        console.log('✅ Returning avatar name:', avatarName);
        return avatarName;
    }
    console.log('✅ Using default avatar name: Miss Sapna');
    return 'Miss Sapna'; // Default to Miss Sapna
}

// Function to get current avatar ID dynamically
function getCurrentAvatarId() {
    console.log('🔧 getCurrentAvatarId called');
    console.log('🔧 window.userData:', window.userData);
    console.log('🔧 window.userData?.ai_avatar:', window.userData?.ai_avatar);
    
    if (window.userData && window.userData.ai_avatar) {
        console.log('✅ Returning avatar ID:', window.userData.ai_avatar);
        return window.userData.ai_avatar;
    }
    // Fallback to localStorage for small devices/APK if profile not yet loaded
    const stored = localStorage.getItem('ai_avatar');
    if (stored) {
        console.log('✅ Returning avatar ID from localStorage:', stored);
        return stored;
    }
    console.log('✅ Using default avatar ID: miss-sapna');
    return 'miss-sapna'; // Default to Miss Sapna
}

// Function to get avatar gender
function getCurrentAvatarGender() {
    console.log('🔧 getCurrentAvatarGender called');
    console.log('🔧 window.userData:', window.userData);
    console.log('🔧 window.userData?.ai_avatar:', window.userData?.ai_avatar);
    
    if (window.userData && window.userData.ai_avatar) {
        let gender;
        if (window.userData.ai_avatar === 'miss-sapna') {
            gender = 'female';
        } else {
            gender = 'male';
        }
        console.log('✅ Returning avatar gender:', gender);
        return gender;
    }
    console.log('✅ Using default avatar gender: female');
    return 'female'; // Default to Miss Sapna (female)
}

// Function to get avatar-specific welcome message
function getAvatarWelcomeMessage() {
    const avatarId = getCurrentAvatarId();
    
    if (avatarId === 'miss-sapna') {
        return "Hi, main aapki Miss Sapna hu. Main aapko Hindi bhasha mai padhaungi. Aap kya padhna chahti hain?";
    } else {
        return "Hi, I am Roy Sir. I will teach you all subjects in English. Please tell me what you want to study today?";
    }
}

// Function to get short welcome message for first interaction
function getShortWelcomeMessage() {
    const avatarId = getCurrentAvatarId();
    const userName = window.userData?.full_name || 'Student';
    
    if (avatarId === 'miss-sapna') {
        return `Hi ${userName}! Main Miss Sapna hu aur main aapko Hindi mai padhaungi. Aap kya padhna chahte hain?`;
    } else {
        return `Hi ${userName}! I am Roy Sir and I will help you with your studies. Please tell me what would you like to learn today?`;
    }
}

// Initialize Supabase when page loads
async function initializeSupabase() {
    try {
        console.log('🔧 Initializing Supabase...');
        
        // Check if Supabase client already exists
        if (window.supabaseClient) {
            console.log('✅ Supabase client already available');
            return window.supabaseClient;
        }
        
        // Try to initialize Supabase client
        console.log('🔄 Attempting to initialize Supabase client...');
        
        // Check if Supabase library is loaded
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase library not loaded');
            throw new Error('Supabase library not available. Please check your internet connection.');
        }
        
        // Check if config is available
        if (!window.TUTOR_CONFIG) {
            console.error('❌ TUTOR_CONFIG not available');
            throw new Error('Application configuration not loaded.');
        }
        
        // Create Supabase client
        const supabaseUrl = window.TUTOR_CONFIG.SUPABASE_URL;
        const supabaseKey = window.TUTOR_CONFIG.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Supabase credentials not found in config');
            throw new Error('Database configuration incomplete.');
        }
        
        console.log('🔧 Creating Supabase client with URL:', supabaseUrl);
        window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        // Test the connection with timeout
        const connectionPromise = window.supabaseClient.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );
        
        try {
            const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
            if (error) {
                console.warn('⚠️ Auth check failed, but client created:', error);
                // Don't throw error here, client might still work for other operations
        } else {
                console.log('✅ Supabase client initialized and tested successfully');
            }
        } catch (timeoutError) {
            console.warn('⚠️ Connection test timed out, but client created:', timeoutError);
            // Continue anyway, client might work for other operations
        }
        
        return window.supabaseClient;
        
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        
        // Show user-friendly error message
        const errorMessage = error.message || 'Failed to initialize database connection.';
        showError(errorMessage + ' Please check your internet connection and try again.');
        
        // Don't redirect immediately, let the user see the error
        // Only redirect if it's a critical auth error
        if (error.message && error.message.includes('auth')) {
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        }
        
        throw error;
    }
}

// PDF Processor will be initialized separately if needed
let pdfProcessor = null;

// Global state - currentUser is managed by dashboard.html
let recognition;
let recognitionTimeout;
let isRecording = false; // Declare isRecording at top level
let isAmbientListening = false;

// Enhanced voice recognition variables

let isLongPressActive = false;
let currentTranscript = '';
let micLongPressTimer = null;

// Global variables
let currentUser = null;
let currentGrade = null;
let currentSubject = null;
let selectedAvatar = 'miss-sapna'; // Default to Miss Sapna, will be overridden by user preference
let conversationHistory = [];
let synth = window.speechSynthesis;
let selectedVoice = null;
let voiceRate = 1.0;
let voicePitch = 1.0;
let preWarmedRecognition = null;
let voicesLoaded = false;
let lastResponseDate = null; // Track the date of last AI response

// Performance optimization: Add caching
let userDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30000; // 30 seconds cache

// Make variables globally accessible immediately
window.currentUser = currentUser;
window.isRecording = isRecording;
window.selectedAvatar = selectedAvatar;

// Functions are already defined above

// Indian Regional Avatars
const regionalAvatars = [
    { id: 'roy-sir', name: 'Roy Sir', region: 'English', gender: 'male', image: '👨‍🏫', language: 'english' },
    { id: 'miss-sapna', name: 'Miss Sapna', region: 'Hindi/Hinglish', gender: 'female', image: '👩‍🏫', language: 'hindi' },
    { id: 'baruah-sir', name: 'Baruah Sir', region: 'Assamese', gender: 'male', image: '👨‍🏫', language: 'assamese' }
];

// Mobile detection and optimization
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
window.isMobile = isMobile; // Make it globally accessible

// Enhanced mobile detection for smaller devices
const isSmallDevice = window.innerWidth <= 480;
window.isSmallDevice = isSmallDevice;

console.log('📱 Device detection - Mobile:', isMobile, 'Small device:', isSmallDevice);

        // Request all permissions immediately after login
        async function requestInitialPermissions() {
            console.log('🔧 Requesting initial permissions...');
            
            try {
                // Check if permissions are already granted
                const micPermission = await navigator.permissions.query({ name: 'microphone' });
                const cameraPermission = await navigator.permissions.query({ name: 'camera' });
                
                let micGranted = micPermission.state === 'granted';
                let cameraGranted = cameraPermission.state === 'granted';
                
                // Request microphone permission if not granted
                if (!micGranted) {
                    console.log('🎤 Requesting microphone permission...');
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        stream.getTracks().forEach(track => track.stop());
                        micGranted = true;
                        console.log('✅ Microphone permission granted');
                    } catch (error) {
                        console.warn('⚠️ Microphone permission denied:', error);
                        micGranted = false;
                    }
                }
                
                // Small delay to avoid overwhelming the user
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Request camera permission if not granted
                if (!cameraGranted) {
                    console.log('📸 Requesting camera permission...');
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        stream.getTracks().forEach(track => track.stop());
                        cameraGranted = true;
                        console.log('✅ Camera permission granted');
                    } catch (error) {
                        console.warn('⚠️ Camera permission denied:', error);
                        cameraGranted = false;
                    }
                }
                
                console.log('✅ Initial permissions requested - Mic:', micGranted, 'Camera:', cameraGranted);
                
                // Update UI to reflect permission status
                updatePermissionUI(micGranted, cameraGranted);
                
                return { micPermission: micGranted, cameraPermission: cameraGranted };
            } catch (error) {
                console.error('❌ Error requesting initial permissions:', error);
                return { micPermission: false, cameraPermission: false };
            }
        }
        
        // Force refresh user data to ensure APK gets latest data from Supabase
        async function forceRefreshUserData() {
            console.log('🔄 Force refreshing user data from Supabase...');
            try {
                // Clear any cached data
                localStorage.removeItem('userData');
                localStorage.removeItem('userProfile');
                sessionStorage.removeItem('userData');
                sessionStorage.removeItem('userProfile');
                
                // Ensure Supabase is properly initialized
                if (!window.supabaseClient) {
                    console.log('🔄 Supabase client not available, reinitializing...');
                    await initializeSupabase();
                }
                
                // Force reload user data from Supabase with retry logic
                let user = null;
                let authError = null;
                
                // Retry auth check up to 3 times
                for (let i = 0; i < 3; i++) {
                    try {
                        const { data, error } = await window.supabaseClient.auth.getUser();
                        if (!error && data.user) {
                            user = data.user;
                            break;
                        } else {
                            authError = error;
                            console.warn(`⚠️ Auth check attempt ${i + 1} failed:`, error);
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                        }
                    } catch (error) {
                        authError = error;
                        console.warn(`⚠️ Auth check attempt ${i + 1} threw error:`, error);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                if (authError || !user) {
                    console.error('❌ Auth error during force refresh after retries:', authError);
                    return;
                }
                
                console.log('✅ User authenticated successfully:', user.id);
                
                // Fetch fresh user profile from database with retry logic
                let userProfile = null;
                let profileError = null;
                
                // Retry profile fetch up to 3 times
                for (let i = 0; i < 3; i++) {
                    try {
                        const { data, error } = await window.supabaseClient
                            .from('user_profiles')
                            .select('*')
                            .eq('id', user.id)
                            .single();
                        
                        if (!error && data) {
                            userProfile = data;
                            break;
                        } else {
                            profileError = error;
                            console.warn(`⚠️ Profile fetch attempt ${i + 1} failed:`, error);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    } catch (error) {
                        profileError = error;
                        console.warn(`⚠️ Profile fetch attempt ${i + 1} threw error:`, error);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                if (profileError || !userProfile) {
                    console.error('❌ Profile fetch error during force refresh after retries:', profileError);
                    return;
                }
                
                console.log('✅ Fresh user profile fetched:', userProfile);
                
                // Update global user data
                window.userData = userProfile;
                window.userDataLoaded = true;
                
                // Force subscription expiry check with detailed logging - check multiple expiry columns
                let isExpired = false;
                let expiryDate = null;
                let expiryType = null;
                
                // Check subscription_expiry first
                if (userProfile && userProfile.subscription_expiry) {
                    expiryDate = new Date(userProfile.subscription_expiry);
                    expiryType = 'subscription_expiry';
                    isExpired = expiryDate <= new Date();
                }
                // Check trial_end if subscription_expiry is not available or not expired
                else if (userProfile && userProfile.trial_end) {
                    expiryDate = new Date(userProfile.trial_end);
                    expiryType = 'trial_end';
                    isExpired = expiryDate <= new Date();
                }
                // Check subscription_end as fallback
                else if (userProfile && userProfile.subscription_end) {
                    expiryDate = new Date(userProfile.subscription_end);
                    expiryType = 'subscription_end';
                    isExpired = expiryDate <= new Date();
                }
                
                if (expiryDate) {
                    const now = new Date();
                    const timeRemaining = expiryDate.getTime() - now.getTime();
                    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
                    
                    console.log('📅 Detailed expiry check:', {
                        expiryType: expiryType,
                        expiry: expiryDate.toISOString(),
                        now: now.toISOString(),
                        isExpired: isExpired,
                        timeRemaining: timeRemaining,
                        daysRemaining: daysRemaining,
                        userProfile: userProfile
                    });
                    
                    // If expired, show the voice message
                    if (isExpired) {
                        console.log('❌ Subscription/trial expired, showing voice message');
                        showExpiredSubscriptionVoiceMessage();
                    } else {
                        console.log('✅ Subscription/trial is active, days remaining:', daysRemaining);
                    }
                } else {
                    console.log('⚠️ No expiry date found in user profile');
                }
                
                console.log('✅ User data force refreshed successfully:', userProfile);
                return userProfile;
            } catch (error) {
                console.error('❌ Error force refreshing user data:', error);
                throw error;
            }
        }
        
        // Update UI to show permission status
        function updatePermissionUI(micPermission, cameraPermission) {
            // Update voice button
            const voiceButton = document.getElementById('voiceButton');
            const voiceButtonMobile = document.getElementById('voiceButtonMobile');
            
            if (voiceButton) {
                voiceButton.title = micPermission ? 'Voice input ready' : 'Microphone permission needed';
                voiceButton.classList.remove(micPermission ? 'text-red-400' : 'text-green-400');
                voiceButton.classList.add(micPermission ? 'text-green-400' : 'text-red-400');
            }
            
            if (voiceButtonMobile) {
                voiceButtonMobile.title = micPermission ? 'Voice input ready' : 'Microphone permission needed';
                voiceButtonMobile.classList.remove(micPermission ? 'text-red-400' : 'text-green-400');
                voiceButtonMobile.classList.add(micPermission ? 'text-green-400' : 'text-red-400');
            }
            
            // Update camera button
            const cameraButtonMobile = document.getElementById('cameraButtonMobile');
            if (cameraButtonMobile) {
                cameraButtonMobile.title = cameraPermission ? 'Camera ready' : 'Camera permission needed';
                cameraButtonMobile.classList.remove(cameraPermission ? 'text-red-400' : 'text-green-400');
                cameraButtonMobile.classList.add(cameraPermission ? 'text-green-400' : 'text-red-400');
            }
        }

        // Request camera permission with proper system dialog
        async function requestCameraPermission() {
            try {
                console.log('🔧 Requesting camera permission...');
                
                // Check if getUserMedia is supported
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    console.error('❌ getUserMedia not supported');
                    return false;
                }
                
                // Request camera permission with specific constraints for better mobile support
                const constraints = {
                    video: {
                        width: { ideal: 1920, min: 1280 },
                        height: { ideal: 1080, min: 720 },
                        facingMode: 'environment', // Prefer back camera on mobile
                        focusMode: 'continuous',
                        exposureMode: 'continuous',
                        whiteBalanceMode: 'continuous'
                    }
                };
                
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                // Stop the stream immediately after getting permission
                stream.getTracks().forEach(track => {
                    track.stop();
                    console.log('✅ Camera track stopped:', track.kind);
                });
                
                console.log('✅ Camera permission granted successfully');
                return true;
                
            } catch (error) {
                console.warn('⚠️ Camera permission error:', error);
                // Don't show warning popup - let system handle it
                return false;
            }
        }

        // Request microphone permission with proper system dialog
        async function requestMicrophonePermission() {
            try {
                console.log('🔧 Requesting microphone permission...');
                
                // Check if getUserMedia is supported
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    console.error('❌ getUserMedia not supported');
                    return false;
                }
                
                // Request microphone permission with specific constraints
                const constraints = {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 44100
                    }
                };
                
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                // Stop the stream immediately after getting permission
                stream.getTracks().forEach(track => {
                    track.stop();
                    console.log('✅ Microphone track stopped:', track.kind);
                });
                
                console.log('✅ Microphone permission granted successfully');
                return true;
                
            } catch (error) {
                console.warn('⚠️ Microphone permission error:', error);
                // Don't show warning popup - let system handle it
                return false;
            }
        }
        
        // Mobile optimization function
        function applyMobileOptimizations() {
            // Prevent zoom on input focus (iOS)
            const inputs = document.querySelectorAll('input, textarea, select');
            
            // Request microphone permission on mobile devices
            if (isMobile) {
                requestMicrophonePermission();
            }
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (isMobile) {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
    
    // Improve touch scrolling
    const scrollableElements = document.querySelectorAll('.chat-container, .modal-content, .subject-manager-modal');
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
        element.style.overflowScrolling = 'touch';
    });
    
    // Add mobile-specific event listeners
    setupMobileEventListeners();
    
    // Optimize for mobile performance
    if (isMobile) {
        // Reduce animations on mobile for better performance
        document.body.style.setProperty('--transition-duration', '0.2s');
        
        // Enable mobile-specific features
        enableMobileFeatures();
        setupMicLongPress();
    }
}

function setupMobileEventListeners() {
    // Handle mobile-specific gestures
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipeGesture();
    }, { passive: true });
    
    // Handle swipe gestures
    function handleSwipeGesture() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - could be used for quick actions
                console.log('Swipe up detected');
            } else {
                // Swipe down - could be used to close modals
                console.log('Swipe down detected');
                const activeModal = document.querySelector('.modal-content:not(.hidden)');
                if (activeModal) {
                    // Close modal on swipe down
                    const closeButton = activeModal.querySelector('[onclick*="close"], [onclick*="hide"]');
                    if (closeButton) {
                        closeButton.click();
                    }
                }
            }
        }
    }
}

function enableMobileFeatures() {
    // Enable mobile-specific voice recognition improvements
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // Mobile voice recognition optimizations
        const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (recognition) {
            // Set mobile-optimized settings
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
        }
    }
    
    // Mobile-specific TTS optimizations
    if ('speechSynthesis' in window) {
        // Optimize for mobile speakers
        const utterance = new SpeechSynthesisUtterance();
        utterance.volume = 0.8; // Slightly lower volume for mobile
        utterance.rate = 0.9; // Slightly slower for mobile
    }
    
    // Mobile-specific UI improvements
    if (isMobile) {
        // Add mobile-specific CSS classes
        document.body.classList.add('mobile-device');
        
        // Optimize chat container for mobile
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.style.height = 'calc(100vh - 200px)';
            chatContainer.style.maxHeight = 'calc(100vh - 200px)';
        }
        
        // Add mobile-specific keyboard handling
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('focus', () => {
                // Scroll to input on mobile
                setTimeout(() => {
                    chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        }
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Mobile-specific optimizations
        if (isMobile) {
            console.log('📱 Mobile device detected - applying optimizations');
            applyMobileOptimizations();
            
            // Additional mobile optimizations for better responsiveness
            if (window.isSmallDevice) {
                console.log('📱 Small device detected - applying additional optimizations');
                
                // Optimize touch targets for small devices
                const buttons = document.querySelectorAll('button');
                buttons.forEach(button => {
                    button.style.minHeight = '44px';
                    button.style.minWidth = '44px';
                });
                
                // Optimize input fields for small devices
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.style.fontSize = '16px'; // Prevent zoom on iOS
                });
            }
        }
        
        // Register service worker for caching
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration);
            } catch (error) {
                console.warn('⚠️ Service Worker registration failed:', error);
            }
        }
        
        await initializeSupabase();
        
        // Initialize avatar selection system
        initializeAvatarSelection();
        
        // Initialize Mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose'
        });

        // Initialize voice services
        if ('speechSynthesis' in window) {
            await initVoiceSelection();
        } else {
            const voiceSelect = document.getElementById('voiceSelect');
            if(voiceSelect) voiceSelect.disabled = true;
            console.log('Text-to-speech not supported');
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            initSpeechRecognition();
            
            // Setup long press for mobile
            if (window.isMobile || window.isAPK) {
                console.log('📱 Setting up long press for mobile device');
                // Long press will be set up in setupVoiceSettingsListeners
                console.log('🔧 Setting up long press for mobile voice recognition');
                setupMicLongPress();
            }
        } else {
            const voiceButton = document.getElementById('voiceButton');
            if(voiceButton) voiceButton.style.display = 'none';
            console.log('Speech recognition not supported');
        }

        // --- Keep existing initialization logic ---
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    
        if (error || !user) {
            console.log('No authenticated user, redirecting to login');
            window.location.href = '/login';
            return;
        }
    
        // Set current user globally
        window.currentUser = user;
        currentUser = user; // Set local variable too
        console.log('✅ User authenticated:', user.id);
    
        // currentUser is already set from authentication
        await loadUserData();
        setupEventListeners();
        populateAvatarGrid();
        initializeVoiceFeatures();
        populateVoices();
        
        // Initialize subject manager if available
        if (window.subjectManager) {
            console.log('🔧 Initializing subject manager...');
            try {
                await window.subjectManager.initialize(window.userData, window.userData?.class, window.userData?.board);
                console.log('✅ Subject manager initialized');
            } catch (error) {
                console.error('❌ Subject manager initialization error:', error);
            }
        } else {
            console.warn('⚠️ Subject manager not available');
        }
        
        // Wait for TTS to be ready before loading voice settings
        setTimeout(() => {
            loadVoiceSettings();
            setupVoiceSettingsListeners();
            setupSmallTTSControls();
        }, 1000);
        
        initSpeechRecognition();
        
        // Show welcome message only once
        if (!window.welcomeMessageShown) {
            showWelcomeMessage();
        }
        // --- End of existing logic ---

        // Test voice services
        setTimeout(() => {
            if (speechSynthesis && speechSynthesis.getVoices().length > 0) {
                speakText("Welcome to Tution App. Voice services are ready.");
            } else {
                 console.log("Skipping welcome message as voices are not ready yet.");
            }
        }, 1500);
        
        // Set up periodic user session refresh for multiple users
        setInterval(async () => {
            try {
                const { data: { user }, error } = await window.supabaseClient.auth.getUser();
                if (error || !user) {
                    console.warn('⚠️ User session expired, redirecting to login...');
                    window.location.href = '/login.html';
                } else {
                    currentUser = user; // Update current user
                    console.log('✅ User session refreshed:', user.id);
                }
            } catch (sessionError) {
                console.warn('⚠️ Session check failed:', sessionError);
            }
        }, 300000); // Check every 5 minutes

    } catch (error) {
        console.error('Initialization error:', error);
        showError("Failed to initialize some features");
    }
});

// Dashboard initialization state management
let isInitializing = false;
let isInitialized = false;

// Helper function to wait for Supabase
function ensureSupabaseReady() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.supabase?.auth) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

// Helper function to wait for TTS
function ensureTTSReady() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.speechSynthesis) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

async function initializeDashboard() {
  console.log('🔧 Initializing dashboard...');
  
  // Force enable TTS for mobile devices
  window.ttsEnabled = true;
  if (window.isMobile || window.isAPK) {
      localStorage.setItem('ttsEnabled', 'true');
      console.log('🔧 TTS force enabled for mobile');
  }
  
  // Detect if running in APK
  window.isAPK = window.location.protocol === 'file:' || 
                  window.navigator.userAgent.includes('Capacitor') ||
                  window.navigator.userAgent.includes('Android');
  
  try {
        // Check for cached login first (for APK)
        if (window.isAPK) {
            console.log('📱 APK detected, checking for cached login...');
            try {
                // Removed cached login redirect for APK
            } catch (error) {
                console.error('❌ Cached login check failed:', error);
                // Continue with normal flow if cached login fails
            }
        }
        
        // Check and delete cache if no AI chat is saved
        try {
            deleteCacheIfNoChat();
        } catch (error) {
            console.error('❌ Cache deletion check failed:', error);
        }
    
    // Initialize mobile sidebar first
    initializeMobileSidebar();
    
    // Initialize Supabase
    await initializeSupabase();
    
        // Request permissions immediately for all mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile || window.isAPK) {
        console.log('📱 Mobile/APK detected - requesting permissions immediately...');
        setTimeout(async () => {
            try {
                const { micPermission, cameraPermission } = await requestInitialPermissions();
                updatePermissionUI(micPermission, cameraPermission);
            } catch (error) {
                console.error('❌ Permission request failed:', error);
            }
        }, 500);
    } else {
        // For desktop, delay permissions
        console.log('🖥️ Desktop detected - delaying permissions...');
        setTimeout(async () => {
            const { micPermission, cameraPermission } = await requestInitialPermissions();
            updatePermissionUI(micPermission, cameraPermission);
        }, 2000);
    }
    
    // Initialize avatar selection system
    initializeAvatarSelection();
    
    // Initialize Mermaid
    mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose'
    });

    // Initialize TTS state immediately
    initializeTTSState();
    
    // Force enable TTS for mobile devices
    if (window.isMobile || window.isAPK) {
        window.ttsEnabled = true;
        localStorage.setItem('ttsEnabled', 'true');
        console.log('🔧 TTS force enabled for mobile devices');
    }

    // Initialize voice services immediately
    if ('speechSynthesis' in window) {
        await initVoiceSelection();
    } else {
        const voiceSelect = document.getElementById('voiceSelect');
        if(voiceSelect) voiceSelect.disabled = true;
        console.log('Text-to-speech not supported');
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        initSpeechRecognition();
        
        // Setup long press for mobile
        if (window.isMobile || window.isAPK) {
            console.log('🔧 Setting up long press for mobile voice recognition');
            setupMicLongPress();
        }
    } else {
        const voiceButton = document.getElementById('voiceButton');
        if(voiceButton) voiceButton.style.display = 'none';
        console.log('Speech recognition not supported');
    }

    // --- Keep existing initialization logic ---
    const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    
        if (error || !user) {
        console.log('No authenticated user, clearing stale data and redirecting...');
        
        // Clear any stale session data first
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('tution_cached_user');
        localStorage.removeItem('tution_cached_password');
        
        // For APK, stay on login and let user authenticate (do not bounce)
        if (window.isAPK) {
            console.log('📱 APK detected - staying on current page for login');
            // Do not redirect in APK to prevent loop
            return;
        } else {
            console.log('Web user not authenticated, redirecting to login');
            window.location.href = '/login';
            return;
        }
    }
    
    // Set current user globally
    window.currentUser = user;
    currentUser = user; // Set local variable too
    console.log('✅ User authenticated:', user.id);
    
    // currentUser is already set from authentication
    await loadUserData();
    
    // Force refresh user data to ensure APK gets latest data from Supabase
    console.log('🔄 Force refreshing user data for APK...');
    try {
        const refreshedUserData = await forceRefreshUserData();
        if (refreshedUserData) {
            console.log('✅ User data refreshed successfully for APK');
            // Update global user data
            window.userData = refreshedUserData;
            window.userDataLoaded = true;
            
            // Ensure user display is updated for mobile
            updateUserDisplay(refreshedUserData);
        } else {
            console.warn('⚠️ Force refresh returned no data, using loaded data');
            // Still update display with loaded data
            if (window.userData) {
                updateUserDisplay(window.userData);
            }
        }
    } catch (error) {
        console.error('❌ Error during force refresh:', error);
        // Continue with loaded data if force refresh fails
        if (window.userData) {
            updateUserDisplay(window.userData);
        }
    }
    
    setupEventListeners();
    populateAvatarGrid();
    initializeVoiceFeatures();
    populateVoices();
    
    // Ensure welcome message shows after data is loaded
    if (!window.welcomeMessageShown) {
        console.log('🔧 Showing welcome message after data load...');
        showWelcomeMessage();
        // Start TTS immediately after dashboard initialization
        setTimeout(() => {
            readWelcomeMessageAtLogin();
        }, 1000); // Small delay to ensure everything is ready
    }
    
    // Initialize subject manager if available
    if (window.subjectManager) {
        console.log('🔧 Initializing subject manager...');
        try {
            await window.subjectManager.initialize(window.userData, window.userData?.class, window.userData?.board);
            console.log('✅ Subject manager initialized');
        } catch (error) {
            console.error('❌ Subject manager initialization error:', error);
        }
    } else {
        console.warn('⚠️ Subject manager not available');
    }
        
    // Load voice settings and setup TTS controls immediately
    loadVoiceSettings();
    setupVoiceSettingsListeners();
    setupSmallTTSControls();
    // --- End of existing logic ---

    // Ensure TTS is ready and voices are loaded
    setTimeout(() => {
        if (speechSynthesis && speechSynthesis.getVoices().length > 0) {
            console.log("✅ Voice services are ready and TTS should be active.");
        } else {
            console.log("⚠️ Voices not ready yet, retrying TTS initialization...");
            // Retry TTS initialization
            initVoiceSelection().then(() => {
                if (!window.welcomeMessageShown) {
                    readWelcomeMessageAtLogin();
                }
            });
        }
    }, 1000);
    
    // Set up periodic user session refresh for multiple users
    setInterval(async () => {
        try {
            const { data: { user }, error } = await window.supabaseClient.auth.getUser();
            if (error || !user) {
                console.warn('⚠️ User session expired, redirecting to login...');
                window.location.href = '/login';
            } else {
                currentUser = user; // Update current user
                console.log('✅ User session refreshed:', user.id);
            }
        } catch (sessionError) {
            console.warn('⚠️ Session check failed:', sessionError);
        }
    }, 300000); // Check every 5 minutes
    
    // Set up periodic data refresh for APK to ensure fresh subscription data
    setInterval(async () => {
        try {
            console.log('🔄 Periodic data refresh for APK...');
            const refreshedData = await forceRefreshUserData();
            if (refreshedData) {
                console.log('✅ Periodic data refresh successful');
                // Update global user data
                window.userData = refreshedData;
                window.userDataLoaded = true;
            }
        } catch (refreshError) {
            console.warn('⚠️ Periodic data refresh failed:', refreshError);
        }
    }, 60000); // Refresh every 1 minute for APK
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
    showError('Initialization failed. Please refresh the page.');
  } finally {
    isInitializing = false;
  }
}

// Debugging helpers
function logSupabaseState() {
    console.log("🔍 Supabase client state:", {
        initialized: !!window.supabase,
        auth: !!window.supabase?.auth,
        getUser: !!window.supabase?.auth?.getUser,
        supabaseClient: !!window.supabaseClient,
        userDataLoaded: window.userDataLoaded,
        userData: !!window.userData
    });
}

// Proper request queue implementation
const requestQueue = [];
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 3;

function processRequestQueue() {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
            return;
        }
        
  const nextRequest = requestQueue.shift();
  if (!nextRequest || typeof nextRequest.requestFn !== 'function') {
    console.error('Invalid request in queue:', nextRequest);
    processRequestQueue(); // Skip invalid requests
            return;
        }
        
  activeRequests++;
  
  nextRequest.requestFn()
    .then(result => {
      nextRequest.resolve(result);
    })
    .catch(error => {
      nextRequest.reject(error);
    })
    .finally(() => {
      activeRequests--;
      processRequestQueue();
    });
}

function addToRequestQueue(requestFn) {
  return new Promise((resolve, reject) => {
    if (typeof requestFn !== 'function') {
      reject(new Error('requestFn must be a function'));
            return;
        }
        
    requestQueue.push({ requestFn, resolve, reject });
    processRequestQueue();
  });
}

// Simplified user data loading - no request queue wrapper
async function loadUserData() {
  console.log('🔧 CORRECT loadUserData function called');
  
  try {
    // Verify Supabase is ready - use the correct client
    const supabaseClient = window.supabaseClient || window.supabase;
    if (!supabaseClient?.auth?.getUser) {
      console.error('❌ Supabase auth not initialized');
      throw new Error('Supabase auth not initialized');
    }

    console.log('✅ Supabase auth is ready, proceeding with user data fetch');

    // Direct call to getUser - no request queue wrapper
    console.log('🔧 Fetching user data from Supabase auth...');
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
      console.error('❌ Error getting user:', error);
      throw error;
    }
    console.log('✅ User data fetched:', user);

    if (!user) {
      console.error('❌ No user data returned');
      throw new Error('No user data returned');
    }
    
    console.log('✅ User authenticated, fetching profile...');
    
    // Direct call to profile fetch - no request queue wrapper
    console.log('🔧 Fetching profile from user_profiles table...');
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Handle database errors - now that RLS is disabled
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      
      // If no profile exists, create a real profile in the database
      if (profileError.code === 'PGRST116') { // No rows found
        console.log('📝 No profile found, creating new profile...');
        
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'User',
          verification_status: 'approved',
          ai_avatar: 'miss-sapna',
          class: '10',
          board: 'CBSE',
          gender: 'male',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: createdProfile, error: createError } = await supabaseClient
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();
          
        if (createError) {
          console.error('❌ Failed to create profile:', createError);
          throw createError;
        }
        
        console.log('✅ New profile created:', createdProfile);
        return createdProfile;
      } else {
        // Other database error - throw it
        throw profileError;
      }
    }
    
    console.log('✅ Profile fetched:', profile);

    // Update UI with loaded data
    window.userData = profile;
    window.userDataCache = profile;
    window.cacheTimestamp = Date.now();
    window.userDataLoaded = true;
    window.selectedAvatar = profile.ai_avatar || 'miss-sapna';
    
    // Ensure userData is set for other functions
    if (!window.userData) {
        window.userData = profile;
    }
    
    // Update avatar display
            updateAvatarDisplay();
            
    // Update TTS voice to match current avatar
    if (window.textToSpeech) {
        window.textToSpeech.forceVoiceUpdate();
    }
    
    // Update user display in sidebar
    updateUserDisplay(profile);
    
    console.log('✅ User data loaded successfully:', profile);
    
    // Update UI with user data
    updateUserDisplay(profile);
    
    // Set current user profile for voice message
    window.currentUserProfile = profile;
    
    // Read welcome message at login
    setTimeout(() => {
        readWelcomeMessageAtLogin();
    }, 1000);
    
    // Set user data as loaded
    window.userDataLoaded = true;
    
    return profile;

    } catch (error) {
    console.error('❌ User data loading failed:', error);
    showError('Failed to load user data. Please refresh the page.');
    return null;
    }
}

function showWelcomeMessage() {
    // Strict check to prevent multiple welcome messages
    if (window.welcomeMessageShown) {
        console.log('🔧 Welcome message already shown, skipping...');
        return;
    }
    
    // Add the welcome message to chat only once
    const welcomeText = "Welcome to Tution App, your study buddy. What would you like to learn today? Roy Sir and Miss Sapna are here to help you. You may change your teachers in the settings.";
    
    // Check if welcome message already exists in chat
    const chatMessages = document.querySelectorAll('.message.message-ai');
    let welcomeExists = false;
    
    chatMessages.forEach(message => {
        const messageText = message.textContent || '';
        if (messageText.includes(welcomeText.substring(0, 50))) {
            welcomeExists = true;
        }
    });
    
    if (!welcomeExists) {
        // Add welcome message to chat
        const welcomeMessage = `
            <div class="message message-ai">
                <div class="message-bubble">
                    <div class="flex items-center space-x-3 mb-3">
                        <img id="welcomeTeacherAvatar" src="images/roy_sir.jpg" alt="Teacher" class="w-8 h-8 rounded-full object-cover" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2QjdGRUEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTQgMC0yLjIxLTEuNzktNC00LTQtMi4yMSAwLTQgMS43OS00IDQgMCAyLjIxIDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo='">
                        <span id="welcomeTeacherName" class="text-sm font-medium text-blue-200">Tution App</span>
                    </div>
                    <p>${welcomeText}</p>
                    <div class="mt-3 text-xs text-gray-300">
                        💡 <strong>Tip:</strong> Try asking me about Math, Science, English, or any homework problems!
                    </div>
                </div>
            </div>
        `;
        
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.insertAdjacentHTML('beforeend', welcomeMessage);
            console.log('✅ Welcome message added to chat');
        }
    }
    
    // Mark as shown to prevent duplication
    window.welcomeMessageShown = true;
    console.log('✅ Welcome message flag set');
}

async function loadBooks() {
    try {
        // Get user's class from the profile or UI
                const userClass = window.currentUser?.user_metadata?.class ||
                         document.getElementById('userClass')?.textContent?.replace('Class ', '') || 
                         '10'; // Default fallback
        
        // Extract class number (e.g., "Class 10" -> "10")
        const classNumber = userClass.toString().replace(/[^\d]/g, '');
        
        // Use the filtered endpoint with class parameter
        const response = await fetch(`${window.TUTOR_CONFIG?.apiBaseUrl || ''}/api/fs/books?grade=${classNumber}`);
        if (!response.ok) throw new Error('Failed to load books');
        
        const books = await response.json();
        const bookList = document.getElementById('bookList');
        if (!bookList) return;
        bookList.innerHTML = '';
        
        if (books.length === 0) {
            bookList.innerHTML = '<p class="text-gray-400 col-span-full">No books available for your class yet. More books will be added soon!</p>';
            return;
        }
        
        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'bg-purple-600/50 hover:bg-purple-600/70 p-2 rounded-lg text-white text-sm flex items-center cursor-pointer';
            bookElement.title = book.name;
            bookElement.innerHTML = `
                <span class="mr-2">📚</span>
                <span class="truncate">${book.name}</span>
            `;
            bookElement.onclick = () => openBook(book.id, book.name);
            bookList.appendChild(bookElement);
        });
        
    } catch (error) {
        console.error('Error loading books:', error);
        showDashboardError('Failed to load study materials');
    }
}

function openBook(bookId, bookName) {
    // Create a modal to view the book
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="glass-effect rounded-2xl p-6 w-full max-w-4xl max-h-screen flex flex-col overflow-hidden">
            <div class="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 class="text-white text-xl font-bold truncate pr-4">${bookName}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-red-400 text-2xl font-bold">
                    &times;
                </button>
            </div>
            <div class="flex-grow">
                <iframe src="/api/fs/books/${bookId}" class="w-full h-full border-none rounded-lg"></iframe>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Debug: Check if functions are available
    console.log('🔧 Function availability check:');
    console.log('- toggleVoiceRecording:', typeof window.toggleVoiceRecording);
    console.log('- sendMessage:', typeof window.sendMessage);
    console.log('- openMobileSidebar:', typeof window.openMobileSidebar);
    console.log('- closeMobileSidebar:', typeof window.closeMobileSidebar);
    console.log('- showSection:', typeof window.showSection);
    console.log('- playTTS:', typeof window.playTTS);
    console.log('- stopTTS:', typeof window.stopTTS);
    
    // Grade and subject selectors
    const gradeSelect = document.getElementById('gradeSelect');
    if (gradeSelect) {
        gradeSelect.addEventListener('change', updateContext);
        console.log('✅ Grade select listener added');
    } else {
        console.log('❌ Grade select not found');
    }
    
    const subjectSelect = document.getElementById('subjectSelect');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', updateContext);
        console.log('✅ Subject select listener added');
    } else {
        console.log('❌ Subject select not found');
    }
    
    // Chat input - use the correct ID
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('🔧 Enter pressed, calling sendMessage');
                sendMessage();
            }
        });
        
        // Also add input event for real-time updates
        chatInput.addEventListener('input', (e) => {
            // Enable/disable send button based on input
            const sendButton = document.getElementById('sendButton');
            if (sendButton) {
                sendButton.disabled = !e.target.value.trim();
            }
        });
        console.log('✅ Chat input listeners added');
    } else {
        console.log('❌ Chat input not found');
    }
    
    // Voice button - use only one event listener to avoid duplicates
    const voiceButton = document.getElementById('voiceButton');
    if (voiceButton) {
        // Remove any existing listeners to avoid conflicts
        voiceButton.removeAttribute('onclick');
        voiceButton.removeEventListener('click', toggleVoiceRecording);
        
        // Add only one event listener
        voiceButton.addEventListener('click', () => {
            console.log('🔧 Voice button clicked, calling startVoiceRecordingWithPermission');
            startVoiceRecordingWithPermission();
        });
        console.log('✅ Voice button listener added');
    } else {
        console.log('❌ Voice button not found');
    }
    
    // Send button - use only one event listener to avoid duplicates
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        // Remove ALL existing listeners to avoid conflicts
        const newSendButton = sendButton.cloneNode(true);
        sendButton.parentNode.replaceChild(newSendButton, sendButton);
        
        // Add single event listener
        newSendButton.addEventListener('click', () => {
            console.log('🔧 Send button clicked, calling sendMessage');
            sendMessage();
        });
        
        console.log('✅ Send button listener added (cleaned)');
    } else {
        console.log('❌ Send button not found');
    }
    
    // Mobile send button
    const sendButtonMobile = document.getElementById('sendButtonMobile');
    if (sendButtonMobile) {
        // Remove ALL existing listeners to avoid conflicts
        const newSendButtonMobile = sendButtonMobile.cloneNode(true);
        sendButtonMobile.parentNode.replaceChild(newSendButtonMobile, sendButtonMobile);
        
        // Add single event listener
        newSendButtonMobile.addEventListener('click', () => {
            console.log('🔧 Mobile send button clicked, calling sendMessage');
            sendMessage();
        });
        console.log('✅ Mobile send button listener added (cleaned)');
    } else {
        console.log('❌ Mobile send button not found');
    }
    
    // Mobile voice button - handled in setupVoiceSettingsListeners
    console.log('✅ Mobile voice button listeners handled in setupVoiceSettingsListeners');
    
    // Accessibility options
    const dyslexicFont = document.getElementById('dyslexicFont');
    if (dyslexicFont) {
        dyslexicFont.addEventListener('change', updateAccessibility);
    }
    
    const highContrast = document.getElementById('highContrast');
    if (highContrast) {
        highContrast.addEventListener('change', updateAccessibility);
    }
    
    const screenReader = document.getElementById('screenReader');
    if (screenReader) {
        screenReader.addEventListener('change', updateAccessibility);
    }

    // Profile modal
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfile = document.getElementById('closeProfile');
    const saveProfile = document.getElementById('saveProfile');
    
    if (profileBtn && profileModal) {
        profileBtn.addEventListener('click', () => {
            profileModal.classList.remove('hidden');
        });
    }
    
    if (closeProfile && profileModal) {
        closeProfile.addEventListener('click', () => {
            profileModal.classList.add('hidden');
        });
    }
    
    if (saveProfile) {
        saveProfile.addEventListener('click', saveProfileChanges);
    }
    
    // Mobile sidebar overlay click handler
    const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
    if (mobileSidebarOverlay) {
        mobileSidebarOverlay.addEventListener('click', closeMobileSidebar);
    }
    
    // Mobile sidebar button - use explicit ID for reliability
    const mobileSidebarButton = document.getElementById('mobileSidebarToggle');
    if (mobileSidebarButton) {
        mobileSidebarButton.addEventListener('click', () => {
            console.log('🔧 Mobile sidebar button clicked, calling openMobileSidebar');
            openMobileSidebar();
        });
        mobileSidebarButton.onclick = () => {
            console.log('🔧 Mobile sidebar button onclick fallback');
            openMobileSidebar();
        };
        console.log('✅ Mobile sidebar button listener added');
    } else {
        console.log('❌ Mobile sidebar button not found');
    }
    
    // Close mobile sidebar button - use explicit ID
    const closeMobileSidebarButton = document.getElementById('closeSidebarBtn');
    if (closeMobileSidebarButton) {
        closeMobileSidebarButton.addEventListener('click', () => {
            console.log('🔧 Close mobile sidebar button clicked, calling closeMobileSidebar');
            closeMobileSidebar();
        });
        // Add onclick as fallback
        closeMobileSidebarButton.onclick = () => {
            console.log('🔧 Close mobile sidebar button onclick fallback');
            closeMobileSidebar();
        };
        console.log('✅ Close mobile sidebar button listener added');
    } else {
        console.log('❌ Close mobile sidebar button not found');
    }

    // Ensure nav items inside sidebar close it after navigation on mobile
    const sidebarEl = document.getElementById('mobileSidebar');
    if (sidebarEl) {
        sidebarEl.addEventListener('click', (e) => {
            const targetNav = e.target.closest('.nav-item');
            if (!targetNav) return;
            // Defer close slightly to allow section switch handlers to run
            setTimeout(() => { try { closeMobileSidebar(); } catch (_) {} }, 0);
        });
    }
    
    // TTS buttons
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.removeAttribute('onclick');
        playButton.addEventListener('click', () => {
            console.log('🔧 Play button clicked, calling playTTS');
            playTTS();
        });
        console.log('✅ Play button listener added');
    } else {
        console.log('❌ Play button not found');
    }
    
    const stopButton = document.getElementById('stopButton');
    if (stopButton) {
        stopButton.removeAttribute('onclick');
        stopButton.addEventListener('click', () => {
            console.log('🔧 Stop button clicked, calling stopTTS');
            stopTTS();
        });
        console.log('✅ Stop button listener added');
    } else {
        console.log('❌ Stop button not found');
    }
    
    // Sidebar navigation items
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`🔧 Found ${navItems.length} nav items`);
    navItems.forEach((item, index) => {
        const text = item.textContent.trim();
        console.log(`🔧 Nav item ${index}:`, text);
        
        // Determine action based on text content
        if (text.includes('Classroom') || text.includes('🏫')) {
            item.addEventListener('click', () => {
                console.log(`🔧 Nav item clicked, showing chat section`);
                showSection('chat');
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} listener added for chat section`);
        } else if (text.includes('Study Materials') || text.includes('📚')) {
            item.addEventListener('click', () => {
                console.log(`🔧 Nav item clicked, showing materials section`);
                showSection('materials');
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} listener added for materials section`);
        } else if (text.includes('Progress') || text.includes('📊')) {
            item.addEventListener('click', () => {
                console.log(`🔧 Nav item clicked, showing progress section`);
                showSection('progress');
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} listener added for progress section`);
        } else if (text.includes('Settings') || text.includes('⚙️')) {
            item.addEventListener('click', () => {
                console.log(`🔧 Nav item clicked, showing settings section`);
                showSection('settings');
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} listener added for settings section`);
        } else if (text.includes('Logout') || text.includes('🚪')) {
            item.addEventListener('click', () => {
                console.log('🔧 Logout nav item clicked');
                logout();
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} logout listener added`);
        } else if (text.includes('Test Trial') || text.includes('⏰')) {
            item.addEventListener('click', () => {
                console.log('🔧 Trial overlay nav item clicked');
                forceShowTrialOverlay();
                if (window.isMobile) {
                    closeMobileSidebar();
                }
            });
            console.log(`✅ Nav item ${index} trial overlay listener added`);
        } else {
            console.log(`⚠️ Nav item ${index} has unknown text: ${text}`);
        }
    });
    
    console.log('✅ Event listeners setup complete');
}

function populateAvatarGrid() {
    const avatarGrid = document.getElementById('avatarGrid');
    if (!avatarGrid) {
        console.log('Avatar grid element not found');
        return;
    }
    
    avatarGrid.innerHTML = '';
    
    regionalAvatars.forEach(avatar => {
        const avatarElement = document.createElement('div');
        avatarElement.className = 'avatar-option p-2 text-center';
        avatarElement.innerHTML = `
            <div class="text-3xl mb-2">${avatar.image}</div>
            <div class="text-xs text-white">${avatar.name}</div>
        `;
        avatarElement.onclick = (event) => selectAvatar(avatar.id, event);
        avatarGrid.appendChild(avatarElement);
    });
}

async function selectAvatar(avatarId, event) {
    selectedAvatar = avatarId;
    window.selectedAvatar = avatarId; // Set global variable
    
    // Update visual selection
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    if (event && event.target) {
        event.target.closest('.avatar-option').classList.add('selected');
    }
    
    // Update user display
    const avatar = regionalAvatars.find(a => a.id === avatarId);
    if (avatar) {
        const userAvatar = document.getElementById('userAvatar');
        const userAvatar2 = document.getElementById('userAvatar2');
        if (userAvatar) {
            userAvatar.innerHTML = avatar.image;
        }
        if (userAvatar2) {
            userAvatar2.innerHTML = avatar.image;
        }
    }
    
    // Save avatar preference to Supabase immediately
    if (currentUser && currentUser.id) {
        try {
            await window.supabaseClient.from('user_profiles').upsert({ 
                id: currentUser.id, 
                ai_avatar: selectedAvatar 
            });
            console.log('Avatar preference saved:', selectedAvatar);
        } catch (error) {
            console.error('Error saving avatar preference:', error);
        }
    }
}

async function updateContext() {
    currentGrade = document.getElementById('gradeSelect').value;
    currentSubject = document.getElementById('subjectSelect').value;
    
    // Update user preferences
    if (currentUser) {
        await window.supabaseClient.from('user_preferences').upsert({
            user_id: currentUser.id,
            preference_key: 'current_grade',
            preference_value: currentGrade
        });
        
        await window.supabaseClient.from('user_preferences').upsert({
            user_id: currentUser.id,
            preference_key: 'current_subject',
            preference_value: currentSubject
        });
    }
}

async function sendMessage() {
    if (window.isSendingMessage) {
        console.log('🔧 sendMessage already in progress, ignoring duplicate call');
        return;
    }
    
    window.isSendingMessage = true;
    console.log('🔧 sendMessage function called - SINGLE CALL');
    
    try {
        // Get the appropriate input field based on device
        let chatInput = document.getElementById('chatInput');
        let chatInputMobile = document.getElementById('chatInputMobile');
        
        // Use mobile input if available and visible, otherwise use desktop input
        let activeInput = null;
        if (chatInputMobile && window.innerWidth <= 768) {
            activeInput = chatInputMobile;
        } else if (chatInput) {
            activeInput = chatInput;
        }
        
        if (!activeInput) {
            console.error('❌ No chat input found');
            window.isSendingMessage = false;
            return;
        }
        
        const message = activeInput.value.trim();
        if (!message) {
            console.log('❌ Empty message, not sending');
            window.isSendingMessage = false;
            return;
        }
        
        console.log('📤 Sending message:', message);
        
        // Clear the input field
        activeInput.value = '';
        
        // Add user message to chat
        await addMessage('user', message);
        
        // Show typing indicator
        showTypingIndicator();
        
        // Get conversation context
        const context = getConversationContext();
        
        // Add user profile to context
        context.userProfile = window.userData;
        
        // Set up GPTService context
        if (window.gptService) {
            window.gptService.setContext(
                window.userData?.class?.replace('Class ', '') || '5',
                'General'
            );
            window.gptService.setTeacher(getCurrentAvatarName());
        }
        
        console.log('🔧 Using GPTService to send message');
        console.log('🔧 User profile being sent:', context.userProfile);
        
        // Use GPTService instead of direct API call
        let aiResponse;
        try {
            aiResponse = await window.gptService.sendMessage(message, context.userProfile);
            console.log('✅ AI response received via GPTService:', aiResponse);
        } catch (error) {
            console.error('❌ GPTService Error:', error);
            throw error;
        }
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response to chat
        if (aiResponse) {
            await addMessage('assistant', aiResponse);
            
            // Speak the response if TTS is enabled
            if (window.ttsEnabled && !micSystem.isRecording) {
                speakText(aiResponse);
            } else if (window.ttsEnabled) {
                // Force enable TTS on mobile
                console.log('🔧 Forcing TTS on mobile');
                speakText(aiResponse);
            } else {
                // Force TTS for mobile devices
                if (window.isMobile || window.isAPK) {
                    console.log('🔧 Forcing TTS for mobile device');
                    speakText(aiResponse);
                }
            }
        }
        
        // Save study session
        await saveStudySession(message, aiResponse || 'No response received');
        
    } catch (error) {
        console.error('❌ Error in sendMessage:', error);
        removeTypingIndicator();
        showError('Failed to send message. Please try again.');
    } finally {
        window.isSendingMessage = false;
    }
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) typingDiv.remove();
}

async function saveStudySession(question, answer) {
    if (!currentUser) return;
    
    try {
        await fetch(`${window.TUTOR_CONFIG?.apiBaseUrl || ''}/api/study-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                topic: question,
                subject: currentSubject || 'general',
                duration: 5 // Default duration in minutes
            })
        });
    } catch (error) {
        console.error('Error saving study session:', error);
    }
}

// Initialize voice features
function initializeVoiceFeatures() {
    console.log('🔧 Initializing voice features...');
    
    // Initialize speech synthesis
    if (window.speechSynthesis) {
        // Some browsers need this event to populate voices
        speechSynthesis.onvoiceschanged = function() {
            console.log('Voices changed, refreshing voice list');
            populateVoices();
        };
        
        // First try to populate voices immediately
        populateVoices();
        
        // Faster fallback in case voices aren't loaded yet
        setTimeout(populateVoices, 500);
    } else {
        console.log('Speech synthesis not supported');
        document.getElementById('voiceSelect').disabled = true;
    }

    // Initialize speech recognition
    initSpeechRecognition();
    
    // Load saved settings
    loadVoiceSettings();
    
    // Setup voice control listeners
    setupVoiceSettingsListeners();
    
    console.log('✅ Voice features initialized');
}

function populateVoices() {
    return new Promise((resolve) => {
        if (!speechSynthesis) {
            return resolve([]);
        }
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            voicesLoaded = true;
            resolve(voices);
        } else {
            speechSynthesis.onvoiceschanged = () => {
                voicesLoaded = true;
                resolve(speechSynthesis.getVoices());
            };
            // Faster timeout - only 500ms instead of 2000ms
            setTimeout(() => {
                if (!voicesLoaded) {
                    console.log('Voice loading timeout - using available voices');
                    resolve(speechSynthesis.getVoices());
                }
            }, 500);
        }
    });
}

function loadVoiceSettings() {
    const voiceRate = document.getElementById('voiceRate');
    const voicePitch = document.getElementById('voicePitch');
    const voiceRateValue = document.getElementById('voiceRateValue');
    const voicePitchValue = document.getElementById('voicePitchValue');
    
    // Load settings from TTS system if available, otherwise from localStorage
    if (window.textToSpeech) {
        if (voiceRate) {
            voiceRate.value = window.textToSpeech.rate || 1.0;
        }
        if (voicePitch) {
            voicePitch.value = window.textToSpeech.pitch || 1.0;
        }
    } else {
        // Fallback to localStorage
        if (voiceRate) {
            voiceRate.value = localStorage.getItem('voiceRate') || '1.0';
        }
        if (voicePitch) {
            voicePitch.value = localStorage.getItem('voicePitch') || '1.0';
        }
    }
    
    // Update display values
    if (voiceRateValue && voiceRate) {
        voiceRateValue.textContent = voiceRate.value;
    }
    if (voicePitchValue && voicePitch) {
        voicePitchValue.textContent = voicePitch.value;
    }
}

function setupVoiceSettingsListeners() {
    const voicePitch = document.getElementById('voicePitch');
    const voicePitchValue = document.getElementById('voicePitchValue');
    const voiceRate = document.getElementById('voiceRate');
    const voiceRateValue = document.getElementById('voiceRateValue');
    const voiceSelect = document.getElementById('voiceSelect');
    const voiceButton = document.getElementById('voiceButton');

    if (voiceRate) {
        voiceRate.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            // Update display
            if (voiceRateValue) {
                voiceRateValue.textContent = value.toFixed(1);
            }
            // Update TTS system
            if (window.textToSpeech) {
                window.textToSpeech.setRate(value);
            }
            // Save to localStorage as backup
            localStorage.setItem('voiceRate', value.toString());
        });
        
        voiceRate.addEventListener('change', (e) => {
            const value = parseFloat(e.target.value);
            // Update TTS system
            if (window.textToSpeech) {
                window.textToSpeech.setRate(value);
            }
            // Save to localStorage
            localStorage.setItem('voiceRate', value.toString());
        });
    }

    if (voicePitch) {
        voicePitch.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            // Update display
            if (voicePitchValue) {
                voicePitchValue.textContent = value.toFixed(2);
            }
            // Update TTS system
            if (window.textToSpeech) {
                window.textToSpeech.setPitch(value);
            }
            // Save to localStorage as backup
            localStorage.setItem('voicePitch', value.toString());
        });
        
        voicePitch.addEventListener('change', (e) => {
            const value = parseFloat(e.target.value);
            // Update TTS system
            if (window.textToSpeech) {
                window.textToSpeech.setPitch(value);
            }
            // Save to localStorage
            localStorage.setItem('voicePitch', value.toString());
        });
    }

    // Desktop voice button - handled by micSystem
    if (voiceButton) {
        // Remove any existing listeners to avoid conflicts
        const newVoiceButton = voiceButton.cloneNode(true);
        voiceButton.parentNode.replaceChild(newVoiceButton, voiceButton);
        
        // Setup long press functionality ONLY
        setupMicLongPress(newVoiceButton);
        console.log('✅ Desktop voice button listener added (consolidated)');
    }
    
    // Mobile button event listeners - CONSOLIDATED
    const voiceButtonMobile = document.getElementById('voiceButtonMobile');
    if (voiceButtonMobile) {
        // Remove ALL existing listeners by cloning
        const newVoiceButtonMobile = voiceButtonMobile.cloneNode(true);
        voiceButtonMobile.parentNode.replaceChild(newVoiceButtonMobile, voiceButtonMobile);
        
        // Setup long press functionality ONLY - no additional click listener
        setupMicLongPress(newVoiceButtonMobile);
        
        console.log('✅ Mobile voice button listener added (consolidated)');
    }
    
    const sendButtonMobile = document.getElementById('sendButtonMobile');
    if (sendButtonMobile) {
        // Remove ALL existing listeners by cloning
        const newSendButtonMobile = sendButtonMobile.cloneNode(true);
        sendButtonMobile.parentNode.replaceChild(newSendButtonMobile, sendButtonMobile);
        
        // Add single event listener
        newSendButtonMobile.addEventListener('click', () => {
            console.log('🔧 Mobile send button clicked, calling sendMessage');
            sendMessage();
        });
        console.log('✅ Mobile send button listener added (cleaned)');
    } else {
        console.log('❌ Mobile send button not found');
    }
    
    const chatInputMobile = document.getElementById('chatInputMobile');
    if (chatInputMobile) {
        chatInputMobile.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        console.log('✅ Mobile chat input listener added');
    }
}

// Global variables for voice recognition
// Note: isRecording is already declared at the top of the file

function initSpeechRecognition() {
    try {
        console.log('🔧 Initializing speech recognition...');
        const voiceButton = document.getElementById('voiceButton');
        
        if (!voiceButton) {
            console.log('❌ Voice button not found');
            return;
        }
        
        // Check for speech recognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('❌ Speech recognition not supported');
            voiceButton.style.display = 'none';
            showError('Voice recognition not supported in this browser');
            return;
        }

        // Check if voice features are enabled in config
        if (!window.TUTOR_CONFIG?.features?.voiceInput) {
            console.log('❌ Voice input disabled in config');
            voiceButton.style.display = 'none';
            return;
        }

        console.log('🔧 Creating speech recognition instance...');
        recognition = new SpeechRecognition();
        // Mobile-optimized speech recognition settings
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        recognition.continuous = false;
        recognition.interimResults = isMobile ? true : false; // Enable interim results on mobile for better responsiveness
        recognition.maxAlternatives = isMobile ? 2 : 1; // More alternatives on mobile for better accuracy
        
        // Start with English and dynamically switch if Hindi is detected
        recognition.lang = 'en-IN';
        recognition._dynamicSwitch = true;
        recognition._lastLang = 'en-IN';

        recognition.onstart = () => {
            console.log('✅ Speech recognition started');
            isRecording = true;
            const voiceIcon = document.getElementById('voiceIcon');
            if (voiceIcon) {
                voiceIcon.textContent = '🔴';
            }
            voiceButton.classList.add('voice-recording');
            
            // Set timeout (shorter for mobile)
            const timeout = isMobile ? 8000 : 12000; // 8s for mobile, 12s for desktop
            recognitionTimeout = setTimeout(() => {
                if (isRecording) {
                    recognition.stop();
                    showError("No speech detected. Please try again.");
                }
            }, timeout);
        };

        recognition.onresult = (event) => {
            clearTimeout(recognitionTimeout);
            const transcript = event.results[0][0].transcript;
            console.log('✅ Speech recognized:', transcript);
            
            // Process transcript based on detected language
            let processedTranscript = transcript;
            
    // Detect if user is speaking English or Hindi
    const hindiPattern = /[\u0900-\u097F]/; // Devanagari script
    const englishPattern = /[A-Za-z]/; // any English letters anywhere

            const isEnglish = englishPattern.test(transcript) && !hindiPattern.test(transcript);
            const isHindi = !isEnglish && hindiPattern.test(transcript);

            if (isEnglish) {
                // User is speaking English - keep in English script
                processedTranscript = transcript;
                console.log('🔤 Detected English speech, keeping in English script');
                // Dynamic switch: if recognition in Hindi, switch to English
                if (recognition._dynamicSwitch && recognition._lastLang !== 'en-IN') {
                    try { recognition.stop(); } catch(_) {}
                    recognition.lang = 'en-IN';
                    recognition._lastLang = 'en-IN';
                    console.log('🔁 Switched STT language to en-IN');
                }
            } else if (isHindi) {
                // User is speaking Hindi - keep in Devanagari script
                processedTranscript = transcript;
                console.log('🔤 Detected Hindi speech, keeping in Devanagari script');
                // Dynamic switch: if recognition in English, switch to Hindi
                if (recognition._dynamicSwitch && recognition._lastLang !== 'hi-IN') {
                    try { recognition.stop(); } catch(_) {}
                    recognition.lang = 'hi-IN';
                    recognition._lastLang = 'hi-IN';
                    console.log('🔁 Switched STT language to hi-IN');
                }
            } else {
                // Mixed or unclear - keep as is (let the user decide)
                processedTranscript = transcript;
                console.log('🔤 Mixed or unclear language, keeping transcript as is');
            }
            
            // Set value in both desktop and mobile inputs
            const chatInput = document.getElementById('chatInput');
            const chatInputMobile = document.getElementById('chatInputMobile');
            
            if (chatInput) chatInput.value = processedTranscript;
            if (chatInputMobile) chatInputMobile.value = processedTranscript;
            
            showSuccess("Voice input received: " + processedTranscript);
            stopRecording();
        };

        recognition.onerror = (event) => {
            clearTimeout(recognitionTimeout);
            console.error('❌ Speech recognition error:', event.error);
            
            let errorMessage = 'Voice input error: ';
            switch(event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone found. Please check your audio settings.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
                    break;
                case 'network':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                case 'service-not-allowed':
                    errorMessage = 'Speech recognition service not allowed. Please check permissions.';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            showError(errorMessage);
            stopRecording();
        };

        recognition.onend = () => {
            clearTimeout(recognitionTimeout);
            stopRecording();
        };

        console.log('✅ Speech recognition initialized successfully');

    } catch (error) {
        console.error('❌ Failed to initialize speech recognition:', error);
        const voiceButton = document.getElementById('voiceButton');
        if (voiceButton) {
            voiceButton.style.display = 'none';
        }
        showError('Voice input not available in this browser');
    }
}

function stopRecording() {
    isRecording = false;
    const voiceButton = document.getElementById('voiceButton');
    const voiceIcon = document.getElementById('voiceIcon');
    if (voiceButton) {
        voiceButton.classList.remove('voice-recording');
    }
    if (voiceIcon) {
        voiceIcon.textContent = '🎤';
    }
}

async function toggleVoiceRecording() {
    console.log('🎤 toggleVoiceRecording called - using micSystem');
    
    // Use the new micSystem instead of old functions
    if (micSystem.isRecording) {
        console.log('🎤 Stopping recording...');
        micSystem.stopRecording();
    } else {
        console.log('🎤 Starting recording...');
        // Stop any ongoing TTS immediately
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            console.log('[TTS] Stopped TTS for voice recording');
        }
        
        // Start recording using micSystem
        try {
            micSystem.startRecording();
        } catch (error) {
            console.error('Voice recording error:', error);
            showError('Voice recording failed. Please try again.');
        }
    }
}

// Assign to global immediately
window.toggleVoiceRecording = toggleVoiceRecording;

async function speakText(text) {
    if (!window.textToSpeech) {
        console.log('[TTS] Text-to-Speech not initialized');
        return;
    }

    // Check if TTS is enabled (default to true unless user explicitly disabled)
    if (window.ttsDisabled === true) {
        console.log('[TTS] TTS is disabled by user');
        return;
    }

    // Check if user has interacted with the page
    if (!window.userHasInteracted) {
        console.log('[TTS] User has not interacted yet, skipping autoplay speech');
        return;
    }

    // Don't speak if voice recording is active
    if (micSystem.isRecording) {
        console.log('[TTS] Voice recording active, skipping TTS');
        return;
    }

    try {
        console.log('[TTS] Attempting to speak:', text);
        window.textToSpeech.speak(text, { role: 'ai' });
    } catch (error) {
        console.error('[TTS] Error speaking text:', error);
    }
}

// TTS Control Functions
function enableTTS() {
    window.ttsDisabled = false;
    localStorage.setItem('ttsEnabled', 'true');
    console.log('[TTS] TTS enabled');
}

function disableTTS() {
    window.ttsDisabled = true;
    localStorage.setItem('ttsEnabled', 'false');
    console.log('[TTS] TTS disabled');
}

// Initialize TTS state on page load
function initializeTTSState() {
    const ttsEnabled = localStorage.getItem('ttsEnabled');
    if (ttsEnabled === 'false') {
        window.ttsDisabled = true;
        console.log('[TTS] TTS disabled from previous session');
    } else {
        window.ttsDisabled = false;
        console.log('[TTS] TTS enabled by default');
    }
    
    // Ensure TTS is ready for immediate use
    if ('speechSynthesis' in window) {
        // Force load voices if not already loaded
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = () => {
                console.log('[TTS] Voices loaded:', speechSynthesis.getVoices().length);
            };
        }
    }
}

// Initialize voice selection dropdown
async function initVoiceSelection() {
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect) return;
    voiceSelect.innerHTML = '<option value="">Loading voices...</option>';

    try {
        const voices = await populateVoices();
        voiceSelect.innerHTML = ''; // Clear loading message

        const indianLangCodes = ['en-IN', 'hi-IN', 'bn-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'ta-IN', 'te-IN'];

        const filteredVoices = voices.filter(voice => {
            const name = voice.name.toLowerCase();
            const lang = voice.lang;

            // Keep "Microsoft Ravi"
            if (name.includes('ravi') && lang === 'en-IN') {
                return true;
            }
            // Keep "Google Hindi"
            if (name.includes('google') && lang === 'hi-IN') {
                return true;
            }
            // Keep any other Indian regional languages
            if (indianLangCodes.includes(lang) && !(name.includes('ravi') || name.includes('google'))) {
                return true;
            }
            
            return false;
        });

        if (filteredVoices.length === 0) {
            voiceSelect.innerHTML = '<option value="">Specified voices not found</option>';
            console.log("Could not find 'Microsoft Ravi' or 'Google Hindi'. Please check your system's installed voices.");
            // As a fallback, populate with whatever is available
            voices.forEach(v => {
                const option = document.createElement('option');
                option.value = v.name;
                option.textContent = `${v.name} (${v.lang})`;
                voiceSelect.appendChild(option);
            });
            return;
        }

        // Populate dropdown with the filtered voices
        filteredVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });

        // Set default voice to "Google Hindi" for Miss Sapna
        const defaultVoice = filteredVoices.find(v => v.name.toLowerCase().includes('google') && v.lang === 'hi-IN');
        if (defaultVoice) {
            voiceSelect.value = defaultVoice.name;
        } else if (filteredVoices.length > 0) {
            // Fallback to the first available voice in the filtered list
            voiceSelect.value = filteredVoices[0].name;
        }
        
        console.log(`[TTS] Populated dropdown with ${filteredVoices.length} filtered voices.`);

    } catch (error) {
        console.error('Error loading voices:', error);
        voiceSelect.innerHTML = '<option value="">Voice loading failed</option>';
    }
}

// Enhanced Diagram Rendering
async function renderDiagrams() {
    try {
        await mermaid.run({
            querySelector: '.mermaid',
            suppressErrors: true
        });
    } catch (error) {
        console.error('Mermaid rendering error:', error);
    }
}

// OAuth Functions
function showOAuthModal() {
    document.getElementById('oauthModal').classList.remove('hidden');
}

function hideOAuthModal() {
    document.getElementById('oauthModal').classList.add('hidden');
}

async function signInWithGoogle() {
    try {
        const { error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'https://tution.app/dashboard'
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        alert('Failed to sign in with Google. Please try again.');
    }
}

async function signInWithGitHub() {
    try {
        const { error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: 'https://tution.app/dashboard'
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('Error signing in with GitHub:', error);
        alert('Failed to sign in with GitHub. Please try again.');
    }
}

async function logout() {
    if (!window.supabaseClient) return;
    
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        
        // Clear cached credentials
        clearCachedUserCredentials();
        
        // Reset welcome message flag for next login
        window.welcomeMessageShown = false;
        
        window.location.href = '/';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
}



function toggleSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar.classList.contains('-translate-x-full')) {
        // Open sidebar
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.style.removeProperty('display');
        overlay.style.removeProperty('visibility');
        overlay.style.pointerEvents = 'auto';
        overlay.classList.add('pointer-events-auto');
        
        // Mobile-specific improvements
        if (isMobile) {
            // Prevent body scroll when sidebar is open
            document.body.style.overflow = 'hidden';
            
            // Add touch-to-close functionality
            overlay.addEventListener('click', closeMobileSidebar, { once: true });
            
            // Add swipe-to-close functionality
            let touchStartX = 0;
            sidebar.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            
            sidebar.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;
                
                if (diff > 50) { // Swipe left to close
                    closeMobileSidebar();
                }
            }, { passive: true });
        }
    } else {
        closeMobileSidebar();
    }
}



function closeMobileSidebar() {
    console.log('🔧 Closing mobile sidebar...');
    
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
        // Reset transition lock
        sidebar.dataset.transitioning = 'false';
        // Clean inline styles that might block input layers
        sidebar.style.removeProperty('display');
        sidebar.style.removeProperty('visibility');
        sidebar.style.zIndex = '';
    }
    
    if (overlay) {
        overlay.classList.remove('opacity-100', 'pointer-events-auto');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';
        overlay.style.visibility = 'hidden';
    }
    
    // Reset body overflow
    document.body.style.overflow = '';
    
    console.log('✅ Mobile sidebar closed');
}

function toggleMobileSidebar() {
    console.log('🔧 Toggle mobile sidebar called');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    if (!sidebar || !overlay) return;
    if (sidebar.dataset.transitioning === 'true') return;
    const isOpen = sidebar.classList.contains('translate-x-0') && !sidebar.classList.contains('-translate-x-full');
    if (isOpen) {
        closeMobileSidebar();
    } else {
        // Open
        sidebar.dataset.transitioning = 'true';
        sidebar.style.removeProperty('display');
        sidebar.style.removeProperty('visibility');
        overlay.style.removeProperty('display');
        overlay.style.removeProperty('visibility');
        overlay.style.pointerEvents = 'auto';
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        sidebar.classList.add('translate-x-0');
        overlay.classList.add('opacity-100', 'pointer-events-auto');
        if (window.isMobile) document.body.style.overflow = 'hidden';
        setTimeout(() => { sidebar.dataset.transitioning = 'false'; }, 200);
        console.log('✅ Mobile sidebar opened');
    }
}

// Close sidebar when clicking overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('mobileSidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileSidebar);
        // Close on any tap outside the sidebar
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('mobileSidebar');
            if (!sidebar) return;
            const isOpen = sidebar.classList.contains('translate-x-0');
            if (!isOpen) return;
            if (!sidebar.contains(e.target) && e.target !== document.getElementById('mobileSidebarToggle')) {
                closeMobileSidebar();
            }
        });
        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobileSidebar();
        });
    }
    // Close on any nav item click inside sidebar
    document.addEventListener('click', (e) => {
        const navItem = e.target.closest('#mobileSidebar .nav-item');
        if (!navItem) return;
        setTimeout(() => { try { closeMobileSidebar(); } catch(_){} }, 0);
    }, true);
});

function updateUserDisplay(profile) {
    // Update all user name elements (both sets)
    const userNameElements = [
        document.getElementById('userName'),
        document.getElementById('userName2')
    ];
    
    const userClassElements = [
        document.getElementById('userClass'),
        document.getElementById('userClass2')
    ];
    
    const userAvatarElements = [
        document.getElementById('userAvatar'),
        document.getElementById('userAvatar2')
    ];
    
    const userInitialsElement = document.getElementById('userInitials');
    
    // Update user names
    userNameElements.forEach(element => {
        if (element) {
            element.textContent = profile.full_name || profile.name || 'Student';
        }
    });
    
    // Update user classes
    userClassElements.forEach(element => {
        if (element) {
            const grade = profile.grade || profile.class_level || profile.class || '10';
            // Remove "Class" prefix if it already exists
            const cleanGrade = grade.replace(/^Class\s*/i, '');
            element.textContent = `Class ${cleanGrade}`;
        }
    });
    
    // Update user avatars
    userAvatarElements.forEach(element => {
        if (element) {
            const avatarId = profile.ai_avatar || selectedAvatar;
            const avatar = regionalAvatars.find(a => a.id === avatarId);
            if (avatar) {
                element.innerHTML = avatar.image;
            } else {
                // Default avatar if none found
                element.innerHTML = '👤';
            }
        }
    });
    
    if (userInitialsElement) {
        const name = profile.full_name || profile.name || 'Student';
        userInitialsElement.textContent = name.charAt(0).toUpperCase();
    }
}

async function savePreferences() {
    try {
        const preferences = {
            learning_style: document.getElementById('learningStyle').value,
            preferred_language: document.getElementById('preferredLanguage').value,
            avatar_id: selectedAvatar,
            accessibility: {
                dyslexic_font: document.getElementById('dyslexicFont').checked,
                high_contrast: document.getElementById('highContrast').checked,
                screen_reader: document.getElementById('screenReader').checked
            }
        };
        
        await window.supabaseClient.from('user_preferences').upsert({
            user_id: currentUser.id,
            preference_key: 'user_preferences',
            preference_value: preferences
        });
        
        alert('Preferences saved successfully!');
    } catch (error) {
        console.error('Error saving preferences:', error);
        alert('Failed to save preferences. Please try again.');
    }
}

function loadUserPreferences() {
    // Load saved preferences and apply them
    // This would be implemented based on your preferences structure
}

function updateAccessibility() {
    const dyslexicFont = document.getElementById('dyslexicFont').checked;
    const highContrast = document.getElementById('highContrast').checked;
    
    document.body.classList.toggle('font-dyslexic', dyslexicFont);
    document.body.classList.toggle('high-contrast', highContrast);
}

function askQuickQuestion(question) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = question;
    sendMessage();
}

// Helper function to get default avatar based on language
function getDefaultAvatarForLanguage(language) {
    // Default to Miss Sapna for all users unless they specifically choose another avatar
    if (language === 'assamese' || language === 'Assamese') {
        return regionalAvatars.find(avatar => avatar.id === 'baruah-sir');
    } else {
        return regionalAvatars.find(avatar => avatar.id === 'miss-sapna');
    }
}

// Export functions for global access
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.sendMessage = sendMessage;
window.startVoiceInput = toggleVoiceRecording;
window.selectAvatar = selectAvatar;
window.savePreferences = savePreferences;
window.signInWithGoogle = signInWithGoogle;
window.signInWithGitHub = signInWithGitHub;
window.logout = logout;

// Save profile changes
async function saveProfileChanges() {
    try {
        const profileName = document.getElementById('profileName');
        const profilePhone = document.getElementById('profilePhone');
        const learningStyle = document.getElementById('learningStyle');
        const preferredLanguage = document.getElementById('preferredLanguage');
        
        const { error } = await window.supabaseClient
            .from('user_profiles')
            .upsert({
                id: currentUser.id,
                full_name: profileName.value,
                phone: profilePhone.value,
                learning_style: learningStyle.value,
                preferred_language: preferredLanguage.value,
                ai_avatar: selectedAvatar
            });
        
        if (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile changes.');
        } else {
            alert('Profile updated successfully!');
            document.getElementById('profileModal').classList.add('hidden');
            await loadUserData(); // Reload data to reflect changes
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile changes.');
    }
}

// Update avatar display
function updateAvatarDisplay() {
    console.log('🔧 Updating avatar display...');

    const avatarDisplay = document.getElementById('currentAvatarDisplay');
    if (!avatarDisplay) return;

    const currentAvatarId = getCurrentAvatarId();
    const avatarName = getCurrentAvatarName();
    let avatarIcon;

    if (currentAvatarId === 'miss-sapna') {
        avatarIcon = '👩‍🏫';
    } else {
        avatarIcon = '👨‍🏫';
    }

    avatarDisplay.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="text-2xl">${avatarIcon}</div>
            <div>
                <div class="text-white font-semibold">${avatarName}</div>
                <div class="text-gray-300 text-sm">AI Teacher</div>
            </div>
        </div>
    `;

    // Also update the welcome message avatar
    const welcomeTeacherAvatar = document.getElementById('welcomeTeacherAvatar');
    const welcomeTeacherName = document.getElementById('welcomeTeacherName');

    if (welcomeTeacherAvatar) {
        let avatarSrc;
        if (currentAvatarId === 'miss-sapna') {
            avatarSrc = 'images/miss_sapna.jpg';
        } else {
            avatarSrc = 'images/roy_sir.jpg';
        }
        welcomeTeacherAvatar.src = avatarSrc;
        welcomeTeacherAvatar.alt = avatarName;
    }

    if (welcomeTeacherName) {
        welcomeTeacherName.textContent = avatarName;
    }

    console.log('✅ Avatar display updated:', avatarName);
}

// Setup avatar selection
function setupAvatarSelection() {
    const avatarCards = document.querySelectorAll('.avatar-selection-card');
    avatarCards.forEach(card => {
        card.addEventListener('click', () => {
            avatarCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            // Determine which avatar was selected based on the image alt text
            const img = card.querySelector('img');
            if (img && img.alt === 'Miss Sapna') {
                selectedAvatar = 'miss-sapna';
                window.selectedAvatar = 'miss-sapna';
            } else if (img && img.alt === 'Baruah Sir') {
                selectedAvatar = 'baruah-sir';
                window.selectedAvatar = 'baruah-sir';
            } else if (img && img.alt === 'Roy Sir') {
                selectedAvatar = 'roy-sir';
                window.selectedAvatar = 'roy-sir';
            }
            
            updateAvatarDisplay();
            saveAvatarPreference();
        });
    });
    updateAvatarDisplay();
}

async function saveAvatarPreference() {
    try {
        // Use the current selectedAvatar from window object
        const avatarId = window.selectedAvatar;
        if (!avatarId) {
            console.log('No avatar selected');
            return;
        }

        console.log('Saving avatar preference:', avatarId);

        // Save to Supabase user_profiles table
        if (currentUser) {
            const { error } = await window.supabaseClient
                .from('user_profiles')
                .upsert({
                    id: currentUser.id,
                    ai_avatar: avatarId,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error saving avatar preference:', error);
                showError('Failed to save avatar preference');
                return;
            }

            console.log('Avatar preference saved successfully');
            showSuccess('Avatar preference saved!');
            
            // Update local userData
            if (userData) {
                userData.ai_avatar = avatarId;
            }
            if (window.userData) {
                window.userData.ai_avatar = avatarId;
            }
            
                            // Force TTS to update voice selection for new avatar
                if (window.textToSpeech) {
                    console.log('Updating TTS voice for new avatar:', avatarId);
                    // Trigger voice selection update
                    window.textToSpeech.forceVoiceUpdate();
                }
        }
    } catch (error) {
        console.error('Error in saveAvatarPreference:', error);
        showError('Failed to save avatar preference');
    }
}

// Chat
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const message = chatInput.value.trim();
    if (!message) return;
    clearDashboardError();
    await addMessage('user', message);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    showTypingIndicator();
    // Check if user is asking for a diagram or image
    const diagramKeywords = ['diagram', 'image', 'picture', 'flowchart', 'figure', 'graph', 'chart'];
    const isDiagramRequest = diagramKeywords.some(word => message.toLowerCase().includes(word));
    if (isDiagramRequest) {
        // Try to find a relevant book image first
        try {
            const imgRes = await fetch(`${window.TUTOR_CONFIG?.apiBaseUrl || ''}/api/book-images?keyword=${encodeURIComponent(message)}`);
            const imgData = await imgRes.json();
            if (imgData.images && imgData.images.length > 0) {
                removeTypingIndicator();
                const img = imgData.images[0];
                await addMessage('ai', `<img src='${img.imgPath.replace(/\\/g, '/')}' alt='Book Diagram' class='max-w-full max-h-80 rounded shadow mb-2'><div class='text-xs text-gray-300'>From book: <b>${img.file}</b>, page ${img.page}</div>`);
                return;
            }
        } catch (e) {
            // If image search fails, fallback to GPT
        }
    }
    // Get AI response as before
    try {
        // Get the current avatar from user profile or global variable
        const currentAvatar = userProfile?.ai_avatar || getCurrentAvatarId();
        
        // Get recent chat history for context
        let chatHistory = [];
        if (window.subjectManager && window.subjectManager.getCurrentSubject()) {
            const subjectHistory = window.subjectManager.subjectChatHistory[window.subjectManager.getCurrentSubject()] || [];
            chatHistory = subjectHistory.slice(-10); // Last 10 messages for context
        }
    
        // Send to AI backend with complete user profile and chat history
        const apiBase = (window.location.protocol === 'file:') ? 'https://tution.app' : '';
        const response = await fetch(apiBase + '/api/enhanced-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: text,
                grade: userClass.replace(/[^0-9]/g, ''), // Extract number from class
                subject: userSubject,
                userProfile: userProfile,
                avatar: getCurrentAvatarId(), // Send avatar ID instead of teacher name
                teacher: getCurrentAvatarName(), // Keep teacher name for compatibility
                userGender: userGender,
                avatarGender: avatarGender,
                isFirstResponseOfDay: isFirstResponseOfDay,
                chatHistory: chatHistory,
                teacherPersonality: getTeacherPersonality(),
                shortWelcomeMessage: getShortWelcomeMessage()
            })
        });
        
        console.log('🔧 Response received:', response.status);
        const data = await response.json();
        removeTypingIndicator();
        
        if (data.success && data.response) {
            console.log('✅ AI response received');
        await addMessage('ai', data.response);
            
            // Save message to subject history if subject manager is active
            if (window.subjectManager && window.subjectManager.getCurrentSubject()) {
                await window.subjectManager.saveChatMessage(
                    window.subjectManager.getCurrentSubject(),
                    text,
                    data.response
                );
            }
            
            // Update the last response date after successful response
            lastResponseDate = today;
        } else {
            console.error('❌ AI response error:', data);
            await addMessage('ai', 'Sorry, I could not get a response from the AI.');
        }
    } catch (err) {
        console.error('❌ Send message error:', err);
        removeTypingIndicator();
        await addMessage('ai', 'Error connecting to AI server.');
    }
}

function handleQuickAction(event) {
    const button = event.currentTarget;
    const text = button.textContent.trim();
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = text;
        sendChatMessage();
    }
}

// Voice
function updateVoiceButton() {
    const voiceToggle = document.getElementById('voiceToggle');
    if (!voiceToggle) return;
    if (micSystem.isRecording) {
        voiceToggle.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        voiceToggle.classList.add('listening');
    } else {
        voiceToggle.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceToggle.classList.remove('listening');
    }
}

// Utility: Show error
function showDashboardError(msg) {
    const errDiv = document.getElementById('dashboardError');
    if (errDiv) {
        errDiv.textContent = msg;
        errDiv.classList.remove('hidden');
    }
    console.error(msg);
}
function clearDashboardError() {
    const errorEl = document.getElementById('dashboardError');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }
}

// Enhanced error handling
function showError(message, duration = 5000) {
    const existing = document.querySelector('.error-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 glass-effect p-4 rounded-xl text-red-400 font-medium flex items-center space-x-2 z-50 error-toast';
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showSuccess(message, duration = 3000) {
    const existing = document.querySelector('.success-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 glass-effect p-4 rounded-xl text-green-400 font-medium flex items-center space-x-2 z-50 success-toast';
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Attach chat and voice event listeners on DOMContentLoaded

document.addEventListener('DOMContentLoaded', function() {
      // REMOVED ALL DUPLICATE EVENT LISTENERS
  console.log('✅ No duplicate event listeners - all handled in initializeEventListeners()');
});

if (window.mermaid) {
    window.mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true
        },
        securityLevel: 'loose'
    });
} 

// Show profile popup
function showProfilePopup() {
    console.log('Opening profile popup...');
    console.log('User data:', userData);
    console.log('Current user:', currentUser);
    
    // If currentUser missing, try to refresh once before failing
    if (!currentUser && window.supabaseClient) {
        console.warn('Current user missing; attempting to refresh session...');
        window.supabaseClient.auth.getUser().then(({ data }) => {
            if (data && data.user) {
                currentUser = data.user;
                showProfilePopup(); // re-enter with user present
            } else {
                alert('Please log in again to access your profile.');
            }
        });
        return;
    }
    
    // Load fresh user data from Supabase
    loadUserData().then(() => {
        // Populate popup fields with current user data
        const nameField = document.getElementById('popupProfileName');
        const classField = document.getElementById('popupProfileClass');
        const genderField = document.getElementById('popupProfileGender');
        const boardField = document.getElementById('popupProfileBoard');
        const emailField = document.getElementById('popupProfileEmail');
        const mobileField = document.getElementById('popupProfileMobile');
        
        if (nameField) nameField.value = window.userData?.full_name || '';
        if (classField) classField.value = window.userData?.class || '';
        if (genderField) genderField.value = window.userData?.gender || 'male';
        if (boardField) boardField.value = window.userData?.board || '';
        if (emailField) emailField.value = (currentUser && currentUser.email) || '';
        if (mobileField) mobileField.value = window.userData?.mobile || 'Not set';
        
        // Show popup
        const popup = document.getElementById('profilePopupOverlay');
        if (popup) {
            popup.classList.remove('hidden');
            
            // Add click outside to close functionality
            popup.addEventListener('click', function(e) {
                if (e.target === popup) {
                    closeProfilePopup();
                }
            });
        }
    });
}

// Close profile popup
function closeProfilePopup() {
    const popup = document.getElementById('profilePopupOverlay');
    if (popup) {
        popup.classList.add('hidden');
    }
}

// Save profile from popup
async function saveProfileFromPopup() {
    try {
        const name = document.getElementById('popupProfileName')?.value || '';
        const classValue = document.getElementById('popupProfileClass')?.value || '';
        const gender = document.getElementById('popupProfileGender')?.value || 'male';
        const board = document.getElementById('popupProfileBoard')?.value || '';
        
        if (!window.currentUser) {
            showError('User not authenticated');
            return;
        }
        
        // Update user data
        const { error } = await window.supabaseClient
            .from('user_profiles')
            .upsert({
                id: window.currentUser.id,
                full_name: name,
                class: classValue,
                gender: gender,
                board: board,
                updated_at: new Date().toISOString()
            });
        
        if (error) {
            console.error('Error updating profile:', error);
            showError('Failed to update profile');
            return;
        }
        
        // Update local userData
        window.userData = { ...window.userData, full_name: name, class: classValue, gender: gender, board: board };
        
        // Update display
        updateUserDisplay(window.userData);
        
        // Close popup
        closeProfilePopup();
        
        showSuccess('Profile updated successfully!');
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showError('Failed to save profile. Please try again.');
    }
}

// Show contact us popup
function showContactUs() {
    // Populate contact form with user data
    const nameField = document.getElementById('contactUsName');
    const emailField = document.getElementById('contactUsEmail');
    const mobileField = document.getElementById('contactUsMobile');
    
    if (nameField) nameField.value = window.userData?.full_name || (currentUser && currentUser.email) || '';
    if (emailField) emailField.value = (currentUser && currentUser.email) || '';
    if (mobileField) mobileField.value = window.userData?.mobile || 'Not set';
    
    // Show popup
    const popup = document.getElementById('contactUsPopupOverlay');
    if (popup) {
        popup.classList.remove('hidden');
        
        // Add click outside to close functionality
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                closeContactUsPopup();
            }
        });
    }
}

// Close contact us popup
function closeContactUsPopup() {
    const popup = document.getElementById('contactUsPopupOverlay');
    if (popup) {
        popup.classList.add('hidden');
    }
} 

    // Setup small TTS controls below avatar
    function setupSmallTTSControls() {
        const playBtn = document.getElementById('tts-play-small');
        const stopBtn = document.getElementById('tts-stop-small');
        
        if (playBtn && stopBtn) {
            playBtn.addEventListener('click', () => {
                if (window.textToSpeech) {
                    window.textToSpeech.playLastMessage();
                }
            });
            
            stopBtn.addEventListener('click', () => {
                if (window.textToSpeech) {
                    window.textToSpeech.stop();
                }
            });
        }
    }

    // All functions are now assigned immediately after definition
    
    console.log('✅ All global functions assigned successfully');
// Assign to global immediately
window.openMobileSidebar = function() {
    console.log('🔧 Opening mobile sidebar...');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    if (!sidebar || !overlay) return;
    // Clear any inline styles from previous close
    sidebar.style.removeProperty('display');
    sidebar.style.removeProperty('visibility');
    overlay.style.removeProperty('display');
    overlay.style.removeProperty('visibility');
    overlay.style.pointerEvents = 'auto';
    // Apply classes to open
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
    if (window.isMobile) document.body.style.overflow = 'hidden';
    sidebar.dataset.transitioning = 'false';
    console.log('✅ Mobile sidebar opened');
};
    
// Assign to global immediately
window.playTTS = function() {
    if (window.textToSpeech) {
        window.textToSpeech.playLastMessage();
    }
};

// Assign to global immediately
window.stopTTS = function() {
    if (window.textToSpeech) {
        window.textToSpeech.stop();
    }
};
    
// Assign to global immediately
window.handleAvatarSelection = function(language) {
    const englishCard = document.querySelector('[onclick="handleAvatarSelection(\'english\')"]');
    const hindiCard = document.querySelector('[onclick="handleAvatarSelection(\'hindi\')"]');
    const assameseCard = document.querySelector('[onclick="handleAvatarSelection(\'assamese\')"]');
    
    // Remove selected class from all
    englishCard?.classList.remove('selected');
    hindiCard?.classList.remove('selected');
    assameseCard?.classList.remove('selected');
    
    // Add selected class to chosen language
    if (language === 'english') {
        englishCard?.classList.add('selected');
        selectedAvatar = 'roy-sir';
    } else if (language === 'hindi') {
        hindiCard?.classList.add('selected');
        selectedAvatar = 'miss-sapna';
    } else if (language === 'assamese') {
        assameseCard?.classList.add('selected');
        selectedAvatar = 'baruah-sir';
    }
    
    // Update avatar display
    updateAvatarDisplay();
    
    // Save preference
    saveAvatarPreference();
};
    
// Assign to global immediately
window.downloadApp = function() {
    console.log('📱 Download App called');
    
    // Show download modal with progress
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
            <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">📱 Downloading tution.app</h3>
            <p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 1.5rem;">
                Your download will start automatically...
            </p>
            <div style="
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 1rem;
            ">
                <div id="progress-bar" style="
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    transition: width 0.3s ease;
                "></div>
            </div>
            <p id="download-status" style="color: #4ecdc4; font-size: 0.9rem;">Preparing download...</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Simulate download progress
    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const status = document.getElementById('download-status');
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        
        if (progress < 30) {
            status.textContent = 'Preparing download...';
        } else if (progress < 60) {
            status.textContent = 'Downloading APK file...';
        } else if (progress < 90) {
            status.textContent = 'Almost done...';
        } else {
            status.textContent = 'Download complete!';
            clearInterval(interval);
            
            // Trigger actual download after 1 second
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = '/tution.app.v1.1.apk';
                link.download = 'tution.app.v1.1.apk';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Close modal after download
                setTimeout(() => {
                    modal.remove();
                }, 2000);
            }, 1000);
        }
    }, 200);
};

// Assign to global immediately
window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Assign to global immediately
window.forceShowTrialOverlay = function() {
    const overlay = document.getElementById('trialExpiredOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
};

// Assign to global immediately
window.upgradeToPremium = function() {
    window.location.href = 'payment.html';
};

// Assign to global immediately
window.closeTrialOverlay = function() {
    const overlay = document.getElementById('trialExpiredOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
};
    
// Assign to global immediately
window.showSubjectManager = function() {
    if (window.subjectManager && window.subjectManager.showSubjectManager) {
        return window.subjectManager.showSubjectManager();
    }
};

// Assign to global immediately
window.addNewSubject = function() {
    if (window.subjectManager && window.subjectManager.addNewSubject) {
        return window.subjectManager.addNewSubject();
    }
};

// Assign to global immediately
window.saveChatMessage = function(message, response) {
    if (window.subjectManager && window.subjectManager.saveChatMessage) {
        return window.subjectManager.saveChatMessage(message, response);
    }
};
// Functions are already made globally accessible at the top of the file

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM loaded, initializing dashboard...');
    
    // Prevent multiple initializations
    if (window.dashboardInitialized || isInitializing) {
        console.log('⚠️ Dashboard already initialized or initializing, skipping...');
        return;
    }
    
    isInitializing = true;
    
    try {
        // Wait for Supabase to be available
        let attempts = 0;
        const maxAttempts = 10;
        
        while (typeof window.supabase === 'undefined' && attempts < maxAttempts) {
            console.log(`🔄 Waiting for Supabase to load... (attempt ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase library failed to load after multiple attempts. Continuing without Supabase.');
        } else {
            console.log('✅ Supabase library loaded successfully');
            
            // Test that key functions are available
            console.log('🔧 Testing function availability:');
            console.log('- toggleVoiceRecording:', typeof window.toggleVoiceRecording);
            console.log('- openMobileSidebar:', typeof window.openMobileSidebar);
            console.log('- closeMobileSidebar:', typeof window.closeMobileSidebar);
            console.log('- showSection:', typeof window.showSection);
            console.log('- sendMessage:', typeof window.sendMessage);
            
            // Initialize Supabase first
            try {
                await initializeSupabase();
                // After supabase auth, ensure userData is loaded for mobile
                if (!window.userData || !window.userData.full_name) {
                    try {
                        await loadUserData();
                        updateUserDisplay(window.userData || {});
                    } catch (_) {}
                }
            } catch (e) {
                console.warn('⚠️ initializeSupabase failed in DOMContentLoaded. Continuing without Supabase.', e);
            }
        }
        
        // Initialize the dashboard
        await initializeDashboard();
        
        // Initialize avatar selection system
        initializeAvatarSelection();
        
        // Test voice recognition initialization
        console.log('🔧 Testing voice recognition:');
        const voiceButton = document.getElementById('voiceButton');
        if (voiceButton) {
            console.log('- Voice button found:', voiceButton);
            console.log('- Voice button display:', voiceButton.style.display);
        } else {
            console.log('- Voice button not found');
        }
        
        // Test sidebar buttons
        console.log('🔧 Testing sidebar buttons:');
        const navItems = document.querySelectorAll('.nav-item');
        console.log('- Nav items found:', navItems.length);
        navItems.forEach((item, index) => {
            console.log(`- Nav item ${index}:`, item.textContent.trim());
        });
        
        // Apply mobile optimizations
        if (window.isMobile) {
            applyMobileOptimizations();
            setupMobileEventListeners();
            enableMobileFeatures();
        }
        
        // Mark as initialized
        window.dashboardInitialized = true;
        console.log('✅ Dashboard initialization complete');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showError('Failed to initialize dashboard. Please refresh the page.');
        
        // Fallback: Initialize basic UI functionality even if Supabase fails
        try {
            console.log('🔄 Attempting fallback initialization...');
            
            // Set up basic event listeners
            setupEventListeners();
            
            // Show basic welcome message only once
            if (!window.welcomeMessageShown) {
                showWelcomeMessage();
            }
            
            // Initialize voice features
            try {
                initializeVoiceFeatures();
                populateVoices();
                initSpeechRecognition();
            } catch (voiceError) {
                console.warn('⚠️ Voice features failed to initialize:', voiceError);
            }
            
            // Apply mobile optimizations
            if (window.isMobile) {
                applyMobileOptimizations();
                setupMobileEventListeners();
                enableMobileFeatures();
            }
            
            // Mark as initialized
            window.dashboardInitialized = true;
            console.log('✅ Fallback initialization completed');
            
        } catch (fallbackError) {
            console.error('❌ Fallback initialization also failed:', fallbackError);
        }
    } finally {
        isInitializing = false;
    }
});

// Also initialize when window loads (fallback)
window.addEventListener('load', function() {
    console.log('🔄 Window loaded, checking dashboard status...');
    
    // Only initialize if not already done
    if (!window.dashboardInitialized) {
        console.log('🔄 Dashboard not initialized, starting initialization...');
        
        // The DOMContentLoaded listener should handle this, but this is a fallback
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async function() {
                if (!window.dashboardInitialized) {
                    await initializeDashboard();
                }
            });
        } else if (!window.dashboardInitialized) {
            initializeDashboard();
        }
    }
});

// Assign key functions to window object for global access
window.sendMessage = sendMessage;
window.toggleVoiceRecording = toggleVoiceRecording;
window.showSection = showSection;
// Remove duplicate re-assignments to avoid confusion; keep a single export only
window.logout = logout;
window.saveChatMessage = saveChatMessage;
// Ensure UI handlers are globally accessible for button bindings
window.showProfilePopup = showProfilePopup;
window.showContactUs = showContactUs;

// Add a test function to verify button clicks
window.testButtonClick = function(buttonName) {
    console.log(`🔧 Test button click: ${buttonName}`);
    showSuccess(`Button ${buttonName} is clickable!`);
};

// Add a test function to verify subject manager
window.testSubjectManager = function() {
    console.log('🔧 Testing subject manager...');
    console.log('- Subject manager available:', !!window.subjectManager);
    console.log('- Show subject manager function:', typeof window.showSubjectManager);
    console.log('- Subject manager modal:', document.getElementById('subjectManagerModal'));
    
    if (window.subjectManager) {
        console.log('- Subject manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.subjectManager)));
    }
    
    showSuccess('Subject manager test completed! Check console for details.');
};

console.log('✅ All functions assigned to window object');

async function addMessage(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    // Restore legacy classes so messages stack vertically
    messageDiv.className = `message ${role === 'user' ? 'message-user' : 'message-ai'}`;

    // Process Mermaid diagrams
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);
    let processedContent = contentString;
    const hasMermaid = contentString.includes('```mermaid');

    if (hasMermaid) {
        processedContent = contentString.replace(/```mermaid([\s\S]*?)```/g,
            '<div class="mermaid bg-gray-800 p-4 rounded-lg my-4">$1</div>');
    }

    // Process other markdown
    processedContent = marked.parse(processedContent);

    // Bubble layout that respects vertical stacking
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="text-white message-content prose prose-invert max-w-none">${processedContent}</div>
            <p class="text-gray-400 text-xs mt-2">Just now</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (hasMermaid) {
        setTimeout(renderDiagrams, 100);
    }

    if (role === 'ai') {
        // Use resilient speaker that waits for TTS init if needed
        speakText(content);
    }
}

// Global variables for concurrency control
// REMOVED: Old concurrency control variables that were causing conflicts

// Avatar selection variables
let selectedAvatarOption = null;
let avatarSelectionModal = null;

// Initialize avatar selection system
function initializeAvatarSelection() {
    console.log('🔧 Initializing avatar selection system...');
    
    // Get current avatar from user profile
    if (window.userData && window.userData.ai_avatar) {
        selectedAvatarOption = window.userData.ai_avatar;
        console.log('✅ Current avatar loaded:', selectedAvatarOption);
    } else {
        selectedAvatarOption = getCurrentAvatarId(); // Use dynamic function
        console.log('✅ Default avatar set:', selectedAvatarOption);
    }
    
    // Update avatar display
    updateAvatarDisplay();
}

// Show avatar selection modal
function showAvatarSelectionModal() {
    console.log('🔧 Showing avatar selection modal...');
    const modal = document.getElementById('avatarSelectionModal');
    if (modal) {
        modal.classList.remove('hidden');
        highlightCurrentAvatar();
    } else {
        console.error('❌ Avatar selection modal not found');
    }
}

// Close avatar selection modal
function closeAvatarSelectionModal() {
    console.log('🔧 Closing avatar selection modal...');
    const modal = document.getElementById('avatarSelectionModal');
    if (modal) {
        modal.classList.add('hidden');
        selectedAvatarOption = null; // Reset selection
    }
}

// Select avatar option
function selectAvatarOption(avatarId, avatarName, event) {
    console.log('🔧 Selecting avatar:', avatarId, avatarName);
    
    // Remove previous selection
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('ring-4', 'ring-yellow-400');
    });
    
    // Highlight selected option
    if (event && event.currentTarget) {
        const selectedOption = event.currentTarget;
        selectedOption.classList.add('ring-4', 'ring-yellow-400');
    }
    
    selectedAvatarOption = avatarId;
    console.log('✅ Avatar selected:', selectedAvatarOption);
}

// Save avatar selection
async function saveAvatarSelection() {
    if (!selectedAvatarOption) {
        showError('Please select an avatar first');
        return;
    }
    
    console.log('🔧 Saving avatar selection:', selectedAvatarOption);
    
    try {
        // Use the correct Supabase client
        const supabaseClient = window.supabaseClient || window.supabase;
        
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .update({ 
                ai_avatar: selectedAvatarOption,
                updated_at: new Date().toISOString()
            })
            .eq('id', window.userData.id)
            .select();
        
        if (error) {
            console.error('❌ Error saving avatar:', error);
            throw new Error('Failed to save avatar selection');
        }
        
        // Update local user data
        if (window.userData) {
            console.log('🔧 Updating local userData.ai_avatar from:', window.userData.ai_avatar, 'to:', selectedAvatarOption);
            window.userData.ai_avatar = selectedAvatarOption;
        }
        // Persist locally for small devices/APK
        try { localStorage.setItem('ai_avatar', selectedAvatarOption); } catch(_) {}
        
        // Update global selected avatar
        console.log('🔧 Updating window.selectedAvatar from:', window.selectedAvatar, 'to:', selectedAvatarOption);
        window.selectedAvatar = selectedAvatarOption;
        
        console.log('✅ Avatar saved successfully:', selectedAvatarOption);
        console.log('🔧 Current window.userData.ai_avatar:', window.userData?.ai_avatar);
        console.log('🔧 Current window.selectedAvatar:', window.selectedAvatar);
        showSuccess('Avatar updated successfully!');
        
        // Reload user data to ensure AI gets the updated avatar
        console.log('🔧 Reloading user data...');
        await reloadUserData();
        
        // Update TTS voice to match new avatar
        console.log('🔧 Updating TTS voice...');
        if (window.textToSpeech) {
            // Force immediate voice update
            window.textToSpeech.forceVoiceUpdate();
            
            // Force voice change for next speech
            setTimeout(() => {
                window.textToSpeech.forceVoiceUpdate();
                console.log('🔧 Voice updated for new avatar:', selectedAvatarOption);
            }, 100);
            
            // Force voice change again after a longer delay
            setTimeout(() => {
                window.textToSpeech.forceVoiceUpdate();
                console.log('🔧 Final voice update for avatar:', selectedAvatarOption);
            }, 500);
        }
        
        // Don't show welcome message when changing avatar - it's annoying
        // showAvatarWelcomeMessage();
        
        // Update display
        updateAvatarDisplay();
        
        // Close modal
        closeAvatarSelectionModal();
        
    } catch (error) {
        console.error('❌ Avatar selection error:', error);
        showError('Failed to save avatar selection. Please try again.');
    }
}

// Highlight current avatar in modal
function highlightCurrentAvatar() {
    console.log('🔧 Highlighting current avatar:', selectedAvatarOption);
    
    // Remove all highlights
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('ring-4', 'ring-yellow-400');
    });
    
    // Highlight current avatar
    if (selectedAvatarOption) {
        const currentOption = document.querySelector(`[onclick*="${selectedAvatarOption}"]`);
        if (currentOption) {
            currentOption.classList.add('ring-4', 'ring-yellow-400');
        }
    }
}

// Loading state management
// Loading state management
// REMOVED: let isInitializing = false; - DUPLICATE
// REMOVED: let isUserDataLoading = false; - DUPLICATE

// Initialize UI components
function initializeUI() {
  console.log('🔧 Initializing UI components...');
  
  // Load books
  loadBooks();
  
  // Populate avatar grid
  populateAvatarGrid();
  
  // Initialize voice features
  initializeVoiceFeatures();
  populateVoices();
  
  // Initialize subject manager if available
  if (window.subjectManager) {
    console.log('🔧 Initializing subject manager...');
    try {
      window.subjectManager.initialize(window.userData, window.userData?.class, window.userData?.board);
      console.log('✅ Subject manager initialized');
    } catch (error) {
      console.error('❌ Subject manager initialization error:', error);
    }
  }
  
  // Load voice settings
  setTimeout(() => {
    loadVoiceSettings();
    setupVoiceSettingsListeners();
  }, 1000);
  
  // Initialize speech recognition
  initSpeechRecognition();
  
  // Show welcome message only once
  if (!window.welcomeMessageShown) {
    showWelcomeMessage();
  }
  
  // Force refresh images to ensure they display properly
  setTimeout(() => {
    forceRefreshImages();
  }, 1000);
  
  // Initialize additional features
  if (window.learningProgress) {
    window.learningProgress.loadProgress();
  }
  
  if (window.groupLearning) {
    window.groupLearning.initializeRealtime();
  }
  
  console.log('✅ UI components initialized');
}

// Initialize event listeners
function initializeEventListeners() {
  console.log('🔧 Initializing event listeners...');
  
  // COMPLETELY REMOVE ALL EXISTING LISTENERS
  const sendButton = document.getElementById('sendButton');
  const sendButtonMobile = document.getElementById('sendButtonMobile');
  const voiceButton = document.getElementById('voiceButton');
  const voiceButtonMobile = document.getElementById('voiceButtonMobile');
  
  // Desktop Send Button - COMPLETE RESET
  if (sendButton) {
    console.log('🔧 Resetting desktop send button...');
    const newSendButton = sendButton.cloneNode(true);
    sendButton.parentNode.replaceChild(newSendButton, sendButton);
    
    // ONLY ONE EVENT LISTENER
    newSendButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔧 Desktop send button clicked ONCE');
      sendMessage();
    });
  }
  
  // Mobile Send Button - COMPLETE RESET
  if (sendButtonMobile) {
    console.log('🔧 Resetting mobile send button...');
    const newSendButtonMobile = sendButtonMobile.cloneNode(true);
    sendButtonMobile.parentNode.replaceChild(newSendButtonMobile, sendButtonMobile);
    
    // ONLY ONE EVENT LISTENER
    newSendButtonMobile.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔧 Mobile send button clicked ONCE');
      sendMessage();
    });
  }
  
  // Voice Buttons - handled by micSystem in setupVoiceSettingsListeners
  console.log('✅ Voice button listeners handled by micSystem');
  
  // Mobile voice button - handled in setupVoiceSettingsListeners
  console.log('✅ Mobile voice button listeners handled in setupVoiceSettingsListeners');
  
  // Enter Key - COMPLETE RESET
  const chatInput = document.getElementById('chatInput');
  const chatInputMobile = document.getElementById('chatInputMobile');
  
  if (chatInput) {
    const newChatInput = chatInput.cloneNode(true);
    chatInput.parentNode.replaceChild(newChatInput, chatInput);
    
    newChatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        console.log('🔧 Enter key pressed ONCE in desktop input');
        sendMessage();
      }
    });
  }
  
  if (chatInputMobile) {
    const newChatInputMobile = chatInputMobile.cloneNode(true);
    chatInputMobile.parentNode.replaceChild(newChatInputMobile, chatInputMobile);
    
    newChatInputMobile.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        console.log('🔧 Enter key pressed ONCE in mobile input');
        sendMessage();
      }
    });
  }
  
  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.textContent.trim().toLowerCase();
      showSection(section);
    });
  });
  
  console.log('✅ Event listeners initialized - ALL DUPLICATES REMOVED');
}

// Track user interaction for TTS
function trackUserInteraction() {
    if (!window.userHasInteracted) {
        window.userHasInteracted = true;
        console.log('[TTS] User interaction detected, TTS now enabled');
    }
}

// Close subject manager when clicking outside
function closeSubjectManagerOnOutsideClick(event) {
    if (event.target.id === 'subjectManagerModal') {
        window.subjectManager?.hideSubjectManager();
    }
}

// Add event listeners for user interaction
document.addEventListener('click', trackUserInteraction);
document.addEventListener('keydown', trackUserInteraction);
document.addEventListener('touchstart', trackUserInteraction);

// Initialize user interaction tracking
window.userHasInteracted = false;

// Global click delegation to ensure critical buttons always work
document.addEventListener('click', (event) => {
    const target = event.target.closest('#downloadAppBtn, #profilePopupBtn, #contactUsBtn, #subjectManagerBtn');
    if (!target) return;
    event.preventDefault();
    switch (target.id) {
        case 'downloadAppBtn':
            if (typeof window.downloadApp === 'function') window.downloadApp();
            break;
        case 'profilePopupBtn':
            if (typeof window.showProfilePopup === 'function') window.showProfilePopup();
            break;
        case 'contactUsBtn':
            if (typeof window.showContactUs === 'function') window.showContactUs();
            break;
        case 'subjectManagerBtn':
            if (typeof window.showSubjectManager === 'function') window.showSubjectManager();
            break;
        default:
            break;
    }
});

// Close avatar selection when clicking outside
function closeAvatarSelectionOnOutsideClick(event) {
    if (event.target.id === 'avatarSelectionModal') {
        closeAvatarSelectionModal();
    }
}

// Update subject progress section with user's subjects
function updateSubjectProgress() {
    console.log('🔧 Updating subject progress...');
    
    const subjectsContainer = document.getElementById('subjectsContainer');
    if (!subjectsContainer) {
        console.error('❌ Subjects container not found');
        return;
    }
    
    // Get user's subjects from subject manager
    let userSubjects = ['English']; // Default subject
    
    if (window.subjectManager && window.subjectManager.userSubjects) {
        userSubjects = window.subjectManager.userSubjects;
    }
    
    console.log('📚 User subjects:', userSubjects);
    
    // Clear existing subjects
    subjectsContainer.innerHTML = '';
    
    // Add each subject with progress bar
    userSubjects.forEach(subject => {
        const subjectItem = document.createElement('div');
        subjectItem.className = 'subject-item';
        subjectItem.innerHTML = `
            <div class="flex justify-between text-white text-sm mb-2">
                <span>${subject}</span>
                <span id="${subject.toLowerCase().replace(/\s+/g, '')}Progress">0%</span>
            </div>
            <div class="progress-modern">
                <div class="progress-fill" id="${subject.toLowerCase().replace(/\s+/g, '')}ProgressBar" style="width: 0%"></div>
            </div>
        `;
        subjectsContainer.appendChild(subjectItem);
    });
    
    console.log('✅ Subject progress updated with', userSubjects.length, 'subjects');
}

// Force reload user data to get latest avatar
async function reloadUserData() {
    console.log('🔄 Reloading user data...');
    try {
        await loadUserData();
        console.log('✅ User data reloaded successfully');
    } catch (error) {
        console.error('❌ Failed to reload user data:', error);
    }
}

// Function to update user gender
async function updateUserGender(newGender) {
    try {
        console.log('🔧 Updating user gender to:', newGender);
        
        if (!window.userData || !window.userData.id) {
            throw new Error('User data not available');
        }
        
        const supabaseClient = window.supabaseClient || window.supabase;
        
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .update({ 
                gender: newGender,
                updated_at: new Date().toISOString()
            })
            .eq('id', window.userData.id)
            .select();
        
        if (error) {
            console.error('❌ Error updating gender:', error);
            throw new Error('Failed to update gender');
        }
        
        // Update local user data
        if (window.userData) {
            window.userData.gender = newGender;
        }
        
        console.log('✅ Gender updated successfully:', newGender);
        showSuccess('Gender updated successfully!');
        
        // Reload user data to ensure AI gets the updated gender
        await reloadUserData();
        
    } catch (error) {
        console.error('❌ Gender update error:', error);
        showError('Failed to update gender. Please try again.');
    }
}

// Function to get current user gender
function getCurrentUserGender() {
    if (window.userData && window.userData.gender) {
        return window.userData.gender;
    }
    return 'male'; // Default fallback
}

// Global flag to prevent repeated welcome messages
window.welcomeMessageShown = false;

// Function to reset welcome message flag (for testing or fresh start)
function resetWelcomeMessage() {
    window.welcomeMessageShown = false;
    console.log('🔧 Welcome message flag reset');
}

// Check subscription expiry and show reminder
function checkSubscriptionExpiry(expiryDate) {
    if (!expiryDate) return;
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        // Show expiry reminder
        const reminderHtml = `
            <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="text-2xl">⚠️</div>
                        <div>
                            <div class="text-yellow-200 font-semibold">Premium Subscription Expiring Soon</div>
                            <div class="text-yellow-300 text-sm">Your premium access expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}</div>
                        </div>
                    </div>
                    <button onclick="window.location.href='payment.html'" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">
                        Renew Now
                    </button>
                </div>
            </div>
        `;
        
        // Add reminder to the top of the chat section
        const chatSection = document.getElementById('chatSection');
        if (chatSection) {
            const existingReminder = chatSection.querySelector('.subscription-reminder');
            if (existingReminder) {
                existingReminder.remove();
            }
            
            const reminderDiv = document.createElement('div');
            reminderDiv.className = 'subscription-reminder';
            reminderDiv.innerHTML = reminderHtml;
            chatSection.insertBefore(reminderDiv, chatSection.firstChild);
        }
    } else if (daysUntilExpiry <= 0) {
        // Show expired message
        const expiredHtml = `
            <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="text-2xl">❌</div>
                        <div>
                            <div class="text-red-200 font-semibold">Premium Subscription Expired</div>
                            <div class="text-red-300 text-sm">Your premium access has expired. Renew to continue enjoying premium features.</div>
                        </div>
                    </div>
                    <button onclick="window.location.href='payment.html'" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                        Renew Now
                    </button>
                </div>
            </div>
        `;
        
        // Add expired message to the top of the chat section
        const chatSection = document.getElementById('chatSection');
        if (chatSection) {
            const existingReminder = chatSection.querySelector('.subscription-reminder');
            if (existingReminder) {
                existingReminder.remove();
            }
            
            const reminderDiv = document.createElement('div');
            reminderDiv.className = 'subscription-reminder';
            reminderDiv.innerHTML = expiredHtml;
            chatSection.insertBefore(reminderDiv, chatSection.firstChild);
        }
        
        // Show voice message for expired subscription
        showExpiredSubscriptionVoiceMessage();
    }
}

// Function to show voice message for expired subscription
function showExpiredSubscriptionVoiceMessage() {
    try {
        // Get user name from profile
        const userName = window.currentUserProfile?.full_name || 'Student';
        
        // Create the voice message
        const message = `Hi ${userName}, I liked teaching you but your plan has expired. Please recharge so that we can enjoy studying together.`;
        
        // Add message to chat
        addMessage('assistant', message);
        
        // Speak the message
        setTimeout(() => {
            speakText(message);
        }, 500);
        
        console.log('✅ Expired subscription voice message shown and spoken');
    } catch (error) {
        console.error('❌ Error showing expired subscription message:', error);
    }
}

// Function to force refresh images
function forceRefreshImages() {
    console.log('🔧 Force refreshing images...');
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.src && img.src.includes('images/')) {
            const originalSrc = img.src;
            img.classList.add('force-refresh');
            img.src = '';
            setTimeout(() => {
                img.src = originalSrc + '?v=' + Date.now();
                img.classList.remove('force-refresh');
            }, 50);
        }
    });
    console.log('✅ Images refreshed');
}

// Function to show avatar-specific welcome message
function showAvatarWelcomeMessage() {
    // Prevent repeated welcome messages
    if (window.welcomeMessageShown) {
        console.log('🔧 Welcome message already shown, skipping...');
        return;
    }
    
    const welcomeMessage = getAvatarWelcomeMessage();
    const avatarName = getCurrentAvatarName();

    console.log('🔧 Showing welcome message for:', avatarName);
    console.log('🔧 Welcome message:', welcomeMessage);

    // Add welcome message to chat only if not already added
    const chatMessages = document.querySelectorAll('.message.ai');
    const lastMessage = chatMessages[chatMessages.length - 1];
    const lastMessageText = lastMessage?.textContent || '';
    
    if (!lastMessageText.includes(welcomeMessage.substring(0, 50))) {
        addMessage('ai', welcomeMessage);
    }

    // Speak the welcome message only if TTS is not already speaking
    if (window.textToSpeech && !window.textToSpeech.isSpeaking) {
        window.textToSpeech.speak(welcomeMessage, { role: 'ai' });
        window.welcomeMessageShown = true; // Mark as shown
    } else {
        console.log('🔧 Skipping TTS for welcome message - already speaking or TTS not ready');
    }
}

// Function to get teacher personality and teaching style
function getTeacherPersonality() {
    const avatarId = getCurrentAvatarId();

    if (avatarId === 'miss-sapna') {
        return {
            name: 'Miss Sapna',
            language: 'Hindi + English (Hinglish)',
            personality: 'Caring and nurturing teacher who uses Hindi with English words for better understanding',
            teachingStyle: 'Uses Hindi as primary language with English terms for scientific names, technical terms, and better communication',
            gender: 'female',
            tone: 'Warm and motherly'
        };
    } else {
        return {
            name: 'Roy Sir',
            language: 'English',
            personality: 'Professional and knowledgeable teacher',
            teachingStyle: 'Uses English for all subjects and advanced topics',
            gender: 'male',
            tone: 'Professional and friendly'
        };
    }
}

// Function to read welcome message at login
function readWelcomeMessageAtLogin() {
    // Prevent repeated welcome messages
    if (window.welcomeMessageShown && window.welcomeMessageSpoken) {
        console.log('🔧 Welcome message already shown and spoken at login, skipping...');
        return;
    }
    
    const welcomeText = "Welcome to Tution App, your study buddy. What would you like to learn today? Roy Sir and Miss Sapna are here to help you. You may change your teachers in the settings.";
    
    console.log('🔧 Reading welcome message at login');
    
    // Speak the welcome message using TTS
    if (speechSynthesis && !window.ttsDisabled) {
        try {
            // Get the selected voice
            const voiceSelect = document.getElementById('voiceSelect');
            const selectedVoice = voiceSelect ? voiceSelect.value : null;
            
            // Create speech synthesis utterance
            const utterance = new SpeechSynthesisUtterance(welcomeText);
            
            // Set voice if available
            if (selectedVoice) {
                const voices = speechSynthesis.getVoices();
                const voice = voices.find(v => v.name === selectedVoice);
                if (voice) {
                    utterance.voice = voice;
                }
            }
            
            // Set speech properties
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Speak the message
            speechSynthesis.speak(utterance);
            window.welcomeMessageSpoken = true;
            console.log('✅ Welcome message spoken via TTS');
            
        } catch (error) {
            console.error('❌ Error speaking welcome message:', error);
        }
    } else {
        console.log('🔧 TTS not available or disabled, skipping welcome message speech');
    }
}

// Initialize mobile sidebar
function initializeMobileSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    
    if (sidebar && overlay) {
        console.log('🔧 Initializing mobile sidebar...');
        
        // Remove any hidden classes that might prevent display
        sidebar.classList.remove('hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
        overlay.classList.remove('hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
        
        // Ensure sidebar is in closed position
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
        
        // Ensure overlay is hidden
        overlay.classList.remove('opacity-100', 'pointer-events-auto');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        
        // Force display properties
        sidebar.style.display = 'block';
        overlay.style.display = 'block';
        
        console.log('✅ Mobile sidebar initialized');
    } else {
        console.error('❌ Mobile sidebar elements not found during initialization');
    }
}

// Make mobile sidebar functions globally available
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;

// Test function for debugging mobile sidebar
window.testMobileSidebar = function() {
    console.log('🧪 Testing mobile sidebar...');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    const button = document.querySelector('button[onclick="toggleMobileSidebar()"]');
    
    console.log('🔍 Elements found:', {
        sidebar: !!sidebar,
        overlay: !!overlay,
        button: !!button
    });
    
    if (sidebar) {
        console.log('🔍 Sidebar classes:', sidebar.className);
        console.log('🔍 Sidebar style:', sidebar.style.cssText);
    }
    
    if (button) {
        console.log('🔍 Button found, testing click...');
        button.click();
    } else {
        console.log('❌ Button not found');
    }
};

        // Request camera permission directly through system dialog with enhanced feedback
        async function requestCameraPermissionDirect() {
            try {
                console.log('🔧 Requesting camera permission directly...');
                
                // For APK, show native permission dialog
                if (window.isAPK) {
                    console.log('📱 APK: Showing native camera permission dialog');
                }
                
                // Use the enhanced camera permission function
                const result = await requestCameraPermission();
                
                if (result) {
                    console.log('✅ Camera permission granted via direct request');
                    return true;
                } else {
                    console.log('❌ Camera permission denied via direct request');
                    return false;
                }
            } catch (error) {
                console.error('❌ Error in direct camera permission request:', error);
                return false;
            }
        }

        // Request microphone permission directly through system dialog with enhanced feedback
        async function requestMicrophonePermissionDirect() {
            try {
                console.log('🔧 Requesting microphone permission directly...');
                
                // Use the enhanced microphone permission function
                const result = await requestMicrophonePermission();
                
                if (result) {
                    console.log('✅ Microphone permission granted via direct request');
                    return true;
                } else {
                    console.log('❌ Microphone permission denied via direct request');
                    return false;
                }
            } catch (error) {
                console.error('❌ Error in direct microphone permission request:', error);
                return false;
            }
        }

        // Function to start camera scan with permission check
        async function startCameraScanWithPermission() {
            try {
                console.log('📷 Starting camera scan with permission...');
                
                // Request camera permission first
                const permission = await navigator.permissions.query({ name: 'camera' });
                if (permission.state === 'denied') {
                    showError('Camera permission denied. Please enable camera access in your browser settings.');
                    return;
                }
                
                // Start camera
                await startCamera();
                
            } catch (error) {
                console.error('❌ Error starting camera scan:', error);
                showError('Failed to start camera. Please check camera permissions.');
            }
        }
        
        async function startVoiceRecordingWithPermission() {
            // Prevent multiple simultaneous calls
            if (window.isRecordingInProgress) {
                console.log('🎤 Recording already in progress, ignoring duplicate call');
                return;
            }
            
            try {
                console.log('🎤 Starting voice recording with permission...');
                window.isRecordingInProgress = true;
                
                // Request microphone permission first
                const permission = await navigator.permissions.query({ name: 'microphone' });
                if (permission.state === 'denied') {
                    showError('Microphone permission denied. Please enable microphone access in your browser settings.');
                    window.isRecordingInProgress = false;
                    return;
                }
                
                // Use micSystem for recording
                console.log('🎤 Starting recording with micSystem');
                micSystem.startRecording();
                
            } catch (error) {
                console.error('❌ Error starting voice recording:', error);
                showError('Failed to start voice recording. Please check microphone permissions.');
                window.isRecordingInProgress = false;
            }
        }

        // Make permission-aware functions globally available
        // Don't redefine startCameraScan to avoid conflicts
        window.startVoiceRecordingWithPermission = startVoiceRecordingWithPermission;
        window.requestCameraPermissionDirect = requestCameraPermissionDirect;
        window.requestMicrophonePermissionDirect = requestMicrophonePermissionDirect;
        
        // APK Permission Popup Function
        function showAPKPermissionPopup() {
            console.log('📱 Showing APK permission popup...');
            
            // Create popup HTML
            const popupHTML = `
                <div id="apkPermissionPopup" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
                        <div class="text-center">
                            <div class="text-2xl mb-4">📱</div>
                            <h3 class="text-lg font-semibold mb-2">Permission Required</h3>
                            <p class="text-gray-600 mb-4">This app needs camera and microphone access to work properly.</p>
                            
                            <div class="space-y-3">
                                <button id="grantCameraPermission" class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                                    Allow Camera Access
                                </button>
                                <button id="grantMicPermission" class="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                                    Allow Microphone Access
                                </button>
                                <button id="grantAllPermissions" class="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
                                    Allow All Permissions
                                </button>
                            </div>
                            
                            <button id="skipPermissions" class="w-full mt-4 text-gray-500 hover:text-gray-700">
                                Skip for now
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add popup to page
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            
            // Add event listeners
            document.getElementById('grantCameraPermission').addEventListener('click', async () => {
                const granted = await requestCameraPermissionDirect();
                if (granted) {
                    showSuccess('Camera permission granted!');
                }
            });
            
            document.getElementById('grantMicPermission').addEventListener('click', async () => {
                const granted = await requestMicrophonePermissionDirect();
                if (granted) {
                    showSuccess('Microphone permission granted!');
                }
            });
            
            document.getElementById('grantAllPermissions').addEventListener('click', async () => {
                const cameraGranted = await requestCameraPermissionDirect();
                const micGranted = await requestMicrophonePermissionDirect();
                
                if (cameraGranted && micGranted) {
                    showSuccess('All permissions granted!');
                    closeAPKPermissionPopup();
                }
            });
            
            document.getElementById('skipPermissions').addEventListener('click', () => {
                closeAPKPermissionPopup();
            });
        }
        
        function closeAPKPermissionPopup() {
            const popup = document.getElementById('apkPermissionPopup');
            if (popup) {
                popup.remove();
            }
        }
        
        // Make functions globally available
        window.showAPKPermissionPopup = showAPKPermissionPopup;
        window.closeAPKPermissionPopup = closeAPKPermissionPopup;
        
        // ========== CACHING FUNCTIONS FOR APK ==========
        
        // Save user credentials to cache
        function saveUserCredentialsToCache(email, password) {
            try {
                console.log('💾 Saving user credentials to cache...');
                localStorage.setItem('tution_cached_user', email);
                localStorage.setItem('tution_cached_password', password);
                localStorage.setItem('tution_last_login', Date.now().toString());
                console.log('✅ Credentials saved to cache');
            } catch (error) {
                console.error('❌ Error saving credentials to cache:', error);
            }
        }
        
        // Load cached user credentials
        function loadCachedUserCredentials() {
            try {
                console.log('🔍 Loading cached user credentials...');
                const cachedUser = localStorage.getItem('tution_cached_user');
                const cachedPassword = localStorage.getItem('tution_cached_password');
                const lastLoginTime = localStorage.getItem('tution_last_login');
                
                if (cachedUser && cachedPassword && lastLoginTime) {
                    console.log('✅ Found cached credentials');
                    
                    // Check if cache is not too old (7 days)
                    const cacheAge = Date.now() - parseInt(lastLoginTime);
                    const maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days
                    
                    if (cacheAge < maxCacheAge) {
                        console.log('✅ Cache is still valid');
                        return { email: cachedUser, password: cachedPassword };
                    } else {
                        console.log('❌ Cache expired, clearing old credentials');
                        clearCachedUserCredentials();
                        return null;
                    }
                } else {
                    console.log('❌ No cached credentials found');
                    return null;
                }
            } catch (error) {
                console.error('❌ Error loading cached credentials:', error);
                return null;
            }
        }
        
        // Clear cached user credentials
        function clearCachedUserCredentials() {
            try {
                localStorage.removeItem('tution_cached_user');
                localStorage.removeItem('tution_cached_password');
                localStorage.removeItem('tution_last_login');
                console.log('✅ Cached credentials cleared');
            } catch (error) {
                console.error('❌ Error clearing cached credentials:', error);
            }
        }
        
        // Check if user should be redirected to login with prefilled credentials
        function checkForCachedLogin() {
            try {
                console.log('🔍 Checking for cached login...');
                
                // Only for APK
                if (!window.isAPK) {
                    console.log('🌐 Not APK, skipping cached login check');
                    return;
                }
                
                const cachedCredentials = loadCachedUserCredentials();
                if (cachedCredentials) {
                    console.log('✅ Found cached credentials, redirecting to login with prefilled form');
                    window.location.href = 'login.html?prefill=true';
                } else {
                    console.log('❌ No cached credentials found');
                }
            } catch (error) {
                console.error('❌ Error checking for cached login:', error);
            }
        }
        
        // Make caching functions globally available
        window.saveUserCredentialsToCache = saveUserCredentialsToCache;
        window.loadCachedUserCredentials = loadCachedUserCredentials;
        window.clearCachedUserCredentials = clearCachedUserCredentials;
        window.checkForCachedLogin = checkForCachedLogin;

        // NEW FUNCTION: Delete cache if no AI chat is saved
        function deleteCacheIfNoChat() {
            try {
                console.log('🔍 Checking if user has any AI chat history...');
                
                // Check if user has any chat messages stored
                const chatHistory = localStorage.getItem('chatHistory');
                const userEmail = localStorage.getItem('userEmail');
                const authToken = localStorage.getItem('supabase.auth.token');
                
                // If user is not properly logged in or has no chat history, clear cache
                if (!authToken || !userEmail || !chatHistory) {
                    console.log('❌ No proper login or chat history found, clearing cache');
                    clearCachedUserCredentials();
                    
                    // Also clear any other session data
                    localStorage.removeItem('supabase.auth.token');
                    sessionStorage.removeItem('supabase.auth.token');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('currentUser');
                    
                    console.log('✅ Cache cleared due to no AI chat history');
                    return true;
                }
                
                // Try to parse chat history to see if it has any messages
                try {
                    const parsedChat = JSON.parse(chatHistory);
                    if (!parsedChat || !Array.isArray(parsedChat) || parsedChat.length === 0) {
                        console.log('❌ Chat history is empty, clearing cache');
                        clearCachedUserCredentials();
                        return true;
                    }
                } catch (parseError) {
                    console.log('❌ Invalid chat history format, clearing cache');
                    clearCachedUserCredentials();
                    return true;
                }
                
                console.log('✅ User has chat history, keeping cache');
                return false;
            } catch (error) {
                console.error('❌ Error checking chat history:', error);
                // If there's an error, clear cache to be safe
                clearCachedUserCredentials();
                return true;
            }
        }

        // Make the new function globally available
        window.deleteCacheIfNoChat = deleteCacheIfNoChat;

// Enhanced voice recognition with long press functionality
// Global variables for voice recognition (already declared above)

// OLD FUNCTION REMOVED - Using new micSystem instead

// OLD FUNCTIONS REMOVED - Using new micSystem instead

// OLD FUNCTION REMOVED - Using new micSystem instead

// OLD FUNCTIONS REMOVED - Using new micSystem instead

// OLD FUNCTION REMOVED - Using new micSystem instead

// OLD FUNCTIONS REMOVED - Using new micSystem instead



// Setup all event listeners for dashboard
function setupDashboardEventListeners() {
    // Logo and emblem click handlers
    const logos = document.querySelectorAll('[id*="Logo"], [id*="Emblem"], #mainLogo, #mainEmblem, #sidebarLogo, #sidebarEmblem');
    logos.forEach(logo => {
        logo.addEventListener('click', () => {
            if (window.location.protocol === 'file:') {
                window.location.href = 'index.html';
            } else {
                window.location.href = '/index.html';
            }
        });
    });
    
    // Mobile sidebar close button
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeMobileSidebar);
    }
    
    // Mobile sidebar toggle button
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    if (mobileSidebarToggle) {
        // Remove existing listeners to prevent duplicates
        mobileSidebarToggle.removeEventListener('click', toggleMobileSidebar);
        mobileSidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Mobile sidebar toggle clicked');
            toggleMobileSidebar();
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Mobile camera button
    const cameraButtonMobile = document.getElementById('cameraButtonMobile');
    if (cameraButtonMobile) {
        cameraButtonMobile.addEventListener('click', () => {
            console.log('🔧 Mobile camera button clicked');
            openCameraModal();
        });
    } else {
        console.warn('⚠️ Mobile camera button not found');
    }
    
    // Mobile voice button with long press
    const voiceButtonMobile = document.getElementById('voiceButtonMobile');
    if (voiceButtonMobile) {
        console.log('🔧 Setting up mobile voice button with long press');
        
        // Remove ALL existing listeners to prevent duplicates
        voiceButtonMobile.removeEventListener('click', startVoiceRecordingWithPermission);
        voiceButtonMobile.removeEventListener('touchstart', handleMicPress);
        voiceButtonMobile.removeEventListener('touchend', handleMicRelease);
        voiceButtonMobile.removeEventListener('mousedown', handleMicPress);
        voiceButtonMobile.removeEventListener('mouseup', handleMicRelease);
        
        // Only use setupMicLongPress - it handles both long press and short press
        setupMicLongPress(voiceButtonMobile);
    } else {
        console.warn('⚠️ Mobile voice button not found');
    }
    
    // Mobile send button
    const sendButtonMobile = document.getElementById('sendButtonMobile');
    if (sendButtonMobile) {
        sendButtonMobile.addEventListener('click', () => {
            console.log('🔧 Mobile send button clicked');
            sendMessage();
        });
    } else {
        console.warn('⚠️ Mobile send button not found');
    }
    
    // Trial info button
    const trialInfoBtn = document.getElementById('trialInfoBtn');
    if (trialInfoBtn) {
        trialInfoBtn.addEventListener('click', showTrialInfo);
    }
    
    // Download app button (bind robustly, handle dynamic re-renders)
    const bindDownload = () => {
        const btn = document.getElementById('downloadAppBtn');
        if (!btn) return;
        btn.replaceWith(btn.cloneNode(true));
        const fresh = document.getElementById('downloadAppBtn');
        fresh.addEventListener('click', () => {
            console.log('📱 Download App button clicked');
            if (typeof window.downloadApp === 'function') {
                window.downloadApp();
            } else {
                console.error('❌ downloadApp function not found');
                showError('Download app function not available');
            }
        });
    };
    bindDownload();
    
    // Profile popup button
    const bindProfile = () => {
        const btn = document.getElementById('profilePopupBtn');
        if (!btn) return;
        btn.replaceWith(btn.cloneNode(true));
        const fresh = document.getElementById('profilePopupBtn');
        fresh.addEventListener('click', () => {
            console.log('👤 Profile popup button clicked');
            if (typeof window.showProfilePopup === 'function') {
                window.showProfilePopup();
            } else {
                console.error('❌ showProfilePopup function not found');
                showError('Profile popup function not available');
            }
        });
    };
    bindProfile();
    
    // Contact us button
    const bindContact = () => {
        const btn = document.getElementById('contactUsBtn');
        if (!btn) return;
        btn.replaceWith(btn.cloneNode(true));
        const fresh = document.getElementById('contactUsBtn');
        fresh.addEventListener('click', () => {
            console.log('💬 Contact us button clicked');
            if (typeof window.showContactUs === 'function') {
                window.showContactUs();
            } else {
                console.error('❌ showContactUs function not found');
                showError('Contact us function not available');
            }
        });
    };
    bindContact();
    
    // Scroll to top button
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            console.log('⬆️ Scroll to top button clicked');
            if (typeof window.scrollToTop === 'function') {
                window.scrollToTop();
            } else {
                console.error('❌ scrollToTop function not found');
                showError('Scroll to top function not available');
            }
        });
    }
    
    // Subject manager button
    const bindSubjectManager = () => {
        const btn = document.getElementById('subjectManagerBtn');
        if (!btn) return;
        btn.replaceWith(btn.cloneNode(true));
        const fresh = document.getElementById('subjectManagerBtn');
        fresh.addEventListener('click', () => {
            console.log('📚 Subject manager button clicked');
            if (typeof window.showSubjectManager === 'function') {
                window.showSubjectManager();
            } else {
                console.error('❌ showSubjectManager function not found');
                showError('Subject manager function not available');
            }
        });
    };
    bindSubjectManager();

    // Re-bind on section changes (DOM may re-render parts)
    document.addEventListener('section:shown', () => {
        bindDownload();
        bindProfile();
        bindContact();
        bindSubjectManager();
    });
    
    // Avatar selection button
    const bindAvatarBtn = () => {
        const btn = document.getElementById('avatarSelectionBtn');
        if (!btn) return;
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', showAvatarSelectionModal, { once: false });
    };
    bindAvatarBtn();
    // Quick avatar taps in settings
    const quickRoy = document.getElementById('quickAvatarRoy');
    if (quickRoy) {
        quickRoy.addEventListener('click', async () => {
            await selectAvatar('roy-sir');
            showSuccess('Avatar changed to Roy Sir');
        });
    }
    const quickSapna = document.getElementById('quickAvatarSapna');
    if (quickSapna) {
        quickSapna.addEventListener('click', async () => {
            await selectAvatar('miss-sapna');
            showSuccess('Avatar changed to Miss Sapna');
        });
    }
    
    // Manage subjects button
    // Always bind Manage button via delegation to survive re-renders
    const chatBox = document.getElementById('chatBox') || document;
    chatBox.addEventListener('click', (e) => {
        const target = e.target.closest('#manageSubjectsBtn');
        if (!target) return;
        showSection('progress');
        if (typeof window.showSubjectManager === 'function') {
            setTimeout(() => window.showSubjectManager(), 50);
        }
    });
    
    // Mobile sidebar navigation items
    const navItems = document.querySelectorAll('.nav-item[data-section], .sidebar-modern .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const ds = item.getAttribute('data-section');
            const rawText = item.textContent.trim().toLowerCase();
            const section = ds || (rawText.includes('classroom') ? 'chat' : rawText.includes('study') ? 'materials' : rawText.includes('progress') ? 'progress' : rawText.includes('settings') ? 'settings' : 'chat');
            showSection(section);
            // Always close after navigating from sidebar
            setTimeout(() => closeMobileSidebar(), 0);
        });
    });
    
    // All buttons with onclick handlers
    const buttons = document.querySelectorAll('button[onclick]');
    buttons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        if (onclick) {
            // Remove the onclick attribute
            button.removeAttribute('onclick');
            
            // Add event listener based on the onclick content
            if (onclick.includes('showSection')) {
                const section = onclick.match(/showSection\('([^']+)'\)/)?.[1];
                if (section) {
                    button.addEventListener('click', () => showSection(section));
                }
            } else if (onclick.includes('closeMobileSidebar')) {
                button.addEventListener('click', closeMobileSidebar);
            } else if (onclick.includes('toggleMobileSidebar')) {
                button.addEventListener('click', toggleMobileSidebar);
            } else if (onclick.includes('logout')) {
                button.addEventListener('click', logout);
            } else if (onclick.includes('showTrialInfo')) {
                button.addEventListener('click', showTrialInfo);
            } else if (onclick.includes('downloadApp')) {
                button.addEventListener('click', () => {
                    if (typeof window.downloadApp === 'function') {
                        window.downloadApp();
                    } else {
                        showError('Download app function not available');
                    }
                });
            } else if (onclick.includes('showProfilePopup')) {
                button.addEventListener('click', () => {
                    if (typeof window.showProfilePopup === 'function') {
                        window.showProfilePopup();
                    } else {
                        showError('Profile popup function not available');
                    }
                });
            } else if (onclick.includes('showContactUs')) {
                button.addEventListener('click', () => {
                    if (typeof window.showContactUs === 'function') {
                        window.showContactUs();
                    } else {
                        showError('Contact us function not available');
                    }
                });
            } else if (onclick.includes('scrollToTop')) {
                button.addEventListener('click', () => {
                    if (typeof window.scrollToTop === 'function') {
                        window.scrollToTop();
                    } else {
                        showError('Scroll to top function not available');
                    }
                });
            } else if (onclick.includes('closeProfilePopup')) {
                button.addEventListener('click', closeProfilePopup);
            } else if (onclick.includes('saveProfileFromPopup')) {
                button.addEventListener('click', saveProfileFromPopup);
            } else if (onclick.includes('closeCameraModal')) {
                button.addEventListener('click', closeCameraModal);
            } else if (onclick.includes('capturePhoto')) {
                button.addEventListener('click', capturePhoto);
            } else if (onclick.includes('retakePhoto')) {
                button.addEventListener('click', retakePhoto);
            } else if (onclick.includes('editExtractedText')) {
                button.addEventListener('click', editExtractedText);
            } else if (onclick.includes('saveEditedText')) {
                button.addEventListener('click', saveEditedText);
            } else if (onclick.includes('cancelEdit')) {
                button.addEventListener('click', cancelEdit);
            } else if (onclick.includes('sendToChat')) {
                button.addEventListener('click', sendToChat);
            } else if (onclick.includes('closeContactUsPopup')) {
                button.addEventListener('click', closeContactUsPopup);
            } else if (onclick.includes('closeTrialOverlay')) {
                button.addEventListener('click', closeTrialOverlay);
            } else if (onclick.includes('upgradeToPremium')) {
                button.addEventListener('click', upgradeToPremium);
            } else if (onclick.includes('showSubjectManager')) {
                button.addEventListener('click', () => {
                    if (typeof window.showSubjectManager === 'function') {
                        window.showSubjectManager();
                    } else {
                        showError('Subject manager function not available');
                    }
                });
            } else if (onclick.includes('showAvatarSelectionModal')) {
                button.addEventListener('click', showAvatarSelectionModal);
            } else if (onclick.includes('closeAvatarSelectionModal')) {
                button.addEventListener('click', closeAvatarSelectionModal);
            } else if (onclick.includes('saveAvatarSelection')) {
                button.addEventListener('click', saveAvatarSelection);
            } else if (onclick.includes('selectAvatarOption')) {
                const match = onclick.match(/selectAvatarOption\('([^']+)',\s*'([^']+)'\)/);
                if (match) {
                    const avatarId = match[1];
                    const avatarName = match[2];
                    button.addEventListener('click', () => selectAvatarOption(avatarId, avatarName));
                }
            }
        }
    });

    // Also rebind avatar button on section show
    document.addEventListener('section:shown', () => bindAvatarBtn());
    
    // Handle modal outside clicks
    const modals = document.querySelectorAll('[onclick*="closeSubjectManagerOnOutsideClick"], [onclick*="closeAvatarSelectionOnOutsideClick"]');
    modals.forEach(modal => {
        const onclick = modal.getAttribute('onclick');
        if (onclick) {
            modal.removeAttribute('onclick');
            if (onclick.includes('closeSubjectManagerOnOutsideClick')) {
                modal.addEventListener('click', closeSubjectManagerOnOutsideClick);
            } else if (onclick.includes('closeAvatarSelectionOnOutsideClick')) {
                modal.addEventListener('click', closeAvatarSelectionOnOutsideClick);
            }
        }
    });
}

// Initialize page with all event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupDashboardEventListeners();
    setupMicLongPress();
});

// Enhanced voice recognition variables are already declared globally

// ===== NEW SIMPLIFIED MIC SYSTEM =====
let micSystem = {
    isRecording: false,
    recognition: null,
    currentTranscript: '',
    isLongPressActive: false,
    longPressTimer: null,
    
    init() {
        console.log('🎤 Initializing new mic system...');
        
        // Check for speech recognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('❌ Speech recognition not supported');
            return false;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        // Set language to support both Hindi and English
        this.recognition.lang = 'hi-IN,en-IN'; // Support both Hindi and English
        
        // Event handlers
        this.recognition.onstart = () => {
            console.log('🎤 Recording started');
            this.isRecording = true;
            this.updateMicButton(true);
            // Stop any ongoing TTS so mic doesn't capture it
            try { if (window.textToSpeech) window.textToSpeech.stop(); } catch (_) {}
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Process transcript based on detected language
            let processedTranscript = finalTranscript + interimTranscript;
            
            // Detect if user is speaking English or Hindi
            const hindiPattern = /[\u0900-\u097F]/; // Devanagari script
            const englishPattern = /[A-Za-z]/; // any English letters anywhere
            
            if (englishPattern.test(processedTranscript) && !hindiPattern.test(processedTranscript)) {
                // User is speaking English - keep in English script
                console.log('🔤 Enhanced STT: Detected English speech, keeping in English script');
            } else if (hindiPattern.test(processedTranscript)) {
                // User is speaking Hindi - keep in Devanagari script
                console.log('🔤 Enhanced STT: Detected Hindi speech, keeping in Devanagari script');
            }
            
            this.currentTranscript = processedTranscript;
            this.displayTranscript(this.currentTranscript);
        };
        
        this.recognition.onend = () => {
            console.log('🎤 Recording ended');
            this.isRecording = false;
            this.updateMicButton(false);
            
            // Send transcript if we have one
            if (this.currentTranscript.trim()) {
                this.sendTranscript();
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('🎤 Recording error:', event.error);
            this.isRecording = false;
            this.updateMicButton(false);
            
            if (event.error === 'no-speech') {
                showError('No speech detected. Please try again.');
            }
        };
        
        console.log('✅ Mic system initialized');
        return true;
    },
    
    startRecording() {
        if (this.isRecording) {
            console.log('🎤 Already recording, stopping first...');
            this.stopRecording();
            // Wait a bit before starting new recording
            setTimeout(() => {
                this.startRecording();
            }, 100);
            return;
        }
        
        if (!this.recognition) {
            if (!this.init()) {
                showError('Voice recognition not supported');
                return;
            }
        }
        
        try {
            this.currentTranscript = '';
            // Ensure we don't have TTS speaking over the mic
            try { if (window.textToSpeech) window.textToSpeech.stop(); } catch (_) {}
            this.recognition.start();
        } catch (error) {
            console.error('🎤 Error starting recording:', error);
            // Don't show error to user, just log it
            if (error.name === 'InvalidStateError') {
                console.log('🎤 Recognition already started, resetting...');
                this.isRecording = false;
                // Try again after a short delay
                setTimeout(() => {
                    this.startRecording();
                }, 200);
            }
        }
    },
    
    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    },
    
    updateMicButton(isRecording) {
        // Update both mobile and desktop mic buttons
        const micButtonMobile = document.getElementById('voiceButtonMobile');
        const micButtonDesktop = document.getElementById('voiceButton');
        
        const buttons = [micButtonMobile, micButtonDesktop].filter(Boolean);
        
        buttons.forEach(micButton => {
            if (isRecording) {
                // Red light when recording
                micButton.innerHTML = '<span class="text-xs animate-pulse">🔴</span>';
                micButton.classList.add('recording');
                micButton.style.backgroundColor = '#dc2626'; // Red background
                micButton.style.color = 'white';
            } else {
                // Normal mic icon when not recording
                micButton.innerHTML = '<span class="text-xs">🎤</span>';
                micButton.classList.remove('recording');
                micButton.style.backgroundColor = ''; // Reset to default
                micButton.style.color = '';
            }
        });
    },
    
    displayTranscript(transcript) {
        const chatInput = document.getElementById('chatInput');
        const chatInputMobile = document.getElementById('chatInputMobile');
        
        if (chatInput) {
            chatInput.value = transcript;
            chatInput.placeholder = 'Listening...';
        }
        
        if (chatInputMobile) {
            chatInputMobile.value = transcript;
            chatInputMobile.placeholder = 'Listening...';
        }
    },
    
    sendTranscript() {
        if (this.currentTranscript.trim()) {
            console.log('🎤 Sending transcript:', this.currentTranscript);
            
            // Show hourglass while processing
            this.showProcessingIndicator();
            
            // Set the transcript in input fields
            const chatInput = document.getElementById('chatInput');
            const chatInputMobile = document.getElementById('chatInputMobile');
            
            if (chatInput) chatInput.value = this.currentTranscript;
            if (chatInputMobile) chatInputMobile.value = this.currentTranscript;
            
            // Send the message
            sendMessage();
            
            // Clear transcript
            this.currentTranscript = '';
        }
    },
    
    showProcessingIndicator() {
        // Update both mobile and desktop mic buttons
        const micButtonMobile = document.getElementById('voiceButtonMobile');
        const micButtonDesktop = document.getElementById('voiceButton');
        
        const buttons = [micButtonMobile, micButtonDesktop].filter(Boolean);
        
        buttons.forEach(micButton => {
            micButton.innerHTML = '<span class="text-xs animate-spin">⏳</span>';
            micButton.style.backgroundColor = '#f59e0b'; // Orange background
            micButton.style.color = 'white';
        });
        
        // Reset after 3 seconds
        setTimeout(() => {
            this.updateMicButton(false);
        }, 3000);
    },
    
    setupLongPress(micButton) {
        let pressTimer = null;
        let isLongPress = false;
        
        const handlePress = (e) => {
            e.preventDefault();
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                console.log('🎤 Long press detected - starting continuous recording');
                // For long-press, switch to continuous mode while pressed
                if (this.recognition) this.recognition.continuous = true;
                try { if (window.textToSpeech) window.textToSpeech.stop(); } catch (_) {}
                this.startRecording();
            }, 3000); // 3s for long press (hold-to-talk)
        };
        
        const handleRelease = (e) => {
            e.preventDefault();
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            
            if (isLongPress) {
                // Long press release - stop recording and send
                console.log('🎤 Long press release - stopping recording');
                this.stopRecording();
                // Restore non-continuous mode after release
                if (this.recognition) this.recognition.continuous = false;
            } else {
                // Short press - start recording (will auto-stop on speech end)
                console.log('🎤 Short press - starting recording');
                if (this.recognition) this.recognition.continuous = false;
                try { if (window.textToSpeech) window.textToSpeech.stop(); } catch (_) {}
                this.startRecording();
            }
        };
        
        // Remove any existing listeners
        micButton.removeEventListener('touchstart', handlePress);
        micButton.removeEventListener('touchend', handleRelease);
        micButton.removeEventListener('mousedown', handlePress);
        micButton.removeEventListener('mouseup', handleRelease);
        micButton.removeEventListener('click', () => {});
        
        // Add new listeners
        micButton.addEventListener('touchstart', handlePress);
        micButton.addEventListener('touchend', handleRelease);
        micButton.addEventListener('mousedown', handlePress);
        micButton.addEventListener('mouseup', handleRelease);
        
        console.log('✅ Long press setup complete');
    }
};

// ===== REPLACE OLD FUNCTIONS =====
function startVoiceRecordingWithPermission() {
    console.log('🎤 Starting voice recording with permission...');
    micSystem.startRecording();
}

function setupMicLongPress(micButton) {
    micSystem.setupLongPress(micButton);
}

// Remove all the old complex functions
// initEnhancedSpeechRecognition, startContinuousRecording, stopContinuousRecording, startNormalRecording
// are all replaced by the new micSystem


