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

      {/* ── Action Buttons ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
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

        <Button
          variant="outlined"
          color="primary"
          fullWidth
          startIcon={<DescriptionIcon />}
          onClick={() => {
            const docContent = `BIOPASS COMPLIANCE DOCUMENTATION: GEOLOCATION COLLECTION & GEE VERIFICATION
================================================================================

1. INTRODUCTION TO EUDR COMPLIANCE
--------------------------------------------------------------------------------
The European Union Deforestation Regulation (EUDR) mandates that any relevant 
commodities (including soy, beef, palm oil, wood, cocoa, coffee, and rubber) 
placed on the EU market must not have been produced on land subjected to 
deforestation or forest degradation after December 31, 2020. 

To prove compliance, the BioPass system relies on two critical pillars:
A) Precise Geolocation Collection
B) Google Earth Engine (GEE) Automated Verification

2. GEOLOCATION COLLECTION METHODOLOGY
--------------------------------------------------------------------------------
Under the EUDR framework, strict geolocation data must be provided for the 
plots of land where the commodities were produced.

2.1. Accuracy Requirements:
- For plots of land under 4 hectares (ha): A single GPS coordinate (latitude 
  and longitude using at least 6 decimal places) is permissible, although a 
  full polygon is recommended.
- For plots of land strictly over 4 hectares: A full closed polygon must be 
  provided. The polygon must represent the precise boundaries of the 
  agricultural plot.

2.2. Data Collection Process in BioPass:
- The BioPass app provides an integrated map interface allowing users to 
  digitize their plot boundaries directly.
- Alternatively, users can upload standard geospatial formats (e.g., GeoJSON, 
  KML, Shapefile) containing their boundary data.
- The collected coordinates must use the WGS84 coordinate reference system.

3. GOOGLE EARTH ENGINE (GEE) VERIFICATION
--------------------------------------------------------------------------------
Once the geolocation data is collected, it is submitted to the BioPass backend 
where an automated, geospatial analysis is performed using Google Earth Engine.

3.1. Reference Datasets:
The analysis leverages heavily validated global forest cover datasets, primarily:
- The Global Forest Change dataset (Hansen et al.)
- Sentinel-2 and Landsat 8/9 historical imagery

3.2. Deforestation Baseline (Dec 31, 2020):
The GEE script establishes a baseline forest mask for the polygon as it existed 
on December 31, 2020. 

3.3. Classification Process:
- Forest Definition: Land spanning more than 0.5 hectares with trees higher 
  than 5 meters and a canopy cover of more than 10%.
- The script analyzes the submitted polygon for any loss of canopy cover or 
  conversion from forest to agricultural use after the baseline date.
- It returns an automated classification:
  * VALID: No deforestation or degradation detected post-2020.
  * DEFORESTED: Significant loss of forest cover detected within the plot.

4. AUDIT & APPEALS
--------------------------------------------------------------------------------
If a plot is flagged as DEFORESTED, the user may initiate a manual review 
process by submitting additional evidence (such as historical land use rights 
certificates or high-resolution drone imagery).

--------------------------------------------------------------------------------
Generated by BioPass System. All checks are in accordance with EUDR Regulation.
`;
            const blob = new Blob([docContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Geolocation_GEE_Docs.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            borderWidth: 2,
            '&:hover': { borderWidth: 2 }
          }}
        >
          Download Documentation (Geo & GEE)
        </Button>
      </Box>

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
