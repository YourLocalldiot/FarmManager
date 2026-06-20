import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { LandCertificateData } from '../../../types/biopass';
import { biopassService } from '../../../services/biopassService';

interface CertificateUploadStepProps {
  data?: LandCertificateData;
  updateData: (data: LandCertificateData) => void;
  recordId: string;
}

const CertificateUploadStep: React.FC<CertificateUploadStepProps> = ({ data, updateData, recordId }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof LandCertificateData, value: any) => {
    updateData({
      certificateNumber: data?.certificateNumber ?? '',
      ownerName: data?.ownerName ?? '',
      issueDate: data?.issueDate ?? '',
      declaredArea: data?.declaredArea ?? 0,
      fileUrl: data?.fileUrl ?? '',
      [field]: value
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const file = files[0];
      const url = await biopassService.uploadEvidenceFile(file, recordId);
      handleChange('fileUrl', url);
    } catch (err: any) {
      console.error('Certificate upload error:', err);
      setError(err.message || 'Failed to upload certificate image. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Land Use Right Certificate (Sổ Đỏ)</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Please upload your land right registry page detailing the rights, ownership, and position coordinates to verify compliance before scanning the boundary.
      </Typography>

      <Grid container spacing={3}>
        {/* Certificate Fields */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Certificate Number / Số hiệu sổ đỏ"
            value={data?.certificateNumber ?? ''}
            onChange={(e) => handleChange('certificateNumber', e.target.value)}
            placeholder="e.g. BD 123456"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Landowner Full Name"
            value={data?.ownerName ?? ''}
            onChange={(e) => handleChange('ownerName', e.target.value)}
            placeholder="e.g. Nguyễn Văn A"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Issue Date"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={data?.issueDate ?? ''}
            onChange={(e) => handleChange('issueDate', e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Declared Area (Hectares)"
            type="number"
            value={data?.declaredArea || ''}
            onChange={(e) => handleChange('declaredArea', Number(e.target.value))}
            placeholder="e.g. 1.5"
            required
          />
        </Grid>

        {/* Upload certificate Section */}
        <Grid size={{ xs: 12 }}>
          <Card 
            variant="outlined" 
            sx={{ 
              borderStyle: data?.fileUrl ? 'solid' : 'dashed', 
              borderColor: data?.fileUrl ? 'success.light' : 'divider',
              bgcolor: data?.fileUrl ? 'rgba(46, 125, 50, 0.02)' : 'transparent',
              borderRadius: 2
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              {data?.fileUrl ? (
                <>
                  <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Certificate Image Uploaded</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 2, textAlign: 'center', maxWidth: 400 }}>
                    Successfully uploaded and stored document. You can proceed to the next step.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component="label"
                      disabled={uploading}
                    >
                      Change Document
                      <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileUpload} />
                    </Button>
                    <Button 
                      variant="text" 
                      size="small" 
                      href={data.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Document
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <UploadFileIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Upload Certificate Copy</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 2, textAlign: 'center', maxWidth: 400 }}>
                    Please upload an image, scan, or PDF of your Land Use Right certificate page containing position coordinates or owner description.
                  </Typography>
                  <Button 
                    variant="contained" 
                    component="label"
                    startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Choose File'}
                    <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileUpload} />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default CertificateUploadStep;
