"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Schema = z.object({
  target_type: z.enum(["user", "session", "comment"]),
  target_id: z.string().uuid(),
  reason: z.enum(["spam", "harassment", "inappropriate", "other"]),
  details: z.string().max(500).optional().nullable()
});

export async function reportTarget(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = Schema.parse({
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    reason: formData.get("reason"),
    details: formData.get("details") || null
  });

  const { error } = await supabase
    .from("reports")
    .insert({ ...parsed, reporter_id: user.id });
  if (error) throw error;
}
