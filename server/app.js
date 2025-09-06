// Load environment variables from parent directory
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const corsOptions = require('./config/cors');
const ErrorHandler = require('./middleware/errorHandler');

// Import routes
const crawlRoutes = require('./routes/crawlRoutes');
const aiRoutes = require('./routes/aiRoutes');
const healthRoutes = require('./routes/healthRoutes');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(cors(corsOptions));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Add request logging middleware
    this.app.use(logger.requestMiddleware());
  }

  setupRoutes() {
    // API routes
    this.app.use('/api', crawlRoutes);
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/', healthRoutes);
  }

  setupErrorHandling() {
    ErrorHandler.setupProcessHandlers();
  }

  getApp() {
    return this.app;
  }
}

module.exports = new App().getApp();