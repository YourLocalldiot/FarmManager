import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavValue = () => {
    const path = location.pathname;
    if (path.startsWith('/biopass')) return '/biopass';
    if (path.startsWith('/agent')) return '/agent';
    return '/';
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={getNavValue()}
        onChange={(_, newValue) => {
          navigate(newValue);
        }}
      >
        <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="BioPass" value="/biopass" icon={<VerifiedUserIcon />} />
        <BottomNavigationAction label="Agent" value="/agent" icon={<SmartToyIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
