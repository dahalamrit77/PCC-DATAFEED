/**
 * Users Index Page
 * Lists users with search + "Add User" CTA.
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import { PageHeader, DataTableContainer } from '@shared/components/ui';
import { ROUTES } from '@shared/constants/routes';
import { UserRole, type User } from '@shared/types/user.types';
import { getRoleDisplayName } from '@shared/lib/permissions';
import { useGetUsersQuery, useDeleteUserMutation } from '../api/usersApi';
import { useToast } from '@shared/hooks/useToast';

export const UsersIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [query, setQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const {
    data: users = [],
    isLoading,
    error,
  } = useGetUsersQuery();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const facilities = u.facilities.join(', ');
      return (
        fullName.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        facilities.includes(q)
      );
    });
  }, [query, users]);

  const errorMessage =
    error && typeof error === 'object' && 'status' in error
      ? 'Failed to load users.'
      : null;

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser({ userId: userToDelete.userId }).unwrap();
      showSuccess('User deleted successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : err && typeof err === 'object' && 'message' in err
          ? (err as { message?: string }).message
          : 'Failed to delete user. Please try again.';
      showError(errorMessage || 'Failed to delete user. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <Box>
      <PageHeader
        title="Users"
       
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: 220, sm: 280, md: 320 } }}
            />
            <Button variant="contained" onClick={() => navigate(ROUTES.CREATE_USER)}>
              Add User
            </Button>
          </Stack>
        }
      />

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <DataTableContainer
        loading={isLoading}
        empty={filtered.length === 0}
        emptyMessage="No users found."
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 90 }}>S.No.</TableCell>
            <TableCell>Full Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Facilities</TableCell>
            <TableCell align="right" sx={{ width: 120 }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((u, idx) => (
            <TableRow key={u.userId} hover>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {u.firstName} {u.lastName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {u.email}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={getRoleDisplayName(u.role)}
                  color={u.role === UserRole.SUPER_ADMIN ? 'error' : u.role === UserRole.ADMIN ? 'warning' : 'success'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {u.facilities.length === 0 ? '—' : u.facilities.join(', ')}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      aria-label="Edit user"
                      onClick={() => navigate(ROUTES.EDIT_USER(u.userId))}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      aria-label="Delete user"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(u);
                      }}
                      sx={{
                        '&:hover': { backgroundColor: 'action.hover', color: 'error.main' },
                        color: 'text.secondary',
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete{' '}
            <strong>
              {userToDelete?.firstName} {userToDelete?.lastName}
            </strong>{' '}
            ({userToDelete?.email})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

