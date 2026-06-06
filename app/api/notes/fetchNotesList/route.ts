import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const db = createClient(await cookies());
  const { searchParams } = new URL(req.url);
  const moduleCode = searchParams.get("moduleCode");
  const count = Number(searchParams.get("count"));
  const start = Number(searchParams.get("start") ?? "0");

  if (moduleCode === null || count === null) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!Number.isInteger(count)) {
    return Response.json({ error: "count is not a number" }, { status: 400 });
  }

  if (!Number.isInteger(start)) {
    return Response.json({ error: "start is not a number" }, { status: 400 });
  }

  const { data, error } = await db
    .from("notes")
    .select(
      `
      id,
      title,
      semester,
      download_count,
      users!notes_author_id_fkey ( username ),
      modules!inner ()`,
    )
    .eq("modules.moduleCode", moduleCode)
    .range(start, start + count);

  if (error) {
    return Response.json({ error: "Unable to retrieve data" }, { status: 500 });
  }

  return Response.json({ notes: data }, { status: 200 });
}
