import React, { useState } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText,
  ListItemIcon, IconButton, CircularProgress, TextField,
  LinearProgress, Alert, Link as MuiLink
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { v4 as uuidv4 } from 'uuid';
import type { EvidenceDocument } from '../../../types/biopass';
import { biopassService } from '../../../services/biopassService';

interface EvidenceStepProps {
  data?: EvidenceDocument[];
  updateData: (data: EvidenceDocument[]) => void;
  recordId: string;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <ImageIcon color="primary" />;
  if (mimeType.startsWith('video/')) return <VideoFileIcon color="secondary" />;
  if (mimeType === 'application/pdf') return <PictureAsPdfIcon color="error" />;
  return <InsertDriveFileIcon color="action" />;
};

const EvidenceStep: React.FC<EvidenceStepProps> = ({ data = [], updateData, recordId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [customName, setCustomName] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!customName.trim()) {
      setUploadError('Please provide a name for the file before uploading.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const file = files[0];
      const url = await biopassService.uploadEvidenceFile(file, recordId);

      const newDoc: EvidenceDocument = {
        id: uuidv4(),
        name: customName.trim(),
        fileUrl: url,
        fileType: file.type || file.name,       // store MIME type for icon
        uploadTimestamp: new Date().toISOString(),
        uploadedBy: 'Current User'
      };

      updateData([...data, newDoc]);
      setCustomName('');
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Upload failed. Check your Firebase Storage rules and try again.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveDocument = (id: string) => {
    updateData(data.filter(doc => doc.id !== id));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Supporting Files</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Upload images, videos, or PDFs to support your BioPass declaration. Give each file a descriptive name before uploading.
      </Typography>

      {/* Upload area */}
      <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="File Name"
            placeholder="e.g., Harvest Report 2024"
            value={customName}
            onChange={(e) => { setCustomName(e.target.value); setUploadError(''); }}
            sx={{ minWidth: 250, flex: 1 }}
          />
          <Button
            variant="contained"
            component="label"
            startIcon={isUploading ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
            <input
              type="file"
              hidden
              accept="image/*,video/*,.pdf,application/pdf"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>

        {isUploading && <LinearProgress sx={{ mt: 2 }} />}

        {uploadError && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setUploadError('')}>
            {uploadError}
          </Alert>
        )}

        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Accepted formats: Images (JPG, PNG, GIF, HEIC), Videos (MP4, MOV), PDFs
        </Typography>
      </Box>

      {/* Uploaded file list */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Uploaded Files ({data.length})
      </Typography>

      {data.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
          No files uploaded yet.
        </Typography>
      ) : (
        <List disablePadding>
          {data.map((doc) => (
            <ListItem
              key={doc.id}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1, pr: 7 }}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveDocument(doc.id)} color="error" size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getFileIcon(doc.fileType)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <MuiLink href={doc.fileUrl} target="_blank" rel="noopener noreferrer" underline="hover">
                    {doc.name}
                  </MuiLink>
                }
                secondary={`${doc.fileType} • ${new Date(doc.uploadTimestamp).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default EvidenceStep;
