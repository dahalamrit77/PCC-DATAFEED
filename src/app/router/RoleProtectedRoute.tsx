/**
 * Role Protected Route Component
 * Protects routes based on user role
 */

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { ROUTES } from '@shared/constants/routes';
import { UserRole } from '@shared/types/user.types';
import { useToast } from '@shared/hooks/useToast';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { role, isAuthenticated } = useAppSelector((state) => state.auth.user);
  const { showError } = useToast();

  // First check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Then check if user has required role
  const hasPermission = role && allowedRoles.includes(role);

  useEffect(() => {
    if (!hasPermission && isAuthenticated) {
      showError('You do not have permission to access this page');
    }
  }, [hasPermission, isAuthenticated, showError]);

  if (!hasPermission) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
