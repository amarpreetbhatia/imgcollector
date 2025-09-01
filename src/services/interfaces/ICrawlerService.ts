import { CrawlRequest, CrawlResponse, ApiResponse } from '../../contracts/api';

/**
 * Interface Segregation Principle: 
 * Focused interface for image crawling functionality
 */
export interface ICrawlerService {
  /**
   * Crawl a website for images
   * @param request - Crawl configuration
   * @returns Promise with crawl results
   */
  crawlImages(request: CrawlRequest): Promise<ApiResponse<CrawlResponse>>;

  /**
   * Validate if a URL is crawlable
   * @param url - URL to validate
   * @returns boolean indicating if URL is valid
   */
  validateUrl(url: string): boolean;

  /**
   * Check if crawling is allowed by robots.txt
   * @param url - URL to check
   * @returns Promise<boolean> indicating if crawling is allowed
   */
  isAllowedByCrawlPolicy(url: string): Promise<boolean>;
}

/**
 * Configuration interface for crawler service
 */
export interface CrawlerConfig {
  maxImages: number;
  timeout: number;
  userAgent: string;
  respectRobotsTxt: boolean;
  maxDepth: number;
  concurrency: number;
}