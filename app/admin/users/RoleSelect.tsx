"use client";
import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { changeUserLevel } from "./admin-actions";
import { authLevelLabel } from "@/types/auth";

export default function RoleSelect({
  userId,
  currentLevel,
}: {
  userId: string;
  currentLevel: number;
}) {
  const [level, setLevel] = useState(currentLevel);
  const [pending, startTransition] = useTransition();

  function onChange(newLevel: number) {
    const prev = level;
    setLevel(newLevel);
    startTransition(async () => {
      const result = await changeUserLevel(userId, newLevel);
      if (result?.error) {
        setLevel(prev);
        toast.error(result.error);
      } else {
        toast.success(`Role updated to ${authLevelLabel(newLevel)}`);
      }
    });
  }

  return (
    <select
      value={level}
      disabled={pending}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-pill border border-ink-4 bg-transparent px-3 py-1 font-mono text-xs text-ink-2 disabled:opacity-50"
    >
      <option value={0}>Student</option>
      <option value={1}>Professor</option>
      <option value={2}>Admin</option>
    </select>
  );
}
