import NoteView from "@/app/components/notes/NoteView";
import { getNoteWithSignedUrl, getComments } from "@/utils/notes/queries";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    module: string;
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { module: moduleCode, id } = await params;

  const noteResult = await getNoteWithSignedUrl(id);
  if (!noteResult || moduleCode !== noteResult.moduleCode) {
    notFound();
  }
  const { signedUrl, title, semester, downloadUrl } = noteResult;

  const commentResult = await getComments(id);
  if (!commentResult) {
    notFound();
  }

  return (
    <>
      <NoteView
        moduleCode={moduleCode}
        signedUrl={signedUrl}
        title={title}
        semester={semester}
        downloadUrl={downloadUrl}
        noteId={id}
      />
    </>
  );
}
