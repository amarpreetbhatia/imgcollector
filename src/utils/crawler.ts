import { CrawlResult } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ImageCrawler {
  async crawl(startUrl: string): Promise<CrawlResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: startUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          images: [],
          error: 'Unable to connect to the crawling server. Please make sure the backend server is running on port 3001.'
        };
      }

      return {
        images: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const imageCrawler = new ImageCrawler();