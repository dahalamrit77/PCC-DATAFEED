import { configureStore } from '@reduxjs/toolkit';
import facilityReducer from './slices/facilitySlice';
import { setStoreInstance } from '../services/api';

export const store = configureStore({
  reducer: {
    facility: facilityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['facility/fetchFacilities/pending', 'facility/fetchFacilities/fulfilled', 'facility/fetchFacilities/rejected'],
      },
    }),
});

// Set store instance in API client to break circular dependency
setStoreInstance(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

