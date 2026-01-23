/**
 * Data Table Container Component
 * Consistent table wrapper with loading, empty, and error states
 */

import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableContainer,
  Typography,
} from '@mui/material';
import { TableSkeleton } from './TableSkeleton';

interface DataTableContainerProps {
  children: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  error?: string | null;
  stickyHeader?: boolean;
  sx?: object;
}

export const DataTableContainer: React.FC<DataTableContainerProps> = ({
  children,
  loading = false,
  empty = false,
  emptyMessage = 'No records found.',
  error = null,
  stickyHeader = false,
  sx,
}) => {
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="error.main">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ ...sx }}
      elevation={0}
      aria-busy={loading}
    >
      {loading ? (
        <Box sx={{ p: 3 }} role="status" aria-label="Loading table">
          <TableSkeleton rows={8} columns={6} />
        </Box>
      ) : empty ? (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <Table stickyHeader={stickyHeader} size="medium">
          {children}
        </Table>
      )}
    </TableContainer>
  );
};
