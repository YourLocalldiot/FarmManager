import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Chip } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CloudIcon from '@mui/icons-material/Cloud';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import FlightIcon from '@mui/icons-material/Flight';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const upcomingFeatures = [
  { title: 'Smart Irrigation', desc: 'IoT automated watering', icon: WaterDropIcon, color: '#1976d2' },
  { title: 'Weather Intel', desc: 'Microclimate forecasting', icon: CloudIcon, color: '#0288d1' },
  { title: 'Carbon Credits', desc: 'Monetize carbon sequestration', icon: NaturePeopleIcon, color: '#388e3c' },
  { title: 'Precision Farming', desc: 'AI-driven field management', icon: PrecisionManufacturingIcon, color: '#fbc02d' },
  { title: 'Drone Monitoring', desc: 'Aerial crop health scanning', icon: FlightIcon, color: '#7b1fa2' },
  { title: 'Supply Tracking', desc: 'Blockchain traceability', icon: LocalShippingIcon, color: '#e64a19' },
];

const Future: React.FC = () => {
  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Future Development
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Upcoming FarmManager Features
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {upcomingFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Grid size={6} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ bgcolor: `${feature.color}22`, color: feature.color, mb: 2, width: 56, height: 56 }}>
                    <Icon fontSize="medium" />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>{feature.title}</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {feature.desc}
                  </Typography>
                  <Chip label="Coming Soon" size="small" variant="outlined" color="primary" sx={{ fontSize: '0.65rem' }} />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Future;
