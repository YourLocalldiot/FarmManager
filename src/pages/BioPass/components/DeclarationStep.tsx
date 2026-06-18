import React, { useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Paper } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { DeclarationData } from '../../../types/biopass';
import { useAuth } from '../../../contexts/AuthContext';

interface DeclarationStepProps {
  data?: DeclarationData;
  updateData: (data: DeclarationData) => void;
  recordId: string;
}

const DeclarationStep: React.FC<DeclarationStepProps> = ({ data, updateData }) => {
  const { currentUser, userProfile } = useAuth();
  const [confirmed, setConfirmed] = useState(data?.userId ? true : false);

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
    if (checked) {
      updateData({
        signatureUrl: '',
        timestamp: now.toISOString(),
        userId: currentUser?.uid ?? 'anonymous'
      });
    } else {
      updateData({
        signatureUrl: '',
        timestamp: '',
        userId: ''
      });
    }
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

      {confirmed && (
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
