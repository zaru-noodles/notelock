"use client";
import { useState, useTransition } from "react";
import { Flag, X } from "lucide-react";
import toast from "react-hot-toast";
import { submitReport } from "./report-actions";
import {
  REPORT_REASONS,
  reportReasonLabel,
  type ReportReason,
} from "@/types/auth";

export function FlagButton({ noteId }: { noteId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("wrong_module");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setReason("wrong_module");
    setDetails("");
  }

  function submit() {
    startTransition(async () => {
      const res = await submitReport(noteId, reason, details);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Report submitted!");
        close();
      }
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="hover:cursor-pointer">
        <Flag size={24} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-0/40 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-ink-3 bg-paper-3 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-lg text-ink-1">
                Report this note
              </h2>
              <button
                onClick={close}
                className="text-ink-3 hover:cursor-pointer hover:text-ink-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-honey-100"
                  />
                  <span className="text-sm text-ink-2">
                    {reportReasonLabel(r)}
                  </span>
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Add a comment (optional)"
              className="mt-4 w-full border border-paper-4/60 bg-paper-1 p-3 font-mono text-sm text-ink-1 placeholder:text-ink-3 focus:border-honey-100 focus:outline-none"
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={submit}
                disabled={pending}
                className="rounded-pill bg-honey-200 px-4 py-2 font-mono text-sm text-ink-1 disabled:opacity-60 hover:cursor-pointer"
              >
                {pending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
