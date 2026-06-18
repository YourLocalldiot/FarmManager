import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, LinearProgress, Divider, List, ListItem, ListItemText, Chip } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MapIcon from '@mui/icons-material/Map';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const BioPass: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          BioPass
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/biopass/new')}
        >
          New Declaration
        </Button>
      </Box>

      {/* Status Card */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <VerifiedUserIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Status: Verified</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Last Verification</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Oct 15, 2025</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Compliance Score</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>98/100</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Farm Information Card */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Farm Details</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="caption" color="textSecondary">Farm Name</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Green Valley Rice</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="textSecondary">Province</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Mekong Delta</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="textSecondary">Crop Type</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Jasmine Rice</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="textSecondary">Farm Area</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>12.5 Hectares</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Interactive Map Placeholder */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>GPS Boundary</Typography>
      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ height: 180, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', position: 'relative' }}>
          <MapIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
          <Typography variant="body2" color="textSecondary">Interactive Map Placeholder</Typography>
          
          {/* Fake polygon outline */}
          <Box sx={{
            position: 'absolute',
            width: '60%',
            height: '60%',
            border: '2px solid #2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.2)',
            transform: 'skew(-10deg) rotate(5deg)',
            pointerEvents: 'none'
          }} />
        </Box>
        <CardContent sx={{ py: 1.5 }}>
          <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'monospace' }}>
            Coordinates: 10.0451° N, 105.7469° E
          </Typography>
        </CardContent>
      </Card>

      {/* Certification Section */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Certification</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Verification Progress</Typography>
            <Typography variant="body2" color="primary">100%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 4, mb: 3 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1, bgcolor: 'action.selected', borderRadius: 2 }}>
              <QrCodeIcon sx={{ fontSize: 64, color: 'text.primary' }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>GlobalGAP Certified</Typography>
              <Button variant="outlined" startIcon={<CloudDownloadIcon />} size="small">
                Download PDF
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Recent Submissions</Typography>
      <Card>
        <List disablePadding>
          <ListItem>
            <ListItemText primary="Soil Analysis Report Q3" secondary="Submitted: Oct 10, 2025" />
            <Chip label="Approved" size="small" color="success" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Water Usage Log" secondary="Submitted: Sep 28, 2025" />
            <Chip label="Approved" size="small" color="success" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Pesticide Declaration" secondary="Submitted: Aug 15, 2025" />
            <Chip label="Under Review" size="small" color="warning" />
          </ListItem>
        </List>
      </Card>

    </Box>
  );
};

export default BioPass;
