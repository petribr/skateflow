"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SessionWithMeta } from "@/lib/types";

const CreateSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().max(500).optional().nullable(),
  location_name: z.string().min(2).max(120),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  starts_at: z.string().min(1),
  type: z.enum(["casual", "training", "class"]),
  max_participants: z.coerce.number().int().positive().optional().nullable(),
  recurring_weekly: z.coerce.boolean().optional().default(false)
});

export async function createSession(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = CreateSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    location_name: formData.get("location_name"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    starts_at: formData.get("starts_at"),
    type: formData.get("type"),
    max_participants: formData.get("max_participants") || null,
    recurring_weekly: formData.get("recurring_weekly") === "on"
  });

  const { data, error } = await supabase
    .from("sessions")
    .insert({ ...parsed, creator_id: user.id })
    .select("id")
    .single();
  if (error) throw error;

  // Auto-attend your own session.
  await supabase.from("attendance").insert({ session_id: data.id, user_id: user.id });

  revalidatePath("/feed");
  redirect(`/sessions/${data.id}`);
}

export async function joinSession(sessionId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("attendance")
    .insert({ session_id: sessionId, user_id: user.id });
  if (error && error.code !== "23505") throw error; // ignore duplicate

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/feed");
}

export async function leaveSession(sessionId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("attendance")
    .delete()
    .match({ session_id: sessionId, user_id: user.id });
  if (error) throw error;

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/feed");
}

export async function listSessions(): Promise<SessionWithMeta[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      creator:profiles!creator_id ( id, name, username, avatar_url ),
      attendance ( user_id )
    `)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(50);
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    ...row,
    attendee_count: row.attendance?.length ?? 0,
    is_attending: row.attendance?.some((a: any) => a.user_id === user.id) ?? false
  })) as SessionWithMeta[];
}

export async function getSession(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      creator:profiles!creator_id ( id, name, username, avatar_url ),
      attendance ( user_id, profiles!user_id ( id, name, username, avatar_url ) )
    `)
    .eq("id", id)
    .single();
  if (error) throw error;

  const attendees = (data.attendance ?? []).map((a: any) => a.profiles).filter(Boolean);
  return {
    ...data,
    attendee_count: attendees.length,
    is_attending: attendees.some((p: any) => p.id === user.id),
    attendees
  };
}
