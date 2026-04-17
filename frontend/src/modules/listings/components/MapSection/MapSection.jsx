import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapSection({ lat, lng, title, address }) {
  const position = [lat || 4.67310, lng || -74.05654];

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {title}
            <br />
            {address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}