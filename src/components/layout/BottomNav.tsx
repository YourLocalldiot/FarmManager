import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NatureIcon from '@mui/icons-material/Nature';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(_, newValue) => {
          navigate(newValue);
        }}
      >
        <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="BioPass" value="/biopass" icon={<VerifiedUserIcon />} />
        <BottomNavigationAction label="Quant" value="/quant" icon={<TrendingUpIcon />} />
        <BottomNavigationAction label="Salvager" value="/salvager" icon={<NatureIcon />} />
        <BottomNavigationAction label="Future" value="/future" icon={<RocketLaunchIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
