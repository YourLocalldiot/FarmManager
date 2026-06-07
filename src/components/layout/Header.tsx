import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Header: React.FC = () => {
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
        <IconButton sx={{ p: 0, ml: 1 }}>
          <Avatar alt="Farmer" src="https://i.pravatar.cc/150?img=11" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
