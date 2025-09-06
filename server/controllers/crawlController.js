const ImageCrawler = require('../services/ImageCrawler');
const logger = require('../utils/logger');

class CrawlController {
  constructor() {
    this.crawler = new ImageCrawler();
  }

  async crawlImages(req, res) {
    const { url } = req.body;
    const requestId = req.requestId;

    if (!url) {
      logger.warn('Crawl request missing URL', {
        component: 'API',
        action: 'validation_error',
        requestId
      });
      return res.status(400).json({ error: 'URL is required' });
    }

    logger.info(`Starting crawl for: ${url}`, {
      component: 'API',
      action: 'crawl_request',
      requestId,
      targetUrl: url
    });

    const result = await this.crawler.crawl(url, requestId);

    logger.info(`Crawl completed. Found ${result.images.length} images`, {
      component: 'API',
      action: 'crawl_response',
      requestId,
      targetUrl: url,
      imageCount: result.images.length,
      hasError: !!result.error
    });

    res.json(result);
  }
}

module.exports = new CrawlController();