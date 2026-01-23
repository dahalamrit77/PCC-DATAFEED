/**
 * Environment configuration
 * Type-safe access to environment variables with validation
 */

import { logger } from '@shared/lib/logger';

interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  environment: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
};

export const config: AppConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', '/api'),
  appName: getEnvVar('VITE_APP_NAME', 'PCC Data Feed'),
  environment: (getEnvVar('VITE_ENVIRONMENT', 'development') as AppConfig['environment']) || 'development',
  get isDevelopment() {
    return this.environment === 'development';
  },
  get isProduction() {
    return this.environment === 'production';
  },
};

// Validate critical config at startup
if (config.isDevelopment) {
  logger.info('Environment configuration', {
    apiBaseUrl: config.apiBaseUrl,
    environment: config.environment,
  });
}

export default config;
