import { createClient } from "@/utils/supabase/server";
import { getOriginURL } from "@/utils/api/helper";
import { cookies } from "next/headers";

// resends verification link to the accounts email
export async function POST(request: Request) {
  const db = createClient(await cookies());
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  const { error } = await db.auth.resend({
    type: "signup",
    email: email,
    options: {
      emailRedirectTo: `${await getOriginURL()}/verify`,
    },
  });
  if (error) return Response.json({ error: error.message }, { status: 401 });

  return Response.json(
    {
      message: "Verification link sent!",
    },
    { status: 200 },
  );
}
