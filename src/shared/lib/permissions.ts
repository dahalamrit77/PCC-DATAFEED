/**
 * Permission Utilities
 * Centralized permission checking logic based on user roles
 * Note: Manager role is not included in this implementation
 */

import { UserRole } from '../types/user.types';

/**
 * Check if user can create new users
 * Only Super Admin and Admin can create users
 */
export const canCreateUsers = (role: UserRole | null | undefined): boolean => {
  if (!role) return false;
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};

/**
 * Check if user can manage users (edit/delete)
 * Only Super Admin and Admin can manage users
 */
export const canManageUsers = (role: UserRole | null | undefined): boolean => {
  if (!role) return false;
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};

/**
 * Check if user can access all facilities
 * Super Admin and Admin can access all facilities
 */
export const canAccessAllFacilities = (role: UserRole | null | undefined): boolean => {
  if (!role) return false;
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};

/**
 * Check if user can view reports/analytics
 * Super Admin and Admin can view reports
 */
export const canViewReports = (role: UserRole | null | undefined): boolean => {
  if (!role) return false;
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};

/**
 * Check if user can export data
 * Super Admin and Admin can export
 */
export const canExportData = (role: UserRole | null | undefined): boolean => {
  if (!role) return false;
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};

/**
 * Check if user can manage patients (create/edit/delete)
 * Super Admin and Admin can manage patients
 */
export const canManagePatients = (role: UserRole | null | undefined): boolean => {
  if (!role) return false;
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};

/**
 * Check if user can create users with specific role
 * Super Admin can create any role
 * Admin can only create User role
 */
export const canCreateUserWithRole = (
  currentUserRole: UserRole | null | undefined,
  targetRole: UserRole
): boolean => {
  if (!currentUserRole) return false;
  
  if (currentUserRole === UserRole.SUPER_ADMIN) {
    return true; // Super Admin can create any role
  }
  
  if (currentUserRole === UserRole.ADMIN) {
    return targetRole === UserRole.USER; // Admin can only create User role
  }
  
  return false; // User role cannot create any users
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole | null | undefined): string => {
  if (!role) return 'Unknown';
  switch (role) {
    case UserRole.ADMIN:
      return 'Pharmacy Admin';
    case UserRole.USER:
      return 'Pharmacy User';
    case UserRole.SUPER_ADMIN:
    default:
      return role;
  }
};

/**
 * Get role color for UI badges
 */
export const getRoleColor = (
  role: UserRole | null | undefined
): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  if (!role) return 'default';
  
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'error'; // Red
    case UserRole.ADMIN:
      return 'warning'; // Orange
    case UserRole.USER:
      return 'success'; // Green
    default:
      return 'default';
  }
};
