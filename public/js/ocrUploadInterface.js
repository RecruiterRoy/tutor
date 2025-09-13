/**
 * OCR Upload Interface
 * Provides a user-friendly interface for uploading images for OCR processing
 */
class OCRUploadInterface {
    constructor() {
        this.uploadButton = null;
        this.fileInput = null;
        this.progressBar = null;
        this.resultContainer = null;
        this.init();
    }

    init() {
        this.createUploadInterface();
        this.bindEvents();
        console.log('📷 OCR Upload Interface initialized');
    }

    createUploadInterface() {
        // Create upload container
        const container = document.createElement('div');
        container.id = 'ocrUploadContainer';
        container.className = 'fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white shadow-lg z-50 max-w-sm';
        container.style.display = 'none';

        container.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <span class="font-semibold">🔍 OCR Image Upload</span>
                <button id="closeOcrUpload" class="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div class="space-y-3">
                <div class="text-xs text-gray-300">
                    Upload an image to extract text using Azure OCR
                </div>
                
                <div class="flex flex-col space-y-2">
                    <input type="file" id="ocrFileInput" accept="image/*" class="hidden">
                    <button id="ocrUploadBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
                        📷 Choose Image
                    </button>
                </div>
                
                <div id="ocrProgress" class="hidden">
                    <div class="text-xs text-gray-300 mb-1">Processing...</div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div id="ocrProgressBar" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                </div>
                
                <div id="ocrResult" class="hidden">
                    <div class="text-xs text-gray-300 mb-1">Extracted Text:</div>
                    <div id="ocrResultText" class="bg-gray-800 rounded p-2 text-xs max-h-32 overflow-y-auto"></div>
                    <button id="copyOcrResult" class="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">
                        📋 Copy Text
                    </button>
                </div>
                
                <div id="ocrError" class="hidden">
                    <div class="text-red-400 text-xs"></div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        
        // Store references
        this.uploadButton = container.querySelector('#ocrUploadBtn');
        this.fileInput = container.querySelector('#ocrFileInput');
        this.progressBar = container.querySelector('#ocrProgressBar');
        this.resultContainer = container.querySelector('#ocrResult');
        this.resultText = container.querySelector('#ocrResultText');
        this.errorContainer = container.querySelector('#ocrError');
        this.progressContainer = container.querySelector('#ocrProgress');
        this.copyButton = container.querySelector('#copyOcrResult');
    }

