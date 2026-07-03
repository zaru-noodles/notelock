import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const db = createClient(await cookies());
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const count = Number(searchParams.get("count")) ?? 10;

  if (!Number.isInteger(count)) {
    return Response.json({ error: "Invalid count" }, { status: 400 });
  }

  const { data, error } = await db.rpc("search_module", {
    search_query: search,
    result_count: count,
  });

  if (error) {
    return Response.json({ error: error }, { status: 500 });
  }

  return Response.json({ modules: data }, { status: 200 });
}
