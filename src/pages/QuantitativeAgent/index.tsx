import React from 'react';
import { Box, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

const QuantitativeAgent: React.FC = () => {
  return (
    <Box sx={{ p: 4, pb: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <ConstructionIcon color="disabled" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
        Intelligent Agent
      </Typography>
      <Typography variant="body1" color="textSecondary">
        This feature is currently a work in progress. Please check back later!
      </Typography>
    </Box>
  );
};

export default QuantitativeAgent;
