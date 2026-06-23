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
  plots?: PlotData[];
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
        Please enter your land right registry details to verify compliance before scanning the boundary.
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
            label="Calculated Area from Geo Collection (Hectares)"
            type="number"
            value={totalArea ? totalArea.toFixed(2) : '0.00'}
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CertificateUploadStep;
