"use client";

import { ArrowDownWideNarrow, Clock, Search } from "lucide-react";
import NotePanel from "@/app/components/notes/NotePanel";
import { useState } from "react";
import type { Note, NoteListSearchParams, Tag } from "@/types";
import { SortOrder } from "@/types";
import { SEMESTERS } from "@/utils/constants";
import { DragDropProvider } from "@dnd-kit/react";

type Props = {
  initialSearchParams: NoteListSearchParams;
  initialNotes: Note[];
  allTags: Tag[];
  showAuthor?: boolean;
};

export default function NotesPreview({
  initialSearchParams,
  initialNotes,
  allTags,
  showAuthor = true,
}: Props) {
  const [notesData, setNotesData] = useState<Note[]>(initialNotes);
  const [notesError, setNotesError] = useState<string>(
    initialNotes.length === 0 ? "No notes found" : "",
  );
  const [searchParams, setSearchParams] =
    useState<NoteListSearchParams>(initialSearchParams);

  const toggleTag = (tagId: number) => {
    let updated;
    if (searchParams.tagIds.includes(tagId)) {
      updated = {
        ...searchParams,
        tagIds: searchParams.tagIds.filter((id) => id !== tagId),
      };
    } else {
      if (searchParams.tagIds.length === 3) return;
      updated = { ...searchParams, tagIds: [...searchParams.tagIds, tagId] };
    }

    setSearchParams(updated);
    fetchNotesData(updated);
  };

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
    params.tagIds.forEach((id) => query.append("tagIds", id.toString()));
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
    <DragDropProvider>
      <div className="flex grow h-screen">
        <div className="mr-4 py-3 w-[17%]">
          {/* search bar */}
          <p className="mt-2 ml-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
            Search
          </p>
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
          <p className="mt-2 ml-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
            Sort by
          </p>
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
          <p className="mt-2 ml-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
            Semester
          </p>
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

          {/* tags input */}
          <p className="mt-2 ml-2 mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
            Tags (max 3)
          </p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = searchParams.tagIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-2.5 py-1.5 text-sm transition-all duration-200 ${
                    isSelected
                      ? "border-honey-500 bg-honey-300 text-paper-1 shadow-sh-1"
                      : "border-paper-4 bg-paper-3 text-ink-2 hover:border-honey-400 hover:bg-paper-2"
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
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
              isDraggable={true}
            />
          ))}
        </div>
      </div>
    </DragDropProvider>
  );
}
