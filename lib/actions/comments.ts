"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const Schema = z.object({
  session_id: z.string().uuid(),
  body: z.string().min(1).max(1000)
});

export async function addComment(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = Schema.parse({
    session_id: formData.get("session_id"),
    body: formData.get("body")
  });

  const { error } = await supabase
    .from("comments")
    .insert({ ...parsed, user_id: user.id });
  if (error) throw error;

  revalidatePath(`/sessions/${parsed.session_id}`);
}

export async function listComments(sessionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, session_id, user_id, body, created_at, author:profiles!user_id(name, username, avatar_url)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
