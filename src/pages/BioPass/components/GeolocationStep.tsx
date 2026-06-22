import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, TextField, IconButton, ButtonGroup, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';
import StopIcon from '@mui/icons-material/Stop';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { v4 as uuidv4 } from 'uuid';
import type { PlotData } from '../../../types/biopass';
import { biopassService } from '../../../services/biopassService';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GeolocationStepProps {
  data?: PlotData[];
  updateData: (data: PlotData[]) => void;
  recordId: string;
}

const MapEventsHandler: React.FC<{
  onMapClick: (latlng: L.LatLng) => void;
  isDrawing: boolean;
  drawMode: 'manual' | 'gps';
}> = ({ onMapClick, isDrawing, drawMode }) => {
  const map = useMap();
  const onMapClickRef = useRef(onMapClick);
  const isDrawingRef = useRef(isDrawing);
  const drawModeRef = useRef(drawMode);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
    isDrawingRef.current = isDrawing;
    drawModeRef.current = drawMode;
  }, [onMapClick, isDrawing, drawMode]);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isDrawingRef.current && drawModeRef.current === 'manual') {
        onMapClickRef.current(e.latlng);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map]);

  useEffect(() => {
    if (isDrawing && drawMode === 'manual') {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }
    return () => {
      map.doubleClickZoom.enable();
    };
  }, [map, isDrawing, drawMode]);

  return null;
};

