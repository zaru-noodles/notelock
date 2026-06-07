import { Download } from "lucide-react";

type NoteHeaderProps = {
  moduleCode: string;
  title: string;
  semester: string;
  signedUrl: string;
};

export default function NoteHeader({
  moduleCode,
  title,
  semester,
  signedUrl,
}: NoteHeaderProps) {
  return (
    <header>
      <p>{moduleCode}</p>

      <div></div>
    </header>
  );
}
