"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addComment } from "@/lib/actions/comments";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "./Avatar";
import type { Comment } from "@/lib/types";

export function CommentSection({
  sessionId,
  initial
}: {
  sessionId: string;
  initial: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `session_id=eq.${sessionId}` },
        async (payload) => {
          const { data } = await supabase
            .from("comments")
            .select("id, session_id, user_id, body, created_at, author:profiles!user_id(name, username, avatar_url)")
            .eq("id", (payload.new as any).id)
            .single();
          if (data) {
            setComments((prev) =>
              prev.some((c) => c.id === data.id) ? prev : [...prev, data as any]
            );
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  function onSubmit(formData: FormData) {
    start(async () => {
      await addComment(formData);
      formRef.current?.reset();
    });
  }

  return (
    <section className="card">
      <h2 className="font-semibold mb-3">Comments ({comments.length})</h2>

      <ul className="space-y-3 mb-4">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-2">
            <Avatar src={c.author.avatar_url} name={c.author.name} size={28} />
            <div className="text-sm">
              <div className="font-semibold">{c.author.name}
                <span className="ml-2 text-xs text-white/40">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-white/80 whitespace-pre-wrap">{c.body}</p>
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-white/50">No comments yet. Say hi 👋</li>
        )}
      </ul>

      <form ref={formRef} action={onSubmit} className="flex gap-2">
        <input type="hidden" name="session_id" value={sessionId} />
        <input
          name="body"
          required
          maxLength={1000}
          placeholder="Write a comment…"
          className="input flex-1"
        />
        <button type="submit" disabled={pending} className="btn-primary">
          Post
        </button>
      </form>
    </section>
  );
}
