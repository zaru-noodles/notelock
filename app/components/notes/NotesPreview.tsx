"use client";

import { ArrowDownWideNarrow, Clock, Search } from "lucide-react";
import NotePanel from "@/app/components/notes/NotePanel";
import { useState } from "react";
import type { Note, NoteListSearchParams } from "@/types";
import { SortOrder } from "@/types";
import { SEMESTERS } from "@/utils/constants";

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
  const [searchParams, setSearchParams] =
    useState<NoteListSearchParams>(initialSearchParams);

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
    <div className="flex grow h-screen">
      <div className="mr-4 py-3 w-[17%]">
        {/* search bar */}
        <div className="flex w-full h-10 mb-3 px-4 py-2 rounded-2xl bg-paper-3 text-sm border border-transparent focus-within:border-terra-200 focus-within:bg-paper-2 transition-all duration-200">
          <Search className="h-5 w-5 text-ink-1 stroke-2" />
          <input
            type="text"
            value={searchParams.searchText}
            onChange={(e) => {
              const updated = { ...searchParams, searchText: e.target.value };
              setSearchParams(updated);
              if (e.target.value.length !== 1) fetchNotesData(updated);
            }}
            placeholder="Search notes..."
            className="rounded focus:outline-none w-full pl-2"
          />
        </div>

        {/* sortBy input */}
        <div className="flex w-[70%] h-10 mb-3 px-4 py-2 rounded-2xl bg-paper-3 text-sm border border-transparent focus-within:border-terra-200 focus-within:bg-paper-2 transition-all duration-200">
          <ArrowDownWideNarrow className="h-5 w-5 text-ink-1 stroke-2 shrink-0" />
          <select
            value={searchParams.sortBy}
            onChange={(e) => {
              const updated = {
                ...searchParams,
                sortBy: e.target.value as SortOrder,
              };
              setSearchParams(updated);
              fetchNotesData(updated);
            }}
            className="rounded focus:outline-none w-full pl-2 bg-transparent"
          >
            <option value={SortOrder.DownloadCount}>Most downloaded</option>
            <option value={SortOrder.Semester}>Semester</option>
          </select>
        </div>

        {/* semester input */}
        <div className="flex w-[56%] h-10 mb-3 px-4 py-2 rounded-2xl bg-paper-3 text-sm border border-transparent focus-within:border-terra-200 focus-within:bg-paper-2 transition-all duration-200">
          <Clock className="h-5 w-5 text-ink-1 stroke-2 shrink-0" />
          <select
            value={searchParams.selectedSemester}
            onChange={(e) => {
              const updated = {
                ...searchParams,
                selectedSemester: e.target.value,
              };
              setSearchParams(updated);
              fetchNotesData(updated);
            }}
            className="rounded focus:outline-none w-full pl-2 bg-transparent"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* notes display */}
      <div className="flex flex-wrap content-start grow px-6 py-5 gap-4 mr-4 w-[80%] border-paper-4 border-l border-t border-r paper-bg">
        {notesError && !notesData && <p>{notesError}</p>}
        {notesData.map((note: Note) => (
          <NotePanel
            key={note.id}
            noteData={note}
            reloadNotes={() => fetchNotesData(searchParams)}
            showAuthor={showAuthor}
          />
        ))}
      </div>
    </div>
  );
}
