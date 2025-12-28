import Tesseract from 'tesseract.js';
import pdf2pic from 'pdf2pic';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temp directory for PDF conversions
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Extract text from an image file using Tesseract OCR
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export async function extractTextFromImage(imagePath) {
  try {
    console.log(`Starting OCR on image: ${imagePath}`);
    
    const result = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words.length,
      lines: result.data.lines.length
    };
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
}

/**
 * Convert PDF to images and extract text from each page
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} Combined OCR results from all pages
 */
export async function extractTextFromPDF(pdfPath) {
  try {
    console.log(`Starting PDF processing: ${pdfPath}`);
    
    // First, try to extract text directly from PDF (if it contains selectable text)
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    
    // If PDF has readable text, use it
    if (pdfData.text && pdfData.text.trim().length > 100) {
      console.log('PDF contains selectable text, using direct extraction');
      return {
        text: pdfData.text,
        confidence: 95, // High confidence for native text
        pages: pdfData.numpages,
        method: 'direct',
        words: pdfData.text.split(/\s+/).length,
        lines: pdfData.text.split('\n').length
      };
    }
    
    // If PDF is image-based or has minimal text, use OCR
    console.log('PDF appears to be image-based, converting to images for OCR');
    
    // Check if GraphicsMagick is available
    try {
      const { execSync } = require('child_process');
      execSync('gm version', { stdio: 'ignore' });
    } catch (error) {
      console.error('GraphicsMagick not found. Cannot process image-based PDFs.');
      return {
        text: pdfData.text || 'PDF text extraction requires GraphicsMagick. Please install it to process scanned PDFs.\n\nFor now, here is any text found in the PDF:\n' + (pdfData.text || 'No text found'),
        confidence: 50,
        pages: pdfData.numpages,
        processedPages: 0,
        method: 'partial',
        words: (pdfData.text || '').split(/\s+/).length,
        lines: (pdfData.text || '').split('\n').length,
        error: 'GraphicsMagick not installed. Install with: choco install graphicsmagick (Windows) or brew install graphicsmagick (Mac)'
      };
    }
    
    const options = {
      density: 300,           // DPI for conversion
      saveFilename: `pdf_${Date.now()}`,
      savePath: tempDir,
      format: 'png',
      width: 2000,
      height: 2000
    };

    const convert = pdf2pic.fromPath(pdfPath, options);
    
    // Get number of pages
    const pageCount = pdfData.numpages || 1;
    console.log(`Converting ${pageCount} page(s) to images...`);
    
    const allText = [];
    let totalConfidence = 0;
    let totalWords = 0;
    let totalLines = 0;
    let convertedPages = 0;

    // Process each page (limit to first 5 pages to avoid long processing times)
    const pagesToProcess = Math.min(pageCount, 5);
    
    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${pagesToProcess}...`);
        
        // Convert page to image
        const page = await convert(pageNum, { responseType: 'image' });
        
        if (!page || !page.path) {
          throw new Error('Page conversion failed - no image generated');
        }
        
        const imagePath = page.path;
        
        // Perform OCR on the image
        const ocrResult = await extractTextFromImage(imagePath);
        
        if (ocrResult.text && ocrResult.text.trim()) {
          allText.push(`--- Page ${pageNum} ---\n${ocrResult.text}`);
          totalConfidence += ocrResult.confidence;
          totalWords += ocrResult.words;
          totalLines += ocrResult.lines;
          convertedPages++;
        }
        
        // Clean up temporary image
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.warn(`Could not delete temp file: ${imagePath}`);
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError.message);
        allText.push(`--- Page ${pageNum} ---\n[Error: ${pageError.message}]`);
      }
    }

    const averageConfidence = convertedPages > 0 ? totalConfidence / convertedPages : 0;

    return {
      text: allText.join('\n\n'),
      confidence: averageConfidence,
      pages: pageCount,
      processedPages: convertedPages,
      method: 'ocr',
      words: totalWords,
      lines: totalLines
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`PDF OCR failed: ${error.message}`);
  }
}

/**
 * Analyze extracted text to find institution names and other metadata
 * @param {string} text - Extracted text content
 * @param {string} documentType - Type of document
 * @returns {Object} Analysis results
 */
export function analyzeExtractedText(text, documentType) {
  const analysis = {
    textLength: text.length,
    wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
    hasContent: text.trim().length > 50,
    confidence: 'low',
    detectedInstitution: null,
    detectedInfo: {}
  };

  // Set confidence based on text length
  if (analysis.wordCount > 100) {
    analysis.confidence = 'high';
  } else if (analysis.wordCount > 30) {
    analysis.confidence = 'medium';
  }

  // Common educational institution keywords
  const institutionKeywords = [
    'university', 'college', 'institute', 'school', 'academy',
    'विश्वविद्यालय', 'महाविद्यालय', 'संस्थान', // Hindi
    'IIT', 'NIT', 'IIIT', 'IIM', 'AIIMS'
  ];

  // Search for institution names (look for keywords followed by proper nouns)
  const lines = text.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    for (const keyword of institutionKeywords) {
      if (lowerLine.includes(keyword.toLowerCase())) {
        // Found a line with institution keyword
        const cleanLine = line.trim();
        if (cleanLine.length < 150) { // Reasonable institution name length
          analysis.detectedInstitution = cleanLine;
          break;
        }
      }
    }
    if (analysis.detectedInstitution) break;
  }

  // Extract document-specific information
  if (documentType === 'student_id') {
    // Look for ID number patterns
    const idPatterns = [
      /ID[\s:]+([A-Z0-9\-]+)/i,
      /Student\s+ID[\s:]+([A-Z0-9\-]+)/i,
      /Roll\s+No[\s:.]+([A-Z0-9\-]+)/i,
      /Enrollment[\s:]+([A-Z0-9\-]+)/i
    ];
    
    for (const pattern of idPatterns) {
      const match = text.match(pattern);
      if (match) {
        analysis.detectedInfo.studentId = match[1].trim();
        break;
      }
    }
  } else if (documentType === 'admission_letter') {
    // Look for admission year/session
    const yearPattern = /20\d{2}/g;
    const years = text.match(yearPattern);
    if (years && years.length > 0) {
      analysis.detectedInfo.admissionYear = years[0];
    }
    
    // Look for program/course
    const programKeywords = ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'BA', 'MA', 'BBA', 'MBA', 'B.E', 'M.E'];
    for (const program of programKeywords) {
      if (text.includes(program)) {
        analysis.detectedInfo.program = program;
        break;
      }
    }
  } else if (documentType === 'fee_receipt') {
    // Look for amount patterns
    const amountPatterns = [
      /₹\s*([0-9,]+)/,
      /Rs\.?\s*([0-9,]+)/i,
      /Amount[\s:]+([0-9,]+)/i,
      /Total[\s:]+([0-9,]+)/i
    ];
    
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        analysis.detectedInfo.amount = match[1].replace(/,/g, '');
        break;
      }
    }
    
    // Look for receipt/transaction number
    const receiptPatterns = [
      /Receipt[\s#:]+([A-Z0-9\-]+)/i,
      /Transaction[\s#:]+([A-Z0-9\-]+)/i,
      /Ref[\s#:]+([A-Z0-9\-]+)/i
    ];
    
    for (const pattern of receiptPatterns) {
      const match = text.match(pattern);
      if (match) {
        analysis.detectedInfo.receiptNumber = match[1].trim();
        break;
      }
    }
  }

  return analysis;
}

/**
 * Main function to extract text from any supported file format
 * @param {string} filePath - Path to the document
 * @param {string} documentType - Type of document
 * @returns {Promise<Object>} Complete extraction and analysis results
 */
export async function processDocument(filePath, documentType) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let ocrResult;

    console.log(`Processing document: ${filePath} (${ext})`);

    if (ext === '.pdf') {
      ocrResult = await extractTextFromPDF(filePath);
    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      ocrResult = await extractTextFromImage(filePath);
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }

    // Analyze the extracted text
    const analysis = analyzeExtractedText(ocrResult.text, documentType);

    return {
      success: true,
      extractedText: ocrResult.text,
      textLength: ocrResult.text.length,
      confidence: ocrResult.confidence,
      wordCount: analysis.wordCount,
      detectedInstitution: analysis.detectedInstitution,
      detectedInfo: analysis.detectedInfo,
      confidenceFlag: analysis.confidence,
      pages: ocrResult.pages || 1,
      method: ocrResult.method || 'ocr',
      processingTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing document:', error);
    return {
      success: false,
      error: error.message,
      extractedText: '',
      confidence: 0
    };
  }
}

/**
 * Clean up temporary files
 */
export function cleanupTempFiles() {
  try {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(tempDir, file));
        } catch (err) {
          console.warn(`Could not delete temp file: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
}

// Clean up temp files on process exit
process.on('exit', cleanupTempFiles);
process.on('SIGINT', () => {
  cleanupTempFiles();
  process.exit();
});
