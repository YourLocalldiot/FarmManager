import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePhoneNumber,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../../components/layout/Header';
import { useLocation } from 'react-router-dom';

// ─── Types ──────────────────────────────────────────────────────────────────

type FieldKey = 'firstName' | 'middleName' | 'lastName' | 'email' | 'phoneNumber' | 'password';

interface FieldDef {
  key: FieldKey;
  label: string;
  icon: React.ReactNode;
  type?: string;
  optional?: boolean;
}

const FIELDS: FieldDef[] = [
  { key: 'firstName',   label: 'First Name',   icon: <PersonIcon /> },
  { key: 'middleName',  label: 'Middle Name',  icon: <PersonIcon />, optional: true },
  { key: 'lastName',    label: 'Last Name',    icon: <PersonIcon /> },
  { key: 'email',       label: 'Gmail / Email', icon: <EmailIcon />,  type: 'email' },
  { key: 'phoneNumber', label: 'Phone Number', icon: <PhoneIcon />,  optional: true },
  { key: 'password',    label: 'Password',     icon: <LockIcon />,   type: 'password' },
];

// ─── Password confirm dialog ─────────────────────────────────────────────────

interface PasswordDialogProps {
  open: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  loading: boolean;
  error: string;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({ open, onConfirm, onCancel, loading, error }) => {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);

