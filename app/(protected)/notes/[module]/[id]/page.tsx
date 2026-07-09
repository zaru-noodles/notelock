import NoteView from "@/app/components/notes/NoteView";
import { getNoteWithSignedUrl, getComments } from "@/utils/notes/queries";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/api/auth/current-user";

type Props = {
  params: Promise<{
    module: string;
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { module: moduleCode, id } = await params;
  const db = createClient(await cookies());

  const user = await getCurrentUser();
  if (!user) {
    return redirect("/");
  }

  const [noteResult, commentResult, { data: voteState }] = await Promise.all([
    getNoteWithSignedUrl(id),
    getComments(id),
    db.rpc("get_vote_state", { p_note_id: id }),
  ]);

  if (!noteResult || moduleCode !== noteResult.moduleCode) {
    notFound();
  }

  const {
    signedUrl,
    title,
    semester,
    downloadUrl,
    created_at,
    author_id,
    username,
  } = noteResult;

  const votes = voteState?.[0];

  return (
    <>
      <NoteView
        moduleCode={moduleCode}
        signedUrl={signedUrl}
        title={title}
        semester={semester}
        downloadUrl={downloadUrl}
        noteId={id}
        comments={commentResult}
        currentUserId={user.id}
        currentUsername={user.username}
        created_at={created_at}
        author_id={author_id}
        author_username={username}
        initialUps={Number(votes?.ups ?? 0)}
        initialDowns={Number(votes?.downs ?? 0)}
        initialUserVote={(votes?.user_vote ?? 0) as 0 | 1 | -1}
      />
    </>
  );
}
