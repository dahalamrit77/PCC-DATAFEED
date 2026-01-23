/**
 * Auth Slice
 * Manages authentication state including user role and facilities
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { storage } from '@shared/lib/storage';
import { UserRole } from '@shared/types/user.types';

interface AuthState {
  user: {
    email: string | null;
    firstName?: string | null;
    lastName?: string | null;
    isAuthenticated: boolean;
    role: UserRole | null;
    facilities: number[];
  };
}

const initialState: AuthState = {
  user: {
    email: storage.getUserEmail(),
    firstName: storage.getUserFirstName(),
    lastName: storage.getUserLastName(),
    isAuthenticated: Boolean(storage.getToken()),
    role: storage.getUserRole() as UserRole | null,
    facilities: storage.getUserFacilities() || [],
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        email: string;
        firstName?: string | null;
        lastName?: string | null;
        role?: UserRole;
        facilities?: number[];
      }>
    ) => {
      state.user.email = action.payload.email;
      state.user.isAuthenticated = true;

      if (action.payload.firstName !== undefined) {
        state.user.firstName = action.payload.firstName;
        if (action.payload.firstName) storage.setUserFirstName(action.payload.firstName);
        else storage.removeUserFirstName();
      }

      if (action.payload.lastName !== undefined) {
        state.user.lastName = action.payload.lastName;
        if (action.payload.lastName) storage.setUserLastName(action.payload.lastName);
        else storage.removeUserLastName();
      }
      
      if (action.payload.role !== undefined) {
        state.user.role = action.payload.role;
        storage.setUserRole(action.payload.role);
      }
      
      if (action.payload.facilities !== undefined) {
        state.user.facilities = action.payload.facilities;
        storage.setUserFacilities(action.payload.facilities);
      }
    },
    logout: (state) => {
      state.user.email = null;
      state.user.firstName = null;
      state.user.lastName = null;
      state.user.isAuthenticated = false;
      state.user.role = null;
      state.user.facilities = [];
      storage.clearAuth();
      storage.removeUserRole();
      storage.removeUserFacilities();
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
