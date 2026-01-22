/**
 * Application Routes
 * Centralized routing configuration with fixed URL structure
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import { DashboardWrapper } from '../../shared/components/layout/DashboardWrapper';
import { ROUTES } from '../../shared/constants/routes';
import { UserRole } from '../../shared/types/user.types';

// Lazy load pages for code splitting
const LoginPage = lazy(() =>
  import('../../features/auth/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);

const DashboardPage = lazy(() =>
  import('../../features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);

const PatientsIndexPage = lazy(() =>
  import('../../features/patients/pages/PatientsIndexPage').then((module) => ({
    default: module.PatientsIndexPage,
  }))
);

const PatientDetailsPage = lazy(() =>
  import('../../features/patients/pages/PatientDetailsPage').then((module) => ({
    default: module.PatientDetailsPage,
  }))
);

const CreateUserPage = lazy(() =>
  import('../../features/users/pages/CreateUserPage').then((module) => ({
    default: module.CreateUserPage,
  }))
);

const UsersIndexPage = lazy(() =>
  import('../../features/users/pages/UsersIndexPage').then((module) => ({
    default: module.UsersIndexPage,
  }))
);

const EditUserPage = lazy(() =>
  import('../../features/users/pages/EditUserPage').then((module) => ({
    default: module.EditUserPage,
  }))
);

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.ROOT,
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: (
          <DashboardWrapper>
            <Suspense fallback={<LoadingFallback />}>
              <DashboardPage />
            </Suspense>
          </DashboardWrapper>
        ),
      },
      {
        path: 'patients',
        element: (
          <DashboardWrapper>
            <Suspense fallback={<LoadingFallback />}>
              <PatientsIndexPage />
            </Suspense>
          </DashboardWrapper>
        ),
      },
      {
        path: 'patients/:id',
        element: (
          <DashboardWrapper>
            <Suspense fallback={<LoadingFallback />}>
              <PatientDetailsPage />
            </Suspense>
          </DashboardWrapper>
        ),
      },
      {
        path: 'users',
        element: (
          <DashboardWrapper>
            <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
              <Suspense fallback={<LoadingFallback />}>
                <UsersIndexPage />
              </Suspense>
            </RoleProtectedRoute>
          </DashboardWrapper>
        ),
      },
      {
        path: 'users/create',
        element: (
          <DashboardWrapper>
            <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
              <Suspense fallback={<LoadingFallback />}>
                <CreateUserPage />
              </Suspense>
            </RoleProtectedRoute>
          </DashboardWrapper>
        ),
      },
      {
        path: 'users/:userId/edit',
        element: (
          <DashboardWrapper>
            <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
              <Suspense fallback={<LoadingFallback />}>
                <EditUserPage />
              </Suspense>
            </RoleProtectedRoute>
          </DashboardWrapper>
        ),
      },
    ],
  },
]);
