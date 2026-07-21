"use server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/app/api/auth/current-user";
import type { ReportReason } from "@/types/auth";

export async function submitReport(noteId: string, reason: ReportReason) {
  const user = await getCurrentUser();
  if (!user) return { error: "No user found" };
  const db = createClient(await cookies());
  const { error } = await db
    .from("reports")
    .insert({ note_id: noteId, reporter_id: user.id, reason });
  if (error) {
    return { error: "Could not submit report." };
  }
  return { ok: true };
}
