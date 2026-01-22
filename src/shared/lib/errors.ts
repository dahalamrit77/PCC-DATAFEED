/**
 * Error handling utilities
 * Provides standardized error types and error message extraction
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Extract user-friendly error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    // Try to get backend error message
    const backendMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error;

    if (backendMessage) {
      return backendMessage;
    }

    // Fallback to HTTP status messages
    const status = axiosError.response?.status;
    if (status) {
      switch (status) {
        case 401:
          return 'Authentication required. Please sign in again.';
        case 403:
          return 'You do not have permission to access this resource.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return `Request failed with status ${status}`;
      }
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    const message = (error as { message?: string }).message?.toLowerCase() || '';
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout')
    );
  }
  return false;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const status = (error as { response?: { status?: number } }).response?.status;
    return status === 401 || status === 403;
  }
  return false;
};
