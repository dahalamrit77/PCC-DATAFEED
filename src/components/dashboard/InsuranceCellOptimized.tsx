import React from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
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
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        —
      </Typography>
    );
  }

  // Find primary and secondary payers
  const primaryPayer = coverage.payers.find((p) => p.payerRank === 'Primary');
  const secondaryPayer = coverage.payers.find((p) => p.payerRank === 'Secondary');

  return (
    <Stack spacing={0.25}>
      {primaryPayer && (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.3,
          }}
        >
          {primaryPayer.payerName}
        </Typography>
      )}
      {secondaryPayer && (
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 400,
            fontSize: '0.75rem',
            color: 'text.secondary',
            lineHeight: 1.2,
          }}
        >
          {secondaryPayer.payerName}
        </Typography>
      )}
    </Stack>
  );
};

