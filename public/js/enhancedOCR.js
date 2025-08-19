// Enhanced OCR System - Best possible text recognition
// Combines multiple OCR services and image preprocessing for maximum accuracy

class EnhancedOCR {
    constructor() {
        this.services = [];
        this.imageProcessor = null;
        this.lastProcessedImage = null;
        this.confidenceThreshold = 0.7;
        
        this.init();
    }

    async init() {
        console.log('🔧 Initializing Enhanced OCR System...');
        
        // Initialize image preprocessor
        this.imageProcessor = new ImagePreprocessor();
        
        // Initialize all available OCR services
        await this.initializeOCRServices();
        
        console.log(`✅ Enhanced OCR initialized with ${this.services.length} services`);
    }

    async initializeOCRServices() {
        // Microsoft Azure OCR (Primary)
        if (window.azureOCRService) {
            this.services.push({
                name: 'Azure OCR',
                service: window.azureOCRService,
                priority: 1,
                confidence: 0.9
            });
        }

        // Free OCR Service (Backup)
        if (window.freeOCRService) {
            this.services.push({
                name: 'Free OCR',
                service: window.freeOCRService,
                priority: 2,
                confidence: 0.7
            });
        }

        // OCR.space (Additional backup)
        if (window.ocrSpaceService) {
            this.services.push({
                name: 'OCR Space',
                service: window.ocrSpaceService,
                priority: 3,
                confidence: 0.8
            });
        }

        // Browser native OCR if available
        if ('createImageBitmap' in window && 'OffscreenCanvas' in window) {
            this.services.push({
                name: 'Browser OCR',
                service: this,
                priority: 4,
                confidence: 0.6
            });
        }
    }

    async processImage(imageFile, options = {}) {
        console.log('📸 Enhanced OCR processing started...');
        
        try {
            // Step 1: Preprocess image for better OCR
            const processedImages = await this.preprocessImage(imageFile, options);
            
            // Step 2: Try multiple OCR services in parallel
            const ocrResults = await this.runMultipleOCR(processedImages);
            
            // Step 3: Combine and validate results
            const finalResult = this.combineResults(ocrResults);
            
            // Step 4: Post-process text
            const cleanedText = this.postProcessText(finalResult.text);
            
            console.log('✅ Enhanced OCR completed:', {
                originalText: finalResult.text,
                cleanedText: cleanedText,
                confidence: finalResult.confidence,
                servicesUsed: finalResult.servicesUsed
            });
            
            return {
                text: cleanedText,
                originalText: finalResult.text,
                confidence: finalResult.confidence,
                servicesUsed: finalResult.servicesUsed,
                processedImages: processedImages.length
            };
            
        } catch (error) {
            console.error('❌ Enhanced OCR failed:', error);
            throw error;
        }
    }

    async preprocessImage(imageFile, options) {
        console.log('🔧 Preprocessing image for better OCR...');
        
        const processedImages = [];
        
        try {
            // Original image
            processedImages.push({
                type: 'original',
                file: imageFile,
                description: 'Original image'
            });

            // Enhanced contrast
            const highContrastImage = await this.imageProcessor.enhanceContrast(imageFile, 1.5);
            processedImages.push({
                type: 'high_contrast',
                file: highContrastImage,
                description: 'High contrast version'
            });

            // Sharpened image
            const sharpenedImage = await this.imageProcessor.sharpenImage(imageFile);
            processedImages.push({
                type: 'sharpened',
                file: sharpenedImage,
                description: 'Sharpened version'
            });

            // Grayscale with threshold
            const binaryImage = await this.imageProcessor.convertToBinary(imageFile);
            processedImages.push({
                type: 'binary',
                file: binaryImage,
                description: 'Binary (black and white)'
            });

            // Noise reduction
            const denoisedImage = await this.imageProcessor.reduceNoise(imageFile);
            processedImages.push({
                type: 'denoised',
                file: denoisedImage,
                description: 'Noise reduced'
            });

            // Upscaled version for small text
            const upscaledImage = await this.imageProcessor.upscaleImage(imageFile, 2);
            processedImages.push({
                type: 'upscaled',
                file: upscaledImage,
                description: 'Upscaled 2x'
            });

            console.log(`✅ Generated ${processedImages.length} processed versions`);
            return processedImages;
            
        } catch (error) {
            console.error('❌ Image preprocessing failed:', error);
            // Return at least the original
            return [{
                type: 'original',
                file: imageFile,
                description: 'Original image (preprocessing failed)'
            }];
        }
    }

