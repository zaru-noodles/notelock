import NotesPreviewSmall from "@/app/components/notes/NotesPreviewSmall";
import { NoteListSearchParams, SortOrder } from "@/types";
import { getNotesList } from "@/utils/notes/queries";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";

const searchParams: NoteListSearchParams = {
  searchText: "",
  start: 0,
  count: 4,
  selectedModuleCode: "",
  selectedSemester: "",
  selectedAuthorID: "",
  sortBy: SortOrder.DownloadCount,
  tagIds: [],
};

async function getFavouriteModules(userID: string) {
  const db = createClient(await cookies());
  const { data, error } = await db
    .from("user_module")
    .select("modules!id(moduleCode)")
    .eq("user_id", userID)
    .overrideTypes<{ modules: { moduleCode: string } }[]>();

  if (error) {
    return [];
  }
  return data.map((entry) => entry.modules.moduleCode);
}

export default async function Dashboard() {
  const db = createClient(await cookies());
  const userID = (await db.auth.getUser()).data.user?.id;

  if (!userID) {
    return <p> Unable to fetch user data </p>;
  }

  const favouriteModules: string[] = await getFavouriteModules(userID);
  return (
    <div className="flex flex-col gap-4 px-6 py-5">
      <Link
        className="font-medium text-terra-500 hover:underline"
        href="/upload"
      >
        Upload your notes!
      </Link>
      <Link
        className="font-medium text-terra-500 hover:underline"
        href={`/users/${userID}`}
      >
        View your notes!
      </Link>

      <div>
        <h1 className="text-4xl font-bold">Favourite Modules</h1>
        {favouriteModules.length === 0 ? (
          <p>You have no favourite modules. Start adding some!</p>
        ) : (
          favouriteModules.map(async (moduleCode: string) => (
            <div key={moduleCode} className="mb-6">
              <h2 className="text-2xl font-semibold ml-6">{moduleCode}</h2>
              <NotesPreviewSmall
                initialSearchParams={{
                  ...searchParams,
                  selectedModuleCode: moduleCode,
                }}
                initialNotes={
                  (await getNotesList({
                    ...searchParams,
                    selectedModuleCode: moduleCode,
                  })) || []
                }
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
