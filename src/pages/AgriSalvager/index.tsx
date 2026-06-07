import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Chip, Button } from '@mui/material';
import NatureIcon from '@mui/icons-material/Nature';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { mockCropListings } from '../../mock/data';

const AgriSalvager: React.FC = () => {
  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <NatureIcon color="success" sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          AgriSalvager
        </Typography>
      </Box>

      {/* Summary Section */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>1.2k</Typography>
            <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1 }}>kg Saved Produce</Typography>
          </Box>
        </Grid>
        <Grid size={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>18M</Typography>
            <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1 }}>VND Recovered</Typography>
          </Box>
        </Grid>
        <Grid size={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>15%</Typography>
            <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1 }}>Waste Prevented</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Sustainability Dashboard */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Sustainability Impact</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={12}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AutorenewIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2">CO₂ Saved</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>450 kg</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText', height: '100%' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <EnergySavingsLeafIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>2.5 kWh</Typography>
              <Typography variant="caption" align="center">Renewable Energy Potential</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', height: '100%' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <NatureIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>800 kg</Typography>
              <Typography variant="caption" align="center">Food Waste Reduced</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Crop Listing & Alternative Buyer Matching */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Alternative Buyer Matches</Typography>
      <Grid container spacing={2}>
        {mockCropListings.map((item) => (
          <Grid size={12} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                    <Typography variant="caption" color="textSecondary">Quantity: {item.quantity}</Typography>
                  </Box>
                  <Chip label={item.grade} size="small" color={item.grade.startsWith('B') ? 'primary' : item.grade.startsWith('C') ? 'warning' : 'error'} />
                </Box>
                
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }} gutterBottom>Suggested Buyer Match</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.suggestedBuyer}</Typography>
                      <Typography variant="caption" color="success.main">Match Score: {item.matchScore}%</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.estRevenue}</Typography>
                      <Typography variant="caption" color="textSecondary">Est. Revenue</Typography>
                    </Box>
                  </Box>
                  <Button variant="outlined" size="small" fullWidth sx={{ mt: 1.5 }}>Contact Buyer</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
    </Box>
  );
};

export default AgriSalvager;
