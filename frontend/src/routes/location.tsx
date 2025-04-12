// Location.tsx
import { useEffect } from 'react';
import { createFileRoute } from "@tanstack/react-router"
import React from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { antPath } from 'leaflet-ant-path';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLeafletContext } from '@react-leaflet/core'

// Define three static locations
const locations: { name: string; position: LatLngExpression }[] = [
  { name: 'Jakarta', position: [-6.2088, 106.8456] },
  { name: 'Bandung', position: [-6.9175, 107.6191] },
  { name: 'Yogyakarta', position: [-7.7956, 110.3695] },
  { name: 'Surabaya', position: [-7.2504, 112.7688] },
  { name: 'Bali', position: [-8.3405, 115.0920] },
];

const Location: React.FC = () => {
  // Extract the positions from the locations
  const path = locations.map((location) => location.position);

  const AntPath = (p) => {
      const context = useLeafletContext()
      useEffect(() => {
          let antPolyline = antPath(p.positions, p.options);
          context.map.addLayer(antPolyline)
          return () => {
              context.map.removeLayer(antPolyline)
          }
      })
      return null
  }
  const options = {color: 'red', delay: 800}
  return (
    <div style={{ height: '100vh' }}>
      <MapContainer center={locations[2].position} zoom={6} style={{ height: '100%', width: '100%' }}>
        {/* Use CartoDB tiles for better map styling */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />
        
        {locations.map((location, index) => (
          <Circle
            key={index}
            center={location.position}
            radius={200}
            color="red"
            fillColor="red"
          />
        ))}

        {/* Draw a polyline to connect the locations */}
        <AntPath positions={path} options={options} />
      </MapContainer>
    </div>
  );
};

export default Location;

export const Route = createFileRoute("/location")({
  component: Location,
})