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
import { ROUTES } from '../../../shared/constants/routes';
import { useToast } from '../../../shared/hooks/useToast';
import { useLoginMutation } from '../api/authApi';
import { useAppDispatch } from '../../../app/store/hooks';
import { setUser } from '../store/authSlice';
import { UserRole } from '../../../shared/types/user.types';
import { storage } from '../../../shared/lib/storage';
import { decodeJWT, extractRoleFromJWT, extractFacilitiesFromJWT } from '../../../shared/lib/jwt';

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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const dispatch = useAppDispatch();
  const [login, { isLoading: isSubmitting }] = useLoginMutation();

  const handleChange = (field: keyof LoginFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const credentials = {
        email: formValues.email.trim(),
        password: formValues.password,
      };

      const response = await login(credentials).unwrap();

      const userEmail = formValues.email.trim();
      let inferredRole: UserRole = UserRole.USER;
      let userFacilities: number[] = [];
      let firstName: string | null = null;
      let lastName: string | null = null;

      // Try to extract role and facilities from JWT token first
      const jwtPayload = decodeJWT(response.jwtToken);
      
      if (jwtPayload) {
        // Extract name fields from JWT (if present)
        if (typeof jwtPayload.firstName === 'string') firstName = jwtPayload.firstName;
        if (typeof jwtPayload.lastName === 'string') lastName = jwtPayload.lastName;
        if (typeof jwtPayload.first_name === 'string') firstName = jwtPayload.first_name;
        if (typeof jwtPayload.last_name === 'string') lastName = jwtPayload.last_name;

        // Some providers store a single "name" claim
        if ((!firstName || !lastName) && typeof jwtPayload.name === 'string' && jwtPayload.name.trim()) {
          const parts = jwtPayload.name.trim().split(/\s+/);
          if (!firstName && parts.length >= 1) firstName = parts[0];
          if (!lastName && parts.length >= 2) lastName = parts.slice(1).join(' ');
        }

        // Extract role from JWT
        const roleFromJWT = extractRoleFromJWT(jwtPayload);
        if (roleFromJWT) {
          // Map role string to UserRole enum
          if (roleFromJWT === 'Super Admin') {
            inferredRole = UserRole.SUPER_ADMIN;
          } else if (roleFromJWT === 'Admin') {
            inferredRole = UserRole.ADMIN;
          } else if (roleFromJWT === 'User') {
            inferredRole = UserRole.USER;
          }
        }
        
        // Extract facilities from JWT
        const facilitiesFromJWT = extractFacilitiesFromJWT(jwtPayload);
        if (facilitiesFromJWT.length > 0) {
          userFacilities = facilitiesFromJWT;
        }
      }

      // Fallback: If JWT doesn't contain role/facilities, use inference logic
      if (!jwtPayload || !extractRoleFromJWT(jwtPayload) || userFacilities.length === 0) {
        // Check if user is test@example.com (Super Admin)
        if (userEmail === 'test@example.com') {
          inferredRole = UserRole.SUPER_ADMIN;
        } else {
          // Try to fetch facilities to determine role
          // Use a timeout to prevent hanging
          try {
            const facilitiesPromise = fetch('/api/facilities', {
              headers: {
                Authorization: `Bearer ${response.jwtToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            // Set a timeout for facilities fetch (don't block login)
            const timeoutPromise = new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error('Facilities fetch timeout')), 5000)
            );
            
            const facilitiesResponse = await Promise.race([facilitiesPromise, timeoutPromise]);
            
            if (facilitiesResponse.ok) {
              const facilitiesData = await facilitiesResponse.json();
              const facilitiesList = Array.isArray(facilitiesData)
                ? facilitiesData
                : facilitiesData?.data || facilitiesData?.facilities || [];
              
              const fetchedFacilities = facilitiesList.map((f: { facId: number }) => f.facId);
              
              // Only update if we didn't get facilities from JWT
              if (userFacilities.length === 0) {
                userFacilities = fetchedFacilities;
              }
              
              // Infer role based on number of facilities if not in JWT
              if (!extractRoleFromJWT(jwtPayload || {})) {
                if (facilitiesList.length > 1) {
                  inferredRole = UserRole.ADMIN;
                } else if (facilitiesList.length === 1) {
                  inferredRole = UserRole.USER;
                  userFacilities = [facilitiesList[0].facId];
                }
              }
            } else {
              // If facilities fetch fails (e.g., 401/403), default to User role
              // Don't block login - role will be inferred later when facilities are fetched via RTK Query
              console.warn('Could not fetch facilities for role inference. Status:', facilitiesResponse.status);
              if (!extractRoleFromJWT(jwtPayload || {})) {
                inferredRole = UserRole.USER;
              }
            }
          } catch (facilitiesError) {
            // If facilities fetch fails or times out, default to User role
            // Don't block login - role will be inferred later when facilities are fetched via RTK Query
            console.warn('Could not fetch facilities for role inference:', facilitiesError);
            if (!extractRoleFromJWT(jwtPayload || {})) {
              inferredRole = UserRole.USER;
            }
          }
        }
      }

      // Update Redux auth state with role and facilities
      // Note: Facilities will be updated when RTK Query fetches them in DashboardLayout
      dispatch(
        setUser({
          email: userEmail,
          firstName,
          lastName,
          role: inferredRole,
          facilities: userFacilities,
        })
      );

      // Allow parent components to react to successful login if needed.
      onSubmit?.(formValues);

      // Show success toast
      showSuccess('Login successful! Welcome back.');

      // Navigate to dashboard immediately
      // Redux state update is synchronous, and ProtectedRoute checks storage as fallback
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: unknown) {
      // RTK Query error handling
      console.error('Login error:', err);
      
      // Extract error message from RTK Query error structure
      let errorMessage: string | null = null;
      
      if (err && typeof err === 'object') {
        // RTK Query error structure: { status, data: { message } }
        if ('data' in err) {
          const data = (err as { data?: { message?: string } }).data;
          errorMessage = data?.message || null;
        }
        // Alternative error structure: { message }
        else if ('message' in err) {
          errorMessage = (err as { message: string }).message;
        }
        // Check for status code
        else if ('status' in err) {
          const status = (err as { status: number }).status;
          if (status === 401) {
            errorMessage = 'Invalid credentials. Please check your email and password.';
          } else if (status === 403) {
            errorMessage = 'Access denied. Please contact your administrator.';
          }
        }
      }
      
      const finalErrorMessage = errorMessage || 'Unable to sign in. Please check your credentials and try again.';
      setError(finalErrorMessage);
      showError(finalErrorMessage);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        maxWidth: 460,
        mx: 'auto',
      }}
    >
      <Stack spacing={1} mb={4} alignItems="center" textAlign="center">
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to access your census intelligence dashboard.
        </Typography>
      </Stack>

      <Stack spacing={3}>
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
