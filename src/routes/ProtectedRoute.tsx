import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AUTH_TOKEN_STORAGE_KEY } from '../services';

const LOGIN_ROUTE = '/login';

/**
 * Route guard for authenticated routes.
 * Redirects to login when no auth token is present.
 */
export const ProtectedRoute: React.FC = () => {
  const hasToken =
    typeof window !== 'undefined' && Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));

  if (!hasToken) {
    return <Navigate to={LOGIN_ROUTE} replace />;
  }

  return <Outlet />;
};

