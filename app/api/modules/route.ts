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

  const { data: modsByCode, error: error1 } = await db
    .from("modules")
    .select("*")
    .ilike("moduleCode", `%${search}%`)
    .limit(10);

  if (error1) return Response.json({ error: error1.message }, { status: 500 });

  const { data: modsByName, error: error2 } = await db
    .from("modules")
    .select("*")
    .ilike("title", `%${search}%`)
    .limit(10);

  if (error2) return Response.json({ error: error2.message }, { status: 500 });

  return Response.json(
    { modules: [...modsByCode, ...modsByName].slice(0, count) },
    { status: 200 },
  );
}
