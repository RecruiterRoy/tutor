/**
 * OCR.Space Service
 * Provides unlimited OCR functionality using OCR.Space API
 * Used as fallback when Azure OCR limits are reached
 */
class OCRSpaceService {
    constructor() {
        this.apiKey = null;
        this.apiUrl = 'https://api.ocr.space/parse/image';
        this.init();
    }

    async init() {
        try {
            // Get API key from server-side environment
            console.log('🔍 Getting OCR.Space credentials...');
            const response = await fetch('/api/ocrspace-credentials');
            if (response.ok) {
                const credentials = await response.json();
                this.apiKey = credentials.apiKey;
                console.log('✅ OCR.Space credentials loaded');
            } else {
                console.warn('⚠️ OCR.Space credentials not configured');
            }
        } catch (error) {
            console.error('❌ Error initializing OCR.Space:', error);
        }
    }

    async extractTextFromImage(imageFile) {
        try {
            if (!this.apiKey) {
                await this.init();
                if (!this.apiKey) {
                    throw new Error('OCR.Space API key not configured');
                }
            }

            console.log('🔍 Processing with OCR.Space...');

            // Create form data
            const formData = new FormData();
            formData.append('apikey', this.apiKey);
            formData.append('language', 'eng+hin'); // Support both English and Hindi
            formData.append('file', imageFile);
            formData.append('isOverlayRequired', 'false');
            formData.append('filetype', 'png');
            formData.append('detectOrientation', 'true');
            formData.append('scale', 'true');
            formData.append('OCREngine', '2'); // Use advanced OCR engine

            // Send request
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`OCR.Space request failed: ${response.status}`);
            }

            const result = await response.json();

            // Check for errors
            if (result.IsErroredOnProcessing) {
                throw new Error(`OCR.Space error: ${result.ErrorMessage}`);
            }

            // Extract text
            let extractedText = '';
            if (result.ParsedResults && result.ParsedResults.length > 0) {
                extractedText = result.ParsedResults[0].ParsedText;
            }

            // Calculate confidence (OCR.Space doesn't provide confidence scores)
            const confidence = this.estimateConfidence(extractedText);

            console.log(`✅ OCR.Space completed. Text length: ${extractedText.length}`);

            return {
                text: extractedText,
                confidence: confidence,
                source: 'ocrspace',
                pages: result.ParsedResults?.length || 1
            };

        } catch (error) {
            console.error('❌ OCR.Space error:', error);
            throw new Error('OCR.Space processing failed: ' + error.message);
        }
    }

    estimateConfidence(text) {
        if (!text || text.length === 0) return 0;

        // Simple confidence estimation based on text quality
        let score = 70; // Base score

        // Reduce score for common OCR errors
        const errorPatterns = [
            /\d{1,2}[^\w\s]/g, // Numbers followed by symbols
            /[^\w\s]{3,}/g, // Long sequences of symbols
            /\s{3,}/g, // Multiple spaces
            /[A-Z]{5,}/g, // All caps words (might be OCR errors)
        ];

        errorPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                score -= matches.length * 2;
            }
        });

        // Increase score for good patterns
        const goodPatterns = [
            /\b[a-z]{3,}\b/g, // Lowercase words
            /\b[A-Z][a-z]+\b/g, // Proper nouns
            /[.!?]\s+[A-Z]/g, // Sentence endings
        ];

        goodPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                score += matches.length;
            }
        });

        return Math.max(0, Math.min(100, score));
    }

    // Check if service is available
    isAvailable() {
        return this.apiKey !== null;
    }
}

// Initialize OCR.Space Service when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ocrSpaceService = new OCRSpaceService();
    console.log('✅ OCR.Space Service ready');
});

// Export for use in other modules
window.OCRSpaceService = OCRSpaceService;
