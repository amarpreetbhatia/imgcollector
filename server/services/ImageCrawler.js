const axios = require('axios');
const cheerio = require('cheerio');
const robotsParser = require('robots-parser');
const { URL } = require('url');
const logger = require('../utils/logger');
const { MAX_IMAGES, MAX_TIME_MS, USER_AGENT } = require('../config/constants');

class ImageCrawler {
  constructor() {
    this.startTime = 0;
    this.foundImages = new Set();
    this.visitedUrls = new Set();
  }

  async crawl(startUrl, requestId = 'unknown') {
    this.startTime = Date.now();
    this.foundImages.clear();
    this.visitedUrls.clear();

    logger.logCrawlStart(startUrl, requestId);

    try {
      const normalizedUrl = this.normalizeUrl(startUrl);
      const images = [];

      // Check robots.txt for the main domain
      const robotsAllowed = await this.checkRobotsTxt(normalizedUrl);
      if (!robotsAllowed) {
        logger.warn('Crawling blocked by robots.txt', {
          component: 'Crawler',
          action: 'robots_blocked',
          requestId,
          url: normalizedUrl
        });
        return {
          images: [],
          error: 'Crawling not allowed by robots.txt'
        };
      }

      // Crawl the main URL
      await this.crawlUrl(normalizedUrl, images, 0, requestId);

      const duration = Date.now() - this.startTime;
      logger.logCrawlComplete(startUrl, images.length, duration, requestId);

      return { images };
    } catch (error) {
      logger.logCrawlError(startUrl, error, requestId);
      return {
        images: [],
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async crawlUrl(url, images, depth, requestId = 'unknown') {
    if (this.shouldStop() || this.visitedUrls.has(url) || depth > 1) {
      return;
    }

    this.visitedUrls.add(url);
    logger.debug(`Crawling URL: ${url} (depth: ${depth})`, {
      component: 'Crawler',
      action: 'crawl_url',
      requestId,
      url,
      depth
    });

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
            await this.crawlUrl(link, images, depth + 1, requestId);
          }
        }

        // Log progress periodically
        if (images.length > 0 && images.length % 10 === 0) {
          logger.logCrawlProgress(url, images.length, requestId);
        }
      }
    } catch (error) {
      logger.warn(`Failed to crawl ${url}`, {
        component: 'Crawler',
        action: 'crawl_url_error',
        requestId,
        url,
        error: error.message
      });
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

        logger.debug(`Found image: ${absoluteUrl}`, {
          component: 'Crawler',
          action: 'image_found',
          imageUrl: absoluteUrl,
          sourceUrl,
          alt
        });
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

module.exports = ImageCrawler;