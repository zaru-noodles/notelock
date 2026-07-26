"use client";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { dismissReport, deleteReportedNote } from "./report-actions";

export function HandleButtons({
  reportId,
  noteId,
  hasNote,
}: {
  reportId: string;
  noteId: string;
  hasNote: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function dismiss() {
    startTransition(async () => {
      const res = await dismissReport(reportId);
      res?.error ? toast.error(res.error) : toast.success("Report dismissed");
    });
  }

  function deleteNote() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteReportedNote(noteId);
      res?.error ? toast.error(res.error) : toast.success("Note deleted.");
    });
  }

  const buttonStyle =
    "rounded-pill px-3 py-1.5 font-mono text-xs transition-colors disabled:opacity-60 hover:cursor-pointer";
  return (
    <div className="shrink-0 flex items-center gap-2">
      {hasNote && (
        <button
          disabled={pending}
          onClick={deleteNote}
          className={`${buttonStyle} bg-red-400 text-white hover:bg-red-500`}
        >
          Delete note
        </button>
      )}
      <button
        disabled={pending}
        onClick={dismiss}
        className={`${buttonStyle} border border-ink-4 text-ink-3 hover:text-ink-1`}
      >
        Dismiss
      </button>
    </div>
  );
}
