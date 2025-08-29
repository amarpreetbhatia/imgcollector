import { ImageData } from '../types';

export interface DownloadProgress {
  current: number;
  total: number;
  percentage: number;
  message: string;
}

export interface DownloadResult {
  success: boolean;
  zipBlob?: Blob;
  downloadedCount?: number;
  totalCount?: number;
  error?: string;
}

class DownloadService {
  private worker: Worker | null = null;
  private currentRequestId: string | null = null;
  private progressCallback: ((progress: DownloadProgress) => void) | null = null;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    try {
      // Create worker from public directory
      this.worker = new Worker('/download-worker.js');
      
      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.cleanup();
      };

    } catch (error) {
      console.error('Failed to initialize download worker:', error);
    }
  }

  private handleWorkerMessage(data: any) {
    const { type, requestId } = data;

    // Ignore messages from other requests
    if (requestId !== this.currentRequestId) {
      return;
    }

    switch (type) {
      case 'DOWNLOAD_PROGRESS':
        if (this.progressCallback) {
          this.progressCallback({
            current: data.current,
            total: data.total,
            percentage: data.percentage,
            message: data.message
          });
        }
        break;

      case 'DOWNLOAD_COMPLETE':
        this.handleDownloadComplete(data);
        break;

      case 'DOWNLOAD_ERROR':
        this.handleDownloadError(data.error);
        break;

      case 'DOWNLOAD_CANCELLED':
        this.handleDownloadCancelled();
        break;
    }
  }

  private handleDownloadComplete(data: any) {
    const { zipBlob } = data;
    
    // Create download link and trigger download
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `images_${new Date().toISOString().split('T')[0]}.zip`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    this.cleanup();
  }

  private handleDownloadError(error: string) {
    console.error('Download failed:', error);
    this.cleanup();
    throw new Error(error);
  }

  private handleDownloadCancelled() {
    console.log('Download cancelled');
    this.cleanup();
  }

  private cleanup() {
    this.currentRequestId = null;
    this.progressCallback = null;
  }

  public async downloadImages(
    images: ImageData[],
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    return new Promise((resolve, reject) => {
      // Security validations
      if (!images || !Array.isArray(images)) {
        reject(new Error('Invalid images array'));
        return;
      }

      if (images.length === 0) {
        reject(new Error('No images to download'));
        return;
      }

      if (images.length > 100) {
        reject(new Error('Too many images (max 100 allowed)'));
        return;
      }

      // Check if already downloading
      if (this.currentRequestId) {
        reject(new Error('Download already in progress'));
        return;
      }

      // Check worker availability
      if (!this.worker) {
        reject(new Error('Download service not available'));
        return;
      }

      // Validate image URLs
      const validImages = images.filter(img => {
        try {
          new URL(img.url);
          return true;
        } catch {
          return false;
        }
      });

      if (validImages.length === 0) {
        reject(new Error('No valid image URLs found'));
        return;
      }

      // Setup request
      this.currentRequestId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.progressCallback = onProgress || null;

      // Setup completion handlers
      const originalHandleComplete = this.handleDownloadComplete.bind(this);
      const originalHandleError = this.handleDownloadError.bind(this);

      this.handleDownloadComplete = (data: any) => {
        originalHandleComplete(data);
        resolve({
          success: true,
          zipBlob: data.zipBlob,
          downloadedCount: data.downloadedCount,
          totalCount: data.totalCount
        });
      };

      this.handleDownloadError = (error: string) => {
        originalHandleError(error);
        reject(new Error(error));
      };

      // Start download
      this.worker.postMessage({
        type: 'DOWNLOAD_IMAGES',
        requestId: this.currentRequestId,
        data: { images: validImages }
      });
    });
  }

  public cancelDownload() {
    if (this.currentRequestId && this.worker) {
      this.worker.postMessage({
        type: 'CANCEL_DOWNLOAD',
        requestId: this.currentRequestId
      });
    }
  }

  public isDownloading(): boolean {
    return this.currentRequestId !== null;
  }

  public destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.cleanup();
  }
}

// Singleton instance
export const downloadService = new DownloadService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  downloadService.destroy();
});