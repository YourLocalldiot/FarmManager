import React from 'react';
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import type { RiskAssessmentAnswer } from '../../../types/biopass';

interface RiskAssessmentStepProps {
  data?: RiskAssessmentAnswer[];
  updateData: (data: RiskAssessmentAnswer[]) => void;
}

const questions = [
  { id: 'q1', text: '1. Is the production area near a protected area?' },
  { id: 'q2', text: '2. Are indigenous communities affected by production activities?' },
  { id: 'q3', text: '3. Has any of the lands recorded been subjected to deforestation after 31st December 2020?' },
  { id: 'q4', text: '4. Are there known legality concerns in the area?' },
  { id: 'q5', text: '5. Are there known supply chain traceability gaps?' },
  { id: 'q6', text: '6. Has this supplier been previously flagged for non-compliance?' }
];

const RiskAssessmentStep: React.FC<RiskAssessmentStepProps> = ({ data = [], updateData }) => {
  const getAnswer = (questionId: string) => {
    return data.find(a => a.questionId === questionId) || { questionId, answer: '' as any };
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

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Risk Assessment Questionnaire</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {questions.map((q) => {
          const currentAnswer = getAnswer(q.id);

          return (
            <Box key={q.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold',  mb: 2  }}>
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
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RiskAssessmentStep;
