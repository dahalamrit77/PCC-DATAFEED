/**
 * Create User Form Component
 * Form for creating new users with role-based facility selection
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCreateUserMutation } from '../api/usersApi';
import { useGetFacilitiesQuery } from '../../../entities/facility/api/facilityApi';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { useToast } from '../../../shared/hooks/useToast';
import { UserRole, type CreateUserRequest } from '../../../shared/types/user.types';
import { useAppSelector } from '../../../app/store/hooks';
import { getRoleDisplayName } from '../../../shared/lib/permissions';

interface CreateUserFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  facilities: number[];
}

interface CreateUserFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  facilities?: string;
}

export const CreateUserForm: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { role: currentUserRole, facilities: currentUserFacilities } = useAppSelector(
    (state) => state.auth.user
  );
  const { canCreateUserWithRole } = usePermissions();
  
  const [createUser, { isLoading: isSubmitting }] = useCreateUserMutation();
  const { data: allFacilities = [] } = useGetFacilitiesQuery();

  const [formValues, setFormValues] = useState<CreateUserFormValues>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: UserRole.USER,
    facilities: [],
  });

  const [errors, setErrors] = useState<CreateUserFormErrors>({});

  // Determine available facilities based on current user's role
  const availableFacilities = useMemo(() => {
    if (currentUserRole === UserRole.SUPER_ADMIN) {
      return allFacilities; // Super Admin can assign any facility
    }
    if (currentUserRole === UserRole.ADMIN) {
      // Admin can only assign their own facilities
      return allFacilities.filter((facility) =>
        currentUserFacilities.includes(facility.facId)
      );
    }
    return []; // User role cannot create users
  }, [allFacilities, currentUserRole, currentUserFacilities]);

  // Determine available roles based on current user's role
  const availableRoles = useMemo(() => {
    const roles: UserRole[] = [];
    if (currentUserRole === UserRole.SUPER_ADMIN) {
      roles.push(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER);
    } else if (currentUserRole === UserRole.ADMIN) {
      roles.push(UserRole.USER); // Admin can only create User role
    }
    return roles;
  }, [currentUserRole]);

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: CreateUserFormErrors = {};

    // Email validation
    const emailError = validateEmail(formValues.email);
    if (emailError) newErrors.email = emailError;

    // Password validation
    const passwordError = validatePassword(formValues.password);
    if (passwordError) newErrors.password = passwordError;

    // Confirm password validation
    if (!formValues.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // First name validation
    if (!formValues.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formValues.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Role validation
    if (!formValues.role) {
      newErrors.role = 'Role is required';
    } else if (!canCreateUserWithRole(formValues.role)) {
      newErrors.role = 'You do not have permission to create users with this role';
    }

    // Facilities validation
    if (formValues.facilities.length === 0) {
      newErrors.facilities = 'At least one facility must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateUserFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = event.target.value as string | UserRole | number[];
    
    setFormValues((prev) => {
      const updated = { ...prev, [field]: value };
      
      // If role changes to User, ensure facilities are still valid
      if (field === 'role' && value === UserRole.USER && updated.facilities.length > 0) {
        // Keep only facilities that are still available for the new role
        const validFacilities = updated.facilities.filter((facId) =>
          availableFacilities.some((fac) => fac.facId === facId)
        );
        updated.facilities = validFacilities;
      }
      
      return updated;
    });
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof CreateUserFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFacilityToggle = (facilityId: number) => {
    setFormValues((prev) => {
      const isSelected = prev.facilities.includes(facilityId);
      const updatedFacilities = isSelected
        ? prev.facilities.filter((id) => id !== facilityId)
        : [...prev.facilities, facilityId];
      
      return { ...prev, facilities: updatedFacilities };
    });
    
    // Clear facilities error
    if (errors.facilities) {
      setErrors((prev) => ({ ...prev, facilities: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    try {
      const userData: CreateUserRequest = {
        email: formValues.email.trim(),
        password: formValues.password,
        first_name: formValues.firstName.trim(),
        last_name: formValues.lastName.trim(),
        role: formValues.role, // Send UserRole enum value as string ("Super Admin", "Admin", or "User")
        facilities: formValues.facilities,
      };

      const response = await createUser(userData).unwrap();
      
      showSuccess(response.message || 'User created successfully');
      
      // Reset form
      setFormValues({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: UserRole.USER,
        facilities: [],
      });
      setErrors({});
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : err && typeof err === 'object' && 'message' in err
          ? (err as { message?: string }).message
          : 'Failed to create user. Please try again.';
      
      showError(errorMessage);
    }
  };

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return 'strong';
    }
    return 'medium';
  };

  const passwordStrength = getPasswordStrength(formValues.password);

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* Full Name Row */}
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
                Full Name
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  placeholder="First Name"
                  required
                  fullWidth
                  size="small"
                  value={formValues.firstName}
                  onChange={handleChange('firstName')}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                />
                <TextField
                  placeholder="Last Name"
                  required
                  fullWidth
                  size="small"
                  value={formValues.lastName}
                  onChange={handleChange('lastName')}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                />
              </Stack>
            </Box>

            {/* Email Row */}
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
                placeholder="user@example.com"
                type="email"
                required
                fullWidth
                size="small"
                value={formValues.email}
                onChange={handleChange('email')}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
            </Box>

            {/* Password Row */}
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
              <Stack spacing={1.5}>
                <TextField
                  placeholder="Enter password"
                  type="password"
                  required
                  fullWidth
                  size="small"
                  value={formValues.password}
                  onChange={handleChange('password')}
                  error={Boolean(errors.password)}
                  helperText={errors.password || 'Minimum 8 characters'}
                />
                <TextField
                  placeholder="Confirm password"
                  type="password"
                  required
                  fullWidth
                  size="small"
                  value={formValues.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                />
                {formValues.password && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Password Strength:{' '}
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color:
                            passwordStrength === 'strong'
                              ? 'success.main'
                              : passwordStrength === 'medium'
                              ? 'warning.main'
                              : 'error.main',
                        }}
                      >
                        {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                      </Typography>
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Role Row */}
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
                Role
              </Typography>
              <FormControl fullWidth required error={Boolean(errors.role)}>
                <Select
                  value={formValues.role}
                  onChange={(e) => handleChange('role')({ target: { value: e.target.value } })}
                  displayEmpty
                  size="small"
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Box>

            {/* Facilities Row */}
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
                Facilities
              </Typography>
              <FormControl fullWidth required error={Boolean(errors.facilities)}>
                <Box
                  sx={{
                    border: 1,
                    borderColor: errors.facilities ? 'error.main' : 'divider',
                    borderRadius: 1,
                    p: 1.5,
                    minHeight: 88,
                    maxHeight: 180,
                    overflow: 'auto',
                    bgcolor: 'background.default',
                  }}
                >
                  {availableFacilities.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No facilities available
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {availableFacilities.map((facility) => {
                        const isSelected = formValues.facilities.includes(facility.facId);
                        return (
                          <Chip
                            key={facility.facId}
                            label={facility.facilityName || `Facility ${facility.facId}`}
                            onClick={() => handleFacilityToggle(facility.facId)}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ cursor: 'pointer', fontWeight: 600 }}
                          />
                        );
                      })}
                    </Stack>
                  )}
                </Box>
                {errors.facilities && (
                  <FormHelperText sx={{ mt: 0.5 }}>{errors.facilities}</FormHelperText>
                )}
                {formValues.facilities.length > 0 && (
                  <FormHelperText sx={{ mt: 0.5, color: 'text.secondary' }}>
                    {formValues.facilities.length} facility(s) selected
                  </FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Submit Button */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{ minWidth: 180 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" /> Creating User...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
