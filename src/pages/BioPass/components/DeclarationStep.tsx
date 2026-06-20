import React, { useState, useRef } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Paper, Button, Card, CardContent, CircularProgress } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import SignatureCanvas from 'react-signature-canvas';
import type { DeclarationData } from '../../../types/biopass';
import { useAuth } from '../../../contexts/AuthContext';
import { biopassService } from '../../../services/biopassService';

interface DeclarationStepProps {
  data?: DeclarationData;
  updateData: (data: DeclarationData) => void;
  recordId: string;
}

const DeclarationStep: React.FC<DeclarationStepProps> = ({ data, updateData, recordId }) => {
  const { currentUser, userProfile } = useAuth();
  const [confirmed, setConfirmed] = useState(data?.userId ? true : false);
  const [uploading, setUploading] = useState(false);
  const [signatureError, setSignatureError] = useState('');
  
  const sigCanvasRef = useRef<any>(null);

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleConfirmChange = (checked: boolean) => {
    setConfirmed(checked);
    if (!checked) {
      updateData({
        signatureUrl: '',
        timestamp: '',
        userId: ''
      });
    }
  };

  const handleSaveSignature = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      setSignatureError('Please draw your signature before saving.');
      return;
    }

    setUploading(true);
    setSignatureError('');

    try {
      const dataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
      const uploadUrl = await biopassService.uploadSignatureImage(dataUrl, recordId);
      
      updateData({
        signatureUrl: uploadUrl,
        timestamp: new Date().toISOString(),
        userId: currentUser?.uid ?? 'anonymous'
      });
    } catch (err: any) {
      console.error('Signature upload error:', err);
      setSignatureError(err.message || 'Failed to save signature. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    setSignatureError('');
  };

  const displayName = userProfile
    ? [userProfile.firstName, userProfile.middleName, userProfile.lastName].filter(Boolean).join(' ')
    : currentUser?.email ?? 'Unknown User';

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Declaration</Typography>

      {/* Date box */}
      <Paper
        variant="outlined"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1.5,
          mb: 3,
          borderRadius: 2,
          bgcolor: 'action.hover'
        }}
      >
        <CalendarTodayIcon fontSize="small" color="primary" />
        <Box>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.2 }}>
            Date of Declaration
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formattedDate} at {formattedTime}
          </Typography>
        </Box>
      </Paper>

      {/* Declaration text */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          I, <strong>{displayName}</strong>, declare that:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>The information provided in this compliance package is accurate and complete to the best of my knowledge.</li>
          <li>The commodities listed have been produced on land that was not subject to deforestation after 31 December 2020.</li>
          <li>The production complies with all relevant legislation of the country of production.</li>
          <li>I authorize the use of this data for EUDR Due Diligence Statement preparation.</li>
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={confirmed}
              onChange={(e) => handleConfirmChange(e.target.checked)}
              color="primary"
            />
          }
          label="I have reviewed all the provided information and confirm its accuracy."
        />
      </Box>

      {/* Digital Signature Pad */}
      {confirmed && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Draw Digital Signature</Typography>
          
          {data?.signatureUrl ? (
            <Card variant="outlined" sx={{ bgcolor: 'rgba(46, 125, 50, 0.02)', borderColor: 'success.light', borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 2, '&:last-child': { pb: 2 } }}>
                <CheckIcon color="success" sx={{ fontSize: 32 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Signature Confirmed</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Signed digitally by {displayName}
                  </Typography>
                  <Box sx={{ mt: 1, borderBottom: '1px solid #ccc', display: 'inline-block' }}>
                    <img src={data.signatureUrl} alt="Signature" style={{ maxHeight: 60, display: 'block' }} />
                  </Box>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />} 
                  onClick={() => updateData({ signatureUrl: '', timestamp: '', userId: '' })}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box 
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    bgcolor: '#fff', 
                    overflow: 'hidden',
                    height: 150 
                  }}
                >
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    canvasProps={{
                      style: { width: '100%', height: '100%', cursor: 'crosshair' }
                    }}
                    penColor="black"
                  />
                </Box>
                {signatureError && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {signatureError}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    onClick={handleSaveSignature}
                    disabled={uploading}
                    startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                  >
                    {uploading ? 'Saving...' : 'Confirm Signature'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleClearSignature}
                    disabled={uploading}
                  >
                    Clear
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {confirmed && data?.signatureUrl && (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'success.light', borderRadius: 2, bgcolor: 'success.light', opacity: 0.8 }}>
          <Typography variant="body2" color="success.dark" sx={{ fontWeight: 600 }}>
            ✓ Declaration confirmed on {formattedDate} at {formattedTime}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DeclarationStep;
