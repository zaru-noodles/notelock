import UploadForm from "@/app/components/notes/UploadForm";

export default function Upload() {
  return (
    <div className="justify-center m-13">
      <h2 className="text-5xl mb-0.5">Upload Notes</h2>
      <div className="flex h-[75vh] items-center justify-center">
        <UploadForm />
      </div>
    </div>
  );
}
