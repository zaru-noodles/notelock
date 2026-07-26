"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/app/api/auth/current-user";
import { AuthLevel } from "@/types/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

type NoteWithModule = {
  id: string;
  module: { moduleCode: string } | null;
};

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.authLevel >= AuthLevel.ADMIN ? user : null;
}

export async function dismissReport(reportId: string) {
  if (!(await requireAdmin())) return { error: "Not authorised" };
  const db = createClient(await cookies());
  const { error } = await db.from("reports").delete().eq("id", reportId);
  if (error) return { error: error.message };
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function deleteReportedNote(noteId: string) {
  if (!(await requireAdmin())) return { error: "Not authorised" };
  const db = createClient(await cookies());
  const { data: note, error: lookupError } = await db
    .from("notes")
    .select("id::text, module:modules(moduleCode)")
    .eq("id", noteId)
    .single()
    .overrideTypes<NoteWithModule>();
  if (lookupError || !note?.module) return { error: "Note not found" };
  const moduleCode = note.module?.moduleCode;

  const { error: delError } = await db.from("notes").delete().eq("id", noteId);
  if (delError) return { error: delError.message };
  const [pdfRes, thumbRes] = await Promise.all([
    db.storage.from("notes").remove([`${moduleCode}/${noteId}.pdf`]),
    db.storage.from("thumbnail").remove([`${moduleCode}/${noteId}.png`]),
  ]);
  if (pdfRes.error) console.error("pdf cleanup error: ", pdfRes.error);
  if (thumbRes.error)
    console.error("thumbnail cleanup error: ", thumbRes.error);
  revalidatePath("/admin/reports");
  return { ok: true };
}
