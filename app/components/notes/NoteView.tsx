import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PdfViewer from "./PdfViewer/PdfViewer";
import DownloadButton from "./DownloadButton";
import InsertComment from "./comments/InsertComment";
import CommentBody from "./comments/CommentBody";
import UserVote from "./UserVote";
import { timeAgo } from "@/utils/notes/time";
import { Comments } from "@/types/index";
import { FlagButton } from "./reports/FlagButton";
import { AISummaryBox } from "./AISummaryBox";

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
  created_at: string | Date;
  author_id: string;
  author_username: string;
  initialUps: number;
  initialDowns: number;
  initialUserVote: 0 | 1 | -1;
  summary: string | null;
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
  created_at,
  author_id,
  author_username,
  initialUps,
  initialDowns,
  initialUserVote,
  summary,
}: NoteViewProps) {
  return (
    <div className="xl:w-[90%] mx-auto mt-5 w-full">
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
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-4xl leading-tight text-ink-0">
            {title}
          </h1>
          <p className="font-mono text-sm text-ink-3">
            <time dateTime={new Date(created_at).toISOString()}>
              {timeAgo(created_at)}
            </time>
            {" by "}
            <Link
              href={`/users/${author_id}`}
              className="text-ink-2 transition hover:text-ink-1 hover:underline hover:cursor-pointer"
            >
              {author_username}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <UserVote
            noteId={noteId}
            initialUps={initialUps}
            initialDowns={initialDowns}
            initialUserVote={initialUserVote}
          />
          <DownloadButton downloadUrl={downloadUrl} noteId={noteId} />
          {/*TODO: Report button for updating during permission */}
          <FlagButton noteId={noteId} />
        </div>
      </div>

      <AISummaryBox summary={summary} />

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
