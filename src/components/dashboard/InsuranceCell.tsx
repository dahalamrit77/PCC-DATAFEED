import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { coverageService } from '../../services';

interface InsuranceCellProps {
  patientId: number;
}

export const InsuranceCell: React.FC<InsuranceCellProps> = ({ patientId }) => {
  const [insurance, setInsurance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        const coverage = await coverageService.getPatientCoverage(patientId);
        if (coverage && coverage.payers && coverage.payers.length > 0) {
          setInsurance(coverage.payers[0].payerName);
        } else {
          setInsurance(null);
        }
      } catch (error) {
        console.warn(`[InsuranceCell] Failed to fetch coverage for patient ${patientId}`, error);
        setInsurance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInsurance();
  }, [patientId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={12} />
      </Box>
    );
  }

  if (!insurance) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        No Insurance
      </Typography>
    );
  }

  return (
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {insurance}
    </Typography>
  );
};