const MapAutoBounds: React.FC<{ data: PlotData[] }> = ({ data }) => {
  const map = useMap();
  const hasFitBounds = useRef(false);

  useEffect(() => {
    if (data && data.length > 0 && !hasFitBounds.current) {
      const bounds = L.latLngBounds([]);
      data.forEach((plot) => {
        if (plot.geoJson && plot.geoJson.geometry && plot.geoJson.geometry.coordinates) {
          plot.geoJson.geometry.coordinates[0].forEach((coord: number[]) => {
            bounds.extend([coord[1], coord[0]]);
          });
        }
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        hasFitBounds.current = true;
      }
    }
  }, [map, data]);

  return null;
};

const GeolocationStep: React.FC<GeolocationStepProps> = ({ data = [], updateData, recordId }) => {
  const [currentPoints, setCurrentPoints] = useState<L.LatLng[]>([]);
  const [plotName, setPlotName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'manual' | 'gps'>('manual');
  const [isTrackingGPS, setIsTrackingGPS] = useState(false);
  const [currentGPSPosition, setCurrentGPSPosition] = useState<L.LatLng | null>(null);
  const [gpsError, setGpsError] = useState('');

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleMapClick = (latlng: L.LatLng) => {
    if (isDrawing && drawMode === 'manual') {
      setCurrentPoints((prev) => [...prev, latlng]);
      biopassService.sendCoordinateToServer(recordId, {
        lat: latlng.lat,
        lng: latlng.lng,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleStartDrawing = (mode: 'manual' | 'gps') => {
    setIsDrawing(true);
    setDrawMode(mode);
    setCurrentPoints([]);
    setGpsError('');

    if (mode === 'gps') {
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by your browser.');
        setIsDrawing(false);
        return;
      }

      setIsTrackingGPS(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLatLng = new L.LatLng(latitude, longitude);
          setCurrentGPSPosition(newLatLng);

          setCurrentPoints((prev) => {
            if (prev.length === 0) {
              biopassService.sendCoordinateToServer(recordId, {
                lat: latitude,
                lng: longitude,
                timestamp: new Date().toISOString()
              });
              return [newLatLng];
            }
            const lastPoint = prev[prev.length - 1];
            // Calculate distance using Turf (expect coordinates as [longitude, latitude])
            const fromPoint = turf.point([lastPoint.lng, lastPoint.lat]);
            const toPoint = turf.point([longitude, latitude]);
            const distance = turf.distance(fromPoint, toPoint, { units: 'meters' });

            // Record point if user walked 2-3 meters (allow any value >= 2m for flexibility)
            if (distance >= 2) {
              biopassService.sendCoordinateToServer(recordId, {
                lat: latitude,
                lng: longitude,
                timestamp: new Date().toISOString()
              });
              return [...prev, newLatLng];
            }
            return prev;
          });
        },
        (err) => {
          console.error('GPS tracking error:', err);
          setGpsError(`GPS tracking failed: ${err.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    }
  };

  const handleCompletePolygon = () => {
    if (currentPoints.length < 3) {
      alert('A polygon must have at least 3 points.');
      return;
    }

    if (isTrackingGPS && watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTrackingGPS(false);
    }

    // Convert Leaflet points to GeoJSON coordinates (longitude, latitude)
    const coordinates = currentPoints.map((p) => [p.lng, p.lat]);
    coordinates.push([currentPoints[0].lng, currentPoints[0].lat]); // Close the polygon

    const geoJsonPolygon = turf.polygon([coordinates]);
    const areaSqMeters = turf.area(geoJsonPolygon);
    const areaHectares = areaSqMeters / 10000;

    // Calculate centroid for generic lat/lng of the plot
    const centroid = turf.centroid(geoJsonPolygon);
    const centerLng = centroid.geometry.coordinates[0];
    const centerLat = centroid.geometry.coordinates[1];

    const newPlot: PlotData = {
      id: uuidv4(),
      name: plotName || `Plot ${data.length + 1}`,
      latitude: centerLat,
      longitude: centerLng,
      area: Number(areaHectares.toFixed(2)),
      geoJson: geoJsonPolygon,
    };

    updateData([...data, newPlot]);
    setIsDrawing(false);
    setCurrentPoints([]);
    setPlotName('');
    setCurrentGPSPosition(null);
  };

  const handleUndoLastPoint = () => {
    setCurrentPoints((prev) => prev.slice(0, -1));
  };

  const handleCancelDrawing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsDrawing(false);
    setIsTrackingGPS(false);
    setCurrentPoints([]);
    setCurrentGPSPosition(null);
  };

  const handleRemovePlot = (id: string) => {
    updateData(data.filter((plot) => plot.id !== id));
  };

  // Default center: somewhere generic or based on existing data
  const defaultCenter: [number, number] = [10.0451, 105.7469]; // Mekong Delta area

  return (
    <Box>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
      `}} />
      <Typography variant="h6" sx={{ mb: 2 }}>Farm Geolocation & Boundary</Typography>

      {gpsError && <Alert severity="error" sx={{ mb: 2 }}>{gpsError}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box 
            sx={{ 
              height: 400, 
              width: '100%', 
              mb: 2, 
              border: '1.5px solid',
              borderColor: 'divider',
              borderRadius: 3, 
              overflow: 'hidden',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              transition: 'box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapEventsHandler onMapClick={handleMapClick} isDrawing={isDrawing} drawMode={drawMode} />
              <MapAutoBounds data={data} />

              {/* Draw current boundary points */}
              {currentPoints.map((pos, idx) => (
                <Marker key={idx} position={pos} interactive={false} />
              ))}
              {currentPoints.length === 2 && (
                <Polyline positions={currentPoints} interactive={false} pathOptions={{ color: 'blue', dashArray: isTrackingGPS ? '5, 5' : undefined }} />
              )}
              {currentPoints.length > 2 && (
                <Polygon positions={currentPoints} interactive={false} pathOptions={{ color: 'blue', dashArray: isTrackingGPS ? '5, 5' : undefined }} />
              )}

              {/* Draw active user GPS dot if walking */}
              {currentGPSPosition && (
                <CircleMarker center={currentGPSPosition} radius={8} pathOptions={{ color: 'red', fillColor: '#f03', fillOpacity: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#fff', p: 0.5 }}>You</Typography>
                </CircleMarker>
              )}

              {/* Draw saved plots */}
              {data.map((plot) => {
                const positions = plot.geoJson.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                return <Polygon key={plot.id} positions={positions} interactive={false} pathOptions={{ color: 'green' }} />;
              })}
            </MapContainer>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {!isDrawing ? (
              <ButtonGroup variant="contained" color="primary">
                <Button startIcon={<MapIcon />} onClick={() => handleStartDrawing('manual')}>
                  Draw Manually
                </Button>
                <Button startIcon={<MyLocationIcon />} color="secondary" onClick={() => handleStartDrawing('gps')}>
                  Start GPS Walk (2-3m interval)
                </Button>
              </ButtonGroup>
            ) : (
              <>
                <TextField
                  size="small"
                  label="Plot Name"
                  value={plotName}
                  onChange={(e: any) => setPlotName(e.target.value)}
                  placeholder="e.g. Rice field A"
                />
                <Button variant="contained" color="success" onClick={handleCompletePolygon} startIcon={<StopIcon />}>
                  Complete Plot
                </Button>
                <Button 
                  variant="outlined" 
                  color="warning" 
                  onClick={handleUndoLastPoint} 
                  disabled={currentPoints.length === 0}
                >
                  Undo Point
                </Button>
                <Button variant="outlined" color="error" onClick={handleCancelDrawing}>
                  Cancel
                </Button>

                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isTrackingGPS ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span className="gps-indicator" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4caf50', animation: 'pulse 1.5s infinite' }} />
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                        Tracking: {currentPoints.length} points logged
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Click on map to add points manually.
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Saved Plots</Typography>
          {data.length === 0 ? (
            <Typography variant="body2" color="textSecondary">No plots added yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.map((plot) => (
                <Card key={plot.id} variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{plot.name}</Typography>
                        <Typography variant="body2" color="textSecondary">Area: {plot.area} ha</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Lat: {plot.latitude.toFixed(4)}, Lng: {plot.longitude.toFixed(4)}
                        </Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleRemovePlot(plot.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeolocationStep;
