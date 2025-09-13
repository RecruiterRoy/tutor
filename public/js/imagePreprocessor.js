/**
 * Image Preprocessor
 * Improves image quality for better OCR results
 */
class ImagePreprocessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async preprocessImage(imageFile) {
        try {
            console.log('🖼️ Preprocessing image for better OCR...');
            
            // Create image element
            const img = new Image();
            const imageUrl = URL.createObjectURL(imageFile);
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });

            // Set canvas size
            this.canvas.width = img.width;
            this.canvas.height = img.height;

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw original image
            this.ctx.drawImage(img, 0, 0);

            // Apply preprocessing filters
            await this.applyFilters();

            // Convert to blob
            const processedBlob = await new Promise(resolve => {
                this.canvas.toBlob(resolve, 'image/png', 0.9);
            });

            // Clean up
            URL.revokeObjectURL(imageUrl);

            console.log('✅ Image preprocessing completed');
            return processedBlob;

        } catch (error) {
            console.error('❌ Image preprocessing error:', error);
            return imageFile; // Return original if preprocessing fails
        }
    }

    async applyFilters() {
        // Get image data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        // Apply filters optimized for close-up document photos
        this.enhanceContrast(data, 1.5); // Higher contrast for documents
        this.reduceNoise(data);
        this.sharpen(data, 2.0); // Stronger sharpening for text
        this.enhanceBrightness(data, 1.1); // Slightly brighter
        this.applyGrayscale(data); // Convert to grayscale for better OCR

        // Put processed data back
        this.ctx.putImageData(imageData, 0, 0);
    }

    enhanceContrast(data, factor = 1.2) {
        // Enhanced contrast for document photos
        const offset = 128 * (1 - factor);

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * data[i] + offset));     // Red
            data[i + 1] = Math.min(255, Math.max(0, factor * data[i + 1] + offset)); // Green
            data[i + 2] = Math.min(255, Math.max(0, factor * data[i + 2] + offset)); // Blue
        }
    }

    enhanceBrightness(data, factor = 1.1) {
        // Enhance brightness for better text visibility
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);     // Red
            data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
            data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
        }
    }

    applyGrayscale(data) {
        // Convert to grayscale for better OCR accuracy
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;     // Red
            data[i + 1] = gray; // Green
            data[i + 2] = gray; // Blue
        }
    }

    reduceNoise(data) {
        // Simple noise reduction using median filter
        const width = this.canvas.width;
        const height = this.canvas.height;
        const tempData = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Get 3x3 neighborhood
                const neighbors = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        neighbors.push(tempData[nIdx]); // Red channel
                    }
                }
                
                // Apply median filter
                neighbors.sort((a, b) => a - b);
                const median = neighbors[4]; // Middle value
                
                data[idx] = median;     // Red
                data[idx + 1] = median; // Green
                data[idx + 2] = median; // Blue
            }
        }
    }

    sharpen(data, strength = 1.0) {
        // Enhanced sharpening filter for text documents
        const width = this.canvas.width;
        const height = this.canvas.height;
        const tempData = new Uint8ClampedArray(data);

        // Stronger sharpening kernel for text
        const kernel = [
            [0, -strength, 0],
            [-strength, 1 + 4 * strength, -strength],
            [0, -strength, 0]
        ];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                let r = 0, g = 0, b = 0;
                
                // Apply sharpening kernel
                for (let ky = 0; ky < 3; ky++) {
                    for (let kx = 0; kx < 3; kx++) {
                        const nIdx = ((y + ky - 1) * width + (x + kx - 1)) * 4;
                        const weight = kernel[ky][kx];
                        
                        r += tempData[nIdx] * weight;
                        g += tempData[nIdx + 1] * weight;
                        b += tempData[nIdx + 2] * weight;
                    }
                }
                
                // Clamp values
                data[idx] = Math.min(255, Math.max(0, r));     // Red
                data[idx + 1] = Math.min(255, Math.max(0, g)); // Green
                data[idx + 2] = Math.min(255, Math.max(0, b)); // Blue
            }
        }
    }

    // Convert to grayscale for better OCR
    async convertToGrayscale(imageFile) {
        try {
            const img = new Image();
            const imageUrl = URL.createObjectURL(imageFile);
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });

            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.ctx.drawImage(img, 0, 0);

            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;

            // Convert to grayscale
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                data[i] = gray;     // Red
                data[i + 1] = gray; // Green
                data[i + 2] = gray; // Blue
            }

            this.ctx.putImageData(imageData, 0, 0);

            const grayscaleBlob = await new Promise(resolve => {
                this.canvas.toBlob(resolve, 'image/png', 0.9);
            });

            URL.revokeObjectURL(imageUrl);
            return grayscaleBlob;

        } catch (error) {
            console.error('❌ Grayscale conversion error:', error);
            return imageFile;
        }
    }
}

// Initialize Image Preprocessor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.imagePreprocessor = new ImagePreprocessor();
    console.log('✅ Image Preprocessor ready');
});

// Export for use in other modules
window.ImagePreprocessor = ImagePreprocessor;
