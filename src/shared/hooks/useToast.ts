/**
 * Toast Hook
 * Hook to use toast notifications throughout the app
 */

import { useSnackbar } from 'notistack';

export const useToast = () => {
  const { enqueueSnackbar } = useSnackbar();

  return {
    showSuccess: (message: string) => {
      enqueueSnackbar(message, { variant: 'success' });
    },
    showError: (message: string) => {
      enqueueSnackbar(message, { variant: 'error' });
    },
    showInfo: (message: string) => {
      enqueueSnackbar(message, { variant: 'info' });
    },
    showWarning: (message: string) => {
      enqueueSnackbar(message, { variant: 'warning' });
    },
  };
};
