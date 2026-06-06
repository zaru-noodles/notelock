import { Note } from "@/types";

type Props = {
  noteData: Note;
};

export default function NotePanel({ noteData }: Props) {
  return (
    <div className="w-80 h-150 p-1 bg-terra-100 rounded-1x1 border border-terra-200">
      <img className="w-auto h-40" alt="Note image here" />
      <div className="flex justify-between items-start mb-2">
        <h2 className="font-semibold text-lg">{noteData.title}</h2>

        <p className="text-sm text-gray-700">{noteData.semester}</p>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <p>{noteData.users.username}</p>

        <p>{noteData.download_count} downloads</p>
      </div>
    </div>
  );
}
