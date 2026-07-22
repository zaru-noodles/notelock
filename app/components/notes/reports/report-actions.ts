"use server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/app/api/auth/current-user";
import type { ReportReason } from "@/types/auth";

export async function submitReport(
  noteId: string,
  reason: ReportReason,
  details?: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "No user found" };
  const db = createClient(await cookies());
  const { error } = await db.from("reports").insert({
    note_id: noteId,
    reporter_id: user.id,
    reason,
    details: details?.trim() || null,
  });
  if (error) {
    if (error.code === "23505") {
      return { error: "You have already reported this note." };
    } else {
      return { error: "Could not submit report." };
    }
  }
  return { ok: true };
}
