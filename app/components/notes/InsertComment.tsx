"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { postComment } from "./comment-actions";
import { Comments } from "@/types/index";

export default function InsertComment({
  noteId,
  moduleCode,
  comments,
  currentUserId,
  currentUsername,
}: {
  noteId: string;
  moduleCode: string;
  comments: Comments[];
  currentUserId: string;
  currentUsername: string;
}) {
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (
      prevState: { error: string } | { ok: boolean } | null,
      formData: FormData,
    ) => {
      const result = await postComment(prevState, formData);
      if (result?.ok) {
        setContent("");
        setFocused(false);
      }
      return result;
    },
    null,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  const canPost = content.trim().length > 0 && !pending;

  return (
    <form action={formAction} className="flex gap-3 mb-8 mt-8">
      <input type="hidden" name="noteId" value={noteId} />
      <input type="hidden" name="moduleCode" value={moduleCode} />
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terra-200 text-sm font-medium text-paper-1">
        {currentUsername?.[0] ?? "Deleted user"}
      </div>
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          rows={1}
          maxLength={2000}
          required
          placeholder="Add a comment..."
          className="w-full resize-none border-b border-ink-4/40 bg-transparent pb-1 font-sans text-ink-1 placeholder:text-ink-3 transition focus:border-honey-1 focus:outline-none"
        />
        {focused && (
          <div className="flex items-center gap-3 mt-2">
            {state?.error && <p className="text-red-500">{state.error}</p>}
            <button
              type="button"
              onClick={() => {
                setContent("");
                setFocused(false);
              }}
              className="ml-auto rounded-full px-4 py-1.5 font-sans text-sm text-ink-2 hover:bg-ink-4/20 hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canPost}
              className="rounded-full bg-ink-1 px-4 py-1.5 font-sans text-sm font-medium text-paper-1 transition hover:bg-ink-2 disabled:cursor-not-allowed disabled:bg-ink-4/40 disabled:text-ink-3 hover:cursor-pointer"
            >
              {pending ? "Posting..." : "Comment"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
