import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

// ─── Single contact field display ────────────────────────────────────────────

interface ContactFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  focusParam: string;
}

const ContactField: React.FC<ContactFieldProps> = ({ icon, label, value, focusParam }) => {
  const navigate = useNavigate();

  const hasValue = Boolean(value && value.trim());

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: hasValue ? 'success.light' : 'divider',
        transition: 'border-color 0.3s',
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Icon */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: hasValue ? 'success.main' : 'action.hover',
            color: hasValue ? '#fff' : 'text.secondary',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.2 }}>
            {label}
          </Typography>
          {hasValue ? (
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {value}
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
              Not provided yet
            </Typography>
          )}
        </Box>

        {/* Status / Action */}
        {hasValue ? (
          <CheckCircleIcon color="success" sx={{ flexShrink: 0 }} />
        ) : (
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate(`/profile?focus=${focusParam}`)}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Add {label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main Step ────────────────────────────────────────────────────────────────

const ContactsCollectionStep: React.FC = () => {
  const { userProfile, currentUser } = useAuth();

  const email = userProfile?.email ?? currentUser?.email ?? null;
  const phone = userProfile?.phoneNumber ?? null;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Contacts Collection
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Your email and phone number are used to link your identity to this BioPass declaration.
        They are pulled from your account profile — no manual entry needed.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ContactField
          icon={<EmailIcon />}
          label="Email"
          value={email}
          focusParam="email"
        />

        <Divider sx={{ my: 0.5 }} />

        <ContactField
          icon={<PhoneIcon />}
          label="Phone Number"
          value={phone}
          focusParam="phoneNumber"
        />
      </Box>

      {(!email || !phone) && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: 'warning.light',
            border: '1px solid',
            borderColor: 'warning.main',
          }}
        >
          <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 500 }}>
            ⚠ For a complete declaration, please provide both your email and phone number in your profile.
            Use the &ldquo;Add&rdquo; buttons above to go directly to the missing field.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ContactsCollectionStep;
