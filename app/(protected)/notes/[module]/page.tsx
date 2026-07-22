import Link from "next/link";
import NotesPreview from "@/app/components/notes/NotesPreview";
import { Binder, Note, NoteListSearchParams, SortOrder } from "@/types";
import { getNotesList, getTags } from "@/utils/notes/queries";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ModuleFavouriteButton from "@/app/components/notes/ModuleFavouriteButton";

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

const fetchNoteData = async (searchParams: NoteListSearchParams) => {
  return ((await getNotesList(searchParams)) ?? []) as Note[];
};

const fetchFavouriteData = async (moduleCode: string) => {
  const db = createClient(await cookies());
  const userID = (await db.auth.getUser()).data.user?.id;

  if (!userID) return null;
  const { data, error } = await db
    .from("user_module")
    .select("*, modules!inner(moduleCode)")
    .eq("modules.moduleCode", moduleCode)
    .eq("user_id", userID);

  if (error) return null;
  return data.length > 0;
};

const fetchBinderData = async (moduleCode: string) => {
  const db = createClient(await cookies());
  const userID = (await db.auth.getUser()).data.user?.id;

  if (!userID) return null;
  const { data, error } = await db
    .from("binders")
    .select("id::text, title, modules!inner(moduleCode)")
    .eq("modules.moduleCode", moduleCode)
    .eq("author_id", userID);

  if (error) return null;
  return data as Binder[];
};

export default async function ModulePage({ params }: Props) {
  const moduleCode = (await params).module;
  const searchParams: NoteListSearchParams = {
    searchText: "",
    start: 0,
    count: 40,
    selectedModuleCode: moduleCode,
    selectedSemester: "",
    selectedAuthorID: "",
    sortBy: SortOrder.DownloadCount,
    tagIds: [],
  };

  const [moduleData, noteData, tagsData, isFavourite, binderData] =
    await Promise.all([
      fetchModuleData(moduleCode),
      fetchNoteData(searchParams),
      getTags(),
      fetchFavouriteData(moduleCode),
      fetchBinderData(moduleCode),
    ]);

  if (
    moduleData === null ||
    noteData === null ||
    tagsData === null ||
    isFavourite === null ||
    binderData === null
  ) {
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
      <div className="mb-6 ml-6 mr-15 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-2 uppercase tracking-widest mb-2">
            {moduleData?.faculty} | {moduleData?.department}
          </p>
          <h1 className="text-5xl font-bold mb-0.5">
            {moduleData?.moduleCode}
          </h1>
          <div className="flex items-end">
            <p className="text-3xl text-ink-1 mr-2">{moduleData?.title} </p>
            <p className="text-lg text-ink-2 tracking-widest">
              {noteData.length === 0
                ? "0 notes"
                : noteData.length === 1
                  ? "1 note"
                  : `${noteData[0].totalCount} notes`}
            </p>
          </div>
        </div>

        <ModuleFavouriteButton
          moduleID={moduleData.id}
          isFavourite={isFavourite}
        />
      </div>

      <NotesPreview
        initialSearchParams={searchParams}
        initialNotes={noteData}
        allTags={tagsData}
        initialBinder={binderData}
        showBinders={true}
      />
    </div>
  );
}
