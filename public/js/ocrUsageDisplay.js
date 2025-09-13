/**
 * OCR Usage Display Component
 * Shows users their daily and monthly OCR usage limits
 */
class OCRUsageDisplay {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create usage display container
        this.createUsageDisplay();
        
        // Update display periodically
        setInterval(() => this.updateDisplay(), 30000); // Update every 30 seconds
        
        console.log('📊 OCR Usage Display initialized');
    }

    createUsageDisplay() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'ocrUsageDisplay';
        this.container.className = 'fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-xs shadow-lg z-50 max-w-xs';
        this.container.style.display = 'none'; // Hidden by default
        
        // Add to page
        document.body.appendChild(this.container);
        
        // Update display
        this.updateDisplay();
    }

    updateDisplay() {
        if (!window.azureOCRService) return;
        
        const stats = window.azureOCRService.getUsageStats();
        
        const subscriptionText = stats.userSubscription === 'paid' ? 'Paid Plan' : 'Free Plan';
        const dailyLimit = stats.userDailyLimit;
        const dailyUsage = stats.userDailyUsage;
        const dailyRemaining = stats.userRemainingPages;
        
        const monthlyUsage = stats.monthlyUsage;
        const monthlyLimit = stats.maxPagesPerMonth;
        const monthlyRemaining = stats.monthlyRemainingPages;
        
        // Check OCR.Space availability
        const ocrSpaceAvailable = window.ocrSpaceService && window.ocrSpaceService.isAvailable();
        
        // Create usage display content
        this.container.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-semibold">🔍 OCR Usage</span>
                <button onclick="this.parentElement.parentElement.style.display='none'" class="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div class="space-y-2">
                <div>
                    <div class="flex justify-between">
                        <span>${subscriptionText}</span>
                        <span>${dailyUsage}/${dailyLimit}</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${(dailyUsage/dailyLimit)*100}%"></div>
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                        ${dailyRemaining} remaining today
                    </div>
                </div>
                
                <div>
                    <div class="flex justify-between">
                        <span>Monthly (Azure)</span>
                        <span>${monthlyUsage}/${monthlyLimit}</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div class="bg-green-500 h-1.5 rounded-full" style="width: ${(monthlyUsage/monthlyLimit)*100}%"></div>
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                        ${monthlyRemaining} remaining this month
                    </div>
                </div>
                
                <div class="border-t border-gray-600 pt-2">
                    <div class="flex items-center justify-between">
                        <span>🟢 OCR.Space (Unlimited)</span>
                        <span class="text-xs ${ocrSpaceAvailable ? 'text-green-400' : 'text-red-400'}">
                            ${ocrSpaceAvailable ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                        Unlimited processing when Azure limits reached
                    </div>
                </div>
            </div>
            
            ${dailyRemaining === 0 ? '<div class="text-orange-400 text-xs mt-2">⚠️ Daily limit reached. Will use unlimited OCR.Space.</div>' : ''}
            ${monthlyRemaining === 0 ? '<div class="text-orange-400 text-xs mt-2">⚠️ Monthly Azure limit reached. Will use unlimited OCR.Space.</div>' : ''}
        `;
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.updateDisplay();
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    toggle() {
        if (this.container.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }
}

// Initialize OCR Usage Display when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ocrUsageDisplay = new OCRUsageDisplay();
    console.log('✅ OCR Usage Display ready');
});

// Export for use in other modules
window.OCRUsageDisplay = OCRUsageDisplay;
