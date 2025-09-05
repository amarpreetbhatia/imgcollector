import { ApiResponse } from '../contracts/api';
import { ConfigManager } from './ServiceFactory';
import { logger, logApiCall } from '../utils/logger';

/**
 * HTTP Client Service - Single Responsibility Principle
 * Handles all HTTP communication with proper error handling and retry logic
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;

  constructor(baseUrl?: string, timeout?: number, retryAttempts?: number) {
    const config = ConfigManager.getConfig();
    this.baseUrl = baseUrl || config.apiBaseUrl;
    this.timeout = timeout || config.timeout;
    this.retryAttempts = retryAttempts || config.retryAttempts;
  }

  /**
   * Generic GET request with retry logic
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    logApiCall(url, 'GET', { component: 'HttpClient' });
    
    try {
      const result = await this.executeWithRetry<T>(() => this.fetchWithTimeout(url, { method: 'GET' }));
      
      if (result.success) {
        logger.debug('GET request successful', 'HttpClient', 'api_success', result.data);
      } else {
        logger.error(`GET request failed: ${result.error || 'Request failed'}`, 'HttpClient', 'api_error', result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`GET request error: ${errorMessage}`, 'HttpClient', 'api_error');
      throw error;
    }
  }

  /**
   * Generic POST request with retry logic
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    logApiCall(url, 'POST', { component: 'HttpClient' });
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    };
    
    try {
      const result = await this.executeWithRetry<T>(() => this.fetchWithTimeout(url, options));
      
      if (result.success) {
        logger.debug('POST request successful', 'HttpClient', 'api_success', result.data);
      } else {
        logger.error(`POST request failed: ${result.error || 'Request failed'}`, 'HttpClient', 'api_error', result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`POST request error: ${errorMessage}`, 'HttpClient', 'api_error');
      throw error;
    }
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    endpoint: string, 
    file: File | Blob, 
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    logApiCall(url, 'POST', { component: 'HttpClient', action: 'file_upload' });
    
    logger.info('Starting file upload', 'HttpClient', 'upload_start', {
      endpoint,
      fileSize: file.size,
      fileType: file instanceof File ? file.type : 'blob'
    });
    
    const formData = new FormData();
    formData.append('userImage', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return new Promise<ApiResponse<T>>((resolve) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          const result = this.handleResponse<T>(response, xhr.status);
          
          if (result.success) {
            logger.info('File upload completed successfully', 'HttpClient', 'upload_success', {
              endpoint,
              status: xhr.status
            });
          } else {
            logger.error(`File upload failed: ${result.error || 'Upload failed'}`, 'HttpClient', 'upload_error', result);
          }
          
          resolve(result);
        } catch (error) {
          const errorResult = this.createErrorResponse<T>('Failed to parse response');
          logger.error('Failed to parse upload response', 'HttpClient', 'parse_error');
          resolve(errorResult);
        }
      });

      xhr.addEventListener('error', () => {
        const errorResult = this.createErrorResponse<T>('Network error occurred');
        logger.error('File upload network error', 'HttpClient', 'upload_error', {
          endpoint
        });
        resolve(errorResult);
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  /**
   * Execute request with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<Response>
  ): Promise<ApiResponse<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await requestFn();
        const data = await response.json();
        return this.handleResponse<T>(data, response.status);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.retryAttempts) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }

    return this.createErrorResponse<T>(
      lastError?.message || 'Request failed after retries'
    );
  }

  /**
   * Handle API response
   */
  private handleResponse<T>(data: any, status: number): ApiResponse<T> {
    if (status >= 200 && status < 300) {
      return {
        success: true,
        data: data.data || data,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        error: data.error || `HTTP ${status} error`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Create error response
   */
  private createErrorResponse<T>(error: string): ApiResponse<T> {
    return {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}