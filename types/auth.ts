export const AuthLevel = { USER: 0, PROFESSOR: 1, ADMIN: 2 } as const;

export function authLevelLabel(level: number) {
  switch (level) {
    case AuthLevel.PROFESSOR:
      return "Professor";
    case AuthLevel.ADMIN:
      return "Admin";
    default:
      return "Student";
  }
}

export const REPORT_REASONS = [
  "wrong_module",
  "inappropriate",
  "spam",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

const labels: Record<ReportReason, string> = {
  wrong_module: "Wrong module",
  inappropriate: "Inappropriate content",
  spam: "Spam or advertising",
  other: "Other",
};
export const reportReasonLabel = (r: ReportReason) => labels[r] ?? r;
