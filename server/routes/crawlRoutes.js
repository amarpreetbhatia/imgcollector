const express = require('express');
const crawlController = require('../controllers/crawlController');
const logger = require('../utils/logger');

const router = express.Router();

router.post('/crawl', logger.trackApiEndpoint('/api/crawl'), crawlController.crawlImages.bind(crawlController));

module.exports = router;