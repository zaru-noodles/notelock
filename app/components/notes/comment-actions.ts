"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function postComment(_prev: unknown, formData: FormData) {
  const noteId = String(formData.get("noteId"));
  const modulePath = String(formData.get("modulePath"));
  const content = String(formData.get("content") ?? "").trim();

  if (!content) return { error: "Comment cannot be empty" };
  if (content.length > 2000) return { error: "Comment is too long" };

  const db = createClient(await cookies());
  const { data, error: authError } = await db.auth.getClaims();
  if (!data?.claims || authError) {
    return { error: "User not found" };
  }

  const userId = data.claims.sub;
  const { error } = await db
    .from("comments")
    .insert({ note_id: noteId, author_id: userId, content: content });

  if (error) {
    console.error("postComment failed: ", error);
    return { error: "Could not post your comment, please try again" };
  }

  revalidatePath(`/notes/${modulePath}/${noteId}`);
  return { ok: true };
}
