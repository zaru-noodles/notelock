import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const getCurrentUser = cache(async () => {
  const db = createClient(await cookies());
  const { data, error } = await db.auth.getClaims();
  if (!data?.claims || error) return null;

  const { data: profile } = await db
    .from("users")
    .select("username, auth_level")
    .eq("id", data.claims.sub)
    .single();

  return {
    id: data.claims.sub as string,
    username: profile?.username ?? null,
    authLevel: (profile?.auth_level ?? 0) as 0 | 1 | 2,
  };
});
