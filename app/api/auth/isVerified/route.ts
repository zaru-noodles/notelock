import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// checks if user in current session is verified
export async function GET(request: Request) {
  const db = createClient(await cookies());
  const {
    data: { user },
    error,
  } = await db.auth.getUser();

  if (error)
    return Response.json(
      { error: "Unable to retrieve user info" },
      { status: 401 },
    );

  // check if user has confirmed email
  return Response.json({ verified: user !== null && "confirmed_at" in user });
}
