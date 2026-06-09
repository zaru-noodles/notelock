"use client";

import { Search } from "lucide-react";
import NotePanel from "@/app/components/notes/NotePanel";
import { useState } from "react";
import type { Note } from "@/types";

type Props = {
  moduleCode: string;
  initialNotes: Note[];
};

export default function NotesPreview({ moduleCode, initialNotes }: Props) {
  const [notesData, setNotesData] = useState<Note[]>(initialNotes);
  const [notesError, setNotesError] = useState<string>(
    initialNotes.length == 0 ? "No notes found" : "",
  );
  const [search, setSearch] = useState<string>("");

  return (
    <div className="flex grow h-screen">
      <div className="mr-4 py-3 w-[17%]">
        {/* search bar */}
        <div className="flex w-full h-10 mb-3 px-4 py-2 rounded-2xl bg-paper-3 text-sm placeholder-gray-600 border border-transparent focus:outline-none focus:border-terra-200 focus:bg-paper-2 transition-all duration-200">
          <Search className="h-5 w-5 text-ink-1 stroke-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="rounded focus:outline-none w-full pl-2"
          />
        </div>
      </div>

      {/* notes display */}
      <div className="flex grow px-6 py-5 gap-4 mr-4 border-paper-4 border-l border-t border-r paper-bg">
        {notesError && <p>{notesError}</p>}
        {notesData.map((note: Note) => (
          <NotePanel key={note.id} noteData={note} />
        ))}
      </div>
    </div>
  );
}
