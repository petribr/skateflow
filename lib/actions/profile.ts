"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const Schema = z.object({
  name: z.string().min(1).max(80),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_.]+$/i),
  skill_level: z.enum(["beginner", "intermediate", "advanced"]),
  city: z.string().max(80).optional().nullable(),
  instagram: z.string().max(30).optional().nullable()
});

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = Schema.parse({
    name: formData.get("name"),
    username: formData.get("username"),
    skill_level: formData.get("skill_level"),
    city: formData.get("city") || null,
    instagram: formData.get("instagram") || null
  });

  const { error } = await supabase
    .from("profiles")
    .update(parsed)
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath("/feed");
}

export async function getCurrentProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}
