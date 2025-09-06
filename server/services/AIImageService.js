const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const sharp = require('sharp');
const logger = require('../utils/logger');
const { USER_AGENT } = require('../config/constants');

class AIImageService {
  constructor() {
    logger.info(`🔑 Google AI API Key: ${process.env.GOOGLE_AI_API_KEY ? 'Loaded' : 'Missing'}`);
    const genAI = process.env.GOOGLE_AI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY) : null;
    this.model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro-vision" }) : null;
  }

  async blendImages(baseImageUrl, userImageBuffer, text, prompt, style = 'realistic', requestId = 'unknown') {
    const startTime = Date.now();
    logger.logAIProcessStart(baseImageUrl, requestId);

    try {
      // Check if AI service is available
      if (!this.model) {
        logger.warn('AI service unavailable - missing API key', {
          component: 'AI',
          action: 'service_unavailable',
          requestId
        });
        return {
          success: false,
          error: 'Google AI API key not configured. Please add GOOGLE_AI_API_KEY to your environment variables.'
        };
      }
      
      // Download base image
      const baseImageResponse = await axios.get(baseImageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': USER_AGENT
        }
      });

      const baseImageBuffer = Buffer.from(baseImageResponse.data);

      // Process images with Sharp
      let processedBaseImage = await sharp(baseImageBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();

      let processedUserImage = null;
      if (userImageBuffer) {
        processedUserImage = await sharp(userImageBuffer)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer();
      }

      // Create prompt for AI
      let aiPrompt = this.buildBlendPrompt(text, prompt, style);

      // Prepare images for AI
      const imageParts = [
        {
          inlineData: {
            data: processedBaseImage.toString('base64'),
            mimeType: 'image/jpeg'
          }
        }
      ];

      if (processedUserImage) {
        imageParts.push({
          inlineData: {
            data: processedUserImage.toString('base64'),
            mimeType: 'image/jpeg'
          }
        });
      }

      // Note: Google's Gemini Pro Vision can analyze images but doesn't generate new images
      // For actual image generation, you would need to use Google's Imagen API
      // This is a placeholder implementation that would need the actual Imagen API

      // For demo purposes, return the base image as a "blended" result
      // In production, this would be replaced with actual AI image generation
      const duration = Date.now() - startTime;
      logger.logAIProcessComplete(true, duration, requestId);

      logger.info('AI blending completed (demo mode)', {
        component: 'AI',
        action: 'blend_complete_demo',
        requestId,
        baseImageUrl,
        hasUserImage: !!userImageBuffer,
        hasText: !!text,
        hasPrompt: !!prompt,
        style,
        duration: `${duration}ms`
      });

      return {
        success: true,
        imageUrl: baseImageUrl,
        message: 'Demo: Returning base image as AI-blended result. Actual AI generation requires Google Imagen API.'
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logAIProcessComplete(false, duration, requestId);

      logger.error('AI Image Blending Error', error, {
        component: 'AI',
        action: 'blend_error',
        requestId,
        baseImageUrl
      });

      return {
        success: false,
        error: error.message || 'Failed to blend images'
      };
    }
  }

  buildBlendPrompt(text, prompt, style) {
    let aiPrompt = `Create a ${style} style image that blends the provided images`;

    if (text) {
      aiPrompt += ` and includes the text "${text}"`;
    }

    if (prompt) {
      aiPrompt += `. Additional instructions: ${prompt}`;
    }

    aiPrompt += '. Make it visually appealing and cohesive.';

    return aiPrompt;
  }
}

module.exports = AIImageService;