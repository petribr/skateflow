import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/actions/sessions";
import { listComments } from "@/lib/actions/comments";
import { JoinButton } from "@/components/JoinButton";
import { CommentSection } from "@/components/CommentSection";
import { ReportButton } from "@/components/ReportButton";
import { Avatar } from "@/components/Avatar";

const SessionMap = nextDynamic(() => import("@/components/SessionMap"), { ssr: false });

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  casual: "Casual",
  training: "Training",
  class: "Class / Social"
};

export default async function SessionPage({ params }: { params: { id: string } }) {
  let session;
  try {
    session = await getSession(params.id);
  } catch {
    notFound();
  }
  const comments = await listComments(params.id);
  const date = new Date(session.starts_at);

  return (
    <div className="space-y-5">
      <div className="card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-accent/20 text-accent">
              {TYPE_LABEL[session.type]}
            </span>
            <h1 className="text-xl font-bold mt-2">{session.title}</h1>
            <p className="text-sm text-white/60">{session.location_name}</p>
          </div>
          <ReportButton targetType="session" targetId={session.id} />
        </div>

        <p className="text-sm">
          📅 {date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
        </p>
        {session.description && <p className="text-sm text-white/80">{session.description}</p>}

        <div className="flex items-center gap-2 pt-2 border-t border-line">
          <Avatar src={session.creator.avatar_url} name={session.creator.name} />
          <div className="text-xs">
            <div>by <span className="font-semibold">{session.creator.name}</span></div>
            <div className="text-white/50">@{session.creator.username}</div>
          </div>
        </div>

        <JoinButton
          sessionId={session.id}
          isAttending={session.is_attending}
          count={session.attendee_count}
          full={
            session.max_participants != null &&
            session.attendee_count >= session.max_participants
          }
        />
      </div>

      <SessionMap lat={session.lat} lng={session.lng} label={session.location_name} />

      <section className="card">
        <h2 className="font-semibold mb-3">Going ({session.attendee_count})</h2>
        <ul className="flex flex-wrap gap-3">
          {session.attendees.map((a: any) => (
            <li key={a.id} className="flex items-center gap-2 text-sm">
              <Avatar src={a.avatar_url} name={a.name} size={28} />
              <span>{a.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <CommentSection sessionId={session.id} initial={comments as any} />
    </div>
  );
}
