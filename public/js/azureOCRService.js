/**
 * Microsoft Azure OCR Service
 * Provides OCR functionality using Azure Computer Vision API
 * Includes user daily limits and Azure rate limiting
 */
class AzureOCRService {
    constructor() {
        this.subscriptionKey = null;
        this.endpoint = null;
        this.monthlyUsage = this.getMonthlyUsage();
        this.maxPagesPerMonth = 5000; // Azure free tier: 5K transactions/month
        this.lastResetDate = this.getLastResetDate();
        this.callQueue = []; // Rate limiting queue
        this.lastCallTime = 0; // Track last API call time
        this.callsThisMinute = 0; // Track calls in current minute
        this.minuteStartTime = Date.now(); // Track minute start
        
        // Check if we need to reset monthly usage
        this.checkAndResetMonthlyUsage();
        
        console.log('🔍 Azure OCR Service initialized');
    }

    // Initialize Azure credentials
    async initialize() {
        try {
            // Get credentials from environment variables (server-side)
            // For client-side, we'll need to get them from the API
            if (typeof process !== 'undefined' && process.env) {
                // Server-side environment
                this.subscriptionKey = process.env.AZURE_VISION_KEY;
                this.endpoint = process.env.AZURE_VISION_ENDPOINT;
            } else {
                // Client-side - we'll get credentials from API
                console.log('🔍 Getting Azure credentials from API...');
                const response = await fetch('/api/azure-credentials');
                if (response.ok) {
                    const credentials = await response.json();
                    this.subscriptionKey = credentials.subscriptionKey;
                    this.endpoint = credentials.endpoint;
                } else {
                    throw new Error('Failed to get Azure credentials from API');
                }
            }
            
            if (!this.subscriptionKey || !this.endpoint) {
                console.warn('⚠️ Azure OCR credentials not configured');
                return false;
            }
            
            console.log('✅ Azure OCR credentials loaded');
            return true;
        } catch (error) {
            console.error('❌ Error initializing Azure OCR:', error);
            return false;
        }
    }

    // Check and reset monthly usage counter
    checkAndResetMonthlyUsage() {
        const currentMonth = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
        if (this.lastResetDate !== currentMonth) {
            this.monthlyUsage = 0;
            this.lastResetDate = currentMonth;
            this.saveMonthlyUsage();
            this.saveLastResetDate();
            console.log('🔄 Monthly OCR usage reset');
        }
    }

    // Get monthly usage from localStorage
    getMonthlyUsage() {
        return parseInt(localStorage.getItem('azureOCR_monthlyUsage') || '0');
    }

    // Save monthly usage to localStorage
    saveMonthlyUsage() {
        localStorage.setItem('azureOCR_monthlyUsage', this.monthlyUsage.toString());
    }

    // Get last reset date from localStorage
    getLastResetDate() {
        return localStorage.getItem('azureOCR_lastResetDate') || new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
    }

    // Save last reset date to localStorage
    saveLastResetDate() {
        localStorage.setItem('azureOCR_lastResetDate', this.lastResetDate);
    }

    // Check if monthly limit reached
    isMonthlyLimitReached() {
        return this.monthlyUsage >= this.maxPagesPerMonth;
    }

    // Get remaining pages for this month
    getRemainingPages() {
        return Math.max(0, this.maxPagesPerMonth - this.monthlyUsage);
    }

    // Get user's daily limit based on subscription
    getUserDailyLimit() {
        // Check user subscription status
        const userSubscription = this.getUserSubscription();
        return userSubscription === 'paid' ? 10 : 5; // Paid: 10/day, Free: 5/day
    }

    // Get user's daily usage
    getUserDailyUsage() {
        const today = new Date().toDateString();
        const dailyKey = `azureOCR_userDaily_${today}`;
        return parseInt(localStorage.getItem(dailyKey) || '0');
    }

    // Save user's daily usage
    saveUserDailyUsage(usage) {
        const today = new Date().toDateString();
        const dailyKey = `azureOCR_userDaily_${today}`;
        localStorage.setItem(dailyKey, usage.toString());
    }

    // Check if user's daily limit reached
    isUserDailyLimitReached() {
        const userLimit = this.getUserDailyLimit();
        const userUsage = this.getUserDailyUsage();
        return userUsage >= userLimit;
    }

    // Get user's remaining daily pages
    getUserRemainingPages() {
        const userLimit = this.getUserDailyLimit();
        const userUsage = this.getUserDailyUsage();
        return Math.max(0, userLimit - userUsage);
    }

