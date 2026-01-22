/**
 * Permission Hook
 * Provides easy access to permission checks based on current user's role
 */

import { useAppSelector } from '../../app/store/hooks';
import * as permissions from '../lib/permissions';
import { UserRole } from '../types/user.types';

export const usePermissions = () => {
  const role = useAppSelector((state) => state.auth.user.role);
  
  return {
    // Permission checks
    canCreateUsers: permissions.canCreateUsers(role),
    canManageUsers: permissions.canManageUsers(role),
    canAccessAllFacilities: permissions.canAccessAllFacilities(role),
    canViewReports: permissions.canViewReports(role),
    canExportData: permissions.canExportData(role),
    canManagePatients: permissions.canManagePatients(role),
    canCreateUserWithRole: (targetRole: UserRole) =>
      permissions.canCreateUserWithRole(role, targetRole),
    
    // Role info
    role,
    roleDisplayName: permissions.getRoleDisplayName(role),
    roleColor: permissions.getRoleColor(role),
    
    // Convenience checks
    isSuperAdmin: role === UserRole.SUPER_ADMIN,
    isAdmin: role === UserRole.ADMIN,
    isUser: role === UserRole.USER,
  };
};
