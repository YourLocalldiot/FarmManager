import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, CardActionArea, CircularProgress } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import LandscapeIcon from '@mui/icons-material/Landscape';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { biopassService } from '../../services/biopassService';
import type { BioPassRecord } from '../../types/biopass';

const SummaryCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="textSecondary" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: color, mt: 1, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}1A`, color: color, width: 40, height: 40 }}>
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<BioPassRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      biopassService.getUserRecords(currentUser.uid)
        .then(setRecords)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleActionClick = (action: string) => {
    if (action === 'Start BioPass') {
      navigate('/biopass/new');
    } else if (action === 'Ask Agent') {
      navigate('/agent');
    } else if (action === 'View Reports') {
      navigate('/biopass');
    }
  };

  const totalDeclarations = records.length;
  const submittedDeclarations = records.filter(r => r.status === 'Submitted' || r.status === 'Approved').length;
  const totalArea = records.reduce((sum, r) => {
    const recordArea = r.plots?.reduce((pSum, plot) => pSum + (plot.area || 0), 0) || 0;
    return sum + recordArea;
  }, 0);

  const recentRecords = records.slice(0, 5);

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Good Morning, Farmer
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Here's your BioPass compliance summary.
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={6}>
            <SummaryCard 
              title="Total BioPass Forms" 
              value={totalDeclarations.toString()} 
              subtitle="All drafts & submitted" 
              icon={DescriptionIcon} 
              color="#1976d2" 
            />
          </Grid>
          <Grid size={6}>
            <SummaryCard 
              title="Submitted" 
              value={submittedDeclarations.toString()} 
              subtitle="Pending & Approved" 
              icon={VerifiedIcon} 
              color="#2e7d32" 
            />
          </Grid>
          <Grid size={12}>
            <SummaryCard 
              title="Total Registered Area" 
              value={`${totalArea.toFixed(2)} ha`} 
              subtitle="Calculated from Geo Collection" 
              icon={LandscapeIcon} 
              color="#ed6c02" 
            />
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Quick Actions</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {['Start BioPass', 'Ask Agent', 'View Reports'].map((action, index) => (
          <Grid size={4} key={index}>
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: '100%' }}>
              <CardActionArea sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleActionClick(action)}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{action}</Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent BioPass Activity</Typography>
      <Card>
        {recentRecords.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">No recent activity found.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {recentRecords.map((record, index) => {
              const dateObj = new Date(record.updatedAt || record.createdAt || Date.now());
              return (
                <React.Fragment key={record.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: record.status === 'Draft' ? '#ed6c02' : '#2e7d32' }}>
                        <DescriptionIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{record.commodity?.type ? `BioPass for ${record.commodity.type}` : 'BioPass Draft'}</Typography>}
                      secondary={<Typography variant="caption" color="textSecondary">Status: {record.status} • {dateObj.toLocaleDateString()}</Typography>}
                    />
                  </ListItem>
                  {index < recentRecords.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Card>
    </Box>
  );
};

export default Home;
