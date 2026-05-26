import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// checks if user in current session is verified
export async function POST(request: Request) {
  const db = createClient(await cookies());
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  const { count, error } = await db
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("email", email);

  if (error)
    return Response.json({ error: "Unable to register" }, { status: 401 });

  return Response.json({ verified: count === 1 }, { status: 200 });
}
