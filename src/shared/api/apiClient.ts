/**
 * Axios API client instance
 * Base HTTP client for API requests
 * Note: For RTK Query endpoints, use baseApi.ts instead
 */

import axios from 'axios';
import { storage } from '../lib/storage';
import { logger } from '../lib/logger';
import { isAuthError } from '../lib/errors';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

if (import.meta.env.DEV) {
  logger.info('API Client initialized', { baseURL });
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor: Attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (isAuthError(error)) {
      logger.warn('Authentication error detected', {
        status: error.response?.status,
        url: error.config?.url,
      });
      
      // Clear auth storage
      storage.clearAuth();
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Log error for debugging
    logger.error('API request failed', error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    });

    return Promise.reject(error);
  }
);

export default apiClient;
