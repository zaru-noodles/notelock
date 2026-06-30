import UploadForm from "@/app/components/notes/UploadForm";
import { getTags } from "@/utils/notes/queries";

export default async function Upload() {
  const tags = await getTags();

  return (
    <div className="justify-center m-13">
      <h2 className="text-5xl mb-0.5">Upload Notes</h2>
      <div className="flex h-[75vh] items-center justify-center">
        <UploadForm tags={tags} />
      </div>
    </div>
  );
}
