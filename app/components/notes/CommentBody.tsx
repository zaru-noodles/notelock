import { Comments } from "@/types/index";

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
        <li key={c.id}>{c.content}</li>
      ))}
    </ul>
  );
}
