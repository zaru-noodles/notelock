import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { noteId } = await req.json();
  const db = createClient(await cookies());

  const { error } = await db.rpc("increment_download_count", {
    p_note_id: noteId,
  });

  if (error) {
    console.error("Incrementing download count failed");
    return Response.json(
      { error: "Failed to increment download" },
      { status: 500 },
    );
  }
  console.log(`Download button: ${noteId}`);
  return Response.json({ ok: true });
}
