"use client";
import { Download } from "lucide-react";
export default function DownloadButton({
  downloadUrl,
  noteId,
}: {
  downloadUrl: string;
  noteId: string;
}) {
  return (
    <a
      href={downloadUrl}
      download
      className="hover:text-ink-1"
      onClick={() => {
        fetch("/api/notes/download", {
          method: "POST",
          body: JSON.stringify({ noteId }),
          keepalive: true,
        });
      }}
    >
      <Download className="size-6" />
    </a>
  );
}
