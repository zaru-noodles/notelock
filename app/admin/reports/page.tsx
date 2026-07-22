import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { timeAgo } from "@/utils/notes/time";
import { reportReasonLabel, type ReportReason } from "@/types/auth";

type ReportRow = {
  id: string;
  note_id: string;
  reason: ReportReason;
  created_at: string;
  note: { title: string; module: { moduleCode: string } | null } | null;
  reporter: { username: string | null } | null;
  details: string | null;
};

export default async function ReportsPage() {
  const db = createClient(await cookies());
  const { data, error } = await db
    .from("reports")
    .select(
      "id::text, note_id::text, reason, created_at, note:notes!reports_note_id_fkey(title, module:modules(moduleCode)), reporter:users!reports_reporter_id_fkey(username), details",
    )
    .order("created_at", { ascending: false })
    .overrideTypes<ReportRow[]>();

  if (error)
    return (
      <p className="font-mono text-sm text-ink-3">
        Failed to load: {error.message}
      </p>
    );
  const rows = data ?? [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-ink-1">Reports</h1>
      {rows.length === 0 ? (
        <p className="font-mono text-sm text-ink-3">No open reports.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const moduleCode = r.note?.module?.moduleCode;
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-ink-4 p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/notes/${moduleCode}/${r.note_id}`}
                      className="font-display text-ink-1 hover:underline truncate"
                    >
                      {r.note?.title ?? "deleted note"}
                    </Link>
                    {moduleCode && (
                      <span className="font-mono text-xs text-ink-3">
                        {moduleCode}
                      </span>
                    )}
                    <span className="font-mono text-xs text-ink-3">
                      {reportReasonLabel(r.reason)}
                    </span>
                    <p className="font-mono text-xs text-ink-3">
                      by {r.reporter?.username} {timeAgo(r.created_at)}
                    </p>
                    {r.details && (
                      <p className="border-l-2 border-ink-4 pl-2 text-sm text-ink-2 line-clamp-3">
                        {r.details}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
