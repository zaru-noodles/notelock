import { Note } from "@/types";

type Props = {
  noteData: Note;
};

export default function NotePanel({ noteData }: Props) {
  return (
    <div className="w-80 h-auto p-4 bg-terra-50 rounded-1x1 border border-terra-200 rounded-2xl">
      <img className="w-auto h-40" alt="Note image here" />
      <div className="flex justify-between items-start mb-0">
        <h2 className="font-semibold text-lg">{noteData.title}</h2>

        <p className="text-sm text-gray-700">{noteData.semester}</p>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <p>{noteData?.users?.username ?? "Deleted user"}</p>

        <p>{noteData.download_count} downloads</p>
      </div>
    </div>
  );
}
