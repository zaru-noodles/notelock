import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NOTES_BUCKET, notePath } from "./storage";

export async function getNoteWithSignedUrl(noteId: string) {
  const db = createClient(await cookies());

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: note, error: noteError } = await db
    .from("notes")
    .select("id::text, title, semester, module_id")
    .eq("id", noteId)
    .single();

  if (noteError || !note) {
    return null;
  }
  console.log(note.id);
  const { data: moduleRow, error: moduleError } = await db
    .from("modules")
    .select("moduleCode")
    .eq("id", note.module_id)
    .single();

  if (moduleError || !moduleRow) {
    return null;
  }

  const moduleCode = moduleRow.moduleCode;

  const { data: urlData, error: urlError } = await db.storage
    .from(NOTES_BUCKET)
    .createSignedUrl(notePath(moduleCode, note.id), 3600);

  if (urlError) {
    return null;
  }

  const downloadUrl = `${urlData.signedUrl}&download=${encodeURIComponent(`${note.title}.pdf`)}`;

  return {
    ...note,
    moduleCode,
    signedUrl: urlData.signedUrl,
    downloadUrl,
  };
}

export async function getComments(noteId: string) {
  const db = createClient(await cookies());
  const { data, error } = await db
    .from("comments")
    .select("id::text, content, created_at, author_id, author:users(username)")
    .eq("note_id", noteId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getComments failed:", error);
    return [];
  }

  return data;
}
