// API Contract Definitions - Shared between frontend and backend
// This file defines the contract that both services must adhere to

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface CrawlRequest {
  url: string;
  maxImages?: number;
  timeout?: number;
}

export interface CrawlResponse {
  images: ImageMetadata[];
  sourceUrl: string;
  crawledAt: string;
  totalFound: number;
}

export interface ImageMetadata {
  url: string;
  sourceUrl: string;
  alt?: string;
  width?: number;
  height?: number;
  size?: number;
  format?: string;
}

export interface CollageGenerationRequest {
  images: ImageMetadata[];
  options: CollageConfiguration;
  textCustomization?: TextConfiguration;
}

export interface CollageConfiguration {
  width: number;
  height: number;
  layout: LayoutType;
  backgroundColor: string;
  padding: number;
  quality?: number;
}

export interface TextConfiguration {
  text: string;
  color: string;
  template: TextPosition;
  fontSize: number;
  fontFamily: string;
}

export interface CollageGenerationResponse {
  imageUrl: string;
  downloadUrl: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export interface PrintOrderRequest {
  collageUrl: string;
  productType: ProductType;
  variant: ProductVariant;
  customerInfo: CustomerInformation;
  shippingAddress: Address;
}

export interface PrintOrderResponse {
  orderId: string;
  orderUrl: string;
  estimatedCost: number;
  estimatedDelivery: string;
  trackingInfo?: TrackingInformation;
}

// Enums for type safety
export type LayoutType = 'grid' | 'mosaic' | 'freeform';
export type TextPosition = 'top-center' | 'bottom-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type ProductType = 'poster' | 'tshirt' | 'hoodie' | 'mug' | 'canvas' | 'phonecase' | 'totebag' | 'pillow' | 'sticker';

export interface ProductVariant {
  id: string;
  name: string;
  size: string;
  color?: string;
  price: number;
  currency: string;
}

export interface CustomerInformation {
  name: string;
  email: string;
  phone?: string;
}

export interface Address {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface TrackingInformation {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
}

// API Endpoints - Contract for both services
export const API_ENDPOINTS = {
  CRAWL: '/api/crawl',
  COLLAGE: '/api/collage/generate',
  PRINT: '/api/print/order',
  HEALTH: '/api/health',
} as const;

// Error Codes - Standardized across services
export const ERROR_CODES = {
  INVALID_URL: 'INVALID_URL',
  CRAWL_FAILED: 'CRAWL_FAILED',
  NO_IMAGES_FOUND: 'NO_IMAGES_FOUND',
  COLLAGE_GENERATION_FAILED: 'COLLAGE_GENERATION_FAILED',
  PRINT_SERVICE_ERROR: 'PRINT_SERVICE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;