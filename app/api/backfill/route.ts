export const runtime = "nodejs";
export const maxDuration = 300;

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { extractPdfText } from "@/utils/notes/extract-text";
import { summariseNotes } from "@/utils/notes/AIsummarise";
export async function POST() {
  const db = createClient(await cookies());

  const { data: notes, error } = await db
    .from("notes")
    .select("id::text, title, module:modules ( moduleCode )")
    .is("summary", null)
    .limit(5)
    .overrideTypes<
      { id: string; title: string; module: { moduleCode: string } | null }[]
    >();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results: unknown[] = [];

  for (const note of notes ?? []) {
    if (!note.module) {
      results.push({ id: note.id, status: "no module" });
      continue;
    }

    try {
      const { data: blob, error: dlErr } = await db.storage
        .from("notes")
        .download(`${note.module.moduleCode}/${note.id}.pdf`);
      if (dlErr) {
        results.push({
          id: note.id,
          status: "download failed",
          detail: dlErr.message,
        });
        continue;
      }

      const text = await extractPdfText(
        new Uint8Array(await blob.arrayBuffer()),
      );
      const summary = await summariseNotes(text);

      if (!summary) {
        results.push({
          id: note.id,
          title: note.title,
          status: "no text (scanned?)",
        });
        continue;
      }

      const { error: updErr } = await db
        .from("notes")
        .update({ summary })
        .eq("id", note.id);
      results.push({
        id: note.id,
        title: note.title,
        status: updErr ? `update failed: ${updErr.message}` : "ok",
      });
    } catch (e) {
      results.push({ id: note.id, status: "error", detail: String(e) });
    }
  }

  return Response.json({ processed: results.length, results });
}
