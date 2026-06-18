import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import { DeclarationData } from '../../../types/biopass';
import { biopassService } from '../../../services/biopassService';

interface DeclarationStepProps {
  data?: DeclarationData;
  updateData: (data: DeclarationData) => void;
  recordId: string;
}

const DeclarationStep: React.FC<DeclarationStepProps> = ({ data, updateData, recordId }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    if (data) {
      updateData({ ...data, signatureUrl: '' });
    }
  };

  const saveSignature = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }

    setIsSavingSignature(true);
    try {
      // Get data URL from canvas
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      
      // Upload to Firebase Storage
      const signatureUrl = await biopassService.uploadSignatureImage(dataUrl, recordId);

      updateData({
        signatureUrl,
        timestamp: new Date().toISOString(),
        userId: 'Current User' // Mock user ID
      });
      
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Failed to save signature.');
    } finally {
      setIsSavingSignature(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Declaration & Signature</Typography>
      
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          By signing this document, I declare that:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>The information provided in this compliance package is accurate and complete to the best of my knowledge.</li>
          <li>The commodities listed have been produced on land that was not subject to deforestation after 31 December 2020.</li>
          <li>The production complies with all relevant legislation of the country of production.</li>
          <li>I authorize the use of this data for EUDR Due Diligence Statement preparation.</li>
        </Typography>

        <FormControlLabel
          control={<Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />}
          label="I have reviewed all the provided information and confirm its accuracy."
        />
      </Box>

      {confirmed && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            Digital Signature
          </Typography>
          
          {!data?.signatureUrl ? (
            <>
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, display: 'inline-block', mb: 2, bgcolor: '#fff' }}>
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ width: 400, height: 200, className: 'sigCanvas' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={clearSignature} disabled={isSavingSignature}>
                  Clear
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={saveSignature}
                  disabled={isSavingSignature}
                  startIcon={isSavingSignature && <CircularProgress size={20} color="inherit" />}
                >
                  {isSavingSignature ? 'Saving...' : 'Save Signature'}
                </Button>
              </Box>
            </>
          ) : (
            <Box>
              <Box 
                component="img" 
                src={data.signatureUrl} 
                alt="Signature" 
                sx={{ height: 100, border: '1px solid #ccc', borderRadius: 1, mb: 2, bgcolor: '#fff', p: 1 }} 
              />
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Signed on: {new Date(data.timestamp).toLocaleString()}
              </Typography>
              <Button variant="outlined" color="error" onClick={clearSignature}>
                Remove Signature
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DeclarationStep;
