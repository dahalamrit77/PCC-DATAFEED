import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PatientDetailsPage } from '../pages/dashboard/PatientDetailsPage';
import { PatientsIndexPage } from '../pages/dashboard/PatientsIndexPage';
import { ProtectedRoute } from '../routes';
import { DashboardWrapper } from '../components/layout/DashboardWrapper';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <DashboardWrapper>
            <DashboardPage />
          </DashboardWrapper>
        ),
      },
      {
        path: 'dashboard/patients',
        element: (
          <DashboardWrapper>
            <PatientsIndexPage />
          </DashboardWrapper>
        ),
      },
      {
        // Explicit flat route for maximum reliability
        path: 'dashboard/patient/:id',
        element: (
          <DashboardWrapper>
            <PatientDetailsPage />
          </DashboardWrapper>
        ),
      },
    ],
  },
]);