import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button,
  Chip, Divider, CircularProgress, List, ListItem,
  ListItemText, ListItemSecondaryAction,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { biopassService } from '../../services/biopassService';
import type { BioPassRecord } from '../../types/biopass';

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusColor = (status: string): 'default' | 'warning' | 'success' | 'info' => {
  if (status === 'Draft') return 'warning';
  if (status === 'Submitted') return 'info';
  if (status === 'Approved') return 'success';
  return 'default';
};

const statusIcon = (status: string) => {
  if (status === 'Draft') return <EditNoteIcon fontSize="small" />;
  if (status === 'Approved') return <CheckCircleOutlineIcon fontSize="small" />;
  return <HourglassEmptyIcon fontSize="small" />;
};

// ─── Record list item ─────────────────────────────────────────────────────────

const RecordItem: React.FC<{ record: BioPassRecord }> = ({ record }) => {
  const navigate = useNavigate();

  const dateLabel = record.updatedAt
    ? new Date(record.updatedAt).toLocaleString(undefined, {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : record.createdAt
    ? new Date(record.createdAt).toLocaleString(undefined, {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Unknown date';

  return (
    <ListItem
      sx={{
        borderRadius: 2,
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' },
        cursor: 'pointer',
        pr: 7,
      }}
      onClick={() => navigate(`/biopass/${record.id}`)}
    >
      <Box sx={{ mr: 1.5, color: record.status === 'Draft' ? 'warning.main' : 'success.main', display: 'flex' }}>
        {statusIcon(record.status)}
      </Box>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {dateLabel}
          </Typography>
        }
      />
      <ListItemSecondaryAction>
        <Chip
          label={record.status}
          size="small"
          color={statusColor(record.status)}
          sx={{ fontWeight: 600, fontSize: '0.68rem' }}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const BioPass: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [records, setRecords] = useState<BioPassRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Success message from wizard submission
  const successMessage = (location.state as any)?.message;

  useEffect(() => {
    if (!currentUser) return;
    setLoadingRecords(true);
    biopassService
      .getUserRecords(currentUser.uid)
      .then(setRecords)
      .catch((err) => console.error('Failed to load records:', err))
      .finally(() => setLoadingRecords(false));
  }, [currentUser]);

  const drafts = records.filter((r) => r.status === 'Draft');
  const submitted = records.filter((r) => r.status !== 'Draft');

  return (
    <Box sx={{ p: 2, pb: 12 }}>

      {/* ── Page title ── */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
        BioPass
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        EU Deforestation Regulation compliance declarations
      </Typography>

      {successMessage && (
        <Card sx={{ mb: 3, bgcolor: 'success.light', border: '1px solid', borderColor: 'success.main' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
              ✅ {successMessage}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ── Big CTA button ── */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        startIcon={<AddIcon />}
        onClick={() => navigate('/biopass/new')}
        sx={{
          py: 2.2,
          borderRadius: 3,
          fontSize: '1.05rem',
          fontWeight: 700,
          letterSpacing: 0.5,
          mb: 4,
          boxShadow: '0 4px 20px rgba(46,125,50,0.35)',
          background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
            boxShadow: '0 6px 24px rgba(46,125,50,0.45)',
          },
        }}
      >
        New Declaration
      </Button>

      {/* ── Records panel ── */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ pb: '12px !important' }}>

          {loadingRecords ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : records.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">
                No declarations yet. Tap "New Declaration" to get started.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Drafts section */}
              {drafts.length > 0 && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <EditNoteIcon fontSize="small" color="warning" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                      Drafts
                    </Typography>
                    <Chip label={drafts.length} size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Box>
                  <List disablePadding>
                    {drafts.map((r) => <RecordItem key={r.id} record={r} />)}
                  </List>
                </>
              )}

              {/* Divider between sections */}
              {drafts.length > 0 && submitted.length > 0 && <Divider sx={{ my: 2 }} />}

              {/* Submitted / exported section */}
              {submitted.length > 0 && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CloudDownloadIcon fontSize="small" color="success" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                      Submitted &amp; Exported
                    </Typography>
                    <Chip label={submitted.length} size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Box>
                  <List disablePadding>
                    {submitted.map((r) => <RecordItem key={r.id} record={r} />)}
                  </List>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {!loadingRecords && records.length > 0 && (
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
          {records.length} declaration{records.length !== 1 ? 's' : ''} total
        </Typography>
      )}
    </Box>
  );
};

export default BioPass;
