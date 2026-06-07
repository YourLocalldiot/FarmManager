import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

const AppLayout: React.FC = () => {
  return (
    <Box sx={{ pb: 8, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  );
};

export default AppLayout;
