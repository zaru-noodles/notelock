"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/app/api/auth/current-user";
import { AuthLevel } from "@/types/auth";

export async function changeUserLevel(userId: string, level: number) {
  const user = await getCurrentUser();
  if (!user || user.authLevel < AuthLevel.ADMIN) {
    return { error: "Not authorised" };
  }
  if (user.id === userId && level < AuthLevel.ADMIN) {
    return { error: "You can't demote yourself" };
  }

  const db = createClient(await cookies());
  const { error } = await db.rpc("set_auth_level", {
    p_user_id: userId,
    p_level: level,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { ok: true };
}
