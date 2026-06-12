import NoteView from "@/app/components/notes/NoteView";
import { getNoteWithSignedUrl, getComments } from "@/utils/notes/queries";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    module: string;
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { module: moduleCode, id } = await params;

  const db = createClient(await cookies());
  const { data, error: authError } = await db.auth.getClaims();
  if (!data?.claims || authError) {
    return redirect("/");
  }

  const noteResult = await getNoteWithSignedUrl(id);
  if (!noteResult || moduleCode !== noteResult.moduleCode) {
    notFound();
  }
  const { signedUrl, title, semester, downloadUrl } = noteResult;

  const commentResult = await getComments(id);

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
        currentUserId={data.claims.sub}
      />
    </>
  );
}
