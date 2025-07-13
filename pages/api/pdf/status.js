import pdfHandler from '../../../lib/pdfHandler';

export default async function handler(req, res) {
  try {
    const status = pdfHandler.getStatus();
    
    res.status(200).json({
      service: 'PDF Handler',
      status: status.available ? 'available' : 'unavailable',
      timestamp: status.timestamp,
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
      capabilities: {
        pdfParsing: status.available,
        fileUpload: true,
        textProcessing: true
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'PDF Handler',
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 
