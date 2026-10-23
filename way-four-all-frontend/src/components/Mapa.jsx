import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
function Ajustar({ pontos }) {
  const map = useMap();
  useEffect(() => {
    if (pontos.length)
      map.fitBounds(
        pontos.map((p) => [Number(p.latitude), Number(p.longitude)]),
        { padding: [45, 45], maxZoom: 15 },
      );
  }, [map, pontos]);
  return null;
}
export default function Mapa({ locais = [], className = "" }) {
  const pontos = locais.filter(
    (p) =>
      p.latitude != null &&
      p.longitude != null &&
      Number.isFinite(Number(p.latitude)) &&
      Number.isFinite(Number(p.longitude)),
  );
  return (
    <div className={"map-wrap " + className}>
      <MapContainer
        center={[-23.55052, -46.633308]}
        zoom={12}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Ajustar pontos={pontos} />
        {pontos.map((local) => (
          <CircleMarker
            key={local.id}
            center={[Number(local.latitude), Number(local.longitude)]}
            radius={11}
            pathOptions={{
              color: "white",
              weight: 3,
              fillColor: "#0649f7",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <strong>{local.nome}</strong>
              <br />
              <Link to={"/estabelecimentos/" + local.id}>
                Ver acessibilidade →
              </Link>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {!pontos.length && (
        <div className="map-caption">
          Os locais com coordenadas aparecerão aqui.
        </div>
      )}
    </div>
  );
}
