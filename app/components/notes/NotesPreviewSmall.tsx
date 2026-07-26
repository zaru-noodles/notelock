"use client";
import NotePanel from "@/app/components/notes/NotePanel";
import { useState } from "react";
import type { Note, NoteListSearchParams } from "@/types";

type Props = {
  initialSearchParams: NoteListSearchParams;
  initialNotes: Note[];
  showAuthor?: boolean;
};

export default function NotesPreview({
  initialSearchParams,
  initialNotes,
  showAuthor = true,
}: Props) {
  const [notesData, setNotesData] = useState<Note[]>(initialNotes);
  const [notesError, setNotesError] = useState<string>(
    initialNotes.length === 0 ? "No notes found" : "",
  );

  // update notes with new search params
  const fetchNotesData = async (params: NoteListSearchParams) => {
    setNotesError("");

    const query = new URLSearchParams({
      searchText: params.searchText,
      start: params.start.toString(),
      count: params.count.toString(),
      selectedModuleCode: params.selectedModuleCode,
      selectedSemester: params.selectedSemester,
      selectedAuthorID: params.selectedAuthorID,
      selectedAuthLevel: params.selectedAuthLevel.toString(),
      sortBy: params.sortBy,
    });
    const response = await fetch(`/api/notes/fetchNotesList?${query}`);

    if (!response.ok) {
      setNotesError(`Unable to retrieve data: Status: ${response.status}`);
      return;
    }

    const data = await response.json();

    if (data.notes.length === 0) {
      setNotesError(`No notes found`);
    }
    setNotesData(data.notes);
  };

  return (
    <div className="overflow-x-auto px-2 py-1">
      <div className="flex min-w-max flex-nowrap gap-4">
        {notesError && !notesData && <p>{notesError}</p>}
        {notesData.map((note: Note) => (
          <NotePanel
            key={note.id}
            noteData={note}
            reloadNotes={() => fetchNotesData(initialSearchParams)}
            showAuthor={showAuthor}
          />
        ))}
      </div>
    </div>
  );
}