  // Reset when dialog opens
  useEffect(() => { if (open) { setPw(''); setShow(false); } }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirm Your Password</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          For your security, please enter your current password to apply this change.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Current Password"
          type={show ? 'text' : 'password'}
          fullWidth
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && pw) onConfirm(pw); }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow((s) => !s)} edge="end">
                  {show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button
          onClick={() => onConfirm(pw)}
          variant="contained"
          disabled={!pw || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? 'Verifying…' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Editable field row ──────────────────────────────────────────────────────

interface FieldRowProps {
  field: FieldDef;
  currentValue: string;
  onSave: (key: FieldKey, value: string) => void;
  highlighted: boolean;
  rowRef?: React.Ref<HTMLDivElement>;
}

const FieldRow: React.FC<FieldRowProps> = ({ field, currentValue, onSave, highlighted, rowRef }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentValue);
  const [showPassword, setShowPassword] = useState(false);

  // Sync when parent profile refreshes
  useEffect(() => { setValue(currentValue); }, [currentValue]);

  const displayValue =
    field.type === 'password'
      ? '••••••••'
      : currentValue || (field.optional ? '—' : '—');

  const handleEdit = () => { setValue(field.type === 'password' ? '' : currentValue); setEditing(true); };
  const handleCancel = () => setEditing(false);
  const handleSave = () => { onSave(field.key, value); setEditing(false); };

  return (
    <Box
      ref={rowRef}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 2,
        borderRadius: 2,
        transition: 'background 0.4s',
        bgcolor: highlighted ? 'action.selected' : 'transparent',
        border: highlighted ? '1.5px solid' : '1.5px solid transparent',
        borderColor: highlighted ? 'primary.main' : 'transparent',
      }}
    >
      {/* Icon */}
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', minWidth: 28 }}>
        {field.icon}
      </Box>

      {/* Label + value / input */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.2 }}>
          {field.label}
        </Typography>
        {editing ? (
          <TextField
            size="small"
            fullWidth
            autoFocus
            type={field.type === 'password' ? (showPassword ? 'text' : 'password') : field.type ?? 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            sx={{ mt: 0.5 }}
            InputProps={
              field.type === 'password'
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword((s) => !s)}>
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                : undefined
            }
          />
        ) : (
          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.25 }}>
            {displayValue}
          </Typography>
        )}
      </Box>

      {/* Actions */}
      {editing ? (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" color="primary" onClick={handleSave} title="Save">
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancel} title="Cancel">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <IconButton size="small" onClick={handleEdit} title={`Edit ${field.label}`}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  const { userProfile, currentUser, refreshProfile } = useAuth();
  const location = useLocation();

  // Pending save
  const [pendingKey, setPendingKey] = useState<FieldKey | null>(null);
  const [pendingValue, setPendingValue] = useState('');

  // Password dialog
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Highlight (focus param from /profile?focus=email etc.)
  const [highlighted, setHighlighted] = useState<FieldKey | null>(null);
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLDivElement | null>>>({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focus = params.get('focus') as FieldKey | null;
    if (focus) {
      setHighlighted(focus);
      setTimeout(() => {
        fieldRefs.current[focus]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Remove highlight after a few seconds
        setTimeout(() => setHighlighted(null), 3500);
      }, 300);
    }
  }, [location.search]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  // Called when the user clicks the save tick on a field row
  const handleSaveRequest = (key: FieldKey, value: string) => {
    if (!value.trim() && key !== 'middleName' && key !== 'phoneNumber') return;
    setPendingKey(key);
    setPendingValue(value);
    setPwDialogOpen(true);
    setPwError('');
  };

  // Called after the user enters their current password in the dialog
  const handleConfirmPassword = async (currentPassword: string) => {
    if (!currentUser || !pendingKey) return;
    setPwLoading(true);
    setPwError('');

    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(
        currentUser.email ?? '',
        currentPassword,
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Apply the change
      await applyFieldChange(pendingKey, pendingValue);

      setPwDialogOpen(false);
      setPendingKey(null);
      setPendingValue('');
      showSnackbar('Profile updated successfully!');
      await refreshProfile();
    } catch (err: any) {
      const msg = err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Incorrect password. Please try again.'
        : err.message || 'Verification failed.';
      setPwError(msg);
    } finally {
      setPwLoading(false);
    }
  };

  const applyFieldChange = async (key: FieldKey, value: string) => {
    const user = currentUser!;
    const userRef = doc(db, 'users', user.uid);

    switch (key) {
      case 'email':
        await updateEmail(user, value);
        await updateDoc(userRef, { email: value });
        break;
      case 'password':
        await updatePassword(user, value);
        break;
      case 'phoneNumber':
        // Phone number stored in Firestore only (full phone re-auth is complex)
        await updateDoc(userRef, { phoneNumber: value || null });
        break;
      case 'firstName':
      case 'middleName':
      case 'lastName':
        await updateDoc(userRef, { [key]: value || null });
        break;
      default:
        break;
    }
  };

  const getFieldValue = (key: FieldKey): string => {
    if (!userProfile) return '';
    switch (key) {
      case 'firstName':   return userProfile.firstName ?? '';
      case 'middleName':  return userProfile.middleName ?? '';
      case 'lastName':    return userProfile.lastName ?? '';
      case 'email':       return userProfile.email ?? currentUser?.email ?? '';
      case 'phoneNumber': return userProfile.phoneNumber ?? '';
      case 'password':    return '';
      default:            return '';
    }
  };

  return (
    <Box sx={{ p: 2, pb: 12, maxWidth: 600, mx: 'auto' }}>
      {/* ── Header ── */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        My Profile
      </Typography>

      {/* ── Avatar card ── */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #43a047 100%)',
          color: '#fff',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 3 }}>
          <UserAvatar firstName={userProfile?.firstName} size={72} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
              {[userProfile?.firstName, userProfile?.middleName, userProfile?.lastName]
                .filter(Boolean)
                .join(' ') || 'Your Name'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, color: '#fff' }}>
              {userProfile?.email ?? currentUser?.email ?? ''}
            </Typography>
            {userProfile?.phoneNumber && (
              <Typography variant="body2" sx={{ opacity: 0.75, color: '#fff', mt: 0.5 }}>
                {userProfile.phoneNumber}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ── Fields card ── */}
      <Card sx={{ borderRadius: 3, overflow: 'visible' }}>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="subtitle2" color="textSecondary" sx={{ px: 2, pt: 1, pb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
            Personal Information
          </Typography>

          {FIELDS.slice(0, 3).map((field, i) => (
            <React.Fragment key={field.key}>
              {i > 0 && <Divider sx={{ mx: 2 }} />}
              <FieldRow
                field={field}
                currentValue={getFieldValue(field.key)}
                onSave={handleSaveRequest}
                highlighted={highlighted === field.key}
                rowRef={(el) => { fieldRefs.current[field.key] = el; }}
              />
            </React.Fragment>
          ))}

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="textSecondary" sx={{ px: 2, pt: 1, pb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
            Contact & Security
          </Typography>

          {FIELDS.slice(3).map((field, i) => (
            <React.Fragment key={field.key}>
              {i > 0 && <Divider sx={{ mx: 2 }} />}
              <FieldRow
                field={field}
                currentValue={getFieldValue(field.key)}
                onSave={handleSaveRequest}
                highlighted={highlighted === field.key}
                rowRef={(el) => { fieldRefs.current[field.key] = el; }}
              />
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        All changes require your current password for security.
      </Typography>

      {/* ── Password confirmation dialog ── */}
      <PasswordDialog
        open={pwDialogOpen}
        onConfirm={handleConfirmPassword}
        onCancel={() => { setPwDialogOpen(false); setPwError(''); }}
        loading={pwLoading}
        error={pwError}
      />

      {/* ── Snackbar ── */}
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

export default ProfilePage;
