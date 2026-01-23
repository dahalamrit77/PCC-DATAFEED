/**
 * Dashboard Wrapper Component
 * Wraps dashboard pages with DashboardProvider and DashboardLayout
 */

import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { DashboardProvider } from '@contexts/DashboardContext';

interface DashboardWrapperInnerProps {
  children: React.ReactNode;
}

const DashboardWrapperInner: React.FC<DashboardWrapperInnerProps> = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <DashboardWrapperInner>
        {children}
      </DashboardWrapperInner>
    </DashboardProvider>
  );
};
