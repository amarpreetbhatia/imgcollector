// Legacy crawler service - temporarily restored for immediate compatibility
// TODO: Migrate to new service architecture

import { CrawlResult } from '../types';

class ImageCrawler {
  async crawl(url: string): Promise<CrawlResult> {
    try {
      // Validate URL
      if (!this.validateUrl(url)) {
        return {
          images: [],
          error: 'Invalid URL provided',
        };
      }

      // Make request to backend crawler service
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      const apiUrl = process.env.REACT_APP_API_URL || (
        process.env.NODE_ENV === 'production' 
          ? window.location.origin 
          : 'http://localhost:3001'
      );
      const response = await fetch(`${apiUrl}/api/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        return {
          images: [],
          error: data.error,
        };
      }

      return {
        images: data.images || [],
      };

    } catch (error) {
      console.error('Crawling failed:', error);
      return {
        images: [],
        error: error instanceof Error ? error.message : 'Crawling failed',
      };
    }
  }

  private validateUrl(url: string): boolean {
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(normalizedUrl);
      
      return (
        (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
        urlObj.hostname.length > 0
      );
    } catch {
      return false;
    }
  }
}

export const imageCrawler = new ImageCrawler();