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

export interface CollageOptions {
  width: number;
  height: number;
  layout: 'grid' | 'mosaic';
  backgroundColor: string;
  padding: number;
}

export interface CollageResult {
  success: boolean;
  imageBlob?: Blob;
  imageUrl?: string;
  error?: string;
}

export interface PrintOptions {
  size: 'small' | 'medium' | 'large'; // 12x18, 18x24, 24x36
  paperType: 'matte' | 'glossy';
  quantity: number;
}

export interface PrintOrderResult {
  success: boolean;
  orderId?: string;
  orderUrl?: string;
  estimatedCost?: number;
  error?: string;
}