import Link from "next/link";
import NotesPreviewSmall from "../notes/NotesPreviewSmall";
import { getFavouriteModules, getNotesList } from "@/utils/notes/queries";
import { Module, NoteListSearchParams, SortOrder } from "@/types";

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

export default async function Favourites({ userID }: { userID: string }) {
  const favouriteModules: Module[] = await getFavouriteModules(userID);

  return (
    <div className="mb-8">
      <h2 className="text-5xl font-bold mb-2">Favourites</h2>

      {favouriteModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-paper-4 rounded-2xl">
          <p className="text-gray-500 mb-3">
            You have no favourite modules yet
          </p>
          <Link
            href="/modules"
            className="text-sm font-medium text-terra-500 hover:underline"
          >
            Browse modules to get started
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {favouriteModules.map(
            async (module: { moduleCode: string; title: string }) => (
              <div key={module.moduleCode}>
                <div className="flex items-baseline justify-between mx-8">
                  <div className="flex gap-2 items-baseline">
                    <h3 className="text-2xl font-bold">{module.moduleCode}</h3>
                    <p className=" text-gray-500">{module.title}</p>
                  </div>
                  <Link
                    href={`/notes/${module.moduleCode}`}
                    className=" text-terra-500 hover:underline shrink-0"
                  >
                    View all
                  </Link>
                </div>
                <NotesPreviewSmall
                  initialSearchParams={{
                    ...searchParams,
                    selectedModuleCode: module.moduleCode,
                  }}
                  initialNotes={
                    (await getNotesList({
                      ...searchParams,
                      selectedModuleCode: module.moduleCode,
                    })) || []
                  }
                />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
