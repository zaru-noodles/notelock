import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const request = await req.json();
  const db = createClient(await cookies());

  if (!request?.id || !request?.moduleCode) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  const { error } = await db.from("notes").delete().eq("id", request.id);

  if (error)
    return Response.json({ error: "Unable to delete" }, { status: 500 });

  db.storage.from("notes").remove([`${request.moduleCode}/${request.id}.pdf`]);
  db.storage.from("notes").remove([`${request.moduleCode}/${request.id}.png`]);
  return Response.json({ error: "Delete successful!" }, { status: 200 });
}
