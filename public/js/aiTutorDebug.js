// AI Tutor Debug Utility
// Helps diagnose and fix issues with the AI Tutor system

class AITutorDebug {
    constructor() {
        this.debugMode = true;
        this.diagnostics = {};
        this.errors = [];
        this.warnings = [];
        
        this.initializeDebug();
    }

    initializeDebug() {
        console.log('🔧 AI Tutor Debug initialized');
        
        // Add debug button to help troubleshoot
        this.createDebugButton();
        
        // Monitor for errors
        this.setupErrorMonitoring();
        
        // Check system status periodically
        setInterval(() => this.runDiagnostics(), 30000);
    }

    createDebugButton() {
        // Don't create if it already exists
        if (document.getElementById('aiTutorDebugBtn')) return;

        const debugBtn = document.createElement('button');
        debugBtn.id = 'aiTutorDebugBtn';
        debugBtn.className = 'fixed bottom-4 right-4 z-50 px-3 py-2 bg-red-600 text-white text-sm rounded shadow hover:bg-red-700';
        debugBtn.innerHTML = '🔧 Debug AI';
        debugBtn.style.fontSize = '12px';
        debugBtn.onclick = () => this.showDebugInfo();
        
        document.body.appendChild(debugBtn);
        console.log('✅ Debug button created');
    }

    setupErrorMonitoring() {
        const originalError = console.error;
        console.error = (...args) => {
            this.errors.push({
                timestamp: new Date(),
                message: args.join(' '),
                stack: new Error().stack
            });
            originalError.apply(console, args);
        };

        const originalWarn = console.warn;
        console.warn = (...args) => {
            this.warnings.push({
                timestamp: new Date(),
                message: args.join(' ')
            });
            originalWarn.apply(console, args);
        };
    }

    runDiagnostics() {
        this.diagnostics = {
            timestamp: new Date(),
            systems: this.checkSystems(),
            integration: this.checkIntegration(),
            ui: this.checkUIElements(),
            errors: this.errors.slice(-5), // Last 5 errors
            warnings: this.warnings.slice(-5) // Last 5 warnings
        };
    }

    checkSystems() {
        return {
            learningObjectives: {
                loaded: !!window.learningObjectives,
                status: window.learningObjectives ? 'OK' : 'MISSING'
            },
            personalizedPrompts: {
                loaded: !!window.personalizedPromptSystem,
                status: window.personalizedPromptSystem ? 'OK' : 'MISSING'
            },
            adaptiveLearning: {
                loaded: !!window.adaptiveLearningEngine,
                status: window.adaptiveLearningEngine ? 'OK' : 'MISSING'
            },
            diagnosticAssessment: {
                loaded: !!window.diagnosticAssessmentSystem,
                status: window.diagnosticAssessmentSystem ? 'OK' : 'MISSING',
                details: window.diagnosticAssessmentSystem ? 'Available' : 'Not loaded'
            },
            interactionTracker: {
                loaded: !!window.userInteractionTracker,
                status: window.userInteractionTracker ? 'OK' : 'MISSING'
            },
            outcomesMetrics: {
                loaded: !!window.learningOutcomesMetrics,
                status: window.learningOutcomesMetrics ? 'OK' : 'MISSING'
            },
            integration: {
                loaded: !!window.aiTutorIntegration,
                initialized: window.aiTutorIntegration?.isInitialized || false,
                status: window.aiTutorIntegration?.isInitialized ? 'OK' : 'NOT_INITIALIZED'
            }
        };
    }

    checkIntegration() {
        return {
            gptService: {
                available: !!window.gptService,
                enhanced: !!window.gptService?.sendMessage?.toString().includes('personalizedPrompts'),
                status: window.gptService ? 'OK' : 'MISSING'
            },
            dashboard: {
                loaded: !!document.body && document.readyState === 'complete',
                status: (document.body && document.readyState === 'complete') ? 'OK' : 'MISSING'
            },
            userData: {
                available: !!window.userData,
                hasId: !!(window.userData?.id),
                status: window.userData?.id ? 'OK' : 'MISSING_USER_DATA'
            }
        };
    }

