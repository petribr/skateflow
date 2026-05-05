"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import { TILE_URL, TILE_ATTR } from "./MapBase";
import type { SessionWithMeta } from "@/lib/types";

export default function FeedMap({ sessions }: { sessions: SessionWithMeta[] }) {
  const center: [number, number] = sessions[0]
    ? [sessions[0].lat, sessions[0].lng]
    : [-23.55, -46.63]; // São Paulo fallback

  return (
    <div className="card p-0 overflow-hidden">
      <MapContainer center={center} zoom={12} style={{ height: 480, width: "100%" }}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        {sessions.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]}>
            <Popup>
              <strong>{s.title}</strong>
              <br />
              {new Date(s.starts_at).toLocaleString()}
              <br />
              <Link href={`/sessions/${s.id}`}>View →</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
