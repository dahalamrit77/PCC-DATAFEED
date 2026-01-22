/**
 * Application constants
 * Centralized constants used across the application
 */

export const APP_NAME = 'PCC Data Feed';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_EMAIL: 'user_email',
  SELECTED_FACILITY: 'selected_facility_id',
} as const;

export const API_TIMEOUT = 30000; // 30 seconds

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
