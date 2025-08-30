import { ImageData, CollageOptions, CollageResult } from '../types';

class CollageService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
  }

  async generateCollage(
    selectedImages: ImageData[],
    options: CollageOptions = {
      width: 1200,
      height: 800,
      layout: 'grid',
      backgroundColor: '#ffffff',
      padding: 10
    }
  ): Promise<CollageResult> {
    try {
      if (selectedImages.length === 0) {
        return { success: false, error: 'No images selected' };
      }

      if (selectedImages.length > 5) {
        return { success: false, error: 'Maximum 5 images allowed' };
      }

      // Set canvas dimensions
      this.canvas.width = options.width;
      this.canvas.height = options.height;

      // Fill background
      this.ctx.fillStyle = options.backgroundColor;
      this.ctx.fillRect(0, 0, options.width, options.height);

      // Load all images
      const loadedImages = await this.loadImages(selectedImages);

      // Generate layout based on number of images
      const layout = this.calculateLayout(loadedImages.length, options);

      // Draw images
      await this.drawImages(loadedImages, layout, options);

      // Convert to blob and create URL for preview
      return new Promise((resolve) => {
        this.canvas.toBlob((blob) => {
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            resolve({ 
              success: true, 
              imageBlob: blob,
              imageUrl: imageUrl
            });
          } else {
            resolve({ success: false, error: 'Failed to generate collage image' });
          }
        }, 'image/png', 0.9);
      });

    } catch (error) {
      console.error('Collage generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async loadImages(imageData: ImageData[]): Promise<HTMLImageElement[]> {
    const loadPromises = imageData.map((data) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${data.url}`));
        img.src = data.url;
      });
    });

    return Promise.all(loadPromises);
  }

  private calculateLayout(imageCount: number, options: CollageOptions) {
    const { width, height, padding } = options;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

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

  private async drawImages(
    images: HTMLImageElement[],
    layout: Array<{ x: number; y: number; width: number; height: number }>,
    options: CollageOptions
  ) {
    for (let i = 0; i < images.length && i < layout.length; i++) {
      const img = images[i];
      const pos = layout[i];

      // Calculate aspect ratio and fit image
      const imgAspect = img.width / img.height;
      const boxAspect = pos.width / pos.height;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > boxAspect) {
        // Image is wider than box
        drawWidth = pos.width;
        drawHeight = pos.width / imgAspect;
        drawX = pos.x;
        drawY = pos.y + (pos.height - drawHeight) / 2;
      } else {
        // Image is taller than box
        drawWidth = pos.height * imgAspect;
        drawHeight = pos.height;
        drawX = pos.x + (pos.width - drawWidth) / 2;
        drawY = pos.y;
      }

      // Draw image with rounded corners
      this.drawRoundedImage(img, drawX, drawY, drawWidth, drawHeight, 8);
    }
  }

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

  downloadCollage(blob: Blob, filename: string = 'collage.png') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const collageService = new CollageService();