import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const FEATURES = [
  'Real-time HOA tracking with return dates',
  'Room and bed change notifications',
  'Insurance and payor transitions',
  'Multi-facility enterprise dashboard',
];

export const LoginHero: React.FC = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #0a85d1 0%, #0b9df5 60%, #0ec1ff 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 4, sm: 6, md: 8 },
        py: { xs: 8, md: 0 },
      }}
    >
      <Box sx={{ maxWidth: 520, width: '100%', textAlign: { xs: 'center', md: 'left' } }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          mb={5}
          justifyContent={{ xs: 'center', md: 'flex-start' }}
        >
          {/* Company Logo - Place your logo image at: public/logo.png */}
          {logoError ? (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                color: 'white',
                fontSize: 14,
              }}
            >
              LOGO
            </Box>
          ) : (
            <Box
              component="img"
              src="/logo.png"
              alt="SkyPond Tech Logo"
              onError={() => setLogoError(true)}
              sx={{
                width: 48,
                height: 48,
                objectFit: 'contain',
                borderRadius: '12px',
              }}
            />
          )}
          <Box>
            <Typography
              variant="h6"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 700,
                color: '#ffffff',
                mb: 0.5,
              }}
            >
              Skypond Tech
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 500,
              }}
            >
              CensusIQ
            </Typography>
          </Box>
        </Stack>

        <Typography
          variant="h2"
          component="h1"
          mb={3}
          sx={{
            fontSize: { xs: 32, sm: 40, md: 44 },
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          Enhanced Census Intelligence Platform
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.95)',
            mb: 5,
            fontSize: '1.1rem',
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Transform your pharmacy&apos;s census management with real-time intelligence that goes beyond basic ADT
          integration. Access exclusive data points your competitors can&apos;t see.
        </Typography>
        <Stack spacing={2.5} sx={{ color: 'inherit' }}>
          {FEATURES.map((item) => (
            <Stack direction="row" spacing={2} alignItems="flex-start" key={item}>
              <CheckCircleIcon
                sx={{
                  color: '#ffffff',
                  fontSize: 28,
                  mt: 0.25,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: '#ffffff',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

