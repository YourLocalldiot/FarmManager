import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, CardActionArea } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';
import { mockActivities } from '../../mock/data';

const SummaryCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <Card>
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

  const handleActionClick = (action: string) => {
    if (action === 'Start BioPass') {
      navigate('/biopass/new');
    } else if (action === 'Ask Agent') {
      navigate('/agent');
    } else if (action === 'View Reports') {
      navigate('/biopass');
    }
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Good Morning, Farmer
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Here's what's happening today.
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={6}>
          <SummaryCard 
            title="BioPass Status" 
            value="Verified" 
            subtitle="Valid until Dec 2026" 
            icon={CheckCircleIcon} 
            color="#2e7d32" 
          />
        </Grid>
        <Grid size={6}>
          <SummaryCard 
            title="Current Rec" 
            value="Hold" 
            subtitle="Wait for price peak" 
            icon={TrendingUpIcon} 
            color="#ed6c02" 
          />
        </Grid>
        <Grid size={6}>
          <SummaryCard 
            title="Monthly Revenue" 
            value="45M VND" 
            subtitle="+12% from last month" 
            icon={StorefrontIcon} 
            color="#1976d2" 
          />
        </Grid>
        <Grid size={6}>
          <SummaryCard 
            title="Crop Health" 
            value="92/100" 
            subtitle="Optimal condition" 
            icon={AssessmentIcon} 
            color="#9c27b0" 
          />
        </Grid>
      </Grid>

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
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent Activity</Typography>
      <Card>
        <List disablePadding>
          {mockActivities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: activity.type === 'success' ? '#2e7d32' : activity.type === 'info' ? '#1976d2' : '#ed6c02' }}>
                    <CheckCircleIcon fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{activity.text}</Typography>}
                  secondary={<Typography variant="caption" color="textSecondary">{activity.time}</Typography>}
                />
              </ListItem>
              {index < mockActivities.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Card>
    </Box>
  );
};

export default Home;
