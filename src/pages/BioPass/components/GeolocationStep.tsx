import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { v4 as uuidv4 } from 'uuid';
import { PlotData } from '../../../types/biopass';

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
}

const MapClickHandler: React.FC<{ onMapClick: (latlng: L.LatLng) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const GeolocationStep: React.FC<GeolocationStepProps> = ({ data = [], updateData }) => {
  const [currentPoints, setCurrentPoints] = useState<L.LatLng[]>([]);
  const [plotName, setPlotName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMapClick = (latlng: L.LatLng) => {
    if (isDrawing) {
      setCurrentPoints((prev) => [...prev, latlng]);
    }
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCurrentPoints([]);
  };

  const handleCompletePolygon = () => {
    if (currentPoints.length < 3) {
      alert('A polygon must have at least 3 points.');
      return;
    }

    // Convert Leaflet points to GeoJSON coordinates (longitude, latitude)
    // Turf expects coordinates in [lng, lat] and the first point must equal the last point for a valid polygon.
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
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPoints([]);
  };

  const handleRemovePlot = (id: string) => {
    updateData(data.filter((plot) => plot.id !== id));
  };

  // Default center: somewhere generic or based on existing data
  const defaultCenter: [number, number] = [10.0451, 105.7469]; // Mekong Delta area

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Farm Geolocation & Boundary</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: 400, width: '100%', mb: 2, border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />
              
              {/* Draw current points */}
              {currentPoints.map((pos, idx) => (
                <Marker key={idx} position={pos} />
              ))}
              {currentPoints.length > 2 && (
                <Polygon positions={currentPoints} pathOptions={{ color: 'blue' }} />
              )}

              {/* Draw saved plots */}
              {data.map((plot) => {
                // GeoJSON coordinates are [lng, lat], Leaflet wants [lat, lng]
                const positions = plot.geoJson.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                return <Polygon key={plot.id} positions={positions} pathOptions={{ color: 'green' }} />;
              })}
            </MapContainer>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {!isDrawing ? (
              <Button variant="contained" onClick={handleStartDrawing}>
                Draw New Plot
              </Button>
            ) : (
              <>
                <TextField
                  size="small"
                  label="Plot Name"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                />
                <Button variant="contained" color="success" onClick={handleCompletePolygon}>
                  Complete Polygon
                </Button>
                <Button variant="outlined" color="error" onClick={handleCancelDrawing}>
                  Cancel
                </Button>
                <Typography variant="body2" color="textSecondary">
                  Click on map to add points.
                </Typography>
              </>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Saved Plots</Typography>
          {data.length === 0 ? (
            <Typography variant="body2" color="textSecondary">No plots added yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.map((plot) => (
                <Card key={plot.id} variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{plot.name}</Typography>
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
