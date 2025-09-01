import { CollageGenerationRequest, CollageGenerationResponse, ApiResponse } from '../../contracts/api';

/**
 * Interface for collage generation service
 * Single Responsibility: Only handles collage creation
 */
export interface ICollageService {
  /**
   * Generate a collage from selected images
   * @param request - Collage generation configuration
   * @returns Promise with generated collage data
   */
  generateCollage(request: CollageGenerationRequest): Promise<ApiResponse<CollageGenerationResponse>>;

  /**
   * Get available layout templates
   * @returns Array of available layout options
   */
  getAvailableLayouts(): LayoutTemplate[];

  /**
   * Validate collage generation request
   * @param request - Request to validate
   * @returns Validation result
   */
  validateRequest(request: CollageGenerationRequest): ValidationResult;
}

/**
 * Layout template definition
 */
export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  maxImages: number;
  aspectRatio: number;
  preview?: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Collage service configuration
 */
export interface CollageServiceConfig {
  maxImageSize: number;
  supportedFormats: string[];
  defaultQuality: number;
  maxCanvasSize: number;
}