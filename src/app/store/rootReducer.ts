/**
 * Root Reducer
 * Combines all feature reducers
 */

import { combineReducers } from '@reduxjs/toolkit';
import { baseApi } from '@shared/api/baseApi';
import facilityReducer from '@entities/facility/store/facilitySlice';
import authReducer from '@features/auth/store/authSlice';

export const rootReducer = combineReducers({
  // RTK Query API
  [baseApi.reducerPath]: baseApi.reducer,
  
  // Feature slices
  facility: facilityReducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