    async runMultipleOCR(processedImages) {
        console.log('🔄 Running multiple OCR services...');
        
        const allResults = [];
        
        // Try each service with each processed image
        for (const imageVariant of processedImages) {
            for (const ocrService of this.services) {
                try {
                    console.log(`🔍 Trying ${ocrService.name} on ${imageVariant.description}...`);
                    
                    const startTime = Date.now();
                    let result;
                    
                    if (ocrService.name === 'Azure OCR') {
                        result = await this.runAzureOCR(imageVariant.file);
                    } else if (ocrService.name === 'Free OCR') {
                        result = await this.runFreeOCR(imageVariant.file);
                    } else if (ocrService.name === 'OCR Space') {
                        result = await this.runOCRSpace(imageVariant.file);
                    } else if (ocrService.name === 'Browser OCR') {
                        result = await this.runBrowserOCR(imageVariant.file);
                    }
                    
                    const processingTime = Date.now() - startTime;
                    
                    if (result && result.text && result.text.trim().length > 0) {
                        allResults.push({
                            service: ocrService.name,
                            imageType: imageVariant.type,
                            text: result.text,
                            confidence: result.confidence || ocrService.confidence,
                            processingTime: processingTime,
                            priority: ocrService.priority
                        });
                        
                        console.log(`✅ ${ocrService.name} (${imageVariant.type}): "${result.text.substring(0, 50)}..."`);
                    }
                    
                } catch (error) {
                    console.warn(`⚠️ ${ocrService.name} failed on ${imageVariant.type}:`, error.message);
                }
            }
        }
        
        console.log(`📊 OCR completed: ${allResults.length} successful results`);
        return allResults;
    }

    combineResults(ocrResults) {
        if (ocrResults.length === 0) {
            throw new Error('No OCR results available');
        }

        console.log('🔀 Combining OCR results...');
        
        // Sort by confidence and priority
        const sortedResults = ocrResults.sort((a, b) => {
            const scoreA = a.confidence * (4 - a.priority); // Higher confidence, lower priority number = higher score
            const scoreB = b.confidence * (4 - b.priority);
            return scoreB - scoreA;
        });

        // Group similar results
        const textGroups = this.groupSimilarTexts(sortedResults);
        
        // Choose the best result
        let bestResult = sortedResults[0];
        
        // If we have multiple similar results, increase confidence
        for (const group of textGroups) {
            if (group.length > 1) {
                const avgConfidence = group.reduce((sum, r) => sum + r.confidence, 0) / group.length;
                if (avgConfidence > bestResult.confidence) {
                    bestResult = group[0];
                    bestResult.confidence = Math.min(0.95, avgConfidence + 0.1); // Boost confidence for consensus
                }
            }
        }

        // If confidence is still low, try to combine complementary results
        if (bestResult.confidence < this.confidenceThreshold) {
            bestResult = this.combineComplementaryResults(sortedResults);
        }

        return {
            text: bestResult.text,
            confidence: bestResult.confidence,
            servicesUsed: ocrResults.map(r => `${r.service} (${r.imageType})`).join(', ')
        };
    }

    groupSimilarTexts(results) {
        const groups = [];
        const used = new Set();
        
        for (let i = 0; i < results.length; i++) {
            if (used.has(i)) continue;
            
            const group = [results[i]];
            used.add(i);
            
            for (let j = i + 1; j < results.length; j++) {
                if (used.has(j)) continue;
                
                if (this.areTextsSimilar(results[i].text, results[j].text)) {
                    group.push(results[j]);
                    used.add(j);
                }
            }
            
            groups.push(group);
        }
        
        return groups;
    }

    areTextsSimilar(text1, text2, threshold = 0.8) {
        const clean1 = text1.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const clean2 = text2.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        if (clean1 === clean2) return true;
        
        // Calculate similarity ratio
        const longer = clean1.length > clean2.length ? clean1 : clean2;
        const shorter = clean1.length > clean2.length ? clean2 : clean1;
        
        if (longer.length === 0) return false;
        
        const similarity = (longer.length - this.getEditDistance(longer, shorter)) / longer.length;
        return similarity >= threshold;
    }

    getEditDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    combineComplementaryResults(results) {
        // Combine results that might complement each other
        const combinedText = results
            .filter(r => r.text.trim().length > 0)
            .map(r => r.text.trim())
            .join(' ');
        
        const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
        
        return {
            text: combinedText,
            confidence: avgConfidence,
            service: 'Combined',
            imageType: 'multiple'
        };
    }

