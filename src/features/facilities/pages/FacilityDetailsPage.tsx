import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Button,
  Skeleton,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PrintIcon from '@mui/icons-material/Print';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { useGetFacilitiesQuery } from '@entities/facility/api/facilityApi';
import type { Facility } from '@entities/facility/types/facility.types';
import { PageHeader } from '@shared/components/ui';
import { ROUTES } from '@shared/constants/routes';

export const FacilityDetailsPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const { data: facilities = [], isLoading, error } = useGetFacilitiesQuery();

  const facId = facilityId ? parseInt(facilityId, 10) : NaN;
  const facility: Facility | undefined = facilities.find((f) => f.facId === facId);

  const handleBack = () => {
    navigate(ROUTES.FACILITIES);
  };

  const renderStatusChip = () => {
    if (!facility) return null;
    const isActive = facility.active && facility.facilityStatus === 'Live';

    return (
      <Chip
        label={facility.facilityStatus || (isActive ? 'Active' : 'Inactive')}
        size="small"
        color={isActive ? 'success' : 'default'}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const renderHeadOfficeChip = () => {
    if (!facility || !facility.headOffice) return null;
    return (
      <Chip
        label="Head Office"
        size="small"
        color="primary"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} sx={{ mt: 1 }} />
        </Box>
        <Card>
          <CardContent>
            <Grid container spacing={4}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="80%" height={32} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error || !facility) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <PageHeader
          title="Facility Details"
          breadcrumbs={[
            { label: 'Facilities', path: ROUTES.FACILITIES },
            { label: 'Facility Details' },
          ]}
        />
        <Card>
          <CardContent>
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
                Unable to load facility details.
              </Typography>
              <Button variant="outlined" size="small" onClick={handleBack}>
                Back to Facilities
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {/* Facility Header */}
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
              {/* Facility Icon */}
              <ApartmentIcon sx={{ fontSize: 48, color: 'text.secondary' }} />

              {/* Facility Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Facility Profile
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {facility.facilityName}
                  </Typography>
                  {renderStatusChip()}
                  {renderHeadOfficeChip()}
                </Stack>
                <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Location
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {facility.city}, {facility.state} • {facility.country}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Facility Code
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {facility.facilityCode}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Bed Count
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {facility.bedCount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Status
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {facility.facilityStatus}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Action Button */}
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={handleBack}>
                Back to Facilities
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Location & Contact Information */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                }}
              >
                <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
                  Location & Timezone
                </Typography>
              </Box>

              <Stack spacing={3} sx={{ flex: 1 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
                  >
                    Address
                  </Typography>
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                      {facility.addressLine1}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {facility.city}, {facility.state} {facility.postalCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {facility.country}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
                  >
                    Timezone
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                    <AccessTimeIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight={600}>
                      {facility.timeZone || 'N/A'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                }}
              >
                <PhoneIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
                  Contact Information
                </Typography>
              </Box>

              <Stack spacing={3} sx={{ flex: 1 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
                  >
                    Phone
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                    <PhoneIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight={600}>
                      {facility.phone || 'N/A'}
                    </Typography>
                  </Stack>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
                  >
                    Fax
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                    <PrintIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight={600}>
                      {facility.fax || 'N/A'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

