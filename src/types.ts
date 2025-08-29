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