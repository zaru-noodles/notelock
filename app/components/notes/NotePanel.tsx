import { Note } from "@/types";
import { useRouter, usePathname } from "next/navigation";

type Props = {
  noteData: Note;
};

export default function NotePanel({ noteData }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="w-80 h-fit mx-6 my-2 p-4 bg-paper-2 hover:bg-paper-3 rounded-1x1 border border-terra-100 rounded-2xl transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4"
      onClick={() => router.push(`${pathname}/${noteData.id}`)}
    >
      <img className="w-auto h-40" alt="Note image here" />
      <div className="flex justify-between items-start mb-0">
        <h2 className="font-semibold text-lg">{noteData.title}</h2>

        <p className="text-sm text-gray-700">{noteData.semester}</p>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <p>{noteData?.user_profiles?.username ?? "Deleted user"}</p>

        <p>{noteData.download_count} downloads</p>
      </div>
    </div>
  );
}
