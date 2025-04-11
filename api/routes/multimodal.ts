import { Router, Request, Response } from 'express';
import openAIService from '../openai-service.js'; // Use .js extension
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { roleCheck } from '../auth.js'; // Use .js extension

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

// Set up multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', 'text/plain', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error: any = new Error(`Unsupported file type: ${file.mimetype}`);
      cb(error, false);
    }
  }
});

export const router = Router();

/**
 * Upload and analyze an image
 * @route POST /api/multimodal/analyze-image
 */
router.post('/analyze-image', roleCheck(['admin', 'staff', 'user']), upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    const prompt = req.body.prompt || '';

    const result = await openAIService.analyzeImage(imagePath, prompt);
    
    // Clean up the uploaded file after analysis
    await unlink(imagePath);
    
    res.json(result);
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

/**
 * Upload and analyze a map
 * @route POST /api/multimodal/analyze-map
 */
router.post('/analyze-map', roleCheck(['admin', 'staff']), upload.single('map'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No map file provided' });
    }

    const mapPath = req.file.path;
    const context = req.body.context || '';

    const result = await openAIService.analyzeMap(mapPath, context);
    
    // Clean up the uploaded file after analysis
    await unlink(mapPath);
    
    res.json(result);
  } catch (error) {
    console.error('Error analyzing map:', error);
    res.status(500).json({ error: 'Failed to analyze map' });
  }
});

/**
 * Analyze document text
 * @route POST /api/multimodal/analyze-document
 */
router.post('/analyze-document', roleCheck(['admin', 'staff', 'user']), async (req: Request, res: Response) => {
  try {
    const { text, documentType } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No document text provided' });
    }
    
    const result = await openAIService.analyzeDocument(text, documentType || 'document');
    res.json(result);
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

/**
 * Extract locations from text
 * @route POST /api/multimodal/extract-locations
 */
router.post('/extract-locations', roleCheck(['admin', 'staff', 'user']), async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    const result = await openAIService.extractLocationData(text);
    res.json(result);
  } catch (error) {
    console.error('Error extracting locations:', error);
    res.status(500).json({ error: 'Failed to extract locations' });
  }
});

/**
 * Generate a visualization
 * @route POST /api/multimodal/generate-visualization
 */
router.post('/generate-visualization', roleCheck(['admin', 'staff']), async (req: Request, res: Response) => {
  try {
    const { prompt, size } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }
    
    const imageUrl = await openAIService.generateVisualization(
      prompt, 
      size && ['1024x1024', '1024x1792', '1792x1024'].includes(size) ? size : '1024x1024'
    );
    
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error generating visualization:', error);
    res.status(500).json({ error: 'Failed to generate visualization' });
  }
});

export default router;