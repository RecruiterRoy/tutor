// Camera System for Dashboard
class CameraSystem {
    constructor() {
        this.video = null;
        this.stream = null;
        this.isActive = false;
        this.constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            },
            audio: false
        };
    }

    async startCamera() {
        try {
            console.log('📹 Starting camera...');
            
            // Get video element
            this.video = document.getElementById('cameraVideo');
            if (!this.video) {
                console.error('📹 Video element not found');
                return false;
            }

            // Get user media with fallback constraints
            this.stream = await this.getUserMediaWithFallback();
            
            if (this.stream) {
                this.video.srcObject = this.stream;
                this.video.play();
                this.isActive = true;
                
                // Show camera container
                const cameraContainer = document.getElementById('cameraContainer');
                if (cameraContainer) {
                    cameraContainer.classList.remove('hidden');
                }
                
                console.log('📹 Camera started successfully');
                return true;
            }
            
        } catch (error) {
            console.error('📹 Camera error:', error);
            this.showError('Camera access denied or not available');
            return false;
        }
    }

    async getUserMediaWithFallback() {
        const constraints = [
            // Try HD first
            {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            },
            // Fallback to standard
            {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            },
            // Fallback to any camera
            {
                video: true,
                audio: false
            }
        ];

        for (let i = 0; i < constraints.length; i++) {
            try {
                console.log(`📹 Trying camera constraint ${i + 1}`);
                const stream = await navigator.mediaDevices.getUserMedia(constraints[i]);
                console.log(`📹 Camera constraint ${i + 1} successful`);
                return stream;
            } catch (error) {
                console.warn(`📹 Camera constraint ${i + 1} failed:`, error);
                if (i === constraints.length - 1) {
                    throw error;
                }
            }
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
        
        this.isActive = false;
        
        // Hide camera container
        const cameraContainer = document.getElementById('cameraContainer');
        if (cameraContainer) {
            cameraContainer.classList.add('hidden');
        }
        
        console.log('📹 Camera stopped');
    }

    toggleCamera() {
        if (this.isActive) {
            this.stopCamera();
        } else {
            this.startCamera();
        }
    }

    capturePhoto() {
        if (!this.video || !this.isActive) {
            this.showError('Camera not active');
            return null;
        }

        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.width = this.video.videoWidth;
            canvas.height = this.video.videoHeight;
            
            context.drawImage(this.video, 0, 0);
            
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            console.log('📹 Photo captured');
            return photoData;
            
        } catch (error) {
            console.error('📹 Photo capture error:', error);
            this.showError('Failed to capture photo');
            return null;
        }
    }

    showError(message) {
        console.error('📹 Camera Error:', message);
        // You can implement a toast notification here
        alert(message);
    }

    // Get camera status
    isCameraActive() {
        return this.isActive;
    }

    // Get video element
    getVideoElement() {
        return this.video;
    }
}

// Initialize camera system when DOM is loaded
let cameraSystem;
document.addEventListener('DOMContentLoaded', function() {
    cameraSystem = new CameraSystem();
    
    // Add event listeners for camera button
    const cameraButton = document.getElementById('cameraButton');
    if (cameraButton) {
        cameraButton.addEventListener('click', function() {
            cameraSystem.toggleCamera();
        });
    }
    
    // Add event listener for photo capture
    const captureButton = document.getElementById('captureButton');
    if (captureButton) {
        captureButton.addEventListener('click', function() {
            const photo = cameraSystem.capturePhoto();
            if (photo) {
                // Handle the captured photo
                console.log('📹 Photo captured:', photo.substring(0, 50) + '...');
                // You can send this to the chat or save it
            }
        });
    }
});

// Export for use in other files
window.CameraSystem = CameraSystem;
window.cameraSystem = cameraSystem;
