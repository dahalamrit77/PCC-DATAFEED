/**
 * Live Updates Component
 * Floating panel that displays recent important events (RoomChange, InsuranceUpdate, Death)
 * Positioned at the bottom right of the dashboard
 */

import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
  Divider,
  Fade,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  FiberManualRecord as FiberManualRecordIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { formatEventTime } from '@shared/lib/date';
import { useGetEventsQuery } from '@features/patients/api/eventsApi';
import type { PatientEvent, Patient } from '../../../types/patient.types';
import { ROUTES } from '@shared/constants/routes';
import { useNavigate } from 'react-router-dom';

// Include more event types to ensure events are visible
const IMPORTANT_EVENT_TYPES = [
  'RoomChange', 
  'InsuranceUpdate', 
  'Death',
  'RoomReserve', // Added based on API response
  'Admission',
  'Discharge',
  'Transfer',
  'HOAStatus',
  'HospitalTransfer',
] as const;

interface LiveUpdateItemProps {
  event: PatientEvent;
  onClick?: () => void;
}


const formatEventMessage = (event: PatientEvent): React.ReactNode => {
  const patientName = (
    <Typography
      component="span"
      sx={{
        fontWeight: 700,
        color: 'primary.main',
        cursor: 'pointer',
        '&:hover': {
          textDecoration: 'underline',
        },
      }}
    >
      {event.patientName}
    </Typography>
  );

  switch (event.eventType) {
    case 'RoomChange': {
      const previousRoom = event.previousRoom || 'Unknown';
      const newRoom = event.room || 'Unknown';
      return (
        <>
          Room change: {patientName} - Room {previousRoom} → {newRoom}
        </>
      );
    }

    case 'InsuranceUpdate': {
      const previousProvider = event.previousProvider || 'Unknown';
      const currentProvider = event.currentProvider || 'Unknown';
      return (
        <>
          Insurance update: {patientName} - {previousProvider} → {currentProvider}
        </>
      );
    }

    case 'Death': {
      const previousRoom = event.previousRoom || 'Unknown';
      return (
        <>
          Death: {patientName} - Previously in Room {previousRoom}
        </>
      );
    }

    default:
      return (
        <>
          Event: {patientName} - {event.eventType}
        </>
      );
  }
};

const LiveUpdateItem: React.FC<LiveUpdateItemProps> = ({ event, onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              backgroundColor: 'action.hover',
            }
          : {},
        transition: 'background-color 0.15s ease-in-out',
      }}
    >
      <Stack spacing={1} sx={{ py: 1.5, px: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          {formatEventTime(event.timestamp)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            fontSize: '0.875rem',
            lineHeight: 1.5,
          }}
        >
          {formatEventMessage(event)}
        </Typography>
      </Stack>
    </Box>
  );
};

interface LiveUpdatesProps {
  patients: Patient[];
}

export const LiveUpdates: React.FC<LiveUpdatesProps> = ({ patients: _patients }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const { data: allEvents = [], isLoading } = useGetEventsQuery();

  // Create a Set of patient IDs for fast lookup

  const importantEvents = useMemo(() => {
    // Show all important event types regardless of patient matching
    // This ensures events are always visible even if patient data doesn't match
    return allEvents
      .filter((event) => {
        // Skip events with invalid patientId
        if (!event.patientId || event.patientId === 0) {
          return false;
        }
        // Only include important event types
        if (!IMPORTANT_EVENT_TYPES.includes(event.eventType as any)) {
          return false;
        }
        // Show all matching event types - no patient matching required
        return true;
      })
      .slice(0, 10)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [allEvents]);

  const handleEventClick = (event: PatientEvent) => {
    navigate(ROUTES.PATIENT_DETAIL(event.patientId));
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Floating Action Button to reopen the panel when closed
  if (!isOpen) {
    return (
      <Tooltip title="Show Live Updates" placement="left">
        <Fab
          color="primary"
          aria-label="show live updates"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow:
              '0px 4px 6px -1px rgba(15, 23, 42, 0.1), 0px 2px 4px -1px rgba(15, 23, 42, 0.06)',
            '&:hover': {
              boxShadow:
                '0px 10px 15px -3px rgba(15, 23, 42, 0.1), 0px 4px 6px -2px rgba(15, 23, 42, 0.05)',
            },
          }}
        >
          <NotificationsIcon />
        </Fab>
      </Tooltip>
    );
  }

  return (
    <Fade in={isOpen}>
      <Card
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 380,
          maxHeight: 375, // Reduced by 25% from 500px
          zIndex: 1000,
          boxShadow:
            '0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '8px 8px 0 0',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: 'primary.contrastText',
                fontSize: '0.875rem',
              }}
            >
              Live Updates
            </Typography>
            <FiberManualRecordIcon
              sx={{
                fontSize: 8,
                color: 'success.light',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.5,
                  },
                },
              }}
            />
          </Stack>
          <IconButton
            size="small"
            aria-label="Close live updates"
            onClick={handleClose}
            sx={{
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Content */}
        <CardContent
          sx={{
            p: 0,
            flex: 1,
            overflow: 'auto',
            '&:last-child': {
              pb: 0,
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Loading updates...
              </Typography>
            </Box>
          ) : importantEvents.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No recent updates
              </Typography>
            </Box>
          ) : (
            <Box sx={{ px: 2, py: 1 }}>
              {importantEvents.map((event, index) => (
                <React.Fragment key={event.eventId || index}>
                  <LiveUpdateItem
                    event={event}
                    onClick={() => handleEventClick(event)}
                  />
                  {index < importantEvents.length - 1 && (
                    <Divider sx={{ my: 0.5 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};
