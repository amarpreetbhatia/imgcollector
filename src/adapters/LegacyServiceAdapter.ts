/**
 * Legacy Service Adapter
 * Provides backward compatibility for existing components
 * Gradually migrate components to use new service architecture
 */

import { getServices } from '../services/ServiceInitializer';
import { ImageData, CrawlResult, CollageOptions, CollageResult, TextCustomization } from '../types';
import { 
  CrawlRequest, 
  CollageGenerationRequest, 
  ImageMetadata,
  CollageConfiguration,
  TextConfiguration 
} from '../contracts/api';

/**
 * Legacy Crawler Adapter
 * Maintains existing imageCrawler interface
 */
export class LegacyCrawlerAdapter {
  async crawl(url: string): Promise<CrawlResult> {
    try {
      const services = getServices();
      const request: CrawlRequest = { url };
      
      const response = await services.crawler.crawlImages(request);
      
      if (response.success && response.data) {
        return {
          images: response.data.images.map(this.mapImageMetadataToLegacy),
        };
      } else {
        return {
          images: [],
          error: response.error || 'Crawling failed',
        };
      }
    } catch (error) {
      return {
        images: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private mapImageMetadataToLegacy(metadata: ImageMetadata): ImageData {
    return {
      url: metadata.url,
      sourceUrl: metadata.sourceUrl,
      alt: metadata.alt,
    };
  }
}

/**
 * Legacy Collage Service Adapter
 * Maintains existing collageService interface
 */
export class LegacyCollageAdapter {
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
      const services = getServices();
      
      // Map legacy types to new contracts
      const request: CollageGenerationRequest = {
        images: selectedImages.map(this.mapLegacyToImageMetadata),
        options: this.mapLegacyToCollageConfig(options),
        textCustomization: options.textCustomization ? 
          this.mapLegacyToTextConfig(options.textCustomization) : undefined,
      };

      const response = await services.collage.generateCollage(request);

      if (response.success && response.data) {
        // For client-side generation, we need to create a blob from the URL
        const imageResponse = await fetch(response.data.imageUrl);
        const imageBlob = await imageResponse.blob();
        
        return {
          success: true,
          imageBlob,
          imageUrl: response.data.imageUrl,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Collage generation failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  downloadCollage(blob: Blob, filename: string = 'collage.png'): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private mapLegacyToImageMetadata(legacy: ImageData): ImageMetadata {
    return {
      url: legacy.url,
      sourceUrl: legacy.sourceUrl,
      alt: legacy.alt,
    };
  }

  private mapLegacyToCollageConfig(legacy: CollageOptions): CollageConfiguration {
    return {
      width: legacy.width,
      height: legacy.height,
      layout: legacy.layout as any,
      backgroundColor: legacy.backgroundColor,
      padding: legacy.padding,
    };
  }

  private mapLegacyToTextConfig(legacy: TextCustomization): TextConfiguration {
    return {
      text: legacy.text,
      color: legacy.color,
      template: legacy.template,
      fontSize: legacy.fontSize,
      fontFamily: legacy.fontFamily,
    };
  }
}

// Export singleton instances for backward compatibility
export const imageCrawler = new LegacyCrawlerAdapter();
export const collageService = new LegacyCollageAdapter();