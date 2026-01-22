/**
 * Section Card Component
 * Consistent card wrapper for content sections
 */

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  sx?: object;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  actions,
  sx,
}) => {
  return (
    <Card sx={{ ...sx }}>
      <CardContent>
        {(title || actions) && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {title}
              </Typography>
            )}
            {actions && <Box>{actions}</Box>}
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
};
