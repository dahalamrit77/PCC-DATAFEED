/**
 * Route constants
 * Centralized route definitions for consistency
 */

export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  
  // Patient routes
  PATIENTS: '/patients',
  PATIENT_DETAIL: (patientId: number | string) => `/patients/${patientId}`,
  
  // User management routes
  USERS: '/users',
  CREATE_USER: '/users/create',
  EDIT_USER: (userId: string) => `/users/${userId}/edit`,
  
  // Root
  ROOT: '/',
} as const;
