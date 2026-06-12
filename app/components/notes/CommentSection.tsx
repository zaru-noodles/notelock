import { getComments } from "@/utils/notes/queries";
import { useActionState } from "react";
import { postComment } from "./comment-actions";

type Comments = {
  id: string;
  content: string;
  created_at: Date;
  author_id: string;
  author: { username: string };
};

export default function CommentSection({
  noteId,
  modulePath,
  comments,
  currentUserId,
}: {
  noteId: string;
  modulePath: string;
  comments: Comments[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(postComment, null);
  return <></>;
}
