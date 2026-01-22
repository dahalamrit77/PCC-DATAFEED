import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
  Tabs,
  Tab,
  Divider,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { usePatientDetails } from '../hooks/usePatientDetails';
import { CardSkeleton, PageHeader, SectionCard, DataTableContainer, EmptyState } from '../../../shared/components/ui';
import { ROUTES } from '../../../shared/constants/routes';
import type { AdtRecord, PatientEvent } from '../../../types/patient.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  if (value !== index) return null;

  return (
    <Box
      role="tabpanel"
      id={`patient-details-tabpanel-${index}`}
      aria-labelledby={`patient-details-tab-${index}`}
      sx={{ mt: 2 }}
    >
      {children}
    </Box>
  );
};

const tabA11yProps = (index: number) => ({
  id: `patient-details-tab-${index}`,
  'aria-controls': `patient-details-tabpanel-${index}`,
});

export const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { patient, isLoading, error } = usePatientDetails(id ?? '');
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box>
        {/* HEADER SKELETON */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={80} height={80} />
            <Box>
              <Skeleton variant="text" width={220} height={16} />
              <Skeleton variant="text" width={320} height={40} sx={{ mt: 1 }} />
              <Skeleton variant="text" width={280} height={20} sx={{ mt: 1 }} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" width={140} height={36} />
        </Box>

        {/* TABS SKELETON */}
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 2 }} />
        <CardSkeleton height={300} />
      </Box>
    );
  }

  if (error || !patient) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error && 'data' in (error as any) && (error as any).data?.message
          ? (error as any).data.message
          : 'Patient not found'}
      </Alert>
    );
  }

  const initials = `${patient.firstName?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`.toUpperCase();

  // Format location as Unit-Room-Bed (e.g., "2E63ECA4-202-B")
  const locationParts: string[] = [
    (patient as any).unitName || (patient as any).unitDesc || '',
    patient.roomDesc || '',
    patient.bedDesc || '',
  ].filter(Boolean);

  const formattedLocation = locationParts.length > 0 ? locationParts.join('-') : 'N/A';

  return (
    <Box>
      {/* PATIENT PROFILE HEADER */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Avatar with Initials */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {initials}
              </Box>

              {/* Patient Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Patient Profile
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {patient.lastName}, {patient.firstName}
                  </Typography>
                  <Chip
                    label={patient.patientStatus}
                    color={patient.patientStatus === 'Current' ? 'success' : 'default'}
                    size="small"
                  />
                </Stack>
                <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Status
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {patient.patientStatus}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Location
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formattedLocation}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Gender
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {patient.gender}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      DOB
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {patient.birthDate}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Age
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {patient.birthDate
                        ? Math.floor(
                            (new Date().getTime() - new Date(patient.birthDate).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000)
                          )
                        : '—'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => navigate(ROUTES.PATIENTS)}>
                Back to List
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* TABS SECTION */}
      <Box>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" {...tabA11yProps(0)} />
          <Tab label="ADT History" {...tabA11yProps(1)} />
          <Tab label="Coverage" {...tabA11yProps(2)} />
          <Tab label="Recent Events" {...tabA11yProps(3)} />
        </Tabs>
        <Divider />

        {/* OVERVIEW TAB */}
        <TabPanel value={activeTab} index={0}>
          <SectionCard title="Current Location">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Room
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {patient.roomDesc || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Bed
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {patient.bedDesc || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Unit
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {(patient as any).unitName || (patient as any).unitDesc || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Floor
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {(patient as any).floorName || patient.floorDesc || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Room Type
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {patient.roomType || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Admission Date
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {patient.admissionDate || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </SectionCard>
        </TabPanel>

        {/* ADT HISTORY TAB */}
        <TabPanel value={activeTab} index={1}>
          <SectionCard title="ADT History">
            {patient.adtHistory && patient.adtHistory.length > 0 ? (
              <DataTableContainer
                empty={false}
                emptyMessage="No ADT history available for this patient."
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Date / Time</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Room / Bed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patient.adtHistory.map((record: AdtRecord) => (
                    <TableRow key={record.adtRecordId} hover>
                      <TableCell>
                        {new Date(record.effectiveDateTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.standardActionType || record.actionType}
                          size="small"
                          color={
                            record.standardActionType === 'Admission'
                              ? 'success'
                              : record.standardActionType === 'Discharge'
                              ? 'error'
                              : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{record.origin || '—'}</TableCell>
                      <TableCell>{record.destination || '—'}</TableCell>
                      <TableCell>{record.unitDesc || '—'}</TableCell>
                      <TableCell>
                        {record.roomDesc || '—'}
                        {record.bedDesc ? ` / Bed ${record.bedDesc}` : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </DataTableContainer>
            ) : (
              <EmptyState message="No ADT history available for this patient." />
            )}
          </SectionCard>
        </TabPanel>

        {/* COVERAGE TAB */}
        <TabPanel value={activeTab} index={2}>
          <SectionCard title="Insurance Coverage">
            {patient.activeCoverage?.allPayers &&
            patient.activeCoverage.allPayers.length > 0 ? (
              <DataTableContainer
                empty={false}
                emptyMessage="No coverage information available for this patient."
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Payer Name</TableCell>
                    <TableCell>Rank</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patient.activeCoverage.allPayers.map((payer, index) => (
                    <TableRow
                      key={`${payer.payerId ?? payer.payerName}-${payer.payerRank}-${index}`}
                      hover
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {payer.payerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payer.payerRank}
                          size="small"
                          color={payer.payerRank === 'Primary' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {payer.payerCode || '—'}
                      </TableCell>
                      <TableCell>{payer.payerType || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </DataTableContainer>
            ) : (
              <EmptyState message="No coverage information available for this patient." />
            )}
          </SectionCard>
        </TabPanel>

        {/* RECENT EVENTS TAB */}
        <TabPanel value={activeTab} index={3}>
          <SectionCard title="Recent Events">
            {patient.recentEvents && patient.recentEvents.length > 0 ? (
              <DataTableContainer
                empty={false}
                emptyMessage="No recent events recorded for this patient."
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Date / Time</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Patient Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patient.recentEvents.map((event: PatientEvent) => (
                    <TableRow key={event.eventId} hover>
                      <TableCell>
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.eventType}
                          size="small"
                          color={
                            event.eventType === 'Admission'
                              ? 'success'
                              : event.eventType === 'Discharge'
                              ? 'error'
                              : event.eventType === 'Transfer'
                              ? 'warning'
                              : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{event.patientName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </DataTableContainer>
            ) : (
              <EmptyState message="No recent events recorded for this patient." />
            )}
          </SectionCard>
        </TabPanel>
      </Box>
    </Box>
  );
};
