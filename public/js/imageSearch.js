// Web Image Search Service
class ImageSearchService {
    constructor() {
        this.unsplashAccessKey = null; // You can add your Unsplash API key here
        this.pixabayApiKey = null; // You can add your Pixabay API key here
    }

    async searchImages(query, count = 6) {
        try {
            // Try multiple sources
            const images = [];
            
            // Method 1: Unsplash (if API key available)
            if (this.unsplashAccessKey) {
                const unsplashImages = await this.searchUnsplash(query, count);
                images.push(...unsplashImages);
            }
            
            // Method 2: Pixabay (if API key available)
            if (this.pixabayApiKey && images.length < count) {
                const pixabayImages = await this.searchPixabay(query, count - images.length);
                images.push(...pixabayImages);
            }
            
            // Method 3: Fallback to placeholder service
            if (images.length === 0) {
                const fallbackImages = this.getFallbackImages(query, count);
                images.push(...fallbackImages);
            }
            
            return images.slice(0, count);
            
        } catch (error) {
            console.error('Error searching images:', error);
            return this.getFallbackImages(query, count);
        }
    }

    async searchUnsplash(query, count) {
        try {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${this.unsplashAccessKey}`
            );
            
            if (!response.ok) throw new Error('Unsplash API error');
            
            const data = await response.json();
            return data.results.map(photo => ({
                url: photo.urls.regular,
                description: photo.alt_description || query,
                source: 'unsplash',
                author: photo.user.name
            }));
            
        } catch (error) {
            console.error('Unsplash search failed:', error);
            return [];
        }
    }

    async searchPixabay(query, count) {
        try {
            const response = await fetch(
                `https://pixabay.com/api/?key=${this.pixabayApiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${count}`
            );
            
            if (!response.ok) throw new Error('Pixabay API error');
            
            const data = await response.json();
            return data.hits.map(hit => ({
                url: hit.webformatURL,
                description: hit.tags || query,
                source: 'pixabay',
                author: hit.user
            }));
            
        } catch (error) {
            console.error('Pixabay search failed:', error);
            return [];
        }
    }

    getFallbackImages(query, count) {
        // Use placeholder services that don't require API keys
        const images = [];
        
        for (let i = 0; i < count; i++) {
            images.push({
                url: `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}&sig=${i}`,
                description: `${query} - educational content`,
                source: 'placeholder',
                author: 'Unsplash'
            });
        }
        
        return images;
    }

    // Educational image search with better queries
    async searchEducationalImages(subject, grade, topic) {
        const queries = [
            `${subject} ${grade} class ${topic} diagram`,
            `${subject} ${grade} ${topic} illustration`,
            `${subject} education ${topic}`,
            `${subject} ${grade} textbook ${topic}`
        ];
        
        for (const query of queries) {
            const images = await this.searchImages(query, 3);
            if (images.length > 0) {
                return images;
            }
        }
        
        // Final fallback
        return this.getFallbackImages(`${subject} ${grade} ${topic}`, 3);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageSearchService;
} else {
    window.ImageSearchService = ImageSearchService;
} 