    bindEvents() {
        // Upload button click
        this.uploadButton.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File selection
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processImage(e.target.files[0]);
            }
        });

        // Close button
        document.getElementById('closeOcrUpload').addEventListener('click', () => {
            this.hide();
        });

        // Copy result
        this.copyButton.addEventListener('click', () => {
            this.copyToClipboard(this.resultText.textContent);
        });
    }

    async processImage(file) {
        try {
            // Show progress
            this.showProgress();
            this.hideError();
            this.hideResult();

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('File size too large. Please use an image smaller than 10MB.');
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Please select a valid image file.');
            }

            // Update progress - Preprocessing
            this.updateProgress(10);
            this.updateProgressText('Preprocessing image...');

            // Preprocess image for better OCR
            let processedFile = file;
            if (window.imagePreprocessor) {
                processedFile = await window.imagePreprocessor.preprocessImage(file);
            }

            // Update progress - OCR Processing
            this.updateProgress(30);
            this.updateProgressText('Processing with OCR...');

            // Process with Azure OCR
            const result = await window.azureOCRService.extractTextFromImage(processedFile);
            
            // Update progress - Filtering text
            this.updateProgress(80);
            this.updateProgressText('Filtering text...');

            // Filter and clean the extracted text
            const cleanedText = this.filterAndCleanText(result.text);
            
            this.updateProgress(100);
            this.updateProgressText('Completed!');
            
            // Show result with source information
            this.showResult(cleanedText, result.source, result.confidence, result.fallback, result.fallbackReason);
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                this.hide();
            }, 10000);

        } catch (error) {
            console.error('OCR processing error:', error);
            this.showError(error.message);
            this.hideProgress();
        }
    }

    showProgress() {
        this.progressContainer.classList.remove('hidden');
        this.uploadButton.disabled = true;
        this.uploadButton.textContent = '⏳ Processing...';
    }

    hideProgress() {
        this.progressContainer.classList.add('hidden');
        this.uploadButton.disabled = false;
        this.uploadButton.textContent = '📷 Choose Image';
    }

    updateProgress(percentage) {
        this.progressBar.style.width = `${percentage}%`;
    }

    updateProgressText(text) {
        const progressText = this.progressContainer.querySelector('.text-xs');
        if (progressText) {
            progressText.textContent = text;
        }
    }

    filterAndCleanText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        // Split into lines to preserve structure
        const lines = text.split('\n');
        const cleanedLines = [];

        for (const line of lines) {
            // Clean each line
            let cleanedLine = this.cleanLine(line);
            
            // Only add non-empty lines
            if (cleanedLine.trim()) {
                cleanedLines.push(cleanedLine);
            }
        }

        // Join lines back together
        return cleanedLines.join('\n');
    }

    cleanLine(line) {
        if (!line || typeof line !== 'string') {
            return '';
        }

        // Remove common OCR artifacts and non-printable characters
        let cleaned = line
            // Remove common OCR garbage characters
            .replace(/[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1A20-\u1AAF\u1AB0-\u1AFF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1C00-\u1C4F\u1C50-\u1C7F\u1C80-\u1C8F\u1C90-\u1CBF\u1CC0-\u1CCF\u1CD0-\u1CFF\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2400-\u243F\u2440-\u245F\u2460-\u24FF\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u27C0-\u27EF\u27F0-\u27FF\u2800-\u28FF\u2900-\u297F\u2980-\u29FF\u2A00-\u2AFF\u2B00-\u2BFF\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2DE0-\u2DFF\u2E00-\u2E7F\u2E80-\u2EFF\u2F00-\u2FDF\u2FF0-\u2FFF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31A0-\u31BF\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA4D0-\uA4FF\uA500-\uA63F\uA640-\uA69F\uA6A0-\uA6FF\uA700-\uA71F\uA720-\uA7FF\uA800-\uA82F\uA830-\uA83F\uA840-\uA87F\uA880-\uA8DF\uA8E0-\uA8FF\uA900-\uA92F\uA930-\uA95F\uA960-\uA97F\uA980-\uA9DF\uA9E0-\uA9FF\uAA00-\uAA5F\uAA60-\uAA7F\uAA80-\uAADF\uAAE0-\uAAFF\uAB00-\uAB2F\uAB30-\uAB6F\uAB70-\uABBF\uABC0-\uABFF\uAC00-\uD7AF\uD7B0-\uD7FF\uD800-\uDB7F\uDB80-\uDBFF\uDC00-\uDFFF\uE000-\uF8FF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE00-\uFE0F\uFE10-\uFE1F\uFE20-\uFE2F\uFE30-\uFE4F\uFE50-\uFE6F\uFE70-\uFEFF\uFF00-\uFFEF\uFFF0-\uFFFF]/g, ' ')
            // Remove multiple spaces
            .replace(/\s+/g, ' ')
            // Remove leading/trailing spaces
            .trim();

        // Filter out lines that are mostly garbage
        const garbageRatio = this.calculateGarbageRatio(cleaned);
        if (garbageRatio > 0.7) { // If more than 70% is garbage, return empty
            return '';
        }

        return cleaned;
    }

    calculateGarbageRatio(text) {
        if (!text || text.length === 0) return 1;

        // Count garbage characters (symbols, numbers, etc.)
        const garbageChars = text.match(/[^\u0020-\u007E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1A20-\u1AAF\u1AB0-\u1AFF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1C00-\u1C4F\u1C50-\u1C7F\u1C80-\u1C8F\u1C90-\u1CBF\u1CC0-\u1CCF\u1CD0-\u1CFF\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2400-\u243F\u2440-\u245F\u2460-\u24FF\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u27C0-\u27EF\u27F0-\u27FF\u2800-\u28FF\u2900-\u297F\u2980-\u29FF\u2A00-\u2AFF\u2B00-\u2BFF\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2DE0-\u2DFF\u2E00-\u2E7F\u2E80-\u2EFF\u2F00-\u2FDF\u2FF0-\u2FFF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31A0-\u31BF\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA4D0-\uA4FF\uA500-\uA63F\uA640-\uA69F\uA6A0-\uA6FF\uA700-\uA71F\uA720-\uA7FF\uA800-\uA82F\uA830-\uA83F\uA840-\uA87F\uA880-\uA8DF\uA8E0-\uA8FF\uA900-\uA92F\uA930-\uA95F\uA960-\uA97F\uA980-\uA9DF\uA9E0-\uA9FF\uAA00-\uAA5F\uAA60-\uAA7F\uAA80-\uAADF\uAAE0-\uAAFF\uAB00-\uAB2F\uAB30-\uAB6F\uAB70-\uABBF\uABC0-\uABFF\uAC00-\uD7AF\uD7B0-\uD7FF\uD800-\uDB7F\uDB80-\uDBFF\uDC00-\uDFFF\uE000-\uF8FF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE00-\uFE0F\uFE10-\uFE1F\uFE20-\uFE2F\uFE30-\uFE4F\uFE50-\uFE6F\uFE70-\uFEFF\uFF00-\uFFEF\uFFF0-\uFFFF]/g) || [];
        
        return garbageChars.length / text.length;
    }

    showResult(text, source = 'unknown', confidence = 0, fallback = false, fallbackReason = '') {
        let sourceText = '🟡 Unknown OCR';
        let sourceColor = 'text-gray-400';
        
        switch (source) {
            case 'azure':
                sourceText = '🔵 Azure OCR';
                sourceColor = 'text-blue-400';
                break;
            case 'ocrspace':
                sourceText = '🟢 OCR.Space (Unlimited)';
                sourceColor = 'text-green-400';
                break;
            case 'free':
                sourceText = '🟡 Tesseract OCR';
                sourceColor = 'text-yellow-400';
                break;
        }
        
        const confidenceText = confidence > 0 ? ` (${Math.round(confidence)}% confidence)` : '';
        const fallbackText = fallback ? `<div class="text-xs text-orange-400 mt-1">⚠️ Fallback: ${fallbackReason}</div>` : '';
        
        this.resultText.innerHTML = `
            <div class="text-xs ${sourceColor} mb-2">
                ${sourceText}${confidenceText}
            </div>
            <div class="text-white">
                ${text}
            </div>
            ${fallbackText}
        `;
        this.resultContainer.classList.remove('hidden');
        this.hideProgress();
    }

    hideResult() {
        this.resultContainer.classList.add('hidden');
    }

    showError(message) {
        this.errorContainer.querySelector('div').textContent = message;
        this.errorContainer.classList.remove('hidden');
    }

    hideError() {
        this.errorContainer.classList.add('hidden');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.copyButton.textContent = '✅ Copied!';
            setTimeout(() => {
                this.copyButton.textContent = '📋 Copy Text';
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.copyButton.textContent = '✅ Copied!';
            setTimeout(() => {
                this.copyButton.textContent = '📋 Copy Text';
            }, 2000);
        });
    }

    show() {
        document.getElementById('ocrUploadContainer').style.display = 'block';
        // Show usage stats
        if (window.ocrUsageDisplay) {
            window.ocrUsageDisplay.show();
        }
    }

    hide() {
        document.getElementById('ocrUploadContainer').style.display = 'none';
        this.hideProgress();
        this.hideResult();
        this.hideError();
        this.fileInput.value = '';
    }

    toggle() {
        const container = document.getElementById('ocrUploadContainer');
        if (container.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }
}

// Initialize OCR Upload Interface when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ocrUploadInterface = new OCRUploadInterface();
    console.log('✅ OCR Upload Interface ready');
});

// Export for use in other modules
window.OCRUploadInterface = OCRUploadInterface;
