import Link from "next/link";
import NotesPreview from "@/app/components/notes/NotesPreview";
import { Note, NoteListSearchParams, SortOrder } from "@/types";
import { getNotesList, getTags } from "@/utils/notes/queries";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{
    userID: string;
  }>;
};

const fetchUsername = async (userID: string) => {
  const db = createClient(await cookies());

  const { data, error } = await db
    .from("user_profiles")
    .select("username")
    .eq("id", userID)
    .single();

  if (error) return null;

  return data.username;
};

const fetchNoteData = async (searchParams: NoteListSearchParams) => {
  return ((await getNotesList(searchParams)) ?? []) as Note[];
};

export default async function UserPage({ params }: Props) {
  const userID = (await params).userID;
  const searchParams: NoteListSearchParams = {
    searchText: "",
    start: 0,
    count: 50,
    selectedModuleCode: "",
    selectedSemester: "",
    selectedAuthorID: userID,
    sortBy: SortOrder.DownloadCount,
    tagIds: [],
  };

  const [noteData, username, tagsData] = await Promise.all([
    fetchNoteData(searchParams),
    fetchUsername(userID),
    getTags(),
  ]);

  if (username === null || tagsData === null) {
    return (
      <>
        <p>Unable to fetch user data</p>
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
        <h1 className="text-5xl font-bold mb-0.5">{`${username}'s Notes`}</h1>
      </div>

      <NotesPreview
        initialSearchParams={searchParams}
        initialNotes={noteData}
        showAuthor={false}
        allTags={tagsData}
      />
    </div>
  );
}
