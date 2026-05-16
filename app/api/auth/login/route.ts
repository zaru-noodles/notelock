import { createClient } from "@/utils/supabase/server";
import type { LoginRequest } from "@/types/api";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const db = createClient(await cookies());
  const req: LoginRequest = await request.json();

  if (!req.email || !req.password) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!req.email.endsWith("@u.nus.edu")) {
    return Response.json({ error: "Must use an NUS email" }, { status: 400 });
  }

  // attempt to log in
  const { data, error } = await db.auth.signInWithPassword({
    email: req.email,
    password: req.password,
  });

  if (error) return Response.json({ error: error.message }, { status: 401 });

  return Response.json(
    {
      message: "Login successful",
    },
    { status: 200 },
  );
}
