import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
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
import InsertComment from "./comments/InsertComment";
import CommentBody from "./comments/CommentBody";
import UserVote from "./UserVote";
import { timeAgo } from "@/utils/notes/time";
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
  created_at: string | Date;
  author_id: string;
  author_username: string;
};

export default async function NoteView({
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
}: NoteViewProps) {
  const db = createClient(await cookies());
  const [
    { data: votes },
    {
      data: { user },
    },
  ] = await Promise.all([
    db.from("notes_with_votes").select("*").eq("id", noteId).single(),
    db.auth.getUser(),
  ]);

  let myVote: 0 | 1 | -1 = 0;
  if (user) {
    const { data } = await db
      .from("votes")
      .select("value")
      .eq("note_id", noteId)
      .eq("user_id", user.id)
      .maybeSingle();
    myVote = (data?.value ?? 0) as 0 | 1 | -1;
  }

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

      <div className="flex items-center justify-between ">
        <h1 className="font-display text-4xl leading-tight text-ink-0">
          {title}
          <p>
            {timeAgo(created_at)} by {author_username}
          </p>
        </h1>
        <div className="flex items-center gap-3">
          <UserVote
            noteId={noteId}
            initialUps={Number(votes.ups)}
            initialDowns={Number(votes.downs)}
            initialUserVote={myVote}
          />
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
