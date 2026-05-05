"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { TILE_URL, TILE_ATTR } from "./MapBase";

export default function SessionMap({
  lat,
  lng,
  label
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  return (
    <div className="card p-0 overflow-hidden">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: 240, width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <Marker position={[lat, lng]}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
