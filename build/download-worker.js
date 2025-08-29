// Service Worker for secure image downloading and zipping
// This worker handles background downloads with security measures

const CACHE_NAME = 'image-download-cache-v1';
const MAX_CONCURRENT_DOWNLOADS = 3;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per image
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total
const DOWNLOAD_TIMEOUT = 30000; // 30 seconds per image
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp'
];

// Import JSZip library
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

class SecureImageDownloader {
  constructor() {
    this.downloadQueue = [];
    this.activeDownloads = 0;
    this.totalDownloaded = 0;
    this.downloadedFiles = new Map();
    this.abortController = null;
  }

  async downloadImages(images, requestId) {
    try {
      this.abortController = new AbortController();
      this.downloadedFiles.clear();
      this.totalDownloaded = 0;
      
      // Validate input
      if (!Array.isArray(images) || images.length === 0) {
        throw new Error('Invalid images array');
      }

      if (images.length > 100) {
        throw new Error('Too many images requested (max 100)');
      }

      // Send initial progress
      this.sendProgress(requestId, 0, images.length, 'Starting download...');

      // Process images in batches
      const results = await this.processBatch(images, requestId);
      
      // Create ZIP file
      this.sendProgress(requestId, images.length, images.length, 'Creating ZIP file...');
      const zipBlob = await this.createZipFile(results);
      
      // Send completion message
      self.postMessage({
        type: 'DOWNLOAD_COMPLETE',
        requestId,
        zipBlob,
        downloadedCount: results.length,
        totalCount: images.length
      });

    } catch (error) {
      console.error('Download error:', error);
      self.postMessage({
        type: 'DOWNLOAD_ERROR',
        requestId,
        error: error.message
      });
    }
  }

  async processBatch(images, requestId) {
    const results = [];
    const semaphore = new Semaphore(MAX_CONCURRENT_DOWNLOADS);
    
    const downloadPromises = images.map(async (image, index) => {
      return semaphore.acquire(async () => {
        try {
          const result = await this.downloadSingleImage(image, index, requestId);
          if (result) {
            results.push(result);
            this.sendProgress(requestId, results.length, images.length, 
              `Downloaded ${results.length}/${images.length} images`);
          }
        } catch (error) {
          console.warn(`Failed to download image ${index}:`, error.message);
          // Continue with other downloads
        }
      });
    });

    await Promise.allSettled(downloadPromises);
    return results;
  }

  async downloadSingleImage(image, index, requestId) {
    // Security validations
    if (!this.isValidImageUrl(image.url)) {
      throw new Error(`Invalid image URL: ${image.url}`);
    }

    if (this.totalDownloaded > MAX_TOTAL_SIZE) {
      throw new Error('Total download size limit exceeded');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);

      const response = await fetch(image.url, {
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'User-Agent': 'ImageCrawlerBot/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Validate content type
      const contentType = response.headers.get('content-type');
      if (!this.isValidMimeType(contentType)) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      // Check file size
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${contentLength} bytes`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Double-check size after download
      if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
        throw new Error(`Downloaded file too large: ${arrayBuffer.byteLength} bytes`);
      }

      this.totalDownloaded += arrayBuffer.byteLength;

      // Generate safe filename
      const filename = this.generateSafeFilename(image.url, index, contentType);
      
      return {
        filename,
        data: arrayBuffer,
        originalUrl: image.url,
        sourceUrl: image.sourceUrl,
        alt: image.alt
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Download timeout');
      }
      throw error;
    }
  }

  async createZipFile(downloadedImages) {
    const zip = new JSZip();
    
    // Add images to ZIP
    downloadedImages.forEach((image, index) => {
      zip.file(image.filename, image.data);
    });

    // Add metadata file
    const metadata = {
      downloadDate: new Date().toISOString(),
      totalImages: downloadedImages.length,
      images: downloadedImages.map(img => ({
        filename: img.filename,
        originalUrl: img.originalUrl,
        sourceUrl: img.sourceUrl,
        alt: img.alt
      }))
    };
    
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // Generate ZIP blob
    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }

  generateSafeFilename(url, index, contentType) {
    try {
      const urlObj = new URL(url);
      let filename = urlObj.pathname.split('/').pop() || `image_${index}`;
      
      // Remove query parameters and sanitize
      filename = filename.split('?')[0];
      filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // Ensure proper extension
      const extension = this.getExtensionFromMimeType(contentType);
      if (!filename.includes('.') && extension) {
        filename += extension;
      }
      
      // Ensure unique filename
      filename = `${String(index + 1).padStart(3, '0')}_${filename}`;
      
      return filename;
    } catch {
      const extension = this.getExtensionFromMimeType(contentType) || '.jpg';
      return `image_${String(index + 1).padStart(3, '0')}${extension}`;
    }
  }

  getExtensionFromMimeType(mimeType) {
    const mimeMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp'
    };
    return mimeMap[mimeType] || '.jpg';
  }

  isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  isValidMimeType(mimeType) {
    if (!mimeType) return false;
    return ALLOWED_MIME_TYPES.some(type => mimeType.toLowerCase().includes(type));
  }

  sendProgress(requestId, current, total, message) {
    self.postMessage({
      type: 'DOWNLOAD_PROGRESS',
      requestId,
      current,
      total,
      percentage: Math.round((current / total) * 100),
      message
    });
  }
}

// Semaphore for controlling concurrent downloads
class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.currentConcurrency = 0;
    this.queue = [];
  }

  async acquire(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.tryNext();
    });
  }

  tryNext() {
    if (this.currentConcurrency >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    this.currentConcurrency++;
    const { task, resolve, reject } = this.queue.shift();

    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.currentConcurrency--;
        this.tryNext();
      });
  }
}

// Global downloader instance
const downloader = new SecureImageDownloader();

// Message handler
self.addEventListener('message', async (event) => {
  const { type, data, requestId } = event.data;

  switch (type) {
    case 'DOWNLOAD_IMAGES':
      await downloader.downloadImages(data.images, requestId);
      break;
      
    case 'CANCEL_DOWNLOAD':
      if (downloader.abortController) {
        downloader.abortController.abort();
      }
      self.postMessage({
        type: 'DOWNLOAD_CANCELLED',
        requestId
      });
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
});

// Service worker lifecycle events
self.addEventListener('install', (event) => {
  console.log('Download worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Download worker activated');
  event.waitUntil(self.clients.claim());
});