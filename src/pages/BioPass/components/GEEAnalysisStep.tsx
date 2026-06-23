import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, CircularProgress, LinearProgress, Alert, Chip, Switch, FormControlLabel } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RecyclingIcon from '@mui/icons-material/Recycling';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LandscapeIcon from '@mui/icons-material/Landscape';
import Co2Icon from '@mui/icons-material/Co2';
import PaymentsIcon from '@mui/icons-material/Payments';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import type { PlotData, CarbonCreditStats } from '../../../types/biopass';

interface GEEAnalysisStepProps {
  plots?: PlotData[];
  geeStatus?: 'Valid' | 'Deforested' | 'Pending';
  carbonCredits?: CarbonCreditStats;
  updateGeeStatus: (status: 'Valid' | 'Deforested' | 'Pending') => void;
  updateCarbonCredits: (stats: CarbonCreditStats) => void;
}

const GEEAnalysisStep: React.FC<GEEAnalysisStepProps> = ({
  plots = [],
  geeStatus = 'Pending',
  carbonCredits,
  updateGeeStatus,
  updateCarbonCredits,
}) => {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(geeStatus === 'Pending');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('Connecting to Google Earth Engine...');
  const [simulateDeforestation, setSimulateDeforestation] = useState(false);

  const totalArea = plots.reduce((sum, p) => sum + p.area, 0);

  // Run mock analysis on mount if pending
  useEffect(() => {
    if (geeStatus !== 'Pending') {
      setAnalyzing(false);
      return;
    }

    setAnalyzing(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + 10;
        if (next === 30) {
          setScanMessage('Retrieving Sentinel satellite records for Dec 31, 2020...');
        } else if (next === 60) {
          setScanMessage('Running forest cover change classifier algorithms...');
        } else if (next === 90) {
          setScanMessage('Calculating biomass density and canopy thickness...');
        }

        if (next >= 100) {
          clearInterval(interval);
          setAnalyzing(false);

          // Complete analysis based on simulation switch
          const finalStatus = simulateDeforestation ? 'Deforested' : 'Valid';
          updateGeeStatus(finalStatus);

          // Calculate carbon stats:
          // Agroforestry captures approx 5.5 tonnes CO2 per hectare per year.
          // Estimated Carbon Stock is about 40 tonnes C per hectare.
          const annualSequestration = Number((totalArea * 5.5).toFixed(1));
          const estimatedStock = Number((totalArea * 40.0).toFixed(1));
          const valueUSD = Math.round(annualSequestration * 12); // $12 per carbon credit
          const valueVND = valueUSD * 25400; // Exchange rate

          updateCarbonCredits({
            estimatedStock,
            annualSequestration,
            creditValueUSD: valueUSD,
            creditValueVND: valueVND,
          });
        }
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [geeStatus, simulateDeforestation, totalArea]);

  const handleReanalyze = () => {
    updateGeeStatus('Pending');
  };

  if (plots.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>No Plot Data Found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Please go back to Step 2 (Geolocation Collection) and scan or draw at least one plot boundary.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Google Earth Engine (GEE) Verification</Typography>

        {/* DEV ONLY SIMULATOR TOGGLE */}
        {!analyzing && (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={simulateDeforestation}
                onChange={(e) => setSimulateDeforestation(e.target.checked)}
                color="warning"
              />
            }
            label={
              <Typography variant="caption" color="textSecondary">
                Simulate Deforested Result
              </Typography>
            }
          />
        )}
      </Box>

      {analyzing ? (
        <Card variant="outlined" sx={{ py: 6, px: 3, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={48} color="primary" sx={{ mb: 3 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Analyzing Lands via GEE
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {scanMessage}
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            <LinearProgress variant="determinate" value={scanProgress} />
          </Box>
        </Card>
      ) : (
        <Box>
          {/* Analysis status display */}
          {geeStatus === 'Valid' ? (
            <Card sx={{ bgcolor: 'rgba(46, 125, 50, 0.04)', border: '1.5px solid', borderColor: 'success.light', mb: 4, borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 32, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                    GEE Status: COMPLIANT / HỢP LỆ
                    <Chip label="Valid" color="success" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    Google Earth Engine classification verifies that as of **31 December 2020**, none of the scanned plots contained forest cover. This land is fully compliant with EUDR regulations.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ bgcolor: 'rgba(211, 47, 47, 0.04)', border: '1.5px solid', borderColor: 'error.light', mb: 4, borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <CancelIcon color="error" sx={{ fontSize: 32, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'error.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                    GEE Status: NON-COMPLIANT / KHÔNG HỢP LỆ
                    <Chip label="Deforested" color="error" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    Google Earth Engine detected forest canopy on this land as of **31 December 2020**. Under EUDR compliance frameworks, **exporting commodities from this plot to the European Union is locked / blocked**.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* If Deforested: Block & Suggest alternatives */}
          {geeStatus === 'Deforested' && (
            <Box sx={{ mb: 4 }}>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                <strong>EUDR Compliance Notice:</strong> European markets are locked. However, you can divert your produce to local and alternative circular economies.
              </Alert>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>Recommended Channels</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', gap: 1.5 }}>
                      <StorefrontIcon color="primary" sx={{ fontSize: 28 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Domestic Consumption</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                          Distribute to domestic supermarkets and local processing traders (Est. price: 75% of EU export rate).
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<StorefrontIcon />}
                          onClick={() => navigate('/quant')}
                        >
                          Find Local Buyers
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', gap: 1.5 }}>
                      <RecyclingIcon color="success" sx={{ fontSize: 28 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Biogas & Energy Conversion</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                          Sell biomass residues to eco-friendly biogas generators or organic composting units.
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          startIcon={<RecyclingIcon />}
                          onClick={() => navigate('/salvager')}
                        >
                          Redirect to Salvager
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Carbon credit stats dashboard */}
          {carbonCredits && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Carbon Offset & Ecological Statistics</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LandscapeIcon color="primary" sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Biomass Carbon Stock</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{carbonCredits.estimatedStock} tC</Typography>
                        <Typography variant="caption" color="textSecondary">Stored in vegetation</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Co2Icon color="success" sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Annual Sequestration</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {carbonCredits.annualSequestration} tCO₂/yr
                        </Typography>
                        <Typography variant="caption" color="textSecondary">Carbon absorbed</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PaymentsIcon color="secondary" sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Est. Carbon Credit Value</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          ${carbonCredits.creditValueUSD} / yr
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                          ≈ {(carbonCredits.creditValueVND / 1000000).toFixed(2)}M VND
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1.5, px: 1 }}>
                * Carbon sequestration metrics are calculated using average agroforestry/cropland carbon metrics based on total plot size ({totalArea.toFixed(2)} ha).
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="text" size="small" onClick={handleReanalyze} color="secondary">
              Recalculate / Re-run GEE scan
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GEEAnalysisStep;
