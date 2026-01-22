import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  Typography,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon,
  CreditCard as CreditCardIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import type { PatientEvent, Patient } from '../../types/patient.types';
import { InsuranceCellOptimized } from '../../components/dashboard/InsuranceCellOptimized';
import { useDashboard } from '../../contexts/DashboardContext';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setActiveFacility } from '../../store/slices/facilitySlice';
import { useGetFacilitiesQuery } from '../../entities/facility/api/facilityApi';
import { ROUTES } from '../../shared/constants/routes';
import { useGetPatientsQuery } from '../../features/patients/api/patientsApi';
import { useGetEventsQuery } from '../../features/patients/api/eventsApi';
import { useGetMultiplePatientCoverageQuery } from '../../features/patients/api/coverageApi';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { PageHeader, SectionCard, DataTableContainer, LiveUpdates } from '../../shared/components/ui';

interface TableRowData {
  patient: Patient;
  event: PatientEvent | null;
}

const getEventTypeIcon = (eventType: string) => {
  switch (eventType) {
    case 'HOAStatus':
    case 'HospitalTransfer':
      return <HospitalIcon fontSize="small" sx={{ color: 'warning.main' }} />;
    case 'InsuranceUpdate':
      return <CreditCardIcon fontSize="small" sx={{ color: 'info.main' }} />;
    case 'RoomChange':
      return <HomeIcon fontSize="small" sx={{ color: 'success.main' }} />;
    case 'Discharge':
    case 'Death':
      return <AssignmentIcon fontSize="small" sx={{ color: 'error.main' }} />;
    default:
      return (
        <AssignmentIcon
          fontSize="small"
          sx={{ color: 'text.secondary' }}
        />
      );
  }
};

