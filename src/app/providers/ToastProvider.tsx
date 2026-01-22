/**
 * Toast Notification Provider
 * Provides global toast notifications using notistack
 */

import React from 'react';
import { SnackbarProvider } from 'notistack';
import { useTheme } from '@mui/material/styles';

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={4000}
      dense
      preventDuplicate
    >
      {children}
    </SnackbarProvider>
  );
};

