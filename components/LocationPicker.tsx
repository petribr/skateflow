"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { TILE_URL, TILE_ATTR } from "./MapBase";

const DEFAULT: [number, number] = [-23.55, -46.63]; // São Paulo

function PickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function LocationPicker() {
  const [pos, setPos] = useState<[number, number]>(DEFAULT);

  return (
    <div className="space-y-2">
      <label className="label">Location</label>
      <input
        name="location_name"
        required
        maxLength={120}
        placeholder="Praça Roosevelt, São Paulo"
        className="input"
      />
      <p className="text-xs text-white/50">Tap the map to pin the spot.</p>
      <div className="rounded-lg overflow-hidden border border-line">
        <MapContainer center={DEFAULT} zoom={12} style={{ height: 220, width: "100%" }}>
          <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
          <PickHandler onPick={(lat, lng) => setPos([lat, lng])} />
          <Marker position={pos} />
        </MapContainer>
      </div>
      <input type="hidden" name="lat" value={pos[0]} />
      <input type="hidden" name="lng" value={pos[1]} />
    </div>
  );
}
