import React from 'react';
import { Box, Typography, TextField, Grid } from '@mui/material';
import type { LandCertificateData } from '../../../types/biopass';

interface CertificateUploadStepProps {
  data?: LandCertificateData;
  updateData: (data: LandCertificateData) => void;
  recordId: string;
}

const CertificateUploadStep: React.FC<CertificateUploadStepProps> = ({ data, updateData }) => {
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
            label="Declared Area (Hectares)"
            type="number"
            value={data?.declaredArea || ''}
            onChange={(e) => handleChange('declaredArea', Number(e.target.value))}
            placeholder="e.g. 1.5"
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CertificateUploadStep;
