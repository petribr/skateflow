import Link from "next/link";
import type { SessionWithMeta } from "@/lib/types";

const TYPE_TAG: Record<string, string> = {
  casual: "Casual",
  training: "Training",
  class: "Class"
};

export function SessionCard({ session }: { session: SessionWithMeta }) {
  const date = new Date(session.starts_at);
  const day = date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <Link href={`/sessions/${session.id}`} className="card block hover:border-white/30 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-accent font-semibold uppercase tracking-wide">
            {TYPE_TAG[session.type]}
          </div>
          <div className="text-base font-semibold mt-1">{session.title}</div>
          <div className="text-xs text-white/60 mt-1">📍 {session.location_name}</div>
        </div>
        <div className="text-right text-xs text-white/70">
          <div className="font-semibold">{day}</div>
          <div>{time}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-white/60">
        <span>👤 {session.attendee_count} going</span>
        {session.is_attending && (
          <span className="text-accent font-semibold">You're in</span>
        )}
      </div>
    </Link>
  );
}
