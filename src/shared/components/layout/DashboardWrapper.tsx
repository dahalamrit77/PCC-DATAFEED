/**
 * Dashboard Wrapper Component
 * Wraps dashboard pages with DashboardProvider and DashboardLayout
 */

import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { DashboardProvider, useDashboard } from '../../../contexts/DashboardContext';

interface DashboardWrapperInnerProps {
  children: React.ReactNode;
}

const DashboardWrapperInner: React.FC<DashboardWrapperInnerProps> = ({ children }) => {
  const { searchTerm, setSearchTerm } = useDashboard();

  return (
    <DashboardLayout 
      searchTerm={searchTerm} 
      onSearchChange={setSearchTerm}
    >
      {children}
    </DashboardLayout>
  );
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
