import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function AdminOverview() {
  const db = createClient(await cookies());

  const [users, notes, comments, reports] = await Promise.all([
    db.from("user_profiles").select("*", { count: "exact", head: true }),
    db.from("notes").select("*", { count: "exact", head: true }),
    db.from("comments").select("*", { count: "exact", head: true }),
    db.from("reports").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Users", value: users.count ?? 0 },
    { label: "Notes", value: notes.count ?? 0 },
    { label: "Comments", value: comments.count ?? 0 },
    { label: "Reports", value: reports.count ?? 0 },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-ink-4 p-4 shadow-sh-2"
        >
          <p className="font-mono text-xs text-ink-3 mb-2">{s.label}</p>
          <p className="font-display text-3xl text-ink-0">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
