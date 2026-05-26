import { createClient } from "@/utils/supabase/server";
import type { RegisterRequest } from "@/types/api.ts";
import { cookies } from "next/headers";
import { getOriginURL } from "@/utils/api/helper";

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

  // check if unique username
  const { count, error: countError } = await db
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("username", req.username);

  if (countError)
    return Response.json({ error: "Unable to register" }, { status: 401 });

  if (count !== 0) {
    return Response.json({ error: "Username already used" }, { status: 400 });
  }

  // attempt to sign up
  const { data, error } = await db.auth.signUp({
    email: req.email,
    password: req.password,
    options: {
      emailRedirectTo: `${await getOriginURL()}/verify`,
      data: {
        username: req.username,
      },
    },
  });

  if (error) return Response.json({ error: error.message }, { status: 401 });

  return Response.json(
    {
      message:
        "Registration successful, please check your email to verify your account",
    },
    { status: 200 },
  );
}