    postProcessText(text) {
        if (!text) return '';
        
        console.log('🧹 Post-processing text...');
        
        let cleanedText = text;
        
        // Remove excessive whitespace
        cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
        
        // Fix common OCR errors
        const commonErrors = {
            'rn': 'm',
            'vv': 'w',
            '0': 'O', // in words
            '1': 'l', // in words
            '5': 'S', // in words
            '8': 'B', // in words
            '6': 'G', // in words
        };
        
        // Apply common error corrections carefully
        for (const [error, correction] of Object.entries(commonErrors)) {
            // Only replace if it's clearly a word context
            const wordPattern = new RegExp(`\\b${error}\\b`, 'g');
            cleanedText = cleanedText.replace(wordPattern, correction);
        }
        
        // Fix punctuation spacing
        cleanedText = cleanedText.replace(/\s+([,.!?;:])/g, '$1');
        cleanedText = cleanedText.replace(/([,.!?;:])\s*/g, '$1 ');
        
        // Capitalize first letter of sentences
        cleanedText = cleanedText.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => {
            return prefix + letter.toUpperCase();
        });
        
        console.log('✅ Text post-processing completed');
        return cleanedText.trim();
    }

    // Individual OCR service methods
    async runAzureOCR(imageFile) {
        if (!window.azureOCRService) {
            throw new Error('Azure OCR service not available');
        }
        
        return await window.azureOCRService.processImage(imageFile);
    }

    async runFreeOCR(imageFile) {
        if (!window.freeOCRService) {
            throw new Error('Free OCR service not available');
        }
        
        return await window.freeOCRService.processImage(imageFile);
    }

    async runOCRSpace(imageFile) {
        if (!window.ocrSpaceService) {
            throw new Error('OCR Space service not available');
        }
        
        return await window.ocrSpaceService.processImage(imageFile);
    }

    async runBrowserOCR(imageFile) {
        // Placeholder for potential browser-native OCR
        // This could use WebAssembly-based OCR libraries
        console.log('⚠️ Browser OCR not implemented yet');
        return { text: '', confidence: 0 };
    }

    // Utility methods
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    getServiceStatus() {
        return {
            totalServices: this.services.length,
            services: this.services.map(s => ({
                name: s.name,
                priority: s.priority,
                confidence: s.confidence
            }))
        };
    }
}

// Advanced Image Preprocessor
class ImagePreprocessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async enhanceContrast(imageFile, factor = 1.5) {
        const img = await this.loadImage(imageFile);
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));     // Red
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // Green
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // Blue
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        return this.canvasToFile('enhanced_contrast.png');
    }

    async sharpenImage(imageFile) {
        const img = await this.loadImage(imageFile);
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        const width = img.width;
        const height = img.height;
        
        // Sharpening kernel
        const kernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];
        
        const newData = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const pos = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += data[pos] * kernel[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                    const pos = (y * width + x) * 4 + c;
                    newData[pos] = Math.min(255, Math.max(0, sum));
                }
            }
        }
        
        const newImageData = new ImageData(newData, width, height);
        this.ctx.putImageData(newImageData, 0, 0);
        
        return this.canvasToFile('sharpened.png');
    }

    async convertToBinary(imageFile, threshold = 128) {
        const img = await this.loadImage(imageFile);
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const binary = gray > threshold ? 255 : 0;
            data[i] = binary;     // Red
            data[i + 1] = binary; // Green
            data[i + 2] = binary; // Blue
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        return this.canvasToFile('binary.png');
    }

    async reduceNoise(imageFile) {
        const img = await this.loadImage(imageFile);
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        this.ctx.filter = 'blur(0.5px)';
        this.ctx.drawImage(this.canvas, 0, 0);
        
        return this.canvasToFile('denoised.png');
    }

    async upscaleImage(imageFile, factor = 2) {
        const img = await this.loadImage(imageFile);
        this.canvas.width = img.width * factor;
        this.canvas.height = img.height * factor;
        
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(img, 0, 0, img.width * factor, img.height * factor);
        
        return this.canvasToFile('upscaled.png');
    }

    async loadImage(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            
            if (imageFile instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => img.src = e.target.result;
                reader.readAsDataURL(imageFile);
            } else {
                img.src = imageFile;
            }
        });
    }

    canvasToFile(filename) {
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                const file = new File([blob], filename, { type: 'image/png' });
                resolve(file);
            }, 'image/png', 0.95);
        });
    }
}

// Initialize Enhanced OCR when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedOCR = new EnhancedOCR();
    window.ImagePreprocessor = ImagePreprocessor;
});

// Make available globally
window.EnhancedOCR = EnhancedOCR;
