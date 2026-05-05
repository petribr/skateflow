"use client";

import { useTransition } from "react";
import { joinSession, leaveSession } from "@/lib/actions/sessions";

export function JoinButton({
  sessionId,
  isAttending,
  count,
  full
}: {
  sessionId: string;
  isAttending: boolean;
  count: number;
  full: boolean;
}) {
  const [pending, start] = useTransition();

  function toggle() {
    start(async () => {
      if (isAttending) await leaveSession(sessionId);
      else await joinSession(sessionId);
    });
  }

  if (!isAttending && full) {
    return (
      <button disabled className="btn-ghost w-full opacity-60">
        Session full ({count})
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={isAttending ? "btn-ghost w-full" : "btn-primary w-full"}
    >
      {pending ? "…" : isAttending ? `You're in — Leave (${count})` : `I'm in (${count})`}
    </button>
  );
}
