import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DashboardContextType {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DashboardContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};









