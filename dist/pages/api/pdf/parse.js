import pdfHandler from '../../../lib/pdfHandler';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    const { buffer, filePath, text } = req.body;

    // Check if PDF handler is available
    const status = pdfHandler.getStatus();
    if (!status.available) {
      return res.status(503).json({
        error: 'PDF parsing unavailable',
        message: 'PDF parsing service is not available in this environment',
        fallback: 'Please try uploading a text file instead'
      });
    }

    let result;

    if (buffer) {
      // Parse from buffer (uploaded file)
      const bufferData = Buffer.from(buffer, 'base64');
      result = await pdfHandler.parsePDFBuffer(bufferData);
    } else if (filePath) {
      // Parse from file path (server-side file)
      result = await pdfHandler.parsePDFFile(filePath);
    } else if (text) {
      // Fallback: just return the text as-is
      result = { text, numPages: 1, source: 'text-input' };
    } else {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Please provide buffer, filePath, or text'
      });
    }

    // Return parsed result
    res.status(200).json({
      success: true,
      data: {
        text: result.text,
        numPages: result.numPages,
        wordCount: result.text.split(/\s+/).length,
        charCount: result.text.length,
        processed: true,
        timestamp: new Date().toISOString()
      },
      metadata: {
        info: result.info,
        version: result.version
      }
    });

  } catch (error) {
    console.error('PDF parsing API error:', error);
    
    res.status(500).json({
      error: 'PDF parsing failed',
      message: error.message,
      fallback: 'Please try uploading a text file or try again later',
      timestamp: new Date().toISOString()
    });
  }
}

// Important: Configure this for larger PDF files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 