    // Get user subscription status (placeholder - integrate with your subscription system)
    getUserSubscription() {
        // TODO: Integrate with your subscription system
        // For now, return 'free' - you can modify this based on your user data
        return window.currentUser?.subscription_type || 'free';
    }

    // Rate limiting: Check if we can make an API call
    async checkRateLimit() {
        const now = Date.now();
        
        // Reset minute counter if a new minute has started
        if (now - this.minuteStartTime >= 60000) {
            this.callsThisMinute = 0;
            this.minuteStartTime = now;
        }

        // Check if we've hit the 20 calls per minute limit
        if (this.callsThisMinute >= 20) {
            const waitTime = 60000 - (now - this.minuteStartTime);
            console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime/1000)} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.callsThisMinute = 0;
            this.minuteStartTime = Date.now();
        }

        // Ensure minimum 3-second gap between calls
        const timeSinceLastCall = now - this.lastCallTime;
        if (timeSinceLastCall < 3000) {
            const waitTime = 3000 - timeSinceLastCall;
            console.log(`⏳ Rate limiting: Waiting ${Math.ceil(waitTime/1000)} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    // Extract text from image using Azure OCR with fallback
    async extractTextFromImage(imageFile) {
        try {
            // Check user's daily limit first
            if (this.isUserDailyLimitReached()) {
                const userLimit = this.getUserDailyLimit();
                console.log(`⚠️ Daily limit reached (${userLimit} images). Trying free OCR...`);
                return await this.fallbackToFreeOCR(imageFile);
            }

            // Check monthly Azure limit
            if (this.isMonthlyLimitReached()) {
                console.log(`⚠️ Monthly Azure limit reached. Trying free OCR...`);
                return await this.fallbackToFreeOCR(imageFile);
            }

            // Initialize if not already done
            if (!this.subscriptionKey || !this.endpoint) {
                const initialized = await this.initialize();
                if (!initialized) {
                    console.log('⚠️ Azure OCR not configured. Trying free OCR...');
                    return await this.fallbackToFreeOCR(imageFile);
                }
            }

            // Apply rate limiting
            await this.checkRateLimit();

            // Convert image to base64
            const base64Image = await this.fileToBase64(imageFile);
            
            // Prepare request
            const url = `${this.endpoint}/vision/v3.2/read/analyze`;
            const headers = {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': this.subscriptionKey
            };

            // Update rate limiting counters
            this.callsThisMinute++;
            this.lastCallTime = Date.now();

            // Send initial request
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: base64Image
            });

            if (!response.ok) {
                console.log(`⚠️ Azure OCR request failed. Trying free OCR...`);
                return await this.fallbackToFreeOCR(imageFile);
            }

            // Get operation location for polling
            const operationLocation = response.headers.get('Operation-Location');
            if (!operationLocation) {
                console.log(`⚠️ No operation location received. Trying free OCR...`);
                return await this.fallbackToFreeOCR(imageFile);
            }

            // Poll for results
            const result = await this.pollForResults(operationLocation);
            
            // Increment usage counters
            this.monthlyUsage++;
            this.saveMonthlyUsage();
            
            const userUsage = this.getUserDailyUsage() + 1;
            this.saveUserDailyUsage(userUsage);

            console.log(`✅ Azure OCR completed. User daily: ${userUsage}/${this.getUserDailyLimit()}, Monthly: ${this.monthlyUsage}/${this.maxPagesPerMonth}`);
            return result;

        } catch (error) {
            console.error('❌ Azure OCR error:', error);
            console.log('🔄 Falling back to free OCR...');
            return await this.fallbackToFreeOCR(imageFile);
        }
    }

    // Fallback to OCR.Space (unlimited) or Free OCR
    async fallbackToFreeOCR(imageFile) {
        try {
            // First try OCR.Space (unlimited)
            if (window.ocrSpaceService && window.ocrSpaceService.isAvailable()) {
                console.log('🔍 Using OCR.Space fallback (unlimited)...');
                const result = await window.ocrSpaceService.extractTextFromImage(imageFile);
                
                // Add fallback indicator
                result.fallback = true;
                result.fallbackReason = 'Azure OCR limits reached, using unlimited OCR.Space';
                
                return result;
            }
            
            // Fallback to free Tesseract OCR
            if (window.freeOCRService) {
                console.log('🔍 Using free Tesseract OCR fallback...');
                const result = await window.freeOCRService.extractTextFromImage(imageFile);
                
                // Add fallback indicator
                result.fallback = true;
                result.fallbackReason = 'Azure OCR unavailable, using free Tesseract OCR';
                
                return result;
            }
            
            throw new Error('No fallback OCR services available');
            
        } catch (fallbackError) {
            console.error('❌ All OCR fallbacks failed:', fallbackError);
            throw new Error('All OCR services failed. Please try again later.');
        }
    }

    // Convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix to get just the base64 string
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Poll for OCR results
    async pollForResults(operationLocation) {
        const maxAttempts = 30; // 30 seconds max
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(operationLocation, {
                    headers: {
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey
                    }
                });

                if (!response.ok) {
                    throw new Error(`Polling failed: ${response.status}`);
                }

                const result = await response.json();

                if (result.status === 'succeeded') {
                    return this.extractTextFromResult(result);
                } else if (result.status === 'failed') {
                    throw new Error('OCR processing failed');
                }

                // Wait 1 second before next poll
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;

            } catch (error) {
                console.error('Polling error:', error);
                throw error;
            }
        }

        throw new Error('OCR processing timeout');
    }

    // Extract text from Azure OCR result with better formatting
    extractTextFromResult(result) {
        try {
            const extractedText = [];
            
            if (result.analyzeResult && result.analyzeResult.readResults) {
                result.analyzeResult.readResults.forEach(page => {
                    let currentY = -1;
                    let lineSpacing = 0;
                    
                    // Sort lines by Y position to maintain reading order
                    const sortedLines = page.lines.sort((a, b) => {
                        const yDiff = Math.abs(a.boundingBox[1] - b.boundingBox[1]);
                        if (yDiff < 10) { // Same line
                            return a.boundingBox[0] - b.boundingBox[0]; // Sort by X position
                        }
                        return a.boundingBox[1] - b.boundingBox[1]; // Sort by Y position
                    });
                    
                    sortedLines.forEach((line, index) => {
                        const lineY = line.boundingBox[1];
                        
                        // Add line break if significant Y difference (new paragraph)
                        if (currentY !== -1) {
                            const yDiff = Math.abs(lineY - currentY);
                            if (yDiff > 20) { // New line
                                extractedText.push('');
                            }
                        }
                        
                        extractedText.push(line.text);
                        currentY = lineY;
                    });
                });
            }

            return {
                text: extractedText.join('\n'),
                confidence: this.calculateAverageConfidence(result),
                pages: result.analyzeResult?.readResults?.length || 1,
                source: 'azure'
            };

        } catch (error) {
            console.error('Error extracting text from result:', error);
            throw new Error('Failed to parse OCR result');
        }
    }

    // Calculate average confidence from OCR result
    calculateAverageConfidence(result) {
        try {
            let totalConfidence = 0;
            let confidenceCount = 0;

            if (result.analyzeResult && result.analyzeResult.readResults) {
                result.analyzeResult.readResults.forEach(page => {
                    page.lines.forEach(line => {
                        if (line.confidence !== undefined) {
                            totalConfidence += line.confidence;
                            confidenceCount++;
                        }
                    });
                });
            }

            return confidenceCount > 0 ? (totalConfidence / confidenceCount) * 100 : 0;
        } catch (error) {
            return 0;
        }
    }

    // Get usage statistics
    getUsageStats() {
        const userLimit = this.getUserDailyLimit();
        const userUsage = this.getUserDailyUsage();
        const userRemaining = this.getUserRemainingPages();
        
        return {
            userDailyUsage: userUsage,
            userDailyLimit: userLimit,
            userRemainingPages: userRemaining,
            monthlyUsage: this.monthlyUsage,
            maxPagesPerMonth: this.maxPagesPerMonth,
            monthlyRemainingPages: this.getRemainingPages(),
            lastResetDate: this.lastResetDate,
            isUserLimitReached: this.isUserDailyLimitReached(),
            isMonthlyLimitReached: this.isMonthlyLimitReached(),
            userSubscription: this.getUserSubscription()
        };
    }

    // Reset user daily usage (for testing)
    resetUserDailyUsage() {
        const today = new Date().toDateString();
        const dailyKey = `azureOCR_userDaily_${today}`;
        localStorage.removeItem(dailyKey);
        console.log('🔄 User daily usage reset manually');
    }

    // Reset monthly usage (for testing)
    resetMonthlyUsage() {
        this.monthlyUsage = 0;
        this.saveMonthlyUsage();
        console.log('🔄 Monthly usage reset manually');
    }
}

// Initialize Azure OCR Service when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.azureOCRService = new AzureOCRService();
    console.log('✅ Azure OCR Service ready');
});

// Export for use in other modules
window.AzureOCRService = AzureOCRService;
