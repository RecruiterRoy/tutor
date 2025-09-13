/**
 * Free OCR Service
 * Uses Tesseract.js for free OCR processing
 * Fallback when Azure OCR is not available or limits reached
 */
class FreeOCRService {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Load Tesseract.js dynamically
            if (typeof Tesseract === 'undefined') {
                await this.loadTesseract();
            }
            
            // Initialize Tesseract worker with optimized settings
            this.worker = await Tesseract.createWorker({
                logger: m => console.log('🔍 Free OCR:', m)
            });
            
            // Load English and Hindi languages
            await this.worker.loadLanguage('eng+hin');
            await this.worker.initialize('eng+hin');
            
            // Set optimized parameters for document OCR
            await this.worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()[]{}"\'-/\\@#$%&*+=<>|~`^_',
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // Treat as single text block
                tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // Use LSTM only for better accuracy
                preserve_interword_spaces: '1', // Preserve spaces between words
                textord_heavy_nr: '1', // Heavy noise removal
                textord_min_linesize: '2.0', // Minimum line size
                textord_old_baselines: '0', // Use new baseline detection
                textord_force_make_prop_words: 'F', // Don't force proportional words
                textord_use_cjk_fp_model: 'F', // Don't use CJK model
                textord_noise_debug: '0', // Disable noise debug
                textord_heavy_nr: '1', // Heavy noise removal
                textord_min_linesize: '2.0', // Minimum line size
                textord_old_baselines: '0', // Use new baseline detection
                textord_force_make_prop_words: 'F', // Don't force proportional words
                textord_use_cjk_fp_model: 'F', // Don't use CJK model
                textord_noise_debug: '0' // Disable noise debug
            });
            
            this.isInitialized = true;
            console.log('✅ Free OCR Service initialized');
        } catch (error) {
            console.error('❌ Error initializing Free OCR:', error);
        }
    }

    async loadTesseract() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/tesseract.js@v4.1.1/dist/tesseract.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async extractTextFromImage(imageFile) {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            console.log('🔍 Processing with Free OCR...');
            
            // Convert file to image
            const imageUrl = URL.createObjectURL(imageFile);
            
            // Process with Tesseract
            const result = await this.worker.recognize(imageUrl);
            
            // Clean up
            URL.revokeObjectURL(imageUrl);
            
            // Extract text and confidence
            const text = result.data.text.trim();
            const confidence = this.calculateAverageConfidence(result.data);
            
            console.log(`✅ Free OCR completed. Confidence: ${confidence}%`);
            
            return {
                text: text,
                confidence: confidence,
                source: 'free',
                pages: 1
            };

        } catch (error) {
            console.error('❌ Free OCR error:', error);
            throw new Error('Free OCR processing failed: ' + error.message);
        }
    }

    calculateAverageConfidence(result) {
        try {
            if (!result.words || result.words.length === 0) {
                return 0;
            }

            const totalConfidence = result.words.reduce((sum, word) => {
                return sum + (word.confidence || 0);
            }, 0);

            return Math.round(totalConfidence / result.words.length);
        } catch (error) {
            return 0;
        }
    }

    // Cleanup method
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
        }
    }
}

// Initialize Free OCR Service when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.freeOCRService = new FreeOCRService();
    console.log('✅ Free OCR Service ready');
});

// Export for use in other modules
window.FreeOCRService = FreeOCRService;
