import {
  Upload,
  User,
  FileText,
  ThumbsUp,
  Download,
  MessageSquare,
  LayoutDashboardIcon,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type UserStats = {
  noteCount: bigint;
  noteCountPercentile: number;
  totalLikes: bigint;
  totalLikesPercentile: number;
  totalDownloads: bigint;
  totalDownloadsPercentile: number;
  totalComments: bigint;
  totalCommentsPercentile: number;
};

function getGrade(percentile: number): {
  grade: string;
  color: string;
  bg: string;
} {
  const top = 100 - percentile;
  if (top <= 5)
    return { grade: "S", color: "text-honey-500", bg: "bg-honey-100" };
  if (top <= 15)
    return { grade: "A", color: "text-terra-500", bg: "bg-terra-100" };
  if (top <= 35)
    return { grade: "B", color: "text-green-700", bg: "bg-green-50" };
  if (top <= 60)
    return { grade: "C", color: "text-blue-600", bg: "bg-blue-50" };
  return { grade: "D", color: "text-ink-3", bg: "bg-paper-3" };
}

function getOverallGrade(stats: UserStats) {
  const avg =
    (Number(stats.noteCountPercentile) +
      Number(stats.totalLikesPercentile) +
      Number(stats.totalDownloadsPercentile) +
      Number(stats.totalCommentsPercentile)) /
    4;
  return getGrade(avg);
}

const ROWS = [
  {
    key: "noteCount",
    percentileKey: "noteCountPercentile",
    label: "Notes uploaded",
    icon: FileText,
  },
  {
    key: "totalLikes",
    percentileKey: "totalLikesPercentile",
    label: "Likes received",
    icon: ThumbsUp,
  },
  {
    key: "totalDownloads",
    percentileKey: "totalDownloadsPercentile",
    label: "Total downloads",
    icon: Download,
  },
  {
    key: "totalComments",
    percentileKey: "totalCommentsPercentile",
    label: "Comments received",
    icon: MessageSquare,
  },
] as const;

export default async function Overview({
  userID,
  username,
  authLevel,
}: {
  userID: string;
  username: string;
  authLevel: number;
}) {
  const db = createClient(await cookies());
  const { data, error } = await db.rpc("get_user_stats", {
    target_user_id: userID,
  });
  const stats: UserStats | null = data?.[0] ?? null;
  const overall = stats ? getOverallGrade(stats) : null;

  return (
    <div className="mb-8">
      <h1 className="text-5xl font-bold mb-3">Welcome back, {username}</h1>

      <div className="flex gap-3 mb-10">
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-paper-3 text-ink-1 rounded-xl text-sm font-medium hover:bg-paper-4 transition-colors border border-paper-4"
        >
          <Upload className="w-4 h-4" /> Upload notes
        </Link>
        <Link
          href={`/users/${userID}`}
          className="flex items-center gap-2 px-4 py-2 bg-paper-3 text-ink-1 rounded-xl text-sm font-medium hover:bg-paper-4 transition-colors border border-paper-4"
        >
          <User className="w-4 h-4" /> My uploads
        </Link>
        {authLevel === 2 && (
          <Link
            href={`/admin`}
            className="flex items-center gap-2 px-4 py-2 bg-paper-3 text-ink-1 rounded-xl text-sm font-medium hover:bg-paper-4 transition-colors border border-paper-4"
          >
            <LayoutDashboardIcon className="w-4 h-4" /> Admin Dashboard
          </Link>
        )}
      </div>

      {!error && stats && overall && (
        <div className="bg-paper-1 border border-paper-4 overflow-hidden">
          {/* title bar */}
          <div className="px-7 pt-6 pb-4 flex items-start justify-between border-b border-paper-4">
            <div>
              <h2 className="text-2xl text-ink-1 leading-tight">
                Contributor Report
              </h2>
            </div>
          </div>

          {/* rows */}
          <div className="divide-y divide-paper-3">
            {ROWS.map(({ key, percentileKey, label, icon: Icon }) => {
              const value = Number(stats[key]);
              const percentile = Number(stats[percentileKey]);
              const top = 100 - percentile;
              const { grade, color, bg } = getGrade(percentile);

              return (
                <div
                  key={key}
                  className="flex items-center px-10 py-4 gap-5 hover:bg-paper-2 transition-colors"
                >
                  {/* icon + label */}
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-paper-3 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-ink-2" />
                    </div>
                    <p className="text-sm text-ink-1">{label}</p>
                  </div>

                  {/* count */}
                  <p className="w-4 text-right font-semibold text-ink-1 shrink-0 tabular-nums">
                    {value.toLocaleString()}
                  </p>

                  {/* bar */}
                  <div className="flex-1 h-1.5 bg-paper-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terra-300 rounded-full"
                      style={{ width: `${Math.min(percentile, 100)}%` }}
                    />
                  </div>

                  {/* rank */}
                  <p className="w-16 text-right text-sm text-ink-2 shrink-0">
                    {percentile > 0 ? `top ${top < 1 ? "<1" : top}%` : "—"}
                  </p>

                  {/* grade pill */}
                  <div
                    className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}
                  >
                    <p className={`text-sm font-bold ${color}`}>
                      {percentile > 0 ? grade : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* footer legend */}
          <div className="px-7 py-3 border-t border-paper-4 flex justify-end gap-5">
            {[
              { g: "S", label: "top 5%", color: "text-honey-500" },
              { g: "A", label: "top 15%", color: "text-terra-500" },
              { g: "B", label: "top 35%", color: "text-green-700" },
              { g: "C", label: "top 60%", color: "text-blue-600" },
              { g: "D", label: "top 100%", color: "text-ink-3" },
            ].map(({ g, label, color }) => (
              <div key={g} className="flex items-center gap-1.5">
                <p className={`text-xs font-bold ${color}`}>{g}</p>
                <p className="text-xs text-ink-3">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
