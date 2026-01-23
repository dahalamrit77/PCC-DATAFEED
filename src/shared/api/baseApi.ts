/**
 * RTK Query Base API
 * Centralized RTK Query API instance with authentication and error handling
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './interceptors';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  keepUnusedDataFor: 60,
  tagTypes: [
    'Patient',
    'PatientDetail',
    'Coverage',
    'Adt',
    'Event',
    'Facility',
    'Dashboard',
    'User',
  ],
  endpoints: () => ({}),
});
