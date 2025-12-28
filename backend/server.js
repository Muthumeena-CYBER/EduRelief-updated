import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { processDocument, cleanupTempFiles } from './ocrProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `document-${uniqueSuffix}${ext}`);
  }
});

// File filter - accept only PDF, JPG, PNG
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();
  
  if (allowedTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
  }
};

// Configure multer with 5MB limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Document upload endpoint
app.post('/api/documents/upload', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentType, userId, campaignId } = req.body;

    // Validate required fields
    if (!documentType || !userId) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Document type and user ID are required'
      });
    }

    // Validate document type
    const validTypes = ['student_id', 'admission_letter', 'fee_receipt'];
    if (!validTypes.includes(documentType)) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    // Return success response with file details
    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        documentType: documentType,
        userId: userId,
        campaignId: campaignId || null,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
});

// Get uploaded documents for a user
app.get('/api/documents/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // This is a placeholder - in production, you would query a database
    // For now, we'll just return a success message
    res.status(200).json({
      success: true,
      message: 'Documents retrieved successfully',
      data: []
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
});

// OCR text extraction endpoint
app.post('/api/documents/extract-text', async (req, res) => {
  try {
    const { filePath, documentType } = req.body;

    // Validate required fields
    if (!filePath || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'filePath and documentType are required'
      });
    }

    // Validate document type
    const validTypes = ['student_id', 'admission_letter', 'fee_receipt'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.log(`Starting OCR extraction for: ${filePath}`);
    
    // Process the document with OCR
    const result = await processDocument(filePath, documentType);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Text extracted successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'OCR extraction failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('OCR extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during text extraction',
      error: error.message
    });
  }
});

// Serve uploaded files (for viewing)
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${uploadsDir}`);
});
