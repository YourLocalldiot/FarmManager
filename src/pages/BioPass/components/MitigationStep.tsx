import React from 'react';
import { Box, Typography, TextField, MenuItem, Grid, Button, Card, CardContent, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';
import type { MitigationAction } from '../../../types/biopass';

interface MitigationStepProps {
  data?: MitigationAction[];
  updateData: (data: MitigationAction[]) => void;
}

const statuses = ['Open', 'In Progress', 'Closed'];

const MitigationStep: React.FC<MitigationStepProps> = ({ data = [], updateData }) => {
  const handleAddAction = () => {
    const newAction: MitigationAction = {
      id: uuidv4(),
      riskDescription: '',
      action: '',
      responsiblePerson: '',
      dueDate: '',
      status: 'Open'
    };
    updateData([...data, newAction]);
  };

  const handleRemoveAction = (id: string) => {
    updateData(data.filter(action => action.id !== id));
  };

  const handleChange = (id: string, field: keyof MitigationAction, value: string) => {
    const updatedData = data.map(action => {
      if (action.id === id) {
        return { ...action, [field]: value };
      }
      return action;
    });
    updateData(updatedData);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Risk Mitigation</Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddAction}>
          Add Action
        </Button>
      </Box>

      {data.length === 0 ? (
        <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
          No mitigation actions added. If there are no risks, you may skip this step.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((action, index) => (
            <Card key={action.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Action {index + 1}
                  </Typography>
                  <IconButton color="error" onClick={() => handleRemoveAction(action.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Identified Risk Description"
                      value={action.riskDescription}
                      onChange={(e) => handleChange(action.id, 'riskDescription', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Mitigation Action"
                      value={action.action}
                      onChange={(e) => handleChange(action.id, 'action', e.target.value)}
                      multiline
                      rows={2}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Responsible Person"
                      value={action.responsiblePerson}
                      onChange={(e) => handleChange(action.id, 'responsiblePerson', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="date"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={action.dueDate}
                      onChange={(e) => handleChange(action.id, 'dueDate', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      value={action.status}
                      onChange={(e) => handleChange(action.id, 'status', e.target.value)}
                    >
                      {statuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
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

export default MitigationStep;
