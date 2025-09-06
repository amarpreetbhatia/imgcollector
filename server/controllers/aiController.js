const AIImageService = require('../services/AIImageService');
const logger = require('../utils/logger');

class AIController {
  constructor() {
    this.aiImageService = new AIImageService();
  }

  async blendImages(req, res) {
    const requestId = req.requestId;

    try {
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

      const result = await this.aiImageService.blendImages(
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

  async generateImage(req, res) {
    try {
      const { prompt, style } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required'
        });
      }

      // This would use Google's Imagen API for actual image generation
      // For now, return a placeholder response
      res.json({
        success: false,
        error: 'Image generation requires Google Imagen API access. This feature is currently in development.'
      });
    } catch (error) {
      logger.error('Generate Image API Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new AIController();