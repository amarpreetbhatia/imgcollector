import { 
  ICollageService, 
  LayoutTemplate, 
  ValidationResult, 
  CollageServiceConfig 
} from '../interfaces/ICollageService';
import { 
  CollageGenerationRequest, 
  CollageGenerationResponse, 
  ApiResponse,
  TextConfiguration 
} from '../../contracts/api';

/**
 * Collage Service Implementation
 * Single Responsibility: Handle collage generation
 * Open/Closed: Extensible for new layout algorithms
 */
export class CollageService implements ICollageService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: CollageServiceConfig;

  constructor(config: CollageServiceConfig) {
    this.config = config;
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
  }

  /**
   * Generate collage from images
   */
  async generateCollage(request: CollageGenerationRequest): Promise<ApiResponse<CollageGenerationResponse>> {
    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          timestamp: new Date().toISOString(),
        };
      }

      // Set canvas dimensions
      this.canvas.width = request.options.width;
      this.canvas.height = request.options.height;

      // Clear canvas with background color
      this.ctx.fillStyle = request.options.backgroundColor;
      this.ctx.fillRect(0, 0, request.options.width, request.options.height);

      // Load images
      const loadedImages = await this.loadImages(request.images);

      // Generate layout
      const layout = this.calculateLayout(
        loadedImages.length, 
        request.options
      );

      // Draw images
      await this.drawImages(loadedImages, layout, request.options);

      // Draw text if provided
      if (request.textCustomization?.text) {
        this.drawText(request.textCustomization, request.options);
      }

      // Convert to blob and create response
      const result = await this.canvasToBlob();
      
      return {
        success: true,
        data: {
          imageUrl: result.imageUrl,
          downloadUrl: result.imageUrl, // Same for client-side generation
          metadata: {
            width: request.options.width,
            height: request.options.height,
            format: 'image/png',
            size: result.blob.size,
          },
        },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Collage generation failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get available layout templates
   */
  getAvailableLayouts(): LayoutTemplate[] {
    return [
      {
        id: 'grid',
        name: 'Grid Layout',
        description: 'Evenly distributed grid pattern',
        maxImages: 5,
        aspectRatio: 1.5,
      },
      {
        id: 'mosaic',
        name: 'Mosaic Layout',
        description: 'Artistic mosaic arrangement',
        maxImages: 5,
        aspectRatio: 1.5,
      },
      {
        id: 'freeform',
        name: 'Freeform Layout',
        description: 'Creative free-form arrangement',
        maxImages: 5,
        aspectRatio: 1.5,
      },
    ];
  }

  /**
   * Validate collage generation request
   */
  validateRequest(request: CollageGenerationRequest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate images
    if (!request.images || request.images.length === 0) {
      errors.push('At least one image is required');
    }

    if (request.images.length > 5) {
      errors.push('Maximum 5 images allowed');
    }

    // Validate dimensions
    if (request.options.width > this.config.maxCanvasSize || 
        request.options.height > this.config.maxCanvasSize) {
      errors.push(`Canvas size exceeds maximum of ${this.config.maxCanvasSize}px`);
    }

    // Validate text customization
    if (request.textCustomization?.text) {
      if (request.textCustomization.text.length > 50) {
        errors.push('Text must be 50 characters or less');
      }
      if (request.textCustomization.fontSize < 12 || request.textCustomization.fontSize > 72) {
        warnings.push('Font size should be between 12 and 72 pixels');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Load images with error handling
   */
  private async loadImages(imageData: any[]): Promise<HTMLImageElement[]> {
    const loadPromises = imageData.map((data, index) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          // Validate image size
          if (img.naturalWidth * img.naturalHeight > this.config.maxImageSize) {
            reject(new Error(`Image ${index + 1} is too large`));
          } else {
            resolve(img);
          }
        };
        
        img.onerror = () => reject(new Error(`Failed to load image ${index + 1}`));
        img.src = data.url;
      });
    });

    return Promise.all(loadPromises);
  }

  /**
   * Calculate layout positions for images
   */
  private calculateLayout(imageCount: number, options: any) {
    const { width, height, padding } = options;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    // Layout strategy based on image count
    switch (imageCount) {
      case 1:
        return [{
          x: padding,
          y: padding,
          width: availableWidth,
          height: availableHeight
        }];

      case 2:
        const halfWidth = (availableWidth - padding) / 2;
        return [
          { x: padding, y: padding, width: halfWidth, height: availableHeight },
          { x: padding + halfWidth + padding, y: padding, width: halfWidth, height: availableHeight }
        ];

      case 3:
        const thirdWidth = (availableWidth - padding * 2) / 3;
        return [
          { x: padding, y: padding, width: thirdWidth, height: availableHeight },
          { x: padding + thirdWidth + padding, y: padding, width: thirdWidth, height: availableHeight },
          { x: padding + (thirdWidth + padding) * 2, y: padding, width: thirdWidth, height: availableHeight }
        ];

      case 4:
        const quarterWidth = (availableWidth - padding) / 2;
        const quarterHeight = (availableHeight - padding) / 2;
        return [
          { x: padding, y: padding, width: quarterWidth, height: quarterHeight },
          { x: padding + quarterWidth + padding, y: padding, width: quarterWidth, height: quarterHeight },
          { x: padding, y: padding + quarterHeight + padding, width: quarterWidth, height: quarterHeight },
          { x: padding + quarterWidth + padding, y: padding + quarterHeight + padding, width: quarterWidth, height: quarterHeight }
        ];

      case 5:
        const topWidth = (availableWidth - padding) / 2;
        const topHeight = (availableHeight - padding) / 2;
        const bottomWidth = (availableWidth - padding * 2) / 3;
        const bottomHeight = availableHeight - topHeight - padding;
        return [
          { x: padding, y: padding, width: topWidth, height: topHeight },
          { x: padding + topWidth + padding, y: padding, width: topWidth, height: topHeight },
          { x: padding, y: padding + topHeight + padding, width: bottomWidth, height: bottomHeight },
          { x: padding + bottomWidth + padding, y: padding + topHeight + padding, width: bottomWidth, height: bottomHeight },
          { x: padding + (bottomWidth + padding) * 2, y: padding + topHeight + padding, width: bottomWidth, height: bottomHeight }
        ];

      default:
        return [];
    }
  }

  /**
   * Draw images on canvas
   */
  private async drawImages(images: HTMLImageElement[], layout: any[], options: any) {
    for (let i = 0; i < images.length && i < layout.length; i++) {
      const img = images[i];
      const pos = layout[i];

      // Calculate aspect ratio fit
      const imgAspect = img.width / img.height;
      const boxAspect = pos.width / pos.height;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > boxAspect) {
        drawWidth = pos.width;
        drawHeight = pos.width / imgAspect;
        drawX = pos.x;
        drawY = pos.y + (pos.height - drawHeight) / 2;
      } else {
        drawWidth = pos.height * imgAspect;
        drawHeight = pos.height;
        drawX = pos.x + (pos.width - drawWidth) / 2;
        drawY = pos.y;
      }

      // Draw with rounded corners
      this.drawRoundedImage(img, drawX, drawY, drawWidth, drawHeight, 8);
    }
  }

  /**
   * Draw image with rounded corners
   */
  private drawRoundedImage(
    img: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
    this.ctx.clip();
    this.ctx.drawImage(img, x, y, width, height);
    this.ctx.restore();
  }

  /**
   * Draw text overlay
   */
  private drawText(textConfig: TextConfiguration, options: any) {
    const { text, color, template, fontSize, fontFamily } = textConfig;
    const { width, height, padding } = options;

    // Set font properties
    this.ctx.font = `bold ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Add text shadow for readability
    this.ctx.shadowColor = color === '#FFFFFF' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;

    // Calculate position based on template
    const textMargin = padding + 20;
    let x: number, y: number;

    switch (template) {
      case 'top-center':
        x = width / 2;
        y = textMargin + fontSize / 2;
        break;
      case 'bottom-center':
        x = width / 2;
        y = height - textMargin - fontSize / 2;
        break;
      case 'top-left':
        this.ctx.textAlign = 'left';
        x = textMargin;
        y = textMargin + fontSize / 2;
        break;
      case 'top-right':
        this.ctx.textAlign = 'right';
        x = width - textMargin;
        y = textMargin + fontSize / 2;
        break;
      case 'bottom-left':
        this.ctx.textAlign = 'left';
        x = textMargin;
        y = height - textMargin - fontSize / 2;
        break;
      case 'bottom-right':
        this.ctx.textAlign = 'right';
        x = width - textMargin;
        y = height - textMargin - fontSize / 2;
        break;
      default:
        x = width / 2;
        y = height - textMargin - fontSize / 2;
    }

    // Draw background for text
    const textMetrics = this.ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    this.ctx.save();
    this.ctx.shadowColor = 'transparent';
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    
    let bgX = x - textWidth / 2 - 10;
    let bgY = y - textHeight / 2 - 5;
    let bgWidth = textWidth + 20;
    let bgHeight = textHeight + 10;

    if (this.ctx.textAlign === 'left') {
      bgX = x - 10;
    } else if (this.ctx.textAlign === 'right') {
      bgX = x - textWidth - 10;
    }

    this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
    this.ctx.restore();

    // Draw the text
    this.ctx.fillText(text, x, y);
    this.ctx.shadowColor = 'transparent';
  }

  /**
   * Convert canvas to blob and create URL
   */
  private canvasToBlob(): Promise<{ blob: Blob; imageUrl: string }> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          resolve({ blob, imageUrl });
        } else {
          reject(new Error('Failed to generate collage blob'));
        }
      }, 'image/png', this.config.defaultQuality);
    });
  }
}

/**
 * Factory function to create collage service
 */
export function createCollageService(): CollageService {
  const defaultConfig: CollageServiceConfig = {
    maxImageSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    defaultQuality: 0.9,
    maxCanvasSize: 4000,
  };

  return new CollageService(defaultConfig);
}