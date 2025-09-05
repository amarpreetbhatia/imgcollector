// Load environment variables from parent directory
require('dotenv').config({ path: '../.env' });

const express = require('express');
const logger = require('./utils/logger');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const robotsParser = require('robots-parser');
const { URL } = require('url');

console.log('Imports loaded successfully');
console.log('Logger:', typeof logger);