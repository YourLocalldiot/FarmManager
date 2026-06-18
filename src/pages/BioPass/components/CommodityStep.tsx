import React from 'react';
import { Box, Typography, TextField, MenuItem, Grid } from '@mui/material';
import type { CommodityData } from '../../../types/biopass';

interface CommodityStepProps {
  data?: CommodityData;
  updateData: (data: CommodityData) => void;
}

const commodityTypes = ['Coffee', 'Cocoa', 'Rubber', 'Palm Oil', 'Soy', 'Wood', 'Other'];

const CommodityStep: React.FC<CommodityStepProps> = ({ data, updateData }) => {
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
            value={data.unit || ''}
            onChange={handleChange('unit')}
            placeholder="e.g., kg, tons"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Production Country"
            value={data.productionCountry || ''}
            onChange={handleChange('productionCountry')}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Production Year"
            value={data.productionYear || ''}
            onChange={handleChange('productionYear')}
            type="number"
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommodityStep;
