import { ICrawlerService, CrawlerConfig } from '../interfaces/ICrawlerService';
import { CrawlRequest, CrawlResponse, ApiResponse, API_ENDPOINTS } from '../../contracts/api';
import { HttpClient } from '../HttpClient';

/**
 * Crawler Service Implementation
 * Single Responsibility: Handle image crawling operations
 */
export class CrawlerService implements ICrawlerService {
  private httpClient: HttpClient;
  private config: CrawlerConfig;

  constructor(httpClient: HttpClient, config: CrawlerConfig) {
    this.httpClient = httpClient;
    this.config = config;
  }

  /**
   * Crawl images from a website
   */
  async crawlImages(request: CrawlRequest): Promise<ApiResponse<CrawlResponse>> {
    // Validate URL before making request
    if (!this.validateUrl(request.url)) {
      return {
        success: false,
        error: 'Invalid URL provided',
        timestamp: new Date().toISOString(),
      };
    }

    // Check robots.txt if configured
    if (this.config.respectRobotsTxt) {
      const isAllowed = await this.isAllowedByCrawlPolicy(request.url);
      if (!isAllowed) {
        return {
          success: false,
          error: 'Crawling not allowed by robots.txt',
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Prepare request with defaults
    const crawlRequest: CrawlRequest = {
      url: request.url,
      maxImages: request.maxImages || this.config.maxImages,
      timeout: request.timeout || this.config.timeout,
    };

    try {
      return await this.httpClient.post<CrawlResponse>(
        API_ENDPOINTS.CRAWL,
        crawlRequest
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Crawling failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(normalizedUrl);
      
      // Basic validation rules
      return (
        (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
        urlObj.hostname.length > 0 &&
        !urlObj.hostname.includes('localhost') && // Security: prevent localhost access
        !this.isPrivateIP(urlObj.hostname)
      );
    } catch {
      return false;
    }
  }

  /**
   * Check robots.txt compliance
   */
  async isAllowedByCrawlPolicy(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      
      const response = await fetch(robotsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.config.userAgent,
        },
      });

      if (!response.ok) {
        // If robots.txt doesn't exist, assume crawling is allowed
        return true;
      }

      const robotsText = await response.text();
      return this.parseRobotsTxt(robotsText, this.config.userAgent);
    } catch {
      // If we can't check robots.txt, assume it's allowed
      return true;
    }
  }

  /**
   * Parse robots.txt content
   */
  private parseRobotsTxt(robotsText: string, userAgent: string): boolean {
    const lines = robotsText.split('\n').map(line => line.trim());
    let currentUserAgent = '';
    let isRelevantSection = false;

    for (const line of lines) {
      if (line.startsWith('User-agent:')) {
        currentUserAgent = line.substring(11).trim();
        isRelevantSection = currentUserAgent === '*' || currentUserAgent === userAgent;
      } else if (isRelevantSection && line.startsWith('Disallow:')) {
        const disallowPath = line.substring(9).trim();
        if (disallowPath === '/' || disallowPath === '') {
          return false; // Crawling disallowed
        }
      }
    }

    return true; // Default to allowed
  }

  /**
   * Check if hostname is a private IP
   */
  private isPrivateIP(hostname: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
    ];

    return privateRanges.some(range => range.test(hostname));
  }
}

/**
 * Factory function to create crawler service with default config
 */
export function createCrawlerService(httpClient: HttpClient): CrawlerService {
  const defaultConfig: CrawlerConfig = {
    maxImages: 50,
    timeout: 30000,
    userAgent: 'CollageForge/1.0 (+https://collageforge.com)',
    respectRobotsTxt: true,
    maxDepth: 2,
    concurrency: 5,
  };

  return new CrawlerService(httpClient, defaultConfig);
}