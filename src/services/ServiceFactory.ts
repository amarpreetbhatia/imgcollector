import { ICrawlerService } from './interfaces/ICrawlerService';
import { ICollageService } from './interfaces/ICollageService';
import { IPrintService } from './interfaces/IPrintService';
import { IAIImageService } from './interfaces/IAIImageService';

/**
 * Service Factory implementing Dependency Inversion Principle
 * Allows easy swapping of service implementations
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, any> = new Map();

  private constructor() { }

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Register a service implementation
   */
  public registerService<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  /**
   * Get a service implementation
   */
  public getService<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not registered`);
    }
    return service as T;
  }

  /**
   * Get crawler service
   */
  public getCrawlerService(): ICrawlerService {
    return this.getService<ICrawlerService>('crawler');
  }

  /**
   * Get collage service
   */
  public getCollageService(): ICollageService {
    return this.getService<ICollageService>('collage');
  }

  /**
   * Get print service
   */
  public getPrintService(): IPrintService {
    return this.getService<IPrintService>('print');
  }

  /**
   * Get AI image service
   */
  public getAIImageService(): IAIImageService {
    return this.getService<IAIImageService>('aiImage');
  }
}

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  apiBaseUrl: string;
  timeout: number;
  retryAttempts: number;
  enableLogging: boolean;
}

/**
 * Environment-specific service configuration
 */
export class ConfigManager {
  private static config: ServiceConfig;

  public static initialize(config: ServiceConfig): void {
    ConfigManager.config = config;
  }

  public static getConfig(): ServiceConfig {
    if (!ConfigManager.config) {
      throw new Error('Configuration not initialized');
    }
    return ConfigManager.config;
  }

  public static getApiUrl(endpoint: string): string {
    return `${ConfigManager.config.apiBaseUrl}${endpoint}`;
  }
}