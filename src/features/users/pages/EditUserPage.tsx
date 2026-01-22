/**
 * Edit User Page
 * Loads user from the users listing cache and provides an edit form.
 */
import React from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/ui';
import { ROUTES } from '../../../shared/constants/routes';
import { EditUserForm } from '../components/EditUserForm';
import { useGetUsersQuery } from '../api/usersApi';

export const EditUserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data: users = [], isLoading, error } = useGetUsersQuery();

  if (!userId) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Invalid user id.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load users.
      </Alert>
    );
  }

  const user = users.find((u) => u.userId === userId);

  if (!user) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        User not found.
      </Alert>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit User"
        breadcrumbs={[
          { label: 'Users', path: ROUTES.USERS },
          { label: 'Edit User' },
        ]}
      />
      <EditUserForm user={user} />
    </Box>
  );
};

