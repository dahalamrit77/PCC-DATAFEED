import React from 'react';
import { Box } from '@mui/material';
import { LoginForm, LoginHero } from '../components';
import type { LoginFormValues } from '../components';
import { logger } from '@shared/lib/logger';

export const LoginPage: React.FC = () => {
  const handleLogin = (values: LoginFormValues) => {
    // Note: LoginForm handles login internally via RTK Query
    // This handler is optional and called after successful login
    logger.debug('Login successful callback', { email: values.email });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '1fr 1fr',
        },
        backgroundColor: 'background.default',
      }}
    >
      <LoginHero />
      <Box
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 4, md: 6, lg: 8 },
          py: { xs: 6, sm: 8, md: 10, lg: 12 },
        }}
      >
        <LoginForm onSubmit={handleLogin} />
      </Box>
    </Box>
  );
};
