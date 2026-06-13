import Link from "next/link";
import NotesPreview from "@/app/components/notes/NotesPreview";
import { Note, NoteListSearchParams } from "@/types";
import { getNotesList } from "@/utils/notes/queries";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{
    module: string;
  }>;
};

const fetchModuleData = async (moduleCode: string) => {
  const db = createClient(await cookies());

  const { data, error } = await db
    .from("modules")
    .select("*")
    .eq("moduleCode", moduleCode)
    .single();

  if (error) return null;

  return data;
};

const fetchNoteData = async (moduleCode: string) => {
  const params: NoteListSearchParams = {
    searchText: "",
    start: 0,
    count: 50,
    selectedModuleCode: moduleCode,
    selectedSemester: "",
    selectedAuthorID: "",
  };
  return ((await getNotesList(params)) ?? []) as Note[];
};

export default async function ModulePage({ params }: Props) {
  const moduleCode = (await params).module;
  const moduleData = await fetchModuleData(moduleCode);
  const noteData = await fetchNoteData(moduleCode);

  if (moduleData === null) {
    return (
      <>
        <p>Unable to fetch module data</p>
        <Link
          href="/dashboard"
          className="cursor-pointer border border-honey-500 rounded-md w-10 px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
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

      <NotesPreview moduleCode={moduleCode} initialNotes={noteData} />
    </div>
  );
}
