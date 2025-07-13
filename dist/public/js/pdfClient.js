class PDFClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.isAvailable = null;
  }

  async checkStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/pdf/status`);
      const data = await response.json();
      this.isAvailable = data.status === 'available';
      return data;
    } catch (error) {
      console.error('PDF service status check failed:', error);
      this.isAvailable = false;
      return { status: 'unavailable', error: error.message };
    }
  }

  async uploadAndParse(file, onProgress = null) {
    // Check if service is available first
    if (this.isAvailable === null) {
      await this.checkStatus();
    }

    if (!this.isAvailable) {
      throw new Error('PDF parsing service is not available');
    }

    try {
      // Convert file to base64
      const buffer = await this.fileToBase64(file);
      
      const response = await fetch(`${this.baseUrl}/api/pdf/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buffer })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PDF parsing failed');
      }

      const result = await response.json();
      
      if (onProgress) {
        onProgress(100);
      }

      return result;
    } catch (error) {
      console.error('PDF upload and parse failed:', error);
      throw error;
    }
  }

  async parseText(text) {
    try {
      const response = await fetch(`${this.baseUrl}/api/pdf/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Text parsing failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Text parsing failed:', error);
      throw error;
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data:application/pdf;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Fallback method for when PDF parsing is unavailable
  async fallbackTextExtraction(file) {
    // This could integrate with other services like:
    // - OCR services
    // - Alternative PDF libraries
    // - Cloud-based PDF processing
    
    throw new Error('PDF parsing unavailable and no fallback implemented');
  }
}

// Usage example
const pdfClient = new PDFClient();

// Export for use in your app
export default pdfClient;

// Example usage:
/*
// Check if service is available
const status = await pdfClient.checkStatus();
console.log('PDF Service Status:', status);

// Upload and parse a PDF file
const fileInput = document.getElementById('pdfFile');
const file = fileInput.files[0];

try {
  const result = await pdfClient.uploadAndParse(file, (progress) => {
    console.log(`Progress: ${progress}%`);
  });
  
  console.log('Parsed text:', result.data.text);
  console.log('Number of pages:', result.data.numPages);
} catch (error) {
  console.error('Failed to parse PDF:', error.message);
  // Show fallback UI or alternative options
}
*/ 
