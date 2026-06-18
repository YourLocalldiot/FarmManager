import React from 'react';
import { Box, Typography, TextField, MenuItem, Grid, Button, Card, CardContent, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';
import { SupplyChainActor } from '../../../types/biopass';

interface SupplyChainStepProps {
  data?: SupplyChainActor[];
  updateData: (data: SupplyChainActor[]) => void;
}

const roles = ['Farmer', 'Collector', 'Cooperative', 'Processor', 'Exporter', 'Trader'];

const SupplyChainStep: React.FC<SupplyChainStepProps> = ({ data = [], updateData }) => {
  const handleAddActor = () => {
    const newActor: SupplyChainActor = {
      id: uuidv4(),
      companyName: '',
      contactName: '',
      role: 'Farmer',
      address: '',
      phoneNumber: ''
    };
    updateData([...data, newActor]);
  };

  const handleRemoveActor = (id: string) => {
    updateData(data.filter(actor => actor.id !== id));
  };

  const handleChange = (id: string, field: keyof SupplyChainActor, value: string) => {
    const updatedData = data.map(actor => {
      if (actor.id === id) {
        return { ...actor, [field]: value };
      }
      return actor;
    });
    updateData(updatedData);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Supply Chain Mapping</Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddActor}>
          Add Actor
        </Button>
      </Box>

      {data.length === 0 ? (
        <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
          No actors added yet. Click "Add Actor" to begin mapping the supply chain.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((actor, index) => (
            <Card key={actor.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Actor {index + 1}
                  </Typography>
                  <IconButton color="error" onClick={() => handleRemoveActor(actor.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Role"
                      value={actor.role}
                      onChange={(e) => handleChange(actor.id, 'role', e.target.value)}
                      required
                    >
                      {roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company/Farm Name"
                      value={actor.companyName}
                      onChange={(e) => handleChange(actor.id, 'companyName', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Name"
                      value={actor.contactName}
                      onChange={(e) => handleChange(actor.id, 'contactName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={actor.phoneNumber}
                      onChange={(e) => handleChange(actor.id, 'phoneNumber', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={actor.address}
                      onChange={(e) => handleChange(actor.id, 'address', e.target.value)}
                      multiline
                      rows={2}
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SupplyChainStep;
