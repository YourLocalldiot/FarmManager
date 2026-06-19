import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Menu, MenuItem, Avatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

/** Renders a green circle avatar with the user's first-name initial. */
export const UserAvatar: React.FC<{ firstName?: string; size?: number }> = ({
  firstName,
  size = 36,
}) => {
  const letter = (firstName ?? 'F')[0].toUpperCase();
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: '#2e7d32',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: size * 0.45,
      }}
    >
      {letter}
    </Avatar>
  );
};

const Header: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
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

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
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
            <UserAvatar firstName={userProfile?.firstName} />
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 160 } } }}
        >
          <MenuItem onClick={handleProfile} sx={{ gap: 1.5 }}>
            <PersonIcon fontSize="small" color="action" />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
            <LogoutIcon fontSize="small" color="action" />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
