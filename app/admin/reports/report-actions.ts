import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/app/api/auth/current-user";
import { AuthLevel } from "@/types/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
  const { error } = await db.from("notes").delete().eq("id", noteId);
  if (error) return { error: error.message };
  revalidatePath("/admin/reports");
  return { ok: true };
}
