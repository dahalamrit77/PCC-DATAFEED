/**
 * Auth API
 * RTK Query endpoints for authentication
 */

import { baseApi } from '@shared/api/baseApi';
import { storage } from '@shared/lib/storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  jwtToken: string;
}

export interface UpdatePasswordRequest {
  userId: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  code: string; // e.g., "SUCCESS_PASSWORD_UPDATED"
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store token and user email on successful login
          storage.setToken(data.jwtToken);
          storage.setUserEmail(_arg.email.trim());
        } catch {
          // Error handling is done by the mutation
        }
      },
    }),
    updatePassword: builder.mutation<UpdatePasswordResponse, UpdatePasswordRequest>({
      query: (payload) => ({
        url: '/updatepswd',
        method: 'PUT',
        body: payload,
      }),
    }),
  }),
});

export const { useLoginMutation, useUpdatePasswordMutation } = authApi;
