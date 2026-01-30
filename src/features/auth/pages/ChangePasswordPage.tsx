/**
 * Change Password Page
 * Allows users to change their password
 */

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@shared/components/ui';
import { ROUTES } from '@shared/constants/routes';
import { useAppSelector } from '@app/store/hooks';
import { useGetUsersQuery } from '@features/users/api/usersApi';
import { useUpdatePasswordMutation } from '../api/authApi';
import { useToast } from '@shared/hooks/useToast';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { email: userEmail } = useAppSelector((state) => state.auth.user);
  
  // Get current user's userId from users list
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsersQuery();
  const currentUser = users.find((u) => u.email === userEmail);
  
  const [updatePassword, { isLoading: isSubmitting }] = useUpdatePasswordMutation();
  
  const [formData, setFormData] = useState({
    password: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'New password should be at least 8 characters long';
      } else if (!/[A-Z]/.test(formData.newPassword)) {
        newErrors.newPassword = 'New password should contain at least one capital letter';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
        newErrors.newPassword = 'New password should contain at least one special character';
      } else if (userEmail && formData.newPassword.toLowerCase() === userEmail.toLowerCase()) {
        newErrors.newPassword = 'Email and new password cannot be the same';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser?.userId) {
      showError('Unable to identify user. Please try again.');
      return;
    }

    try {
      await updatePassword({
        userId: currentUser.userId,
        newPassword: formData.newPassword,
      }).unwrap();

      showSuccess('Password updated successfully');
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to update password. Please try again.';
      showError(errorMessage);
    }
  };

  if (isLoadingUsers) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Unable to load user information. Please try again.
      </Alert>
    );
  }

  // Determine account breadcrumb path
  const accountBreadcrumbPath = currentUser?.userId 
    ? ROUTES.EDIT_USER(currentUser.userId)
    : ROUTES.DASHBOARD;

  return (
    <Box>
      <PageHeader
        title="Change Password"
        breadcrumbs={[
          { label: 'Account', path: accountBreadcrumbPath },
          { label: 'Change Password' },
        ]}
      />

      <Box component="form" onSubmit={handleSubmit}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              {/* Password Requirements Section */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '170px 1fr' },
                  gap: 2.5,
                  alignItems: 'start',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    pt: { xs: 0, md: 1.1 },
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Password Requirements
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'background.default',
                    p: 2.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      New password should be at least 8 characters long
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      New password should contain at least one capital letter
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      New password should contain at least one special character
                    </li>
                    <li>Email and new password cannot be the same</li>
                  </Typography>
                </Box>
              </Box>

              {/* Email Field (Read-only) */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '170px 1fr' },
                  gap: 2.5,
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Email
                </Typography>
                <TextField
                  value={userEmail || ''}
                  disabled
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: 'action.disabledBackground',
                    },
                  }}
                />
              </Box>

              {/* Current Password */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '170px 1fr' },
                  gap: 2.5,
                  alignItems: 'start',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    pt: { xs: 0, md: 1.1 },
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Password
                </Typography>
                <TextField
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={!!errors.password}
                  helperText={errors.password}
                  fullWidth
                  size="small"
                  required
                  placeholder="Enter current password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="toggle password visibility"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* New Password */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '170px 1fr' },
                  gap: 2.5,
                  alignItems: 'start',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    pt: { xs: 0, md: 1.1 },
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  New Password
                </Typography>
                <TextField
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange('newPassword')}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  fullWidth
                  size="small"
                  required
                  placeholder="Enter new password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          aria-label="toggle new password visibility"
                          size="small"
                        >
                          {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Confirm Password */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '170px 1fr' },
                  gap: 2.5,
                  alignItems: 'start',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    pt: { xs: 0, md: 1.1 },
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Confirm Password
                </Typography>
                <TextField
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  fullWidth
                  size="small"
                  required
                  placeholder="Confirm new password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          aria-label="toggle confirm password visibility"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Submit Button */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '170px 1fr' },
                  gap: 2.5,
                  alignItems: 'center',
                  pt: 1,
                }}
              >
                <Box /> {/* Empty spacer for grid alignment */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="medium"
                    disabled={isSubmitting}
                    sx={{ minWidth: 160 }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" /> Updating...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    size="medium"
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
