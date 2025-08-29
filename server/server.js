const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const robotsParser = require('robots-parser');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const MAX_IMAGES = 50;
const MAX_TIME_MS = 3 * 60 * 1000; // 3 minutes
const USER_AGENT = 'ImageCrawlerBot/1.0';

class ImageCrawler {
  constructor() {
    this.startTime = 0;
    this.foundImages = new Set();
    this.visitedUrls = new Set();
  }

  async crawl(startUrl) {
    this.startTime = Date.now();
    this.foundImages.clear();
    this.visitedUrls.clear();

    try {
      const normalizedUrl = this.normalizeUrl(startUrl);
      const images = [];
      
      // Check robots.txt for the main domain
      const robotsAllowed = await this.checkRobotsTxt(normalizedUrl);
      if (!robotsAllowed) {
        return {
          images: [],
          error: 'Crawling not allowed by robots.txt'
        };
      }

      // Crawl the main URL
      await this.crawlUrl(normalizedUrl, images, 0);

      return { images };
    } catch (error) {
      console.error('Crawl error:', error);
      return {
        images: [],
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async crawlUrl(url, images, depth) {
    if (this.shouldStop() || this.visitedUrls.has(url) || depth > 1) {
      return;
    }

    this.visitedUrls.add(url);
    console.log(`Crawling: ${url} (depth: ${depth})`);

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': USER_AGENT,
        },
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // Extract images from current page
      this.extractImages($, url, images);

      // If we're at depth 0, crawl one level deeper
      if (depth === 0) {
        const links = this.extractLinks($, url);
        
        for (const link of links.slice(0, 10)) { // Limit to 10 links
          if (this.shouldStop()) break;
          
          const robotsAllowed = await this.checkRobotsTxt(link);
          if (robotsAllowed) {
            await this.crawlUrl(link, images, depth + 1);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to crawl ${url}:`, error.message);
    }
  }

  extractImages($, sourceUrl, images) {
    $('img').each((_, element) => {
      if (this.shouldStop()) return false;

      const src = $(element).attr('src');
      if (!src) return;

      const absoluteUrl = this.resolveUrl(src, sourceUrl);
      if (absoluteUrl && !this.foundImages.has(absoluteUrl)) {
        // Filter out very small images and common non-content images
        const width = $(element).attr('width');
        const height = $(element).attr('height');
        const alt = $(element).attr('alt') || '';
        
        // Skip tiny images, tracking pixels, and common UI elements
        if (width && height && (parseInt(width) < 50 || parseInt(height) < 50)) {
          return;
        }
        
        if (alt.toLowerCase().includes('pixel') || 
            absoluteUrl.includes('tracking') ||
            absoluteUrl.includes('analytics') ||
            absoluteUrl.includes('beacon')) {
          return;
        }

        this.foundImages.add(absoluteUrl);
        
        images.push({
          url: absoluteUrl,
          sourceUrl,
          alt: alt
        });

        console.log(`Found image: ${absoluteUrl}`);
      }
    });
  }

  extractLinks($, baseUrl) {
    const links = [];
    const baseDomain = new URL(baseUrl).hostname;

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      const rel = $(element).attr('rel');
      
      // Respect nofollow
      if (rel && rel.includes('nofollow')) {
        return;
      }

      if (href) {
        const absoluteUrl = this.resolveUrl(href, baseUrl);
        if (absoluteUrl) {
          try {
            const linkDomain = new URL(absoluteUrl).hostname;
            // Only follow links within the same domain
            if (linkDomain === baseDomain && !this.visitedUrls.has(absoluteUrl)) {
              links.push(absoluteUrl);
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
      }
    });

    return links;
  }

  async checkRobotsTxt(url) {
    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const response = await axios.get(robotsUrl, {
        timeout: 5000,
        headers: { 'User-Agent': USER_AGENT }
      });
      
      const robots = robotsParser(robotsUrl, response.data);
      const urlPath = new URL(url).pathname;
      
      return robots.isAllowed(USER_AGENT, urlPath) !== false;
    } catch (error) {
      // If robots.txt doesn't exist or can't be fetched, assume crawling is allowed
      return true;
    }
  }

  shouldStop() {
    return (
      this.foundImages.size >= MAX_IMAGES ||
      Date.now() - this.startTime >= MAX_TIME_MS
    );
  }

  normalizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }

  resolveUrl(url, base) {
    try {
      return new URL(url, base).toString();
    } catch {
      return null;
    }
  }
}

// API endpoint
app.post('/api/crawl', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  console.log(`Starting crawl for: ${url}`);
  
  const crawler = new ImageCrawler();
  const result = await crawler.crawl(url);
  
  console.log(`Crawl completed. Found ${result.images.length} images`);
  
  res.json(result);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Image Crawler Server running on port ${PORT}`);
});