import React, { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, ListItemIcon, IconButton, CircularProgress, MenuItem, TextField } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { v4 as uuidv4 } from 'uuid';
import type { EvidenceDocument } from '../../../types/biopass';
import { biopassService } from '../../../services/biopassService';

interface EvidenceStepProps {
  data?: EvidenceDocument[];
  updateData: (data: EvidenceDocument[]) => void;
  recordId: string;
}

const documentTypes = [
  'National ID',
  'Land Ownership Certificate',
  'Land Use Certificate',
  'Lease Agreement',
  'Farm Photos',
  'Harvest Records',
  'Certifications',
  'Other Supporting Documents'
];

const EvidenceStep: React.FC<EvidenceStepProps> = ({ data = [], updateData, recordId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('National ID');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      // Upload to Firebase Storage
      const url = await biopassService.uploadEvidenceFile(file, recordId);
      
      const newDoc: EvidenceDocument = {
        id: uuidv4(),
        name: file.name,
        fileUrl: url,
        fileType: selectedType,
        uploadTimestamp: new Date().toISOString(),
        uploadedBy: 'Current User' // Mocked user
      };

      updateData([...data, newDoc]);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file.');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleRemoveDocument = (id: string) => {
    // In a real app, you might also want to delete from Firebase Storage
    updateData(data.filter(doc => doc.id !== id));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Supporting Evidence</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
        <TextField
          select
          size="small"
          label="Document Type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {documentTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          component="label"
          startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Uploaded Documents</Typography>
      {data.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
          No documents uploaded yet.
        </Typography>
      ) : (
        <List>
          {data.map((doc) => (
            <ListItem
              key={doc.id}
              sx={{ border: '1px solid #eee', borderRadius: 1, mb: 1 }}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveDocument(doc.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <InsertDriveFileIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={doc.name}
                secondary={`${doc.fileType} • Uploaded ${new Date(doc.uploadTimestamp).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default EvidenceStep;
