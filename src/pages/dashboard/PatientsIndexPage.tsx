import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import type { Patient } from '../../types/patient.types';
import { InsuranceCellOptimized } from '@components/dashboard/InsuranceCellOptimized';
import { PageHeader, DataTableContainer } from '@shared/components/ui';
import { useAppSelector } from '@app/store/hooks';
import { useGetPatientsPageQuery } from '@features/patients/api/patientsApi';
import { useGetMultiplePatientCoverageQuery } from '@features/patients/api/coverageApi';
import { usePermissions } from '@shared/hooks/usePermissions';
import { ROUTES } from '@shared/constants/routes';

export const PatientsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { canExportData } = usePermissions();
  
  // Redux: Get facility state (RBAC)
  const { selectedFacilityId } = useAppSelector(
    (state) => state.facility
  );
  
  // Filter states
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch paginated patients using RTK Query with status filter
  const {
    data: patientsPage,
    isLoading,
    isFetching,
    error: patientsError,
  } = useGetPatientsPageQuery({ 
    pageNumber,
    patientStatus: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const allPatients = patientsPage?.data ?? [];
  const totalCount = patientsPage?.totalCount ?? 0;
  const hasMore = patientsPage?.hasMore ?? false;

  // Filter patients by selected facility on frontend
  const patients = useMemo(() => {
    if (selectedFacilityId !== null) {
      return allPatients.filter((p) => p.facId === selectedFacilityId);
    }
    return allPatients;
  }, [allPatients, selectedFacilityId]);

  const errorMessage = patientsError
    ? 'Failed to retrieve patient data.'
    : null;

  // Filter patients - Status filtering is now handled by API, only search filtering on frontend
  // Note: Facility filtering is handled by API interceptor, so all patients here are already filtered
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search filter (status is handled by API)
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const patientName = `${patient.lastName}, ${patient.firstName}`.toLowerCase();
        const patientIdStr = patient.patientId.toString();
        if (!patientName.includes(searchLower) && !patientIdStr.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  }, [patients, searchTerm]);

  // Optimize coverage fetching - only fetch for filtered/visible patients
  const visiblePatientIds = useMemo(() => {
    return filteredPatients.map((p) => p.patientId);
  }, [filteredPatients]);

  // Fetch coverage for visible patients in parallel using RTK Query
  const {
    data: coverageMap = {},
    isLoading: coverageLoading,
  } = useGetMultiplePatientCoverageQuery(visiblePatientIds, {
    skip: visiblePatientIds.length === 0,
  });

  const getCoverage = (patientId: number) => {
    return coverageMap[patientId] || null;
  };

  const getStatusBadge = (patient: Patient) => {
    if (patient.patientStatus === 'Discharged') {
      return <Chip label="Discharged" size="small" color="error" sx={{ fontWeight: 600 }} />;
    }
    if (patient.patientStatus === 'Current') {
      return <Chip label="Active" size="small" color="success" sx={{ fontWeight: 600 }} />;
    }
    return <Chip label="New" size="small" color="info" sx={{ fontWeight: 600 }} />;
  };

  const handleRowClick = (patientId: number) => {
    navigate(ROUTES.PATIENT_DETAIL(patientId));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Patients"
        subtitle="Complete patient directory"
        actions={
          canExportData ? (
            <Button variant="outlined" size="small">
              Export
            </Button>
          ) : undefined
        }
      />

      {/* Search and Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <TextField
          placeholder="Search patients"
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            // Reset to first page when search term changes
            setPageNumber(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, maxWidth: 400 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={statusFilter} onChange={(e) => {
            setStatusFilter(e.target.value);
            // Reset pagination when filter changes
            setPageNumber(1);
          }}>
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="discharged">Discharged</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Error Message */}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {/* Table */}
      <DataTableContainer
        loading={isLoading || isFetching}
        empty={filteredPatients.length === 0 && !isLoading && !isFetching}
        emptyMessage="No patients found."
        error={errorMessage}
      >
        <TableHead>
          <TableRow>
            <TableCell>RESIDENT</TableCell>
            <TableCell>STATUS</TableCell>
            <TableCell>ROOM/BED</TableCell>
            <TableCell>INSURANCE</TableCell>
            <TableCell>DOB / GENDER</TableCell>
            <TableCell align="right">ACTIONS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPatients.map((patient) => (
            <TableRow
              key={patient.patientId}
              hover
              onClick={() => handleRowClick(patient.patientId)}
              sx={{ cursor: 'pointer', '&:active': { backgroundColor: 'action.selected' } }}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {patient.lastName}, {patient.firstName}
                </Typography>
              </TableCell>
              <TableCell>{getStatusBadge(patient)}</TableCell>
              <TableCell>
                {patient.roomDesc && patient.bedDesc
                  ? `${patient.roomDesc}-${patient.bedDesc}`
                  : '—'}
              </TableCell>
              <TableCell>
                <InsuranceCellOptimized
                  coverage={getCoverage(patient.patientId)}
                  loading={coverageLoading}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {patient.birthDate}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {patient.gender}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <IconButton
                    size="small"
                    aria-label="View patient details"
                    onClick={(e) => { e.stopPropagation(); handleRowClick(patient.patientId); }}
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      color: 'text.secondary',
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="More actions"
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      color: 'text.secondary',
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTableContainer>

      {/* Pagination Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {totalCount > 0 && !isLoading && !isFetching
            ? `Showing ${(pageNumber - 1) * allPatients.length + 1}-${
                Math.min(
                  (pageNumber - 1) * allPatients.length + filteredPatients.length,
                  totalCount
                )
              } of ${totalCount.toLocaleString()} patients`
            : isLoading || isFetching
            ? 'Loading patients...'
            : 'No patients to display'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            disabled={pageNumber === 1 || isLoading || isFetching}
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={!hasMore || isLoading || isFetching}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Next
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

