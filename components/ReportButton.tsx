"use client";

import { useState, useTransition } from "react";
import { reportTarget } from "@/lib/actions/reports";

export function ReportButton({
  targetType,
  targetId
}: {
  targetType: "user" | "session" | "comment";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    start(async () => {
      await reportTarget(formData);
      setDone(true);
      setTimeout(() => { setOpen(false); setDone(false); }, 1500);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-white/40 hover:text-white">
        Report
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 grid place-items-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Report</h3>
            {done ? (
              <p className="text-sm text-accent">Thanks. We'll review.</p>
            ) : (
              <form action={submit} className="space-y-3">
                <input type="hidden" name="target_type" value={targetType} />
                <input type="hidden" name="target_id" value={targetId} />
                <select name="reason" required className="input">
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate">Inappropriate</option>
                  <option value="other">Other</option>
                </select>
                <textarea name="details" rows={3} maxLength={500}
                          placeholder="What happened? (optional)" className="input" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={pending} className="btn-primary">
                    {pending ? "…" : "Send"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
