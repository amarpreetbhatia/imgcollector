import { IAIImageService } from '../interfaces/IAIImageService';
import { BlendImageRequest, BlendImageResult } from '../../types';
import { HttpClient } from '../HttpClient';
import logger from '../../utils/logger';

interface AIImageResponse {
  imageBase64?: string;
  imageUrl?: string;
}

export class AIImageService implements IAIImageService {
  private httpClient: HttpClient;
  private baseUrl: string;

  constructor(httpClient: HttpClient, baseUrl: string) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
  }

  async blendImages(request: BlendImageRequest): Promise<BlendImageResult> {
    try {
      // Prepare additional data for the upload
      const additionalData: Record<string, any> = {
        baseImageUrl: request.baseImageUrl
      };
      
      if (request.text) {
        additionalData.text = request.text;
      }
      
      if (request.prompt) {
        additionalData.prompt = request.prompt;
      }
      
      if (request.style) {
        additionalData.style = request.style;
      }

      // Use uploadFile method if there's a user image, otherwise use post
      let response;
      if (request.userImage) {
        response = await this.httpClient.uploadFile<AIImageResponse>(
          '/api/ai/blend-images',
          request.userImage,
          additionalData
        );
      } else {
        response = await this.httpClient.post<AIImageResponse>('/api/ai/blend-images', additionalData);
      }

      if (response.success && response.data) {
        const data = response.data;
        // Convert base64 to blob if needed
        if (data.imageBase64) {
          const imageBlob = this.base64ToBlob(data.imageBase64, 'image/png');
          const imageUrl = URL.createObjectURL(imageBlob);
          
          return {
            success: true,
            imageBlob,
            imageUrl
          };
        }
        
        return {
          success: true,
          imageUrl: data.imageUrl
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to blend images'
      };
    } catch (error) {
      logger.error('AI Image Service - Blend Images Error', 'AIImageService', 'blendImages', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateImage(prompt: string, style?: string): Promise<BlendImageResult> {
    try {
      const response = await this.httpClient.post<AIImageResponse>('/api/ai/generate-image', {
        prompt,
        style: style || 'realistic'
      });

      if (response.success && response.data) {
        const data = response.data;
        // Convert base64 to blob if needed
        if (data.imageBase64) {
          const imageBlob = this.base64ToBlob(data.imageBase64, 'image/png');
          const imageUrl = URL.createObjectURL(imageBlob);
          
          return {
            success: true,
            imageBlob,
            imageUrl
          };
        }
        
        return {
          success: true,
          imageUrl: data.imageUrl
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to generate image'
      };
    } catch (error) {
      logger.error('AI Image Service - Generate Image Error', 'AIImageService', 'generateImage', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}