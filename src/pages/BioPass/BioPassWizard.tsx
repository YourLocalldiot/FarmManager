import React, { useState } from 'react';
import { Box, Typography, Stepper, Step, StepLabel, Button, Card, CardContent, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { BioPassRecord } from '../../types/biopass';
import { biopassService } from '../../services/biopassService';
import { generateComplianceDataJSON, generateFarmBoundaryGeoJSON, generateComplianceReportPDF } from '../../utils/exportUtils';

// Step Components (to be created)
import CommodityStep from './components/CommodityStep';
import SupplyChainStep from './components/SupplyChainStep';
import GeolocationStep from './components/GeolocationStep';
import EvidenceStep from './components/EvidenceStep';
import RiskAssessmentStep from './components/RiskAssessmentStep';
import MitigationStep from './components/MitigationStep';
import DeclarationStep from './components/DeclarationStep';

const steps = [
  'Commodity Identification',
  'Supply Chain Mapping',
  'Geolocation Collection',
  'Supporting Files',
  'Risk Assessment',
  'Risk Mitigation',
  'Declaration'
];

const initialData: Partial<BioPassRecord> = {
  id: uuidv4(),
  commodity: {
    type: '',
    description: '',
    hsCode: '',
    quantity: 0,
    unit: 'kg',
    productionCountry: '',
    productionYear: new Date().getFullYear().toString()
  },
  supplyChain: [],
  plots: [],
  evidence: [],
  riskAssessment: [],
  mitigation: [],
  status: 'Draft'
};

const BioPassWizard: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [recordData, setRecordData] = useState<Partial<BioPassRecord>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleUpdateData = (key: keyof BioPassRecord, data: any) => {
    setRecordData(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const recordId = recordData.id as string;
      await biopassService.saveFullRecord(recordId, {
        ...recordData,
        status: 'Draft'
      });
      setSnackbarMessage('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Mock user ID for now
      const userId = 'user_123';
      const recordId = recordData.id || await biopassService.createRecord(userId);
      await biopassService.saveFullRecord(recordId, {
        ...recordData,
        status: 'Submitted'
      });

      // Generate Exports
      generateComplianceDataJSON(recordData);
      generateFarmBoundaryGeoJSON(recordData);
      generateComplianceReportPDF(recordData);

      // Redirect or show success
      navigate('/biopass', { state: { message: 'BioPass declaration submitted successfully!' } });
    } catch (error) {
      console.error('Error submitting BioPass:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <CommodityStep data={recordData.commodity} updateData={(data) => handleUpdateData('commodity', data)} />;
      case 1:
        return <SupplyChainStep data={recordData.supplyChain} updateData={(data) => handleUpdateData('supplyChain', data)} />;
      case 2:
        return <GeolocationStep data={recordData.plots} updateData={(data) => handleUpdateData('plots', data)} />;
      case 3:
        return <EvidenceStep data={recordData.evidence} updateData={(data) => handleUpdateData('evidence', data)} recordId={recordData.id as string} />;
      case 4:
        return <RiskAssessmentStep data={recordData.riskAssessment} updateData={(data) => handleUpdateData('riskAssessment', data)} />;
      case 5:
        return <MitigationStep data={recordData.mitigation} updateData={(data) => handleUpdateData('mitigation', data)} />;
      case 6:
        return <DeclarationStep data={recordData.declaration} updateData={(data) => handleUpdateData('declaration', data)} recordId={recordData.id as string} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Box sx={{ p: 2, pb: 10, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        BioPass Declaration
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, display: { xs: 'none', md: 'flex' } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Mobile Step Indicator */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
          Step {activeStep + 1} of {steps.length}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {steps[activeStep]}
        </Typography>
      </Box>

      <Card sx={{ mb: 3, minHeight: 400 }}>
        <CardContent>
          {renderStepContent(activeStep)}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0 || isSubmitting || isSavingDraft}
          onClick={handleBack}
          sx={{ mr: 1 }}
          variant="outlined"
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button
          color="secondary"
          variant="outlined"
          sx={{ mr: 2 }}
          onClick={handleSaveDraft}
          disabled={isSubmitting || isSavingDraft}
        >
          {isSavingDraft ? 'Saving...' : 'Save Draft'}
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
          >
            Submit & Export
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained" color="primary">
            Next
          </Button>
        )}
      </Box>

      <Snackbar 
        open={!!snackbarMessage} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarMessage('')} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BioPassWizard;
