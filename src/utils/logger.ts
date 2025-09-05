// Browser-compatible logger utility
// Provides structured logging for the frontend application

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  component?: string;
  action?: string;
  data?: any;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.level = this.getLogLevel();
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.REACT_APP_LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      default:
        return this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(level: string, message: string, component?: string, action?: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      component,
      action,
      data,
    };
  }

  private log(level: LogLevel, levelName: string, message: string, component?: string, action?: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(levelName, message, component, action, data);
    
    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.ERROR:
        console.error(`🔴 [${logEntry.timestamp}] ERROR: ${message}`, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`🟡 [${logEntry.timestamp}] WARN: ${message}`, data || '');
        break;
      case LogLevel.INFO:
        console.info(`🔵 [${logEntry.timestamp}] INFO: ${message}`, data || '');
        break;
      case LogLevel.DEBUG:
        console.debug(`⚪ [${logEntry.timestamp}] DEBUG: ${message}`, data || '');
        break;
    }

    // In development, also log the full entry for debugging
    if (this.isDevelopment && (component || action)) {
      console.groupCollapsed(`📋 Log Details`);
      console.table(logEntry);
      console.groupEnd();
    }
  }

  error(message: string, component?: string, action?: string, data?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, component, action, data);
  }

  warn(message: string, component?: string, action?: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, component, action, data);
  }

  info(message: string, component?: string, action?: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, component, action, data);
  }

  debug(message: string, component?: string, action?: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, component, action, data);
  }

  // Convenience methods for common use cases
  apiRequest(endpoint: string, method: string, data?: any): void {
    this.debug(`API Request: ${method} ${endpoint}`, 'API', 'request', data);
  }

  apiResponse(endpoint: string, status: number, data?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    const levelName = status >= 400 ? 'ERROR' : 'DEBUG';
    this.log(level, levelName, `API Response: ${status} ${endpoint}`, 'API', 'response', data);
  }

  userAction(action: string, component: string, data?: any): void {
    this.info(`User Action: ${action}`, component, 'user_action', data);
  }

  performance(operation: string, duration: number, component?: string): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, component, 'performance', { duration });
  }
}

// Create singleton instance
const logger = new Logger();

// Export convenience functions for backward compatibility
export const logApiCall = (endpoint: string, method: string, data?: any) => {
  logger.apiRequest(endpoint, method, data);
};

export const logUserAction = (action: string, component: string, data?: any) => {
  logger.userAction(action, component, data);
};

export const logComponentMount = (component: string) => {
  logger.debug(`Component mounted: ${component}`, component, 'mount');
};

export const logComponentUnmount = (component: string) => {
  logger.debug(`Component unmounted: ${component}`, component, 'unmount');
};

export const startTimer = (operation: string) => {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    logger.performance(operation, duration);
  };
};

export { logger };
export default logger;