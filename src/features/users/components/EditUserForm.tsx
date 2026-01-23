/**
 * Edit User Form Component
 * Allows admins to update user profile fields and facility access.
 */
import React, { useMemo, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useUpdateUserMutation, type UpdateUserFacilitiesPatch } from '../api/usersApi';
import { useGetFacilitiesQuery } from '@entities/facility/api/facilityApi';
import { useToast } from '@shared/hooks/useToast';
import {
  ROLE_NAME_TO_ID,
  UserRole,
  type User,
} from '@shared/types/user.types';
import { useAppSelector } from '@app/store/hooks';
import { getRoleDisplayName } from '@shared/lib/permissions';
import { ROUTES } from '@shared/constants/routes';

interface EditUserFormProps {
  user: User;
}

interface EditUserFormValues {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  facilities: number[];
}

interface EditUserFormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  facilities?: string;
}

const uniqSorted = (values: number[]) =>
  Array.from(new Set(values)).sort((a, b) => a - b);

export const EditUserForm: React.FC<EditUserFormProps> = ({ user }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [updateUser, { isLoading: isSubmitting }] = useUpdateUserMutation();
  const { data: allFacilities = [] } = useGetFacilitiesQuery();

  const { role: currentUserRole, facilities: currentUserFacilities } =
    useAppSelector((state) => state.auth.user);

  const initialFacilities = useMemo(
    () => uniqSorted(user.facilities || []),
    [user.facilities]
  );

  const [formValues, setFormValues] = useState<EditUserFormValues>({
    email: user.email ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phoneNumber: '',
    role: user.role ?? UserRole.USER,
    facilities: initialFacilities,
  });

  const [errors, setErrors] = useState<EditUserFormErrors>({});

  const availableFacilities = useMemo(() => {
    if (currentUserRole === UserRole.SUPER_ADMIN) return allFacilities;
    if (currentUserRole === UserRole.ADMIN) {
      return allFacilities.filter((f) => currentUserFacilities.includes(f.facId));
    }
    return [];
  }, [allFacilities, currentUserRole, currentUserFacilities]);

  const availableRoles = useMemo(() => {
    if (currentUserRole === UserRole.SUPER_ADMIN) {
      return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER];
    }
    if (currentUserRole === UserRole.ADMIN) {
      return [UserRole.USER];
    }
    return [];
  }, [currentUserRole]);

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    return undefined;
  };

  const validateForm = (): boolean => {
    const next: EditUserFormErrors = {};
    const emailError = validateEmail(formValues.email);
    if (emailError) next.email = emailError;
    if (!formValues.firstName.trim()) next.firstName = 'First name is required';
    if (!formValues.lastName.trim()) next.lastName = 'Last name is required';
    if (!formValues.role) next.role = 'Role is required';
    if (formValues.facilities.length === 0) next.facilities = 'Select at least one facility';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange =
    (field: keyof EditUserFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
      const value = event.target.value as string | UserRole | number[];
      setFormValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof EditUserFormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleFacilityToggle = (facilityId: number) => {
    setFormValues((prev) => {
      const isSelected = prev.facilities.includes(facilityId);
      const updated = isSelected
        ? prev.facilities.filter((id) => id !== facilityId)
        : [...prev.facilities, facilityId];
      return { ...prev, facilities: uniqSorted(updated) };
    });
    if (errors.facilities) {
      setErrors((prev) => ({ ...prev, facilities: undefined }));
    }
  };

  const buildFacilitiesPatch = (): UpdateUserFacilitiesPatch | undefined => {
    const nextFacilities = uniqSorted(formValues.facilities);
    const add = nextFacilities.filter((id) => !initialFacilities.includes(id));
    const remove = initialFacilities.filter((id) => !nextFacilities.includes(id));
    if (add.length === 0 && remove.length === 0) return undefined;
    return { add, remove };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    const facilitiesPatch = buildFacilitiesPatch();
    const roleId = ROLE_NAME_TO_ID[formValues.role];

    try {
      await updateUser({
        userId: user.userId,
        email: formValues.email.trim(),
        first_name: formValues.firstName.trim(),
        last_name: formValues.lastName.trim(),
        ...(formValues.phoneNumber.trim()
          ? { phone_number: formValues.phoneNumber.trim() }
          : {}),
        ...(typeof roleId === 'number' && roleId !== user.roleId ? { role_id: roleId } : {}),
        ...(facilitiesPatch ? { facilities: facilitiesPatch } : {}),
      }).unwrap();

      showSuccess('User updated successfully');
      navigate(ROUTES.USERS);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : err && typeof err === 'object' && 'message' in err
          ? (err as { message?: string }).message
          : 'Failed to update user. Please try again.';
      showError(message || 'Failed to update user. Please try again.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
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
                Phone
              </Typography>
              <TextField
                placeholder="Optional"
                fullWidth
                size="small"
                value={formValues.phoneNumber}
                onChange={handleChange('phoneNumber')}
              />
            </Box>

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
                  onChange={(e) => {
                    const syntheticEvent = {
                      target: { value: e.target.value, name: 'role' },
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleChange('role')(syntheticEvent);
                  }}
                  displayEmpty
                  size="small"
                  disabled={availableRoles.length <= 1}
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
                        const isSelected = formValues.facilities.includes(
                          facility.facId
                        );
                        return (
                          <Chip
                            key={facility.facId}
                            label={
                              facility.facilityName ||
                              `Facility ${facility.facId}`
                            }
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
                  <FormHelperText sx={{ mt: 0.5 }}>
                    {errors.facilities}
                  </FormHelperText>
                )}
                {formValues.facilities.length > 0 && (
                  <FormHelperText sx={{ mt: 0.5, color: 'text.secondary' }}>
                    {formValues.facilities.length} facility(s) selected
                  </FormHelperText>
                )}
              </FormControl>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
                gap: 1.5,
              }}
            >
              <Button
                variant="outlined"
                size="medium"
                disabled={isSubmitting}
                onClick={() => navigate(ROUTES.USERS)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />{' '}
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

