import React from 'react';
import { Box, Typography, TextField, MenuItem, Grid, Divider } from '@mui/material';
import type { CommodityData } from '../../../types/biopass';

interface CommodityStepProps {
  data?: CommodityData;
  updateData: (data: CommodityData) => void;
}

const commodityTypes = ['Coffee', 'Cocoa', 'Rubber', 'Palm Oil', 'Soy', 'Wood', 'Other'];

const countries = [
  'Argentina', 'Australia', 'Bolivia', 'Brazil', 'Cambodia', 'Cameroon', 'Canada', 'China', 'Colombia', "Côte d'Ivoire", 'Democratic Republic of the Congo', 'Ecuador', 'Ethiopia', 'France', 'Germany', 'Ghana', 'Guatemala', 'Honduras', 'India', 'Indonesia', 'Kenya', 'Laos', 'Liberia', 'Malaysia', 'Mexico', 'Myanmar', 'Nicaragua', 'Nigeria', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Republic of the Congo', 'Sierra Leone', 'Solomon Islands', 'Sri Lanka', 'Tanzania', 'Thailand', 'Uganda', 'United States', 'Vietnam'
].sort();

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (2020 + i).toString());

const CommodityStep: React.FC<CommodityStepProps> = ({ data, updateData }) => {
  // Ensure unit is always tonnes
  React.useEffect(() => {
    if (data && data.unit !== 'Tonnes') {
      updateData({ ...data, unit: 'Tonnes' });
    }
  }, [data?.unit]);

  const handleChange = (field: keyof CommodityData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (data) {
      updateData({ ...data, [field]: event.target.value });
    }
  };

  if (!data) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Commodity Information</Typography>
      <Grid container spacing={3}>

        {/* ── Producer / Farm Identity ── */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.7rem' }}>
            Producer Identity
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Company / Farm Name"
            value={data.companyName || ''}
            onChange={handleChange('companyName')}
            placeholder="e.g., Green Valley Farm Co."
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* spacer on desktop, full-width on mobile */}
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Address"
            value={data.address || ''}
            onChange={handleChange('address')}
            placeholder="e.g., 123 Farm Road, Mekong Delta, Vietnam"
            multiline
            rows={2}
            required
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1.5, mb: 1, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.7rem' }}>
            Commodity Details
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Commodity Type"
            value={data.type || ''}
            onChange={handleChange('type')}
            required
          >
            {commodityTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="HS Code"
            value={data.hsCode || ''}
            onChange={handleChange('hsCode')}
            placeholder="e.g., 0901"
            required
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Product Description"
            value={data.description || ''}
            onChange={handleChange('description')}
            multiline
            rows={3}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={data.quantity || ''}
            onChange={handleChange('quantity')}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Unit"
            value="Tonnes"
            disabled
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Production Country"
            value={data.productionCountry || ''}
            onChange={handleChange('productionCountry')}
            required
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Production Year"
            value={data.productionYear || ''}
            onChange={handleChange('productionYear')}
            required
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommodityStep;
