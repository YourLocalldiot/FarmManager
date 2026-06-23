import React from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { mockMarketRankings, mockChartData } from '../../mock/data';

const QuantitativeAgent: React.FC = () => {
  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AutoGraphIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Intelligent Agent
        </Typography>
      </Box>

      {/* Input Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Analyze Market Opportunity</Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField select fullWidth size="small" label="Crop Type" defaultValue="rice">
                <MenuItem value="rice">Jasmine Rice</MenuItem>
                <MenuItem value="coffee">Coffee Beans</MenuItem>
                <MenuItem value="fruit">Dragon Fruit</MenuItem>
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField fullWidth size="small" label="Quantity (Tons)" defaultValue="50" type="number" />
            </Grid>
            <Grid size={6}>
              <TextField select fullWidth size="small" label="Province" defaultValue="mekong">
                <MenuItem value="mekong">Mekong Delta</MenuItem>
                <MenuItem value="central">Central Highlands</MenuItem>
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField fullWidth size="small" label="Harvest Date" type="date" slotProps={{ inputLabel: { shrink: true } }} defaultValue="2026-11-15" />
            </Grid>
            <Grid size={12}>
              <Button variant="contained" fullWidth sx={{ mt: 1 }}>Generate Prediction</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recommendation Result Card */}
      <Card sx={{ mb: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <CardContent>
          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>Top Recommendation</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Export to Japan</Typography>
          
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="caption" color="textSecondary">Expected Revenue</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>300M VND</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="textSecondary">Estimated Costs</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'error.main' }}>160M VND</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="textSecondary">Estimated Profit</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>140M VND</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="textSecondary">Confidence Score</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>92%</Typography>
                <Chip label="High" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Market Ranking Table */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Market Rankings</Typography>
      <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Market</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Profit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockMarketRankings.map((row) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.market}
                </TableCell>
                <TableCell align="right" sx={{ color: 'success.main', fontWeight: 500 }}>{row.profit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Analytics Section */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Price & Demand Trend</Typography>
      <Card>
        <CardContent sx={{ p: 1, pb: '16px !important' }}>
          <Box sx={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" style={{ fontSize: '0.75rem' }} />
                <YAxis style={{ fontSize: '0.75rem' }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="price" stroke="#2e7d32" strokeWidth={2} name="Price (VND)" />
                <Line type="monotone" dataKey="demand" stroke="#1976d2" strokeWidth={2} name="Demand Index" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
      
    </Box>
  );
};

export default QuantitativeAgent;
