"use client";
import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Props = {
  noteId: string;
  initialUps: number;
  initialDowns: number;
  initialUserVote: 0 | 1 | -1;
};

export function UserVote({
  noteId,
  initialUps,
  initialDowns,
  initialUserVote,
}: Props) {
  const db = createClient();
  const [ups, setUps] = useState(initialUps);
  const [downs, setDowns] = useState(initialDowns);
  const [userVote, setUserVote] = useState<0 | 1 | -1>(initialUserVote);
  const [busy, setBusy] = useState(false);

  async function vote(value: 1 | -1) {
    if (busy) return;
    setBusy(true);

    const { data, error } = await db.rpc("handle_vote", {
      p_note_id: noteId,
      p_value: value,
    });

    if (!error && data?.[0]) {
      setUps(Number(data[0].ups));
      setDowns(Number(data[0].downs));
      setUserVote(data[0].user_vote as 0 | 1 | -1);
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        disabled={busy}
        onClick={() => vote(1)}
        className={userVote === 1 ? "text-green-600" : "text-gray-400"}
      >
        <ThumbsUp size={18} /> {ups}
      </button>
      <button
        disabled={busy}
        onClick={() => vote(-1)}
        className={userVote === 1 ? "text-red-500" : "text-gray-400"}
      >
        <ThumbsDown size={18} /> {downs}
      </button>
    </div>
  );
}
