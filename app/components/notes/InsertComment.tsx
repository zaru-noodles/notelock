"use client";

import { useActionState } from "react";
import { postComment } from "./comment-actions";
import { Comments } from "@/types/index";

export default function InsertComment({
  noteId,
  moduleCode,
  comments,
  currentUserId,
}: {
  noteId: string;
  moduleCode: string;
  comments: Comments[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(postComment, null);
  return (
    <form action={formAction} className="mb-8">
      <input type="hidden" name="noteId" value={noteId} />
      <input type="hidden" name="moduleCode" value={moduleCode} />
      <textarea
        name="content"
        rows={3}
        maxLength={2000}
        required
        placeholder="Comment here!"
        className="w-full bg-paper-1 rounded-xl font-sans"
      />
      <div className="flex items-center gap-3">
        {state?.error && <p className="text-red-500">{state.error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
