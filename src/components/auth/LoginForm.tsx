import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginCredentials } from '../../services';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [formValues, setFormValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (field: keyof LoginFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const credentials: LoginCredentials = {
        email: formValues.email.trim(),
        password: formValues.password,
      };

      const response = await authService.login(credentials);

      // Store JWT for subsequent authenticated requests.
      localStorage.setItem('auth_token', response.jwtToken);
      // Store user email for display
      localStorage.setItem('user_email', formValues.email.trim());

      // Allow parent components to react to successful login if needed.
      onSubmit?.(formValues);

      // Navigate to temporary dashboard placeholder.
      navigate('/', { replace: true });
    } catch (err: unknown) {
      // Basic error handling that surfaces backend message when available.
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        const backendMessage = axiosError.response?.data?.message;
        setError(backendMessage || 'Unable to sign in. Please check your credentials and try again.');
      } else {
        setError('Something went wrong while signing in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        maxWidth: 440,
      }}
    >
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to access your census intelligence dashboard.
        </Typography>
      </Stack>

      <Stack spacing={2.5}>
        {error && (
          <Typography variant="body2" color="error.main">
            {error}
          </Typography>
        )}
        <TextField
          label="Email address"
          type="email"
          name="email"
          value={formValues.email}
          onChange={handleChange('email')}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailRoundedIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formValues.password}
          onChange={handleChange('password')}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockRoundedIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={<Checkbox size="small" sx={{ color: 'text.secondary' }} />}
            label={<Typography variant="body2">Remember me</Typography>}
          />
          <Link href="#" underline="hover" color="primary">
            Forgot your password?
          </Link>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
          sx={{ py: 1.2, fontWeight: 600 }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1.5 }} /> Signing in...
            </>
          ) : (
            'Sign In →'
          )}
        </Button>

        <Divider sx={{ color: 'text.secondary' }}>or</Divider>

        <Button
          variant="outlined"
          color="inherit"
          fullWidth
          size="large"
          startIcon={<MicrosoftIcon />}
          sx={{ justifyContent: 'center', gap: 1 }}
        >
          Sign in with Microsoft
        </Button>
      </Stack>

      <Stack spacing={2.5} mt={4} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Link href="#" color="primary" underline="hover">
            Request access
          </Link>
        </Typography>
        <Stack spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <Typography variant="caption">256-bit Encryption • HIPAA Secure • SOC 2 Type II Ready</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Trusted by 50+ LTC pharmacies nationwide
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

