/**
 * User Menu Component
 * User dropdown menu in the app bar with account management options
 */

import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  ArrowDropDown as ArrowDropDownIcon,
  AccountCircle as AccountCircleIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@app/store/hooks';
import { usePermissions } from '@shared/hooks/usePermissions';
import { useGetUsersQuery } from '@features/users/api/usersApi';
import { ROUTES } from '@shared/constants/routes';

interface UserMenuProps {
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  // Get user info from Redux
  const { email: userEmail, firstName, lastName } = useAppSelector((state) => state.auth.user);
  const { roleDisplayName, roleColor } = usePermissions();
  
  // Get current user's userId from users list
  const { data: users = [] } = useGetUsersQuery();
  const currentUser = users.find((u) => u.email === userEmail);

  const formatNameFromEmail = (email: string): string => {
    const local = email.split('@')[0] || email;
    const cleaned = local.replace(/[._-]+/g, ' ').trim();
    if (!cleaned) return email;
    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const displayName = (() => {
    const fn = (firstName || '').trim();
    const ln = (lastName || '').trim();
    if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
    if (userEmail) return formatNameFromEmail(userEmail);
    return 'User';
  })();

  const initials = (() => {
    const fn = (firstName || '').trim();
    const ln = (lastName || '').trim();
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    if (fn) return fn[0]?.toUpperCase() || 'U';
    if (ln) return ln[0]?.toUpperCase() || 'U';
    if (userEmail) {
      const parts = userEmail.split('@')[0].split(/[._-]/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return userEmail[0]?.toUpperCase() || 'U';
    }
    return 'U';
  })();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const handleMyAccount = () => {
    handleClose();
    if (currentUser?.userId) {
      navigate(ROUTES.EDIT_USER(currentUser.userId));
    }
  };

  const handleChangePassword = () => {
    handleClose();
    navigate(ROUTES.CHANGE_PASSWORD);
  };

  return (
    <Box>
      {/* User Menu Button */}
      <Button
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textTransform: 'none',
          color: 'text.primary',
          px: 1.5,
          py: 1,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.875rem' }}>
            Welcome, {displayName}
          </Typography>
          {roleDisplayName && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.2 }}>
              {roleDisplayName}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '1rem',
            fontWeight: 700,
            border: '2px solid',
            borderColor: 'background.paper',
          }}
        >
          {initials}
        </Avatar>
        <ArrowDropDownIcon sx={{ color: 'text.secondary', fontSize: '1.25rem' }} />
      </Button>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 240,
            boxShadow: 4,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {userEmail || displayName}
          </Typography>
          {roleDisplayName && (
            <Chip
              label={roleDisplayName}
              color={roleColor}
              size="small"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
            />
          )}
        </Box>
        <Divider />
        <MenuItem onClick={handleMyAccount} sx={{ gap: 1.5, py: 1.5 }}>
          <AccountCircleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="body2">My Account</Typography>
        </MenuItem>
        <MenuItem onClick={handleChangePassword} sx={{ gap: 1.5, py: 1.5 }}>
          <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="body2">Password Change</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.5 }}>
          <LogoutIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};
