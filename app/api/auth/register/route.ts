import { createClient } from "@/utils/supabase/server";
import type { RegisterRequest } from "@/types/api.ts";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const db = createClient(await cookies());
  const req: RegisterRequest = await request.json();

  if (!req.email || !req.password || !req.confirmPassword || !req.username) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!req.email.endsWith("@u.nus.edu")) {
    return Response.json({ error: "Must use an NUS email" }, { status: 400 });
  }

  if (req.password !== req.confirmPassword) {
    return Response.json({ error: "Passwords do not match" }, { status: 400 });
  }

  // attempt to sign up
  const { data, error } = await db.auth.signUp({
    email: req.email,
    password: req.password,
  });

  if (error) return Response.json({ error: error.message }, { status: 401 });

  await db.from("users").insert({
    id: data.user?.id,
    email: req.email,
    username: req.username,
  });

  return Response.json(
    {
      message:
        "Registration successful, please check your email to verify your account",
    },
    { status: 200 },
  );
}
