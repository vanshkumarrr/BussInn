import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Automatically moves the map when the bus location changes
function MapUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude]);
    }
  }, [latitude, longitude, map]);

  return null;
}

function LiveBusMap({
  latitude = 28.6139,
  longitude = 77.2090,
  busNumber = "Bus #27"
}) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater
        latitude={latitude}
        longitude={longitude}
      />

      <Marker position={[latitude, longitude]}>
        <Popup>
          <strong>🚌 {busNumber}</strong>
          <br />
          Live Location
          <br />
          Latitude: {latitude}
          <br />
          Longitude: {longitude}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default LiveBusMap;