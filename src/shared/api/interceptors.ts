/**
 * API interceptors
 * Centralized interceptor logic for RTK Query base API
 */

import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { storage } from '../lib/storage';
import { logger } from '../lib/logger';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * Base query function for RTK Query
 * Handles authentication, error formatting, and facility ID injection
 */
const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = storage.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseQueryWithAuth: BaseQueryFn<
  string | { url: string; params?: Record<string, unknown>; method?: string; body?: unknown },
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Get facility ID from Redux state (if available)
  const state = api.getState() as { facility?: { selectedFacilityId: number | null } };
  const selectedFacilityId = state.facility?.selectedFacilityId;

  // Prepare args with facility ID injection
  // Only inject facId for GET requests, and exclude certain endpoints
  let modifiedArgs = args;
  
  // Determine if this is a GET request
  const isGetRequest = typeof args === 'string' 
    ? true // String args are always GET
    : !args.method || args.method === 'GET' || args.method === 'get';
  
  // Only inject facId for GET requests
  if (selectedFacilityId !== null && selectedFacilityId !== undefined && isGetRequest) {
    if (typeof args === 'string') {
      const excludedEndpoints = ['/patients', '/coverage', '/adt', '/login', '/facilities'];
      const shouldExclude = excludedEndpoints.some((endpoint) => args.includes(endpoint));
      
      if (!shouldExclude && !args.includes('facId=')) {
        const separator = args.includes('?') ? '&' : '?';
        modifiedArgs = `${args}${separator}facId=${selectedFacilityId}`;
      }
    } else {
      const url = args.url || '';
      const excludedEndpoints = ['/patients', '/coverage', '/adt', '/login', '/facilities'];
      const shouldExclude = excludedEndpoints.some((endpoint) => url.includes(endpoint));
      
      // Only add facId to GET requests (explicitly check method)
      const method = args.method?.toUpperCase();
      if (!shouldExclude && !args.params?.facId && (method === 'GET' || !method)) {
        modifiedArgs = {
          ...args,
          params: {
            ...(args.params || {}),
            facId: selectedFacilityId,
          },
        };
      }
    }
  }

  // Execute the base query
  const result = await baseQuery(modifiedArgs, api, extraOptions);

  // Handle authentication errors
  if (result.error) {
    const status = 'status' in result.error ? result.error.status : undefined;
    
    if (status === 401 || status === 403) {
      logger.warn('Authentication error in RTK Query', {
        status,
        url: typeof modifiedArgs === 'string' ? modifiedArgs : modifiedArgs.url,
      });

      storage.clearAuth();

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  }

  return result;
};
