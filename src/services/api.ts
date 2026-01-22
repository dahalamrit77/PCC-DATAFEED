import axios from 'axios';

// Store reference - will be set after store initialization to avoid circular dependency
let storeInstance: { getState: () => { facility: { selectedFacilityId: number | null } } } | null = null;

// Function to set store reference (called after store is created)
export const setStoreInstance = (store: typeof storeInstance) => {
  storeInstance = store;
};

/**
 * Storage key for the JWT auth token.
 * Shared across auth, routing guards, and API client.
 */
export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

/**
 * Axios instance pre-configured for backend API calls.
 * Base URL is primarily driven by VITE_API_BASE_URL.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

if (import.meta.env.DEV) {
  // Helpful for verifying correct configuration in development.
  // eslint-disable-next-line no-console
  console.log('[apiClient] baseURL:', baseURL);
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach auth token and auto-inject facId for RBAC
apiClient.interceptors.request.use((config) => {
  // Attach auth token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      // Ensure headers object exists before assigning.
      // eslint-disable-next-line no-param-reassign
      config.headers = config.headers ?? {};
      // eslint-disable-next-line no-param-reassign
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  // RBAC: Auto-inject facId parameter for GET requests
  // NOTE: Only add facId to endpoints that support it (exclude /patients, /coverage, /adt)
  // Patient API doesn't support facId query param - we filter on frontend instead
  if (storeInstance && config.method === 'get') {
    try {
      const state = storeInstance.getState();
      const selectedFacilityId = state.facility?.selectedFacilityId;

      // Exclude endpoints that don't support facId parameter
      const url = config.url || '';
      const excludedEndpoints = ['/patients', '/coverage', '/adt'];
      const shouldExclude = excludedEndpoints.some(endpoint => url.includes(endpoint));

      if (selectedFacilityId !== null && selectedFacilityId !== undefined && !shouldExclude) {
        // Initialize params if it doesn't exist
        // eslint-disable-next-line no-param-reassign
        config.params = config.params || {};
        
        // Only inject facId if it's not already present (allows manual override if needed)
        if (!config.params.facId) {
          // eslint-disable-next-line no-param-reassign
          config.params.facId = selectedFacilityId;
        }
      }
    } catch (error) {
      // Store might not be initialized yet, skip facId injection
      console.warn('[apiClient] Could not access Redux store for facId injection:', error);
    }
  }

  return config;
});

// TODO: Add response interceptors for refresh token handling, global error logging, etc.

