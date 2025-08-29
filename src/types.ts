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