import { BlendImageRequest, BlendImageResult } from '../../types';

export interface IAIImageService {
  blendImages(request: BlendImageRequest): Promise<BlendImageResult>;
  generateImage(prompt: string, style?: string): Promise<BlendImageResult>;
}