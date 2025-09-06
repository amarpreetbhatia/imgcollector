const AIImageService = require('../../server/services/AIImageService');
const logger = require('../../server/utils/logger');
const multer = require('multer');

// Configure multer for serverless
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware wrapper for serverless
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestId = Date.now().toString();

  try {
    // Handle multipart form data
    await runMiddleware(req, res, upload.single('userImage'));

    const { baseImageUrl, text, prompt, style } = req.body;

    logger.info('AI blend request received', {
      component: 'API',
      action: 'ai_blend_request',
      requestId,
      baseImageUrl,
      hasUserImage: !!req.file,
      hasText: !!text,
      hasPrompt: !!prompt,
      style
    });

    if (!baseImageUrl) {
      logger.warn('AI blend request missing base image URL', {
        component: 'API',
        action: 'validation_error',
        requestId
      });
      return res.status(400).json({
        success: false,
        error: 'Base image URL is required'
      });
    }

    const userImageBuffer = req.file ? req.file.buffer : null;
    const aiImageService = new AIImageService();

    const result = await aiImageService.blendImages(
      baseImageUrl,
      userImageBuffer,
      text,
      prompt,
      style,
      requestId
    );

    logger.info('AI blend response sent', {
      component: 'API',
      action: 'ai_blend_response',
      requestId,
      success: result.success
    });

    res.json(result);
  } catch (error) {
    logger.error('Blend Images API Error', error, {
      component: 'API',
      action: 'ai_blend_error',
      requestId
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Disable body parsing for multipart forms
export const config = {
  api: {
    bodyParser: false,
  },
};