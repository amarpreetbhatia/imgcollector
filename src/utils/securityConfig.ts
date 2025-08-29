// Security configuration for image download feature
// This file documents and centralizes security measures

export const SECURITY_CONFIG = {
  // File size limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB per image
  MAX_TOTAL_SIZE: 500 * 1024 * 1024, // 500MB total download
  
  // Request limits
  MAX_IMAGES_PER_REQUEST: 100, // Maximum images in single download
  MAX_CONCURRENT_DOWNLOADS: 3, // Concurrent download limit
  DOWNLOAD_TIMEOUT: 30000, // 30 seconds per image
  
  // Allowed MIME types (whitelist approach)
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp'
  ],
  
  // URL validation
  ALLOWED_PROTOCOLS: ['http:', 'https:'] as const,
  
  // Rate limiting (future enhancement)
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 5,
    MAX_REQUESTS_PER_HOUR: 20
  }
} as const;

// Security validation functions
export class SecurityValidator {
  static validateImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return SECURITY_CONFIG.ALLOWED_PROTOCOLS.includes(urlObj.protocol as 'http:' | 'https:');
    } catch {
      return false;
    }
  }

  static validateMimeType(mimeType: string | null): boolean {
    if (!mimeType) return false;
    return SECURITY_CONFIG.ALLOWED_MIME_TYPES.some(type => 
      mimeType.toLowerCase().includes(type)
    );
  }

  static validateFileSize(size: number): boolean {
    return size <= SECURITY_CONFIG.MAX_FILE_SIZE;
  }

  static validateTotalSize(totalSize: number): boolean {
    return totalSize <= SECURITY_CONFIG.MAX_TOTAL_SIZE;
  }

  static validateImageCount(count: number): boolean {
    return count > 0 && count <= SECURITY_CONFIG.MAX_IMAGES_PER_REQUEST;
  }

  static sanitizeFilename(filename: string): string {
    // Remove dangerous characters and limit length
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100);
  }
}

// Security audit logging (for monitoring)
export class SecurityAudit {
  static logDownloadAttempt(imageCount: number, totalEstimatedSize?: number) {
    console.log('Download attempt:', {
      timestamp: new Date().toISOString(),
      imageCount,
      totalEstimatedSize,
      userAgent: navigator.userAgent
    });
  }

  static logSecurityViolation(violation: string, details?: any) {
    console.warn('Security violation:', {
      timestamp: new Date().toISOString(),
      violation,
      details,
      userAgent: navigator.userAgent
    });
  }

  static logDownloadComplete(downloadedCount: number, totalSize: number) {
    console.log('Download completed:', {
      timestamp: new Date().toISOString(),
      downloadedCount,
      totalSize,
      userAgent: navigator.userAgent
    });
  }
}