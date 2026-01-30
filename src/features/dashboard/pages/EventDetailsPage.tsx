/**
 * Event Details Page
 * Displays event-specific details for a single census/ADT event.
 * Content is tailored by event type: Room Change, Insurance Update, Death, Room Reserve.
 */

import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import { useGetEventsQuery } from '@features/patients/api/eventsApi';
import type { PatientEvent } from '../../../types/patient.types';
import { PageHeader } from '@shared/components/ui';
import { ROUTES } from '@shared/constants/routes';
import { formatDateTime } from '@shared/lib/date';

const getEventTypeLabel = (eventType: string): string => {
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
    case 'Admission':
    case 'Discharge':
    case 'Transfer':
    case 'RoomReserve':
      return eventType;
    default:
      return eventType.replace(/([a-z])([A-Z])/g, '$1 $2') || eventType;
  }
};

export const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const eventFromState = location.state?.event as PatientEvent | undefined;

  const { data: events = [], isLoading, error } = useGetEventsQuery(undefined, {
    skip: !!eventFromState,
  });

  const event: PatientEvent | undefined = eventFromState ?? events.find((e) => e.eventId === eventId);

  const handleBack = () => navigate(ROUTES.DASHBOARD);
  const handleViewPatient = () => {
    if (event?.patientId) navigate(ROUTES.PATIENT_DETAIL(event.patientId));
  };

  if (isLoading && !eventFromState) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} sx={{ mt: 1 }} />
        </Box>
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={200} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error && !eventFromState) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <PageHeader title="Event Details" breadcrumbs={[{ label: 'Dashboard', path: ROUTES.DASHBOARD }, { label: 'Event Details' }]} />
        <Alert severity="error">Failed to load event data.</Alert>
        <Button variant="outlined" size="small" onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!event || !eventId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <PageHeader title="Event Details" breadcrumbs={[{ label: 'Dashboard', path: ROUTES.DASHBOARD }, { label: 'Event Details' }]} />
        <Card>
          <CardContent>
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Event not found.
              </Typography>
              <Button variant="outlined" size="small" onClick={handleBack}>
                Back to Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const eventType = event.eventType;
  const patientName = event.patientName || `Patient #${event.patientId}`;

  return (
    <Box>
      {/* Compact header: event type + patient link + back */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {getEventTypeLabel(eventType)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Patient:{' '}
            <Link component="button" variant="body2" onClick={handleViewPatient} sx={{ cursor: 'pointer', fontWeight: 600 }}>
              {patientName}
            </Link>
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleBack}>
            Back to Dashboard
          </Button>
          <Button variant="contained" onClick={handleViewPatient}>
            View Patient
          </Button>
        </Stack>
      </Box>

      {/* Event-type-specific content */}
      {eventType === 'RoomChange' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
              <HomeIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Room change details
              </Typography>
            </Box>
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                  Room change
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                  {event.previousRoom ?? '—'} → {event.room ?? '—'}
                </Typography>
              </Box>
              {event.facility != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                    Facility
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {String(event.facility)}
                  </Typography>
                </Box>
              )}
              {event.origin != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                    Origin
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {event.origin}
                  </Typography>
                  {event.originType && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {event.originType}
                    </Typography>
                  )}
                </Box>
              )}
              {event.destination != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                    Destination
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {event.destination}
                  </Typography>
                  {event.destinationType && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {event.destinationType}
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {eventType === 'InsuranceUpdate' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
              <CreditCardIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Insurance update details
              </Typography>
            </Box>
            <Stack spacing={3}>
              {event.previousProvider != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                    Previous provider
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {event.previousProvider}
                  </Typography>
                </Box>
              )}
              {event.currentProvider != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                    Current provider
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {event.currentProvider}
                  </Typography>
                </Box>
              )}
              {event.previousProvider == null && event.currentProvider == null && (
                <Typography variant="body2" color="text.secondary">
                  No provider details recorded for this insurance update.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {eventType === 'Death' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
              <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Death
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                Time of death
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                {formatDateTime(event.timestamp)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {eventType === 'RoomReserve' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
              <HomeIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Room reserve details
              </Typography>
            </Box>
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                  Room
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                  {event.room ?? '—'}
                </Typography>
              </Box>
              {event.facility != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                    Facility
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {String(event.facility)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Fallback for Admission, Discharge, Transfer, etc. */}
      {!['RoomChange', 'InsuranceUpdate', 'Death', 'RoomReserve'].includes(eventType) && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
              <PersonIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Event details
              </Typography>
            </Box>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                  Event time
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {formatDateTime(event.timestamp)}
                </Typography>
              </Box>
              {event.room != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                    Room
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {event.room}
                  </Typography>
                </Box>
              )}
              {event.facility != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                    Facility
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {String(event.facility)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
