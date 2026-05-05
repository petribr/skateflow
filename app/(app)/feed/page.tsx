import Link from "next/link";
import nextDynamic from "next/dynamic";
import { listSessions } from "@/lib/actions/sessions";
import { SessionCard } from "@/components/SessionCard";
import { FeedToggle } from "@/components/FeedToggle";

const FeedMap = nextDynamic(() => import("@/components/FeedMap"), { ssr: false });

export const dynamic = "force-dynamic";

export default async function FeedPage({
  searchParams
}: {
  searchParams: { view?: string };
}) {
  const sessions = await listSessions();
  const view = searchParams.view === "map" ? "map" : "list";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Upcoming rolês</h1>
        <FeedToggle current={view} />
      </div>

      {sessions.length === 0 && (
        <div className="card text-center text-white/60">
          <p>No rolês on the schedule.</p>
          <Link href="/sessions/new" className="btn-primary mt-4">Create the first one</Link>
        </div>
      )}

      {view === "list" && (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id}>
              <SessionCard session={s} />
            </li>
          ))}
        </ul>
      )}

      {view === "map" && sessions.length > 0 && <FeedMap sessions={sessions} />}
    </div>
  );
}
