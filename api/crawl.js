const ImageCrawler = require('../server/services/ImageCrawler');
const logger = require('../server/utils/logger');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  const requestId = Date.now().toString();

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

  try {
    const crawler = new ImageCrawler();
    const result = await crawler.crawl(url, requestId);

    logger.info(`Crawl completed. Found ${result.images.length} images`, {
      component: 'API',
      action: 'crawl_response',
      requestId,
      targetUrl: url,
      imageCount: result.images.length,
      hasError: !!result.error
    });

    res.json(result);
  } catch (error) {
    logger.error('Crawl API Error:', error, {
      component: 'API',
      action: 'crawl_error',
      requestId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
}