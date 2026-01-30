import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { formatEventTime } from '@shared/lib/date';
import type { PatientEvent, Patient } from '../../types/patient.types';
import { InsuranceCellOptimized, EventDetailsDrawer } from '@components/dashboard';
import { useDashboard } from '@contexts/DashboardContext';
import { useAppSelector } from '@app/store/hooks';
import { ROUTES } from '@shared/constants/routes';
import { useGetPatientsQuery, useGetPatientsPageQuery } from '@features/patients/api/patientsApi';
import { useGetEventsQuery } from '@features/patients/api/eventsApi';
import { useGetMultiplePatientCoverageQuery } from '@features/patients/api/coverageApi';
import { usePermissions } from '@shared/hooks/usePermissions';
import { SectionCard, DataTableContainer, LiveUpdates } from '@shared/components/ui';

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

const SEEN_EVENTS_STORAGE_KEY = 'pcc_dashboard_seen_event_ids';
const SEEN_EVENTS_MAX = 500;

function getSeenEventIdsFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_EVENTS_STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function persistSeenEventIds(ids: Set<string>) {
  try {
    const arr = [...ids];
    if (arr.length > SEEN_EVENTS_MAX) {
      arr.splice(0, arr.length - SEEN_EVENTS_MAX);
    }
    localStorage.setItem(SEEN_EVENTS_STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { searchTerm } = useDashboard();
  const { canExportData } = usePermissions();
  const [seenEventIds, setSeenEventIds] = useState<Set<string>>(getSeenEventIdsFromStorage);

  useEffect(() => {
    const onFocus = () => setSeenEventIds(getSeenEventIdsFromStorage());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);
  
  // Redux: Get auth and facility state (RBAC)
  const { selectedFacilityId } = useAppSelector(
    (state) => state.facility
  );
  
  // Fetch patients via RTK Query
  const {
    data: allPatients = [],
    isLoading: isLoadingPatients,
    error: patientsError,
  } = useGetPatientsQuery();

  // Total census: use totalCount from api/patients?patientStatus=current (and facilityId when filter applied)
  const { data: censusPage, isLoading: isLoadingCensus } = useGetPatientsPageQuery({
    pageNumber: 1,
    patientStatus: 'current',
    facilityId: selectedFacilityId ?? undefined,
  });

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
  const [selectedEvent, setSelectedEvent] = useState<PatientEvent | null>(null);

  /**
   * Latest event per patient (by timestamp) for fast lookup.
   * Filters out events with invalid patientId (0 or undefined).
   */
  const latestEventByPatientId = useMemo(() => {
    const map = new Map<number, PatientEvent>();

    events.forEach((event) => {
      // Skip events with invalid patientId
      if (!event.patientId || event.patientId === 0) {
        return;
      }

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

  // Coverage is fetched for patient IDs in tableRows (see coveragePatientIds below).

  // Calculate KPI metrics
  const metrics = useMemo(() => {
    // Total census: use totalCount from API response (api/patients?patientStatus=current, optional facilityId)
    const totalCensus =
      censusPage != null && typeof censusPage.totalCount === 'number'
        ? censusPage.totalCount
        : 0;
    
    // Count InsuranceUpdate events filtered by selected facility
    // Create a map of patients by patientId for facility lookup
    const patientsMap = new Map<number, Patient>();
    allPatients.forEach((patient) => {
      patientsMap.set(patient.patientId, patient);
    });
    
    const filterEventsByFacility = (list: typeof events) => {
      if (selectedFacilityId === null) return list;
      return list.filter((event) => {
        const patient = patientsMap.get(event.patientId);
        if (patient?.facId === selectedFacilityId) return true;
        if (event.facility != null) {
          const eventFacilityId =
            typeof event.facility === 'number'
              ? event.facility
              : parseInt(String(event.facility), 10);
          if (!isNaN(eventFacilityId) && eventFacilityId === selectedFacilityId) return true;
        }
        return false;
      });
    };

    const insuranceChanges = filterEventsByFacility(events.filter((e) => e.eventType === 'InsuranceUpdate')).length;
    const roomChanges = filterEventsByFacility(events.filter((e) => e.eventType === 'RoomChange')).length;

    return {
      totalCensus,
      insuranceChanges,
      roomChanges,
    };
  }, [censusPage, selectedFacilityId, allPatients, events]);

  // Helper: event belongs to selected facility (when facility filter is applied)
  const eventMatchesFacility = useCallback(
    (row: TableRowData): boolean => {
      if (selectedFacilityId === null) return true;
      if (row.patient.facId === selectedFacilityId) return true;
      const event = row.event;
      if (!event?.facility) return false;
      const eventFacilityId =
        typeof event.facility === 'number'
          ? event.facility
          : parseInt(String(event.facility), 10);
      return !isNaN(eventFacilityId) && eventFacilityId === selectedFacilityId;
    },
    [selectedFacilityId]
  );

  // Create table rows using events as primary source, enriched with patient data.
  // When facility filter is applied, only show events from that facility.
  const tableRows = useMemo((): TableRowData[] => {
    // Create a map of patients by patientId for fast lookup
    const patientsMap = new Map<number, Patient>();
    patients.forEach((patient) => {
      patientsMap.set(patient.patientId, patient);
    });

    // Start with events and match to patients
    const rows: TableRowData[] = [];
    latestEventByPatientId.forEach((event, patientId) => {
      const patient = patientsMap.get(patientId);
      const row: TableRowData = {
        patient: patient || {
          patientId,
          firstName: event.patientName?.split(', ')[1] || event.patientName || 'Unknown',
          lastName: event.patientName?.split(', ')[0] || 'Patient',
          birthDate: '',
          gender: '',
          patientStatus: 'Current' as const,
        },
        event,
      };
      if (!eventMatchesFacility(row)) return;
      rows.push(row);
    });

    return rows.filter((row) => {
        if (!row.event) {
          return false;
        }

        // Only apply status filter if we have a real patient match
        // Events without matching patients use 'Current' status, so they'll pass 'active' filter
        const hasRealPatient = patientsMap.has(row.patient.patientId);
        if (hasRealPatient && statusFilter !== 'all') {
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

        if (row.event && row.event.timestamp) {
          try {
            const eventDate = new Date(row.event.timestamp);
            // Skip if date is invalid
            if (isNaN(eventDate.getTime())) {
              // If date is invalid and filter is not 'all', exclude it
              // Otherwise include it (for 'all' filter)
              if (dateRangeFilter !== 'all') {
                return false;
              }
            } else {
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
          } catch (error) {
            // If date parsing fails and filter is not 'all', exclude it
            if (dateRangeFilter !== 'all') {
              return false;
            }
          }
        }

        return true;
      });
  }, [
    patients,
    latestEventByPatientId,
    eventMatchesFacility,
    statusFilter,
    eventTypeFilter,
    searchTerm,
    dateRangeFilter,
  ]);

  // Fetch coverage for exactly the patients in the displayed table rows
  const coveragePatientIds = useMemo(
    () => [...new Set(tableRows.map((r) => r.patient.patientId))],
    [tableRows]
  );
  const {
    data: coverageMap = {},
    isLoading: coverageLoading,
  } = useGetMultiplePatientCoverageQuery(coveragePatientIds, {
    skip: coveragePatientIds.length === 0,
  });
  const getCoverage = (patientId: number) => coverageMap[patientId] || null;

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

  const handleRowClick = useCallback(
    (event: PatientEvent) => {
      const eventId = event.eventId;
      const next = new Set(seenEventIds);
      next.add(eventId);
      setSeenEventIds(next);
      persistSeenEventIds(next);
      setSelectedEvent(event);
    },
    [seenEventIds]
  );

  const handleCloseDrawer = useCallback(() => setSelectedEvent(null), []);

  const handleViewPatientFromDrawer = useCallback(
    (patientId: number) => {
      setSelectedEvent(null);
      navigate(ROUTES.PATIENT_DETAIL(patientId));
    },
    [navigate]
  );

  const handlePatientNameClick = useCallback(
    (e: React.MouseEvent, patientId: number) => {
      e.stopPropagation();
      navigate(ROUTES.PATIENT_DETAIL(patientId));
    },
    [navigate]
  );

  const isEventNew = useCallback(
    (eventId: string) => !seenEventIds.has(eventId),
    [seenEventIds]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* KPI Cards - separated with consistent gaps */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ '& > *': { flex: 1, minWidth: 0 } }}
      >
        <MetricCard
          title="TOTAL CENSUS"
          value={metrics.totalCensus}
          icon={<PeopleIcon />}
          iconColor="#7b2cbf"
          loading={isLoading || isLoadingCensus}
        />
        <MetricCard
          title="ROOM CHANGES"
          value={metrics.roomChanges}
          icon={<HomeIcon />}
          iconColor="#2e7d32"
          loading={isLoading}
        />
        <MetricCard
          title="INSURANCE CHANGES"
          value={metrics.insuranceChanges}
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
              <MenuItem value="Death">Death</MenuItem>
              <MenuItem value="Admission">Admission</MenuItem>
              <MenuItem value="RoomReserve">Room Reserve</MenuItem>
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
            {tableRows.map((row) => {
              const isNew = row.event ? isEventNew(row.event.eventId) : false;
              return (
              <TableRow
                key={row.event?.eventId ?? row.patient.patientId}
                hover
                onClick={() => row.event && handleRowClick(row.event)}
                sx={{
                  cursor: 'pointer',
                  '&:active': { backgroundColor: 'action.selected' },
                  ...(isNew && {
                    borderLeft: '4px solid',
                    borderLeftColor: 'primary.main',
                    animation: 'dashboardNewRow 2s ease-in-out infinite',
                    '@keyframes dashboardNewRow': {
                      '0%, 100%': {
                        backgroundColor: 'rgba(0, 158, 220, 0.1)',
                        borderLeftColor: '#009EDC',
                      },
                      '50%': {
                        backgroundColor: 'rgba(0, 158, 220, 0.22)',
                        borderLeftColor: '#0078A8',
                      },
                    },
                  }),
                }}
              >
                <TableCell>
                  <Typography
                    component="button"
                    variant="body2"
                    onClick={(e) => handlePatientNameClick(e, row.patient.patientId)}
                    sx={{
                      fontWeight: 500,
                      color: 'primary.main',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      font: 'inherit',
                      '&:hover': { color: 'primary.dark' },
                    }}
                  >
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
                      aria-label="View event details"
                      onClick={(e) => { e.stopPropagation(); row.event && handleRowClick(row.event); }}
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
            );
            })}
          </TableBody>
        </DataTableContainer>
      </SectionCard>

      {/* Event details drawer */}
      <EventDetailsDrawer
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={handleCloseDrawer}
        onViewPatient={handleViewPatientFromDrawer}
      />

      {/* Live Updates Panel */}
      <LiveUpdates patients={allPatients} />
    </Box>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  loading: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
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
          fontSize: { xs: '2rem', sm: '2.5rem' },
          lineHeight: 1.2,
        }}
      >
        {loading ? '—' : value.toLocaleString()}
      </Typography>
    </CardContent>
  </Card>
);
