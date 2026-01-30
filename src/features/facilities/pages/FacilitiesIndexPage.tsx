import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { useGetFacilitiesQuery } from '@entities/facility/api/facilityApi';
import type { Facility } from '@entities/facility/types/facility.types';
import { PageHeader, SectionCard } from '@shared/components/ui';
import { ROUTES } from '@shared/constants/routes';

export const FacilitiesIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: facilities = [], isLoading, error } = useGetFacilitiesQuery();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredFacilities = useMemo(() => {
    if (!searchTerm.trim()) return facilities;

    const searchLower = searchTerm.toLowerCase();
    return facilities.filter((facility) => {
      const name = facility.facilityName.toLowerCase();
      const city = facility.city.toLowerCase();
      const state = facility.state.toLowerCase();
      const code = facility.facilityCode.toLowerCase();
      return (
        name.includes(searchLower) ||
        city.includes(searchLower) ||
        state.includes(searchLower) ||
        code.includes(searchLower)
      );
    });
  }, [facilities, searchTerm]);

  const handleNavigateToDetails = (facility: Facility) => {
    navigate(ROUTES.FACILITY_DETAIL(facility.facId));
  };

  const renderStatusChip = (facility: Facility) => {
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Facilities"
        subtitle="Facilities you have access to"
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <TextField
          placeholder="Search facilities by name, code, city, or state..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, maxWidth: 420 }}
        />
      </Stack>

      {error && (
        <Typography variant="body2" color="error.main">
          Failed to load facilities.
        </Typography>
      )}

      <Grid container spacing={2}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <SectionCard>
                  <Box sx={{ height: 140, bgcolor: 'action.hover', borderRadius: 2 }} />
                </SectionCard>
              </Grid>
            ))
          : filteredFacilities.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <SectionCard>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No facilities found.
                    </Typography>
                  </Box>
                </SectionCard>
              </Grid>
            ) : (
              filteredFacilities.map((facility) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={facility.facId}>
                  <SectionCard
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow:
                          '0px 10px 15px -3px rgba(15, 23, 42, 0.1), 0px 4px 6px -2px rgba(15, 23, 42, 0.05)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <ApartmentIcon sx={{ color: 'text.secondary', fontSize: 28, mr: 2 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            mb: 0.5,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={facility.facilityName}
                        >
                          {facility.facilityName}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {renderStatusChip(facility)}
                          <Chip
                            label={facility.lineOfBusiness?.shortDesc || facility.healthType}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </Stack>
                      </Box>
                      <Tooltip title="View facility details">
                        <IconButton
                          size="small"
                          onClick={() => handleNavigateToDetails(facility)}
                          sx={{ ml: 1 }}
                        >
                          <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Stack spacing={1.2} sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnIcon
                          fontSize="small"
                          sx={{ color: 'text.secondary', opacity: 0.8 }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {facility.city}, {facility.state} • {facility.country}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BedOutlinedIcon
                          fontSize="small"
                          sx={{ color: 'text.secondary', opacity: 0.8 }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {facility.bedCount} beds
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneIcon
                          fontSize="small"
                          sx={{ color: 'text.secondary', opacity: 0.8 }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {facility.phone}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Facility code: {facility.facilityCode}
                      </Typography>
                    </Stack>
                  </SectionCard>
                </Grid>
              ))
            )}
      </Grid>
    </Box>
  );
};
