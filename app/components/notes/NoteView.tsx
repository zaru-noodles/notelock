import Link from "next/link";
import {
  Bookmark,
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  Flag,
} from "lucide-react";
import PdfViewer from "./PdfViewer/PdfViewer";
import DownloadButton from "./DownloadButton";
import InsertComment from "./InsertComment";
import CommentBody from "./CommentBody";
import { Comments } from "@/types/index";

type NoteViewProps = {
  moduleCode: string;
  title: string;
  semester: string;
  signedUrl: string;
  downloadUrl: string;
  noteId: string;
  comments: Comments[];
  currentUserId: string;
  currentUsername: string;
};

export default function NoteView({
  moduleCode,
  title,
  semester,
  signedUrl,
  downloadUrl,
  noteId,
  comments,
  currentUserId,
  currentUsername,
}: NoteViewProps) {
  return (
    <div className="xl:w-[90%] mx-auto mt-5">
      <Link
        href={`/notes/${moduleCode}`}
        className="inline-flex items-center font-mono text-sm text-ink-3 hover:text-ink-1"
      >
        <ChevronLeft className="size-4" /> Back to {moduleCode}
      </Link>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-pill border border-ink-4 px-3 py-1 font-mono text-xs text-ink-2">
            {moduleCode}
          </span>
          <span className="rounded-pill border border-ink-4 px-3 py-1 font-mono text-xs text-ink-2">
            {semester}
          </span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-pill border border-ink-4 bg-paper-0 px-4 py-2 text-sm font-medium text-ink-1 shadow-sh-1 hover:bg-paper-1"
        >
          <Star className="size-4" /> Favourite
        </button>
      </div>

      <div className="flex items-center justify-between ">
        <h1 className="font-display text-4xl leading-tight text-ink-0">
          {title}
        </h1>

        <div className="flex items-center gap-3">
          <DownloadButton downloadUrl={downloadUrl} noteId={noteId} />
          {/*TODO: Report button for updating during permission */}
          <button className="hover:text-ink-1">
            <Flag className="size-6" />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-ink-4 shadow-sh-2">
        <PdfViewer url={signedUrl} />
      </div>
      <InsertComment
        noteId={noteId}
        moduleCode={moduleCode}
        comments={comments}
        currentUserId={currentUserId}
        currentUsername={currentUsername}
      />
      <CommentBody
        noteId={noteId}
        moduleCode={moduleCode}
        comments={comments}
        currentUserId={currentUserId}
      />
    </div>
  );
}
