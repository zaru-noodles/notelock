import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const db = createClient(await cookies());
  const { searchParams } = new URL(req.url);
  const moduleCode = searchParams.get("moduleCode");
  const searchText = searchParams.get("search") ?? "";
  const selectedSemester = searchParams.get("semester") ?? "";
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

  const { data, error } = await db.rpc("search_notes", {
    search_query: searchText,
    start_index: start,
    result_count: count,
    module_code: moduleCode,
    selected_semester: selectedSemester,
  });

  console.log(error);
  if (error) {
    return Response.json({ error: "Unable to retrieve data" }, { status: 500 });
  }

  // generate signed URLs for thumbnails
  const { data: signedUrls } = await db.storage
    .from("thumbnail")
    .createSignedUrls(
      data.map((note) => `${moduleCode}/${note.id}.png`),
      3600,
    );

  const notesWithUrl = data.map((note, index) => ({
    ...note,
    thumbnailUrl: signedUrls?.[index]?.signedUrl ?? null,
  }));

  return Response.json({ notes: notesWithUrl }, { status: 200 });
}
