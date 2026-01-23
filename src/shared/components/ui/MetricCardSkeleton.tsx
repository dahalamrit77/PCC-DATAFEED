/**
 * Metric Card Skeleton Component
 * Loading skeleton for metric cards
 */

import React from 'react';
import { Card, CardContent, Skeleton, Stack } from '@mui/material';

export const MetricCardSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        flex: 1,
        borderTop: '4px solid',
        borderColor: 'divider',
        boxShadow: 2,
        borderRadius: 1,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Skeleton variant="text" width="40%" height={16} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
        <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={14} />
      </CardContent>
    </Card>
  );
};
