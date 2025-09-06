const express = require('express');
const aiController = require('../controllers/aiController');
const logger = require('../utils/logger');
const upload = require('../config/multer');

const router = express.Router();

router.post('/blend-images', logger.trackApiEndpoint('/api/ai/blend-images'), upload.single('userImage'), aiController.blendImages.bind(aiController));
router.post('/generate-image', aiController.generateImage.bind(aiController));

module.exports = router;