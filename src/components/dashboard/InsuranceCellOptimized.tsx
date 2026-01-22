import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { Coverage } from '../../types/patient.types';

interface InsuranceCellOptimizedProps {
  coverage: Coverage | null | undefined;
  loading?: boolean;
}

export const InsuranceCellOptimized: React.FC<InsuranceCellOptimizedProps> = ({ 
  coverage, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={12} />
      </Box>
    );
  }

  if (!coverage || !coverage.payers || coverage.payers.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        No Insurance
      </Typography>
    );
  }

  return (
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {coverage.payers[0].payerName}
    </Typography>
  );
};

