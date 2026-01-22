import React from 'react';
import { Box } from '@mui/material';
import { LoginForm, LoginHero } from '../../components/auth';
import type { LoginFormValues } from '../../components/auth';

export const LoginPage: React.FC = () => {
  const handleLogin = (values: LoginFormValues) => {
    // TODO: Replace with real auth service call when backend is ready.
    console.info('Login attempted with placeholder handler', values);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
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
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 6, sm: 8, md: 10 },
        }}
      >
        <LoginForm onSubmit={handleLogin} />
      </Box>
    </Box>
  );
};