    checkUIElements() {
        return {
            continuousAssessment: {
                exists: !!(window.aiTutorIntegration?.continuousAssessment?.isActive),
                status: window.aiTutorIntegration?.continuousAssessment?.isActive ? 'ACTIVE' : 'INACTIVE',
                details: window.aiTutorIntegration?.continuousAssessment?.isActive ? 'Continuous assessment running' : 'Not active'
            },
            dynamicContextManager: {
                exists: !!window.dynamicContextManager,
                status: window.dynamicContextManager ? 'ACTIVE' : 'MISSING',
                details: window.dynamicContextManager ? 
                    `Context size: ${window.dynamicContextManager.currentHistorySize}, Continuations: ${window.dynamicContextManager.continuationCount}, Breaks: ${window.dynamicContextManager.discontinuationCount}` : 
                    'Not loaded'
            },
            dailyChallenge: {
                exists: !!window.dailyChallenge,
                status: window.dailyChallenge ? 'ACTIVE' : 'MISSING',
                details: window.dailyChallenge ? 
                    `Streak: ${window.dailyChallenge.streak}, Answered today: ${window.dailyChallenge.isAnswered}, Total challenges: ${window.dailyChallenge.challenges.length}` : 
                    'Not loaded'
            },
            chatInput: {
                exists: !!document.getElementById('chatInput'),
                status: document.getElementById('chatInput') ? 'OK' : 'MISSING'
            },
            chatMessages: {
                exists: !!document.getElementById('chatMessages'),
                status: document.getElementById('chatMessages') ? 'OK' : 'MISSING'
            },
            sidebar: {
                exists: !!document.getElementById('sidebar') || !!document.getElementById('mobileSidebar'),
                status: (document.getElementById('sidebar') || document.getElementById('mobileSidebar')) ? 'OK' : 'MISSING'
            }
        };
    }

    showDebugInfo() {
        this.runDiagnostics();
        
        const debugInfo = `
=== AI TUTOR DEBUG REPORT ===
Generated: ${this.diagnostics.timestamp.toLocaleString()}

🔧 SYSTEMS STATUS:
${Object.entries(this.diagnostics.systems).map(([key, value]) => 
    `  ${key}: ${value.status} ${value.status === 'OK' ? '✅' : '❌'}`
).join('\n')}

🔗 INTEGRATION STATUS:
${Object.entries(this.diagnostics.integration).map(([key, value]) => 
    `  ${key}: ${value.status} ${value.status === 'OK' ? '✅' : '❌'}`
).join('\n')}

🎨 UI ELEMENTS:
${Object.entries(this.diagnostics.ui).map(([key, value]) => 
    `  ${key}: ${value.status} ${value.status === 'OK' ? '✅' : '❌'}`
).join('\n')}

❌ RECENT ERRORS (${this.diagnostics.errors.length}):
${this.diagnostics.errors.map(err => 
    `  ${err.timestamp.toLocaleTimeString()}: ${err.message}`
).join('\n') || '  None'}

⚠️ RECENT WARNINGS (${this.diagnostics.warnings.length}):
${this.diagnostics.warnings.map(warn => 
    `  ${warn.timestamp.toLocaleTimeString()}: ${warn.message}`
).join('\n') || '  None'}

🔧 TROUBLESHOOTING ACTIONS:
${this.generateTroubleshootingActions()}
        `;

        console.log(debugInfo);
        alert(debugInfo);
        
        // Also log detailed diagnostics
        console.log('🔧 Detailed diagnostics:', this.diagnostics);
    }

    generateTroubleshootingActions() {
        const actions = [];
        
        // Check for missing systems
        const missingSystems = Object.entries(this.diagnostics.systems)
            .filter(([key, value]) => value.status !== 'OK')
            .map(([key]) => key);
            
        if (missingSystems.length > 0) {
            actions.push(`- Missing systems: ${missingSystems.join(', ')} - Check script loading`);
        }
        
        // Check initialization
        if (!this.diagnostics.systems.integration?.initialized) {
            actions.push('- AI Tutor Integration not initialized - Wait for scripts to load');
        }
        
        // Check assessment button
        if (this.diagnostics.ui.assessmentButton?.status !== 'OK') {
            actions.push('- Assessment button missing - Try refreshing page');
        }
        
        // Check user data
        if (this.diagnostics.integration.userData?.status !== 'OK') {
            actions.push('- User data missing - Check login status');
        }
        
        return actions.length > 0 ? actions.join('\n') : '  All systems appear to be working correctly!';
    }

