import { Comments } from "@/types/index";
import { deleteComment } from "./comment-actions";
import { Trash2 } from "lucide-react";
import { timeAgo } from "@/utils/notes/time";

export default function CommentBody({
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
  return comments.length === 0 ? (
    <p className="py-8 text-center text-sm text-ink-3">
      No comments yet, be the first!
    </p>
  ) : (
    <ul className="divide-y divide-ink-4/15">
      {comments.map((c) => (
        <li key={c.id} className="animate-[comment-in_0.50s_ease-out] py-4">
          <div className="flex items-baseline gap-2">
            <span className="min-w-0 truncate font-medium text-ink-1">
              {c.author?.username ?? "Deleted user"}
            </span>
            <span className="shrink-0 text-xs text-ink-3">
              {timeAgo(c.created_at)}
            </span>
            {c.author_id === currentUserId && (
              <form action={deleteComment} className="ml-auto shrink-0">
                <input type="hidden" name="noteId" value={noteId} />
                <input type="hidden" name="moduleCode" value={moduleCode} />
                <input type="hidden" name="commentId" value={c.id} />
                <button
                  type="submit"
                  className="text-ink-3 hover:text-ink-2 hover:cursor-pointer transition-colors"
                >
                  <Trash2 className="size-5" />
                </button>
              </form>
            )}
          </div>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-ink-2">
            {c.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
