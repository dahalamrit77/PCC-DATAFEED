import { apiClient } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  jwtToken: string;
}

/**
 * Authentication service.
 * All auth-related API calls should be defined here.
 */
export const authService = {
  /**
   * Calls the backend login endpoint.
   * Backend URL (for reference): POST /api/login
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', credentials);
    return response.data;
  },
};

