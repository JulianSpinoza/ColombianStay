import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, multiPolygon, polygon } from "@turf/helpers";
import { useEffect } from "react";

function ClickHandler({ setPosition, boundary }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      
      // 1. Convertimos el clic a un punto de Turf (formato [lng, lat])
      const pt = point([lng, lat]);

      // 2. Convertimos tu boundary a una geometría de Turf
      // Asumimos que boundary viene como GeoJSON o estructura compatible
      const poly = multiPolygon(boundary.coordinates);

      // 3. Validamos si el punto está dentro
      if (booleanPointInPolygon(pt, poly)) {
        setPosition([lat, lng]);
      } else {
        alert("El punto seleccionado debe estar dentro de la zona sombreada.");
      }
    },
  });
  return null;
}

function MapResizer({ boundary }) {
  const map = useMap();

  useEffect(() => {
    if (boundary && boundary.coordinates) {
      // Creamos un objeto de límites (Bounds) de Leaflet
      const bounds = L.geoJSON(boundary).getBounds();
      
      // Ajustamos el mapa con un pequeño padding para que no quede al ras
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [boundary, map]);

  return null;
}

export default function MapPointSelection({ value, onChange, boundary }) {
  const setPosition = (point) => {
    onChange("location_lat", point[0]);
    onChange("location_lng", point[1]);
  };

  // Convertimos las coordenadas de GeoJSON ([lng, lat]) a Leaflet ([lat, lng])
  // Esto es necesario solo si tu boundary viene en formato estándar GeoJSON
  const leafetBoundary = boundary.coordinates.map(poly => 
    poly.map(ring => ring.map(coord => [coord[1], coord[0]]))
  );

  return (
    <MapContainer 
      center={[51.505, -0.09]} 
      zoom={13} 
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {boundary && <MapResizer boundary={boundary} />}

      {/* Dibujamos la zona sombreada */}
      {boundary && (
        <Polygon 
          positions={leafetBoundary} 
          pathOptions={{ 
            color: 'blue', 
            fillColor: 'blue', 
            fillOpacity: 0.2 
          }} 
        />
      )}

      <ClickHandler setPosition={setPosition} boundary={boundary} />

      {value && value[0] && (
        <Marker position={value}>
          <Popup>
            Lat: {value[0].toFixed(4)} <br /> 
            Lng: {value[1].toFixed(4)}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}