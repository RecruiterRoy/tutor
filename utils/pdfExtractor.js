// Save this in your project
import { getDocument } from 'pdfjs-dist/build/pdf.mjs';

export async function extractPDFText(pdfFile) {
  const pdf = await getDocument(pdfFile).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}