    // Manual fixes for common issues
    fixAssessmentButton() {
        console.log('🔧 Attempting to fix assessment button...');
        
        // Remove existing button if any
        const existingBtn = document.getElementById('startAssessmentBtn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        // Check if integration is available
        if (!window.aiTutorIntegration) {
            console.error('❌ AI Tutor Integration not available');
            return false;
        }
        
        // Force re-add assessment features
        try {
            window.aiTutorIntegration.addAssessmentFeatures();
            console.log('✅ Assessment button fix attempted');
            return true;
        } catch (error) {
            console.error('❌ Failed to fix assessment button:', error);
            return false;
        }
    }

    // Manual assessment start
    startAssessmentManually() {
        console.log('🔧 Starting assessment manually...');
        
        if (!window.aiTutorIntegration) {
            console.error('❌ AI Tutor Integration not available');
            return;
        }
        
        try {
            window.aiTutorIntegration.startDiagnosticAssessment();
        } catch (error) {
            console.error('❌ Manual assessment start failed:', error);
        }
    }

    // Emergency system reload
    reloadSystems() {
        console.log('🔧 Reloading AI Tutor systems...');
        
        // Clear any existing instances
        delete window.learningObjectives;
        delete window.personalizedPromptSystem;
        delete window.adaptiveLearningEngine;
        delete window.diagnosticAssessmentSystem;
        delete window.userInteractionTracker;
        delete window.learningOutcomesMetrics;
        delete window.aiTutorIntegration;
        
        // Reload scripts
        const scripts = [
            'js/learningObjectives.js',
            'js/personalizedPromptSystem.js',
            'js/adaptiveLearningEngine.js',
            'js/diagnosticAssessmentSystem.js',
            'js/userInteractionTracker.js',
            'js/learningOutcomesMetrics.js',
            'js/aiTutorIntegration.js'
        ];
        
        scripts.forEach((src, index) => {
            setTimeout(() => {
                const script = document.createElement('script');
                script.src = src + '?v=' + Date.now();
                script.defer = true;
                document.head.appendChild(script);
                console.log(`🔄 Reloaded: ${src}`);
            }, index * 500);
        });
        
        console.log('🔄 System reload initiated');
    }

    // Force initialize integration
    forceInitializeIntegration() {
        console.log('🔧 Force initializing AI Tutor Integration...');
        
        try {
            // Check if class exists
            if (typeof window.AITutorIntegration !== 'function') {
                console.error('❌ AITutorIntegration class not available');
                return false;
            }
            
            // Create new instance
            window.aiTutorIntegration = new window.AITutorIntegration();
            console.log('✅ AI Tutor Integration force initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Force initialization failed:', error);
            return false;
        }
    }
}

// Create global debug instance
window.aiTutorDebug = new AITutorDebug();

// Expose debug functions globally
window.fixAssessmentButton = () => window.aiTutorDebug.fixAssessmentButton();
window.startAssessmentManually = () => window.aiTutorDebug.startAssessmentManually();
window.reloadAITutorSystems = () => window.aiTutorDebug.reloadSystems();
window.showAITutorDebug = () => window.aiTutorDebug.showDebugInfo();
window.forceInitializeIntegration = () => window.aiTutorDebug.forceInitializeIntegration();

console.log('🔧 AI Tutor Debug utility loaded');

// Auto-fix button if it's missing after a delay
setTimeout(() => {
    if (!document.getElementById('startAssessmentBtn')) {
        console.log('🔧 Assessment button missing, attempting auto-fix...');
        window.aiTutorDebug.fixAssessmentButton();
    }
}, 5000);