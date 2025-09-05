const winston = require('winston');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add custom methods for the application
logger.requestMiddleware = () => {
  return (req, res, next) => {
    req.requestId = Math.random().toString(36).substr(2, 9);
    logger.http(`${req.method} ${req.url}`, { requestId: req.requestId });
    next();
  };
};

logger.trackApiEndpoint = (endpoint) => {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`API ${endpoint} completed in ${duration}ms`, {
        requestId: req.requestId,
        statusCode: res.statusCode,
        duration
      });
    });
    next();
  };
};

logger.logCrawlStart = (url, requestId) => {
  logger.info(`Starting crawl for: ${url}`, { requestId, action: 'crawl_start' });
};

logger.logCrawlComplete = (url, imageCount, duration, requestId) => {
  logger.info(`Crawl completed for ${url}. Found ${imageCount} images in ${duration}ms`, {
    requestId,
    action: 'crawl_complete',
    imageCount,
    duration
  });
};

logger.logCrawlError = (url, error, requestId) => {
  logger.error(`Crawl failed for ${url}: ${error.message}`, {
    requestId,
    action: 'crawl_error',
    error: error.message
  });
};

logger.logCrawlProgress = (url, imageCount, requestId) => {
  logger.debug(`Crawl progress for ${url}: ${imageCount} images found`, {
    requestId,
    action: 'crawl_progress',
    imageCount
  });
};

logger.logAIProcessStart = (baseImageUrl, requestId) => {
  logger.info(`Starting AI image processing`, {
    requestId,
    action: 'ai_process_start',
    baseImageUrl
  });
};

logger.logAIProcessComplete = (success, duration, requestId) => {
  logger.info(`AI image processing ${success ? 'completed' : 'failed'} in ${duration}ms`, {
    requestId,
    action: 'ai_process_complete',
    success,
    duration
  });
};

module.exports = logger;