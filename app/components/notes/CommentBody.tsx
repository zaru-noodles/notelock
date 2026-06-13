import { Comments } from "@/types/index";
import { deleteComment } from "./comment-actions";
import { Trash2 } from "lucide-react";

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
    <p>No comments yet, be the first!</p>
  ) : (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>
          {c.content}
          {c.author_id === currentUserId && (
            <form action={deleteComment}>
              <input type="hidden" name="noteId" value={noteId} />
              <input type="hidden" name="moduleCode" value={moduleCode} />
              <input type="hidden" name="commentId" value={c.id} />
              <button
                type="submit"
                className="text-ink-3 hover:text-ink-2 hover:cursor-pointer"
              >
                <Trash2 className="size-5" />
              </button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
