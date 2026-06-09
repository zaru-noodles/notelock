"use client";
import { useState, useEffect } from "react";
import { Note, type Module } from "@/types";
import Link from "next/link";
import { Search } from "lucide-react";
import NotePanel from "@/app/components/notes/NotePanel";

type Props = {
  params: Promise<{
    module: string;
  }>;
};

export default function ModulePage({ params }: Props) {
  const [moduleData, setModuleData] = useState<Module>();
  const [moduleError, setModuleError] = useState<string>("");
  const [notesData, setNotesData] = useState<Note[]>([]);
  const [notesError, setNotesError] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchModuleData = async () => {
      const moduleCode = (await params).module;
      const response = await fetch(`/api/modules?search=${moduleCode}&count=1`);

      if (!response.ok) {
        setModuleError(`Unable to retrieve data: Status: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.modules.length === 0) {
        setModuleError(`Invalid module code: ${moduleCode}`);
      }
      setModuleData(data.modules[0]);
    };

    const fetchNotesData = async () => {
      const moduleCode = (await params).module;
      const response = await fetch(
        `/api/notes/fetchNotesList?moduleCode=${moduleCode}&count=20`,
      );

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

    fetchModuleData();
    fetchNotesData();
  }, []);

  if (moduleError !== "") {
    return (
      <>
        <p>{moduleError}</p>
        <Link
          href="/dashboard"
          className="cursor-pointer border border-honey-500 rounded-md w-4 px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
        >
          Back to dashboard
        </Link>
      </>
    );
  }

  return (
    <div className="px-8 py-10 max-w-screen mx-4">
      {/* header */}
      <div className="mb-6 ml-6">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">
          {moduleData?.faculty} | {moduleData?.department}
        </p>
        <h1 className="text-5xl font-bold mb-0.5">{moduleData?.moduleCode}</h1>
        <p className="text-3xl text-ink-1">{moduleData?.title}</p>
      </div>

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
        <div className="flex flex-wrap content-start grow px-6 py-5 gap-4 mr-4 border-paper-4 border-l border-t border-r paper-bg">
          {notesError && <p>{notesError}</p>}
          {notesData.map((note: Note) => (
            <NotePanel key={note.id} noteData={note} />
          ))}
        </div>
      </div>
    </div>
  );
}
