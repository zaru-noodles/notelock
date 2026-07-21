import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { timeAgo } from "@/utils/notes/time";
import RoleSelect from "./RoleSelect";

export default async function AdminUsers() {
  const db = createClient(await cookies());
  const { data: users } = await db
    .from("users")
    .select("id, username, auth_level, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <table className="w-full text-left text-sm">
        <thead className="font-mono text-xs text-red-4">
          <tr className="border-b border-ink-4">
            <th className="py-2">Username</th>
            <th>Joined</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-4 text-ink-1">
          {users?.map((u) => (
            <tr key={u.id}>
              <td className="py-3 font-medium">{u.username}</td>
              <td className="text-ink-3">{timeAgo(u.created_at)}</td>
              <td>
                <RoleSelect userId={u.id} currentLevel={u.auth_level} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
