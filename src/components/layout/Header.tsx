import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Menu, MenuItem, Avatar, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../../theme/ThemeContext';

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
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangClose = () => {
    setLangAnchorEl(null);
  };

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            FarmManager
          </Typography>
        </Box>

        {/* Dark / Light mode toggle */}
        <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        {/* Language selector (stub for future i18n) */}
        <Tooltip title="Language (coming soon)">
          <IconButton onClick={handleLangMenu} color="inherit">
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={langAnchorEl}
          open={Boolean(langAnchorEl)}
          onClose={handleLangClose}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 160 } } }}
        >
          <MenuItem onClick={handleLangClose} selected>
            🇬🇧 English
          </MenuItem>
          <MenuItem onClick={handleLangClose} disabled>
            🇻🇳 Tiếng Việt (soon)
          </MenuItem>
          <MenuItem onClick={handleLangClose} disabled>
            🇨🇳 中文 (soon)
          </MenuItem>
        </Menu>

        {/* User avatar / profile menu */}
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
