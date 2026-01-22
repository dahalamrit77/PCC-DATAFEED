/**
 * Protected Route Component
 * Route guard for authenticated routes
 * Redirects to login when no auth token is present
 */

import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { storage } from '../../shared/lib/storage';
import { ROUTES } from '../../shared/constants/routes';
import { isTokenValid } from '../../shared/lib/jwt';
import { logout } from '../../features/auth/store/authSlice';

/**
 * Route guard for authenticated routes.
 * Redirects to login when user is not authenticated.
 */
export const ProtectedRoute: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const token = storage.getToken();
  const tokenValid = isTokenValid(token);

  // Keep Redux/auth state in sync if token is invalid
  useEffect(() => {
    if (!tokenValid && isAuthenticated) {
      dispatch(logout());
    }
  }, [tokenValid, isAuthenticated, dispatch]);

  // Auth is true only if Redux says so AND token is valid
  const isAuth = (isAuthenticated && tokenValid) || tokenValid;

  if (!isAuth) {
    // Clear any stale auth data
    storage.clearAuth();
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};
