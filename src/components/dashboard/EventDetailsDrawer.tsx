/**
 * Event Details Drawer
 * Right-side panel that slides in to show event-specific details.
 * Content is tailored by event type: Room Change, Insurance Update, Death, Room Reserve, and fallback for others.
 */

import React from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import type { PatientEvent } from '@features/patients/api/eventsApi';
import { formatDateTime } from '@shared/lib/date';

const DRAWER_WIDTH = 400;
/** Matches DashboardLayout AppBar Toolbar minHeight (xs: 64, sm: 72) so drawer starts below navbar */
const APP_BAR_OFFSET_PX = 72;

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

interface EventDetailsDrawerProps {
  event: PatientEvent | null;
  open: boolean;
  onClose: () => void;
  onViewPatient?: (patientId: number) => void;
}

export const EventDetailsDrawer: React.FC<EventDetailsDrawerProps> = ({
  event,
  open,
  onClose,
  onViewPatient,
}) => {
  if (!event) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            maxWidth: '100vw',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            top: APP_BAR_OFFSET_PX,
            height: `calc(100vh - ${APP_BAR_OFFSET_PX}px)`,
          },
        }}
      />
    );
  }

  const eventType = event.eventType;
  const patientName = event.patientName || `Patient #${event.patientId}`;
  const handleViewPatient = () => {
    if (event.patientId && onViewPatient) {
      onViewPatient(event.patientId);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          maxWidth: '100vw',
          boxSizing: 'border-box',
          zIndex: (theme) => theme.zIndex.drawer + 2,
          top: APP_BAR_OFFSET_PX,
          height: `calc(100vh - ${APP_BAR_OFFSET_PX}px)`,
        },
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Event Details: {getEventTypeLabel(eventType)}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2" color="text.secondary" component="span">
              Close
            </Typography>
            <IconButton size="small" onClick={onClose} aria-label="Close drawer">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Patient link */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            Patient
          </Typography>
          {onViewPatient && event.patientId ? (
            <Link
              component="button"
              variant="body1"
              onClick={handleViewPatient}
              sx={{ display: 'block', mt: 0.5, cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}
            >
              {patientName}
            </Link>
          ) : (
            <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
              {patientName}
            </Typography>
          )}
        </Box>

        {/* Event-type-specific content */}
        {eventType === 'RoomChange' && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
              <HomeIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Room change details
              </Typography>
            </Box>
            <DetailRow label="Room change" value={`${event.previousRoom ?? '—'} → ${event.room ?? '—'}`} />
            {event.facility != null && <DetailRow label="Facility" value={String(event.facility)} />}
            {event.origin != null && (
              <Box>
                <DetailRow label="Origin" value={event.origin} />
                {event.originType && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{event.originType}</Typography>}
              </Box>
            )}
            {event.destination != null && (
              <Box>
                <DetailRow label="Destination" value={event.destination} />
                {event.destinationType && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{event.destinationType}</Typography>}
              </Box>
            )}
          </Stack>
        )}

        {eventType === 'InsuranceUpdate' && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
              <CreditCardIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Insurance update details
              </Typography>
            </Box>
            {event.previousProvider != null && <DetailRow label="Previous provider" value={event.previousProvider} />}
            {event.currentProvider != null && <DetailRow label="Current provider" value={event.currentProvider} />}
            {event.previousProvider == null && event.currentProvider == null && (
              <Typography variant="body2" color="text.secondary">No provider details recorded for this insurance update.</Typography>
            )}
          </Stack>
        )}

        {eventType === 'Death' && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
              <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Death
              </Typography>
            </Box>
            <DetailRow label="Time of death" value={formatDateTime(event.timestamp)} />
          </Stack>
        )}

        {eventType === 'RoomReserve' && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
              <HomeIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Room reserve details
              </Typography>
            </Box>
            <DetailRow label="Room" value={event.room ?? '—'} />
            {event.facility != null && <DetailRow label="Facility" value={String(event.facility)} />}
          </Stack>
        )}

        {!['RoomChange', 'InsuranceUpdate', 'Death', 'RoomReserve'].includes(eventType) && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
              <PersonIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Event details
              </Typography>
            </Box>
            <DetailRow label="Event time" value={formatDateTime(event.timestamp)} />
            {event.room != null && <DetailRow label="Room" value={event.room} />}
            {event.facility != null && <DetailRow label="Facility" value={String(event.facility)} />}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );
}
