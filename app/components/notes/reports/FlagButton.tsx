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
}
