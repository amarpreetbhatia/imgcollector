import React, { useEffect } from 'react';
import { ServiceInitializer } from './ServiceInitializer';

/**
 * App Initializer Component
 * Initializes services when the app starts
 */
interface AppInitializerProps {
  children: React.ReactNode;
  environment?: 'development' | 'production';
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ 
  children, 
  environment = process.env.NODE_ENV as 'development' | 'production' 
}) => {
  useEffect(() => {
    // Initialize services on app startup
    ServiceInitializer.initialize(environment);
  }, [environment]);

  return <>{children}</>;
};