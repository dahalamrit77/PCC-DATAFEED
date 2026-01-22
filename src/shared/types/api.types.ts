/**
 * Shared API types
 * Common types used across API responses
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
  details?: unknown;
}
