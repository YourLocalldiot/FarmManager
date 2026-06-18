import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box, Menu, MenuItem } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

const Header: React.FC = () => {
  const { userProfile } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await signOut(auth);
  };

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            FarmManager
          </Typography>
        </Box>
        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>
        
        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenu}>
          <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            {userProfile?.firstName || 'Farmer'}
          </Typography>
          <IconButton sx={{ p: 0 }}>
            <Avatar alt={userProfile?.firstName || 'Farmer'} src="https://i.pravatar.cc/150?img=11" />
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
