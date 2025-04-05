import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

interface MapDisplayProps {
  coordinates: [number, number] | null;
  storeName: string;
}

// Component to update map view when coordinates change
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap();
  map.setView(coords, 14); // Zoom level 14
  return null;
}

const MapDisplayComponent = ({ coordinates, storeName }: MapDisplayProps) => {
  // Default to Bangalore center if no coords or invalid coords
  const isValidCoords = Array.isArray(coordinates) && coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1]);
  const defaultPosition: [number, number] = [12.9716, 77.5946]; 
  const position = isValidCoords ? coordinates : defaultPosition;
  const zoomLevel = isValidCoords ? 14 : 10; // Zoom in more if coordinates are specific

  return (
    <MapContainer 
      center={position}
      zoom={zoomLevel}
      scrollWheelZoom={false}
      style={{ height: '250px', width: '100%' }} // Ensure container has height
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {isValidCoords && (
        <Marker position={position}>
          <Popup>
            {storeName || 'Store Location'}
          </Popup>
        </Marker>
      )}
      {/* Only change view if we have valid coordinates */}
      {isValidCoords && <ChangeMapView coords={position} />} 
    </MapContainer>
  );
};

export default MapDisplayComponent; 