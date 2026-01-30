/**
 * Dashboard Layout Component
 * Main layout wrapper for dashboard pages
 */

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BusinessIcon from '@mui/icons-material/Business';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { setFacilityIds, clearSelectedFacility, setActiveFacility } from '@entities/facility/store/facilitySlice';
import { logout, setUser } from '@features/auth/store/authSlice';
import { useGetFacilitiesQuery } from '@entities/facility/api/facilityApi';
import { usePermissions } from '@shared/hooks/usePermissions';
import { UserRole } from '@shared/types/user.types';
import { ROUTES } from '@shared/constants/routes';
import { UserMenu } from './UserMenu';

const drawerWidth = 260;
const APP_BAR_HEIGHT = { xs: 64, sm: 72 } as const;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redux hooks
  const dispatch = useAppDispatch();
  
  // Fetch facilities using RTK Query
  const { data: facilities = [] } = useGetFacilitiesQuery();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedFacilityId } = useAppSelector((state) => state.facility);
  const { canCreateUsers } = usePermissions();
  
  // Check if user is Super Admin (only Super Admin should see facility dropdown)
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;

  // Update facility IDs in Redux when facilities are fetched
  // Also update user role if it wasn't set during login
  // For Admin and User roles, automatically set selectedFacilityId to their assigned facilities
  useEffect(() => {
    if (facilities.length > 0) {
      const ids = facilities.map((f) => f.facId).sort((a, b) => a - b);
      dispatch(setFacilityIds(ids));
      
      // Update role if not already set (role inference based on facilities)
      const currentRole = user.role;
      if (!currentRole && user.email) {
        let inferredRole: UserRole = UserRole.USER;
        
        // Check if user is test@example.com (Super Admin)
        if (user.email === 'test@example.com') {
          inferredRole = UserRole.SUPER_ADMIN;
        } else if (facilities.length > 1) {
          inferredRole = UserRole.ADMIN;
        } else if (facilities.length === 1) {
          inferredRole = UserRole.USER;
        }
        
        // Update role in Redux (facilities will be set from facilities array)
        dispatch(
          setUser({
            email: user.email,
            role: inferredRole,
            facilities: ids,
          })
        );
      } else if (currentRole && user.facilities.length === 0 && ids.length > 0) {
        // Update facilities if role is set but facilities are missing
        dispatch(
          setUser({
            email: user.email!,
            role: currentRole,
            facilities: ids,
          })
        );
      }
      
      // For Admin and User roles (not Super Admin), automatically filter to their assigned facilities
      // Super Admin can see all facilities via dropdown
      if (currentRole && currentRole !== UserRole.SUPER_ADMIN) {
        const userFacilities = user.facilities.length > 0 ? user.facilities : ids;
        
        // If user has only one facility, automatically select it
        if (userFacilities.length === 1 && selectedFacilityId !== userFacilities[0]) {
          dispatch(setActiveFacility(userFacilities[0]));
        }
        // If user has multiple facilities but none selected, select the first one
        else if (userFacilities.length > 1 && !selectedFacilityId) {
          dispatch(setActiveFacility(userFacilities[0]));
        }
        // If selectedFacilityId is not in user's facilities, reset to first facility
        else if (selectedFacilityId && !userFacilities.includes(selectedFacilityId)) {
          dispatch(setActiveFacility(userFacilities[0]));
        }
      }
    }
  }, [facilities, dispatch, user.email, user.role, user.facilities, selectedFacilityId]);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearSelectedFacility());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'primary.main' }}>
      {/* Brand Header Section */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          minHeight: APP_BAR_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderBottom: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.12)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'white',
            fontSize: '1.125rem',
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >CareSync Pro
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          Live PointClickCare Data Feed
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, pt: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === ROUTES.DASHBOARD}
            onClick={() => handleNavClick(ROUTES.DASHBOARD)}
            sx={{
              color: 'white',
              py: 1.5,
              px: 3,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.24)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Census Dashboard" primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === ROUTES.PATIENTS || location.pathname.startsWith('/patients/')}
            onClick={() => handleNavClick(ROUTES.PATIENTS)}
            sx={{
              color: 'white',
              py: 1.5,
              px: 3,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.24)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Patients" primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === ROUTES.FACILITIES || location.pathname.startsWith('/facilities/')}
            onClick={() => handleNavClick(ROUTES.FACILITIES)}
            sx={{
              color: 'white',
              py: 1.5,
              px: 3,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.24)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText primary="Facilities" primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>
        {/* User Management - Only show for Super Admin and Admin */}
        {canCreateUsers && (
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === ROUTES.CREATE_USER || location.pathname.startsWith('/users/')}
              onClick={() => handleNavClick(ROUTES.USERS)}
              sx={{
                color: 'white',
                py: 1.5,
                px: 3,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.24)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Census Management"  primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} SkyPond Tech
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ gap: 3, minHeight: { xs: 64, sm: 72 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Facility Dropdown - Only show for Super Admin */}
          {isSuperAdmin && facilities.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 180, mr: 2 }}>
              <Select
                value={selectedFacilityId?.toString() || 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all') {
                    dispatch(setActiveFacility(null));
                  } else {
                    const newFacilityId = parseInt(value, 10);
                    if (!isNaN(newFacilityId)) {
                      dispatch(setActiveFacility(newFacilityId));
                    }
                  }
                }}
                displayEmpty
              >
                <MenuItem value="all">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    All Facilities
                  </Typography>
                </MenuItem>
                {facilities.map((facility) => (
                  <MenuItem key={facility.facId} value={facility.facId.toString()}>
                    <Typography variant="body2">
                      {facility.facilityName || `Facility ${facility.facId}`}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <UserMenu onLogout={handleLogout} />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="sidebar navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'primary.main',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'primary.main',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
        }}
      >
        {/* Spacer so fixed AppBar never overlaps content */}
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }} />

        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: { lg: '1600px' },
            mx: 'auto',
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
