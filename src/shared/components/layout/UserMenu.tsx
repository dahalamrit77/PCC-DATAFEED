/**
 * User Menu Component
 * User dropdown menu in the app bar
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
} from '@mui/icons-material';
import { Chip } from '@mui/material';
import { useAppSelector } from '@app/store/hooks';
import { usePermissions } from '@shared/hooks/usePermissions';

interface UserMenuProps {
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Get user info from Redux
  const { facilityIds, selectedFacilityId } = useAppSelector(
    (state) => state.facility
  );
  const { email: userEmail, firstName, lastName } = useAppSelector((state) => state.auth.user);
  const { roleDisplayName, roleColor } = usePermissions();

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
    if (facilityIds.length === 1 && selectedFacilityId) return `Facility ${selectedFacilityId}`;
    return 'User';
  })();

  const initials = (() => {
    const fn = (firstName || '').trim();
    const ln = (lastName || '').trim();
    if (fn || ln) return `${fn[0] ?? ''}${ln[0] ?? ''}`.toUpperCase() || 'U';
    if (userEmail) return userEmail[0]?.toUpperCase() || 'U';
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

  return (
    <Box>
      <Button
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textTransform: 'none',
          color: 'text.primary',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            Welcome, {displayName}
          </Typography>
        </Box>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>
        <ArrowDropDownIcon sx={{ color: 'text.secondary' }} />
      </Button>
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
            minWidth: 200,
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
        <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
          <LogoutIcon fontSize="small" />
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};
