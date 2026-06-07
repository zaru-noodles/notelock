import PdfViewer from "@/app/components/notes/PdfViewer/PdfViewer";
import NoteHeader from "@/app/components/notes/NoteHeader";
import { getNoteWithSignedUrl } from "@/utils/notes/queries";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    module: string;
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { module: moduleCode, id } = await params;
  const result = await getNoteWithSignedUrl(id);
  if (!result || moduleCode !== result.moduleCode) {
    notFound();
  }

  const { signedUrl, title, semester } = result;

  return (
    <>
      <NoteHeader
        moduleCode={moduleCode}
        signedUrl={signedUrl}
        title={title}
        semester={semester}
      />
      <PdfViewer url={signedUrl} />
    </>
  );
}
