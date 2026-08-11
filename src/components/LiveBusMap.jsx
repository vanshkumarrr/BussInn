import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LiveBusMap({
  latitude = 28.6139,
  longitude = 77.2090,
  busNumber = "Bus #27",
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

      <Marker position={[latitude, longitude]}>
        <Popup>
          🚌 {busNumber}
          <br />
          Live Location
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default LiveBusMap;