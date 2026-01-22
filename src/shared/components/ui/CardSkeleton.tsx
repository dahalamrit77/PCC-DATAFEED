/**
 * Card Skeleton Component
 * Loading skeleton for cards
 */

import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

interface CardSkeletonProps {
  height?: number | string;
  showHeader?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  height = 200,
  showHeader = true,
}) => {
  return (
    <Card sx={{ height }}>
      {showHeader && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Skeleton variant="text" width="40%" height={32} />
        </Box>
      )}
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="70%" height={20} />
      </CardContent>
    </Card>
  );
};
