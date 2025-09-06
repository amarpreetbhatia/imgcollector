const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 CollageForge Backend running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'localhost'}`);
});