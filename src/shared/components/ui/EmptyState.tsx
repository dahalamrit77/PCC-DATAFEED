/**
 * Empty State Component
 * Consistent empty state display
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  description,
  icon,
}) => {
  return (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      {icon && (
        <Box sx={{ mb: 2, color: 'text.secondary', opacity: 0.6 }}>
          {icon}
        </Box>
      )}
      <Typography variant="body1" sx={{ fontWeight: 500, mb: description ? 0.5 : 0, color: 'text.primary' }}>
        {message}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
};
