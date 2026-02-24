// client/src/components/Layout.tsx
import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  CssBaseline,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Campaign as CampaignIcon,
  ListAlt as ListAltIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

export type DashboardSection = 'emails' | 'lists' | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, onSectionChange }) => {
  const { name, email, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const menuItems = useMemo(
    () => [
      { key: 'emails' as const, label: 'Emails', icon: <CampaignIcon /> },
      { key: 'lists' as const, label: 'Mailing Lists', icon: <ListAltIcon /> },
      { key: 'settings' as const, label: 'Settings', icon: <SettingsIcon /> },
    ],
    [],
  );

  const drawer = (
    <Box>
      <Toolbar>
        <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" noWrap component="div">
          MyMail
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {name && email && (
          <ListItem>
            <ListItemIcon>
              <Avatar>{name.charAt(0).toUpperCase()}</Avatar>
            </ListItemIcon>
            <ListItemText primary={name} secondary={email} />
          </ListItem>
        )}
        <Divider sx={{ my: 1 }} />
        {menuItems.map((item) => (
          <ListItem
            key={item.key}
            onClick={() => onSectionChange(item.key)}
            sx={{
              cursor: 'pointer',
              borderRadius: 2,
              mx: 1,
              '&:hover': { bgcolor: 'action.hover' },
              bgcolor: activeSection === item.key ? 'action.selected' : 'transparent',
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <Box sx={{ flexGrow: 1 }} /> {/* Pushes logout to bottom */}
        <ListItem 
          onClick={handleLogout} 
          sx={{ mt: 'auto', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
            MyMail Campaigns
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {name && (
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar>{name[0]}</Avatar>
            </IconButton>
          )}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of the drawer container. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: ['48px', '56px', '64px'], // Adjust margin-top for app bar height
        }}
      >
        <Toolbar /> {/* This is to offset the content below the fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
