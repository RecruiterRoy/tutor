let pdfParse;

// Lazy load pdf-parse only when needed
const loadPdfParser = async () => {
  if (!pdfParse) {
    try {
      pdfParse = require('pdf-parse');
      console.log('PDF parser loaded successfully');
    } catch (error) {
      console.error('Failed to load PDF parser:', error);
      throw new Error('PDF parsing is not available in this environment');
    }
  }
  return pdfParse;
};

class PDFHandler {
  constructor() {
    this.isAvailable = false;
    this.initializeParser();
  }

  async initializeParser() {
    try {
      await loadPdfParser();
      this.isAvailable = true;
    } catch (error) {
      console.warn('PDF parsing unavailable:', error.message);
      this.isAvailable = false;
    }
  }

  async parsePDFBuffer(buffer) {
    if (!this.isAvailable) {
      throw new Error('PDF parsing is not available');
    }

    try {
      const parser = await loadPdfParser();
      const data = await parser(buffer);
      
      return {
        text: data.text,
        numPages: data.numpages,
        info: data.info,
        metadata: data.metadata,
        version: data.version
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