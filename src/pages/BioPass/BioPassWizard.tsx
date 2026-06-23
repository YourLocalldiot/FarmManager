import React, { useState, useEffect } from 'react';
import { Box, Typography, Stepper, Step, StepLabel, Button, Card, CardContent, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { BioPassRecord } from '../../types/biopass';
import { biopassService } from '../../services/biopassService';
import { generateComplianceDataJSON, generateFarmBoundaryGeoJSON, generateComplianceReportPDF } from '../../utils/exportUtils';
import { useAuth } from '../../contexts/AuthContext';

import CertificateUploadStep from './components/CertificateUploadStep';
import CommodityStep from './components/CommodityStep';
import GeolocationStep from './components/GeolocationStep';
import GEEAnalysisStep from './components/GEEAnalysisStep';
import RiskAssessmentStep from './components/RiskAssessmentStep';
import DeclarationStep from './components/DeclarationStep';

const steps = [
  'Land Registry',
  'Commodity Details',
  'Geolocation Collection',
  'GEE Verification',
  'Risk Assessment',
  'Declaration'
];

const emptyRecord = (id: string, userId: string): Partial<BioPassRecord> => ({
  id,
  userId,
  certificate: {
    certificateNumber: '',
    ownerName: '',
    issueDate: '',
    declaredArea: 0,
    fileUrl: '',
  },
  commodity: {
    type: '',
    description: '',
    quantity: 0,
    unit: 'Tonnes',
    productionCountry: '',
    productionYear: new Date().getFullYear().toString(),
    companyName: '',
    address: '',
  },
  supplyChain: [],
  plots: [],
  evidence: [],
  riskAssessment: [],
  status: 'Draft',
  geeStatus: 'Pending',
});

const BioPassWizard: React.FC = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id?: string }>();
  const { currentUser, userProfile } = useAuth();

  // Use the param ID if editing an existing record, otherwise generate a new one
  const recordId = React.useRef(paramId ?? uuidv4()).current;
  const isEditing = Boolean(paramId);

  const [activeStep, setActiveStep] = useState(0);
  const [recordData, setRecordData] = useState<Partial<BioPassRecord>>(
    emptyRecord(recordId, currentUser?.uid ?? 'anonymous')
  );
  const [loadingRecord, setLoadingRecord] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // When editing, load the existing record from Firestore
  useEffect(() => {
    if (!isEditing) return;
    setLoadingRecord(true);
    biopassService
      .getRecord(recordId)
      .then((existing) => {
        if (existing) {
          setRecordData(existing);
        }
      })
      .catch((err) => {
        console.error('Failed to load record:', err);
        showSnackbar('Failed to load draft. Please try again.', 'error');
      })
      .finally(() => setLoadingRecord(false));
  }, [recordId, isEditing]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  const handleUpdateData = (key: keyof BioPassRecord, data: any) => {
    setRecordData((prev) => ({ ...prev, [key]: data }));
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await biopassService.saveFullRecord(recordId, {
        ...recordData,
        status: 'Draft',
        userId: currentUser?.uid ?? 'anonymous',
      });
      showSnackbar('Draft saved successfully!');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      showSnackbar(error.message || 'Failed to save draft.', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await biopassService.saveFullRecord(recordId, {
        ...recordData,
        status: 'Submitted',
        userId: currentUser?.uid ?? 'anonymous',
      });

      generateComplianceDataJSON(recordData, userProfile);
      generateFarmBoundaryGeoJSON(recordData);
      generateComplianceReportPDF(recordData, userProfile);

      navigate('/biopass', { state: { message: 'BioPass declaration submitted successfully!' } });
    } catch (error: any) {
      console.error('Error submitting BioPass:', error);
      showSnackbar(error.message || 'Failed to submit. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNextDisabled = () => {
    if (activeStep === 0) {
      return (
        !recordData.certificate?.certificateNumber?.trim() ||
        !recordData.certificate?.ownerName?.trim() ||
        !recordData.certificate?.issueDate
      );
    }
    if (activeStep === 1) {
      return (
        !recordData.commodity?.companyName?.trim() ||
        !recordData.commodity?.address?.trim() ||
        !recordData.commodity?.type ||
        !recordData.commodity?.quantity ||
        !recordData.commodity?.productionCountry
      );
    }
    if (activeStep === 2) {
      return !recordData.plots || recordData.plots.length === 0;
    }
    if (activeStep === 3) {
      return recordData.geeStatus === 'Pending';
    }
    if (activeStep === 5) {
      return !recordData.declaration?.timestamp;
    }
    return false;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CertificateUploadStep
            data={recordData.certificate}
            updateData={(data) => handleUpdateData('certificate', data)}
            recordId={recordId}
            plots={recordData.plots}
          />
        );
      case 1:
        return (
          <CommodityStep
            data={recordData.commodity}
            updateData={(data) => handleUpdateData('commodity', data)}
          />
        );
      case 2:
        return (
          <GeolocationStep
            data={recordData.plots}
            updateData={(data) => handleUpdateData('plots', data)}
            recordId={recordId}
          />
        );
      case 3:
        return (
          <GEEAnalysisStep
            plots={recordData.plots}
            geeStatus={recordData.geeStatus}
            carbonCredits={recordData.carbonCredits}
            updateGeeStatus={(status) => handleUpdateData('geeStatus', status)}
            updateCarbonCredits={(stats) => handleUpdateData('carbonCredits', stats)}
          />
        );
      case 4:
        return (
          <RiskAssessmentStep
            data={recordData.riskAssessment}
            updateData={(data) => handleUpdateData('riskAssessment', data)}
          />
        );
      case 5:
        return (
          <DeclarationStep
            data={recordData.declaration}
            updateData={(data) => handleUpdateData('declaration', data)}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  if (loadingRecord) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        {isEditing ? 'Continue Draft' : 'BioPass Declaration'}
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
          {isSavingDraft ? <><CircularProgress size={16} sx={{ mr: 1 }} />Saving...</> : 'Save Draft'}
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting || isNextDisabled()}
            startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
          >
            {isSubmitting ? 'Submitting...' : 'Submit & Export'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
            disabled={isNextDisabled()}
          >
            Next
          </Button>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BioPassWizard;
