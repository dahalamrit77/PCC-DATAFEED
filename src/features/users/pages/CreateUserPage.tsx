/**
 * Create User Page
 * Page wrapper for creating new users
 */

import React from 'react';
import { Box } from '@mui/material';
import { CreateUserForm } from '../components/CreateUserForm';
import { PageHeader } from '../../../shared/components/ui';
import { ROUTES } from '../../../shared/constants/routes';

export const CreateUserPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Add New User"
        breadcrumbs={[
          { label: 'Users', path: ROUTES.USERS },
          { label: 'Create User' },
        ]}
      />

      {/* Form */}
      <CreateUserForm />
    </Box>
  );
};
