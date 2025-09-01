export interface ImageData {
  url: string;
  sourceUrl: string;
  alt?: string;
}

export interface CrawlResult {
  images: ImageData[];
  error?: string;
}

export interface RobotsTxt {
  isAllowed: (userAgent: string, path: string) => boolean;
}

export interface DownloadProgress {
  current: number;
  total: number;
  percentage: number;
  message: string;
}

export interface DownloadResult {
  success: boolean;
  zipBlob?: Blob;
  downloadedCount?: number;
  totalCount?: number;
  error?: string;
}

export interface TextCustomization {
  text: string;
  color: string;
  template: 'top-center' | 'bottom-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  fontSize: number;
  fontFamily: string;
}

export interface CollageOptions {
  width: number;
  height: number;
  layout: 'grid' | 'mosaic';
  backgroundColor: string;
  padding: number;
  textCustomization?: TextCustomization;
}

export interface CollageResult {
  success: boolean;
  imageBlob?: Blob;
  imageUrl?: string;
  error?: string;
}

export interface PrintOptions {
  productType: 'poster' | 'tshirt' | 'hoodie' | 'mug' | 'canvas' | 'phonecase' | 'totebag' | 'pillow' | 'sticker';
  size: string; // Dynamic based on product type
  color?: string; // For apparel
  material?: string; // matte, glossy, cotton, etc.
  quantity: number;
  placement?: 'front' | 'back' | 'both'; // For apparel
}

export interface ProductVariant {
  id: number;
  name: string;
  size: string;
  color?: string;
  price: number;
  image?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  variants: ProductVariant[];
  placement?: ('front' | 'back' | 'both')[];
  sizeGuide?: string;
}

export interface PrintOrderResult {
  success: boolean;
  orderId?: string;
  orderUrl?: string;
  estimatedCost?: number;
  error?: string;
}