const getEventTypeLabel = (eventType: string) => {
  switch (eventType) {
    case 'RoomChange':
      return 'Room Change';
    case 'InsuranceUpdate':
      return 'Insurance Update';
    case 'HospitalTransfer':
      return 'Hospital Transfer';
    case 'HOAStatus':
      return 'HOA Status';
    case 'Death':
      return 'Death';
    default:
      return eventType.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
};

const formatEventTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const distance = formatDistanceToNow(date, { addSuffix: true });
    // Convert "about X hours ago" to "X hours ago" for cleaner display
    return distance.replace('about ', '');
  } catch (error) {
    return 'Unknown';
  }
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { searchTerm } = useDashboard();
  const dispatch = useAppDispatch();
  const { canExportData, canManagePatients } = usePermissions();
  
  // Redux: Get auth and facility state (RBAC)
  const { user } = useAppSelector((state) => state.auth);
  const { selectedFacilityId, facilityIds } = useAppSelector(
    (state) => state.facility
  );
  
  // Fetch facilities using RTK Query
  const { data: facilities = [] } = useGetFacilitiesQuery();
  
  // Check if user is admin (has multiple facilities)
  // Prefer Redux facilityIds / facilities, but also treat test@example.com as admin explicitly
  const isEmailAdmin = user.email === 'test@example.com';
  const isFacilityAdmin = facilityIds.length > 1 || facilities.length > 1;
  const isAdmin = isEmailAdmin || isFacilityAdmin;
  
  // Fetch patients via RTK Query
  const {
    data: allPatients = [],
    isLoading: isLoadingPatients,
    error: patientsError,
  } = useGetPatientsQuery();

  // Fetch events via RTK Query
  const {
    data: events = [],
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useGetEventsQuery();

  const isLoading = isLoadingPatients || isLoadingEvents;
  const errorMessage =
    patientsError || eventsError ? 'Failed to retrieve census data.' : null;
  
  // Filter states (facility filter removed - handled by API interceptor)
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('24h');

  /**
   * Latest event per patient (by timestamp) for fast lookup.
   */
  const latestEventByPatientId = useMemo(() => {
    const map = new Map<number, PatientEvent>();

    events.forEach((event) => {
      const existing = map.get(event.patientId);
      if (!existing) {
        map.set(event.patientId, event);
        return;
      }

      const existingTime = new Date(existing.timestamp).getTime();
      const currentTime = new Date(event.timestamp).getTime();

      if (currentTime > existingTime) {
        map.set(event.patientId, event);
      }
    });

    return map;
  }, [events]);

  // Filter patients by selected facility on frontend
  const patients = useMemo<Patient[]>(() => {
    if (selectedFacilityId !== null) {
      return allPatients.filter((p) => p.facId === selectedFacilityId);
    }
    return allPatients;
  }, [allPatients, selectedFacilityId]);

  // Optimize coverage fetching - only fetch for patients that will be visible
  // in the dashboard table. The dashboard is events-driven, so only patients
  // with at least one event are considered here.
  const visiblePatientIds = useMemo(() => {
    const filtered = patients
      .map((patient) => {
        const event = latestEventByPatientId.get(patient.patientId) ?? null;
        return { patient, event };
      })
      .filter((row) => {
        if (!row.event) {
          return false;
        }

        if (statusFilter !== 'all') {
          if (
            statusFilter === 'active' &&
            row.patient.patientStatus !== 'Current'
          ) {
            return false;
          }
          if (
            statusFilter === 'discharged' &&
            row.patient.patientStatus !== 'Discharged'
          ) {
            return false;
          }
        }

        if (eventTypeFilter !== 'all' && row.event.eventType !== eventTypeFilter) {
          return false;
        }

        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          const patientName = `${row.patient.lastName}, ${row.patient.firstName}`.toLowerCase();
          const patientIdStr = row.patient.patientId.toString();
          if (
            !patientName.includes(searchLower) &&
            !patientIdStr.includes(searchLower)
          ) {
            return false;
          }
        }

        return true;
      });

    return filtered.map((row) => row.patient.patientId);
  }, [patients, latestEventByPatientId, statusFilter, eventTypeFilter, searchTerm]);

  // Fetch coverage for visible patients in parallel using RTK Query
  const {
    data: coverageMap = {},
    isLoading: coverageLoading,
  } = useGetMultiplePatientCoverageQuery(visiblePatientIds, {
    skip: visiblePatientIds.length === 0,
  });

  const getCoverage = (patientId: number) => coverageMap[patientId] || null;

  // Calculate KPI metrics
  const metrics = useMemo(() => {
    const totalCensus = patients.filter((p) => p.patientStatus !== 'Discharged').length;
    return {
      totalCensus,
      insuranceChanges: 27, // Hardcoded as per requirements
    };
  }, [patients]);

  // Create table rows using patients as primary source, enriched with most recent event.
  // IMPORTANT: The dashboard only shows patients that have at least one event.
  const tableRows = useMemo((): TableRowData[] => {
    return patients
      .map((patient) => {
        const event = latestEventByPatientId.get(patient.patientId) ?? null;
        return { patient, event };
      })
      .filter((row) => {
        if (!row.event) {
          return false;
        }

        if (statusFilter !== 'all') {
          if (
            statusFilter === 'active' &&
            row.patient.patientStatus !== 'Current'
          ) {
            return false;
          }
          if (
            statusFilter === 'discharged' &&
            row.patient.patientStatus !== 'Discharged'
          ) {
            return false;
          }
        }

        if (eventTypeFilter !== 'all' && row.event.eventType !== eventTypeFilter) {
          return false;
        }

        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          const patientName = `${row.patient.lastName}, ${row.patient.firstName}`.toLowerCase();
          const patientIdStr = row.patient.patientId.toString();
          if (
            !patientName.includes(searchLower) &&
            !patientIdStr.includes(searchLower)
          ) {
            return false;
          }
        }

        if (row.event) {
          const eventDate = new Date(row.event.timestamp);
          const hoursAgo =
            (Date.now() - eventDate.getTime()) / (1000 * 60 * 60);
          const daysAgo = hoursAgo / 24;

          if (dateRangeFilter === '24h' && hoursAgo > 24) {
            return false;
          }
          if (dateRangeFilter === '7d' && daysAgo > 7) {
            return false;
          }
          if (dateRangeFilter === '30d' && daysAgo > 30) {
            return false;
          }
        }

        return true;
      });
  }, [
    patients,
    latestEventByPatientId,
    statusFilter,
    eventTypeFilter,
    searchTerm,
    dateRangeFilter,
  ]);

  const getStatusBadge = (patient: Patient | null, event: PatientEvent | null) => {
    if (!patient) {
      return (
        <Chip
          label="Unknown"
          size="small"
          color="default"
          sx={{ fontWeight: 600 }}
        />
      );
    }

    if (event?.eventType === 'Death') {
      return (
        <Chip
          label="Deceased"
          size="small"
          color="error"
          sx={{ fontWeight: 600 }}
        />
      );
    }

    if (patient.patientStatus === 'Discharged') {
      return (
        <Chip
          label="Discharged"
          size="small"
          color="error"
          sx={{ fontWeight: 600 }}
        />
      );
    }

    return (
      <Chip
        label="Active"
        size="small"
        color="success"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const renderRoomCell = (patient: Patient, event: PatientEvent | null) => {
    if (event?.eventType === 'RoomChange') {
      const newRoom = event.room || patient.roomDesc || '';
      const previousRoom = event.previousRoom || '';

      if (newRoom || previousRoom) {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {newRoom || previousRoom}
            </Typography>
            {newRoom && previousRoom && newRoom !== previousRoom && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                {previousRoom} → {newRoom}
              </Typography>
            )}
          </Box>
        );
      }
    }

    if (patient.roomDesc && patient.bedDesc) {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`${patient.roomDesc}-${patient.bedDesc}`}
        </Typography>
      );
    }

    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        —
      </Typography>
    );
  };

  const handleRowClick = (patientId: number) => {
    navigate(ROUTES.PATIENT_DETAIL(patientId));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* KPI Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <MetricCard
          title="TOTAL CENSUS"
          value={metrics.totalCensus}
          change="↑ 2.4% from last week"
          changeColor="success"
          icon={<PeopleIcon />}
          iconColor="#7b2cbf"
          loading={isLoading}
        />
        <MetricCard
          title="INSURANCE CHANGES"
          value={metrics.insuranceChanges}
          change="↑ 8 new today"
          changeColor="success"
          icon={<CreditCardIcon />}
          iconColor="#0288d1"
          loading={isLoading}
        />
      </Stack>

      {/* Recent Census Updates Section */}
      <SectionCard
        title="Recent Census Updates"
        actions={
          canExportData ? (
            <Button variant="outlined" size="small">
              Export
            </Button>
          ) : undefined
        }
      >
        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="discharged">Discharged</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Events</MenuItem>
              <MenuItem value="RoomChange">Room Change</MenuItem>
              <MenuItem value="InsuranceUpdate">Insurance Update</MenuItem>
              <MenuItem value="HospitalTransfer">Hospital Transfer</MenuItem>
              <MenuItem value="HOAStatus">HOA Status</MenuItem>
              <MenuItem value="Discharge">Discharge</MenuItem>
              <MenuItem value="Death">Death</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)}>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Table */}
        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

        <DataTableContainer
          loading={isLoading}
          empty={tableRows.length === 0}
          emptyMessage="No records found."
          error={errorMessage}
        >
          <TableHead>
            <TableRow>
              <TableCell>RESIDENT</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell>ROOM/BED</TableCell>
              <TableCell>INSURANCE</TableCell>
              <TableCell>EVENT TYPE</TableCell>
              <TableCell>TIME</TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((row) => (
              <TableRow
                key={row.patient.patientId}
                hover
                onClick={() => handleRowClick(row.patient.patientId)}
                sx={{
                  cursor: 'pointer',
                  '&:active': { backgroundColor: 'action.selected' },
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {row.patient.lastName}, {row.patient.firstName}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getStatusBadge(row.patient, row.event)}
                </TableCell>
                <TableCell>{renderRoomCell(row.patient, row.event)}</TableCell>
                <TableCell>
                  <InsuranceCellOptimized
                    coverage={getCoverage(row.patient.patientId)}
                    loading={coverageLoading}
                  />
                </TableCell>
                <TableCell>
                  {row.event ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getEventTypeIcon(row.event.eventType)}
                      <Typography
                        variant="body2"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {getEventTypeLabel(row.event.eventType)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.875rem' }}>
                      No recent event
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {row.event ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {formatEventTime(row.event.timestamp)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.875rem' }}>
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleRowClick(row.patient.patientId); }}
                      sx={{
                        '&:hover': { backgroundColor: 'action.hover' },
                        color: 'text.secondary',
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
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
      </SectionCard>

      {/* Live Updates Panel */}
      <LiveUpdates patients={allPatients} />
    </Box>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  change: string;
  changeColor: 'success' | 'error' | 'warning' | 'info';
  icon: React.ReactNode;
  iconColor: string;
  loading: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeColor,
  icon,
  iconColor,
  loading,
}) => (
  <Card
    sx={{
      flex: 1,
      borderTop: `4px solid ${iconColor}`,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
        <Box sx={{ color: iconColor, opacity: 0.8 }}>{icon}</Box>
      </Box>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 1,
          fontSize: { xs: '2rem', sm: '2.5rem' },
          lineHeight: 1.2,
        }}
      >
        {loading ? '—' : value.toLocaleString()}
      </Typography>
      <Typography variant="caption" color={`${changeColor}.main`} sx={{ fontWeight: 600 }}>
        {change}
      </Typography>
    </CardContent>
  </Card>
);
