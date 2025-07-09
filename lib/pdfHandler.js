let pdfjsLib;

// Lazy load pdfjs-dist only when needed
const loadPdfJs = async () => {
  if (!pdfjsLib) {
    try {
      // Set up Node.js environment for pdfjs-dist
      const { createCanvas } = await import('canvas');
      global.DOMMatrix = class DOMMatrix {
        constructor(matrix) {
          this.a = matrix?.[0] || 1;
          this.b = matrix?.[1] || 0;
          this.c = matrix?.[2] || 0;
          this.d = matrix?.[3] || 1;
          this.e = matrix?.[4] || 0;
          this.f = matrix?.[5] || 0;
        }
      };
      
      pdfjsLib = await import('pdfjs-dist');
      // Use Node.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = false;
      console.log('PDF.js loaded successfully with Node.js polyfills');
    } catch (error) {
      console.error('Failed to load PDF.js:', error);
      throw new Error('PDF parsing is not available in this environment');
    }
  }
  return pdfjsLib;
};

class PDFHandler {
  constructor() {
    this.isAvailable = false;
    this.initializeParser();
  }

  async initializeParser() {
    try {
      await loadPdfJs();
      this.isAvailable = true;
      console.log('PDF Handler initialized successfully');
    } catch (error) {
      console.warn('PDF parsing unavailable:', error.message);
      this.isAvailable = false;
      // Don't throw error, just mark as unavailable
    }
  }

  async parsePDFBuffer(buffer) {
    if (!this.isAvailable) {
      throw new Error('PDF parsing is not available');
    }

    try {
      const pdfjs = await loadPdfJs();
      
      // Load the PDF document
      const loadingTask = pdfjs.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return {
        text: fullText.trim(),
        numPages: pdf.numPages,
        info: pdf.documentInfo || {},
        metadata: pdf.metadata || {},
        version: pdfjs.version
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  async parsePDFFile(filePath) {
    if (!this.isAvailable) {
      throw new Error('PDF parsing is not available');
    }

    try {
      const fs = require('fs');
      const buffer = fs.readFileSync(filePath);
      return await this.parsePDFBuffer(buffer);
    } catch (error) {
      console.error('PDF file parsing error:', error);
      throw new Error(`Failed to parse PDF file: ${error.message}`);
    }
  }

  // Alternative method using different library
  async parsePDFWithAlternative(buffer) {
    try {
      // Use pdf2pic or similar as backup
      const pdf2pic = require('pdf2pic');
      // Implementation depends on your needs
      throw new Error('Alternative PDF parsing not implemented yet');
    } catch (error) {
      throw new Error('No PDF parsing methods available');
    }
  }

  getStatus() {
    return {
      available: this.isAvailable,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
const pdfHandler = new PDFHandler();

export default pdfHandler; 