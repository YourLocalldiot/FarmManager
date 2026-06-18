import React, { useState } from 'react';
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Button, CircularProgress, Link } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { RiskAssessmentAnswer } from '../../../types/biopass';
import { biopassService } from '../../../services/biopassService';

interface RiskAssessmentStepProps {
  data?: RiskAssessmentAnswer[];
  updateData: (data: RiskAssessmentAnswer[]) => void;
  recordId: string;
}

const questions = [
  { id: 'q1', text: '1. Is the production area near a protected area?' },
  { id: 'q2', text: '2. Are indigenous communities affected by production activities?' },
  { id: 'q3', text: '3. Has land use changed after 31 December 2020?' },
  { id: 'q4', text: '4. Are there known legality concerns in the area?' },
  { id: 'q5', text: '5. Are there known supply chain traceability gaps?' },
  { id: 'q6', text: '6. Has this supplier been previously flagged for non-compliance?' }
];

const RiskAssessmentStep: React.FC<RiskAssessmentStepProps> = ({ data = [], updateData, recordId }) => {
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const getAnswer = (questionId: string) => {
    return data.find(a => a.questionId === questionId) || { questionId, answer: '' as any, evidenceUrl: '' };
  };

  const handleAnswerChange = (questionId: string, answer: 'Yes' | 'No' | 'Unknown') => {
    const existingIndex = data.findIndex(a => a.questionId === questionId);
    if (existingIndex >= 0) {
      const newData = [...data];
      newData[existingIndex].answer = answer;
      updateData(newData);
    } else {
      updateData([...data, { questionId, answer }]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFor(questionId);
    try {
      const file = files[0];
      const url = await biopassService.uploadEvidenceFile(file, recordId);
      
      const existingIndex = data.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const newData = [...data];
        newData[existingIndex].evidenceUrl = url;
        updateData(newData);
      } else {
        updateData([...data, { questionId, answer: '', evidenceUrl: url }]);
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
      alert('Failed to upload evidence.');
    } finally {
      setUploadingFor(null);
      event.target.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Risk Assessment Questionnaire</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {questions.map((q) => {
          const currentAnswer = getAnswer(q.id);
          const isUploading = uploadingFor === q.id;

          return (
            <Box key={q.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {q.text}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={currentAnswer.answer}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value as 'Yes'|'No'|'Unknown')}
                  >
                    <FormControlLabel value="Yes" control={<Radio color="error" />} label="Yes" />
                    <FormControlLabel value="No" control={<Radio color="success" />} label="No" />
                    <FormControlLabel value="Unknown" control={<Radio color="warning" />} label="Unknown" />
                  </RadioGroup>
                </FormControl>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {currentAnswer.evidenceUrl && (
                    <Link href={currentAnswer.evidenceUrl} target="_blank" variant="body2" sx={{ mr: 2 }}>
                      View Attached Evidence
                    </Link>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    component="label"
                    startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : (currentAnswer.evidenceUrl ? 'Change Evidence' : 'Attach Evidence')}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileUpload(e, q.id)}
                    />
                  </Button>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RiskAssessmentStep;
