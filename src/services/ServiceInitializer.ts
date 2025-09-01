import { ServiceFactory, ConfigManager, ServiceConfig } from './ServiceFactory';
import { HttpClient } from './HttpClient';
import { createCrawlerService } from './implementations/CrawlerService';
import { createCollageService } from './implementations/CollageService';

/**
 * Service Initializer - Dependency Injection Setup
 * Configures all services based on environment
 */
export class ServiceInitializer {
  private static initialized = false;

  /**
   * Initialize all services with environment-specific configuration
   */
  public static initialize(environment: 'development' | 'production' = 'development'): void {
    if (ServiceInitializer.initialized) {
      return;
    }

    // Initialize configuration
    const config = ServiceInitializer.createConfig(environment);
    ConfigManager.initialize(config);

    // Initialize HTTP client
    const httpClient = new HttpClient();

    // Initialize service factory
    const serviceFactory = ServiceFactory.getInstance();

    // Register services
    serviceFactory.registerService('crawler', createCrawlerService(httpClient));
    serviceFactory.registerService('collage', createCollageService());
    
    // Note: Print service would be registered here when implemented
    // serviceFactory.registerService('print', createPrintService(httpClient));

    ServiceInitializer.initialized = true;
  }

  /**
   * Create environment-specific configuration
   */
  private static createConfig(environment: string): ServiceConfig {
    const baseConfig: ServiceConfig = {
      apiBaseUrl: '', // Will be set below based on environment
      timeout: 30000,
      retryAttempts: 3,
      enableLogging: environment === 'development',
    };

    switch (environment) {
      case 'production':
        return {
          ...baseConfig,
          apiBaseUrl: process.env.REACT_APP_API_URL || 'https://api.collageforge.com',
          timeout: 15000,
          enableLogging: false,
        };

      case 'development':
      default:
        return {
          ...baseConfig,
          apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
          timeout: 30000,
          enableLogging: true,
        };
    }
  }

  /**
   * Get service factory instance (ensures initialization)
   */
  public static getServiceFactory(): ServiceFactory {
    if (!ServiceInitializer.initialized) {
      ServiceInitializer.initialize();
    }
    return ServiceFactory.getInstance();
  }
}

/**
 * Convenience functions for getting services
 */
export const getServices = () => {
  const factory = ServiceInitializer.getServiceFactory();
  return {
    crawler: factory.getCrawlerService(),
    collage: factory.getCollageService(),
    // print: factory.getPrintService(), // When implemented
  };
};