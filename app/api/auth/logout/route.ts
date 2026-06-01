import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabase = createClient(await cookies());

  const { error } = await supabase.auth.signOut();
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Logged out" }, { status: 200 });
}
