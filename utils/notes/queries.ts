import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Module, Note, NoteListSearchParams, Tag } from "@/types/index";
import { NOTES_BUCKET, notePath } from "./storage";
import { Comments } from "@/types/index";

export async function getNoteWithSignedUrl(noteId: string) {
  const db = createClient(await cookies());

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: note, error: noteError } = await db
    .from("notes")
    .select(
      "id::text, title, semester, module_id, created_at, author_id, summary",
    )
    .eq("id", noteId)
    .single();

  if (noteError || !note) {
    return null;
  }

  const { data: moduleRow, error: moduleError } = await db
    .from("modules")
    .select("moduleCode")
    .eq("id", note.module_id)
    .single();

  const { data: author_user } = await db
    .from("user_profiles")
    .select("username")
    .eq("id", note.author_id)
    .single();

  if (moduleError || !moduleRow) {
    return null;
  }

  const moduleCode = moduleRow.moduleCode;

  const { data: urlData, error: urlError } = await db.storage
    .from(NOTES_BUCKET)
    .createSignedUrl(notePath(moduleCode, note.id), 3600);

  if (urlError) {
    return null;
  }

  const downloadUrl = `${urlData.signedUrl}&download=${encodeURIComponent(`${note.title}.pdf`)}`;

  return {
    ...note,
    ...author_user,
    moduleCode,
    signedUrl: urlData.signedUrl,
    downloadUrl,
  };
}

export async function getNotesList(params: NoteListSearchParams) {
  const db = createClient(await cookies());
  const serviceDB = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_PRIVATE_KEY!,
  );

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await db.rpc("search_notes_with_tags", {
    search_query: params.searchText,
    start_index: params.start,
    result_count: params.count,
    module_code: params.selectedModuleCode,
    selected_semester: params.selectedSemester,
    selected_author_id: params.selectedAuthorID,
    sort_by: params.sortBy,
    tag_ids: params.tagIds,
  });

  if (error || !data) {
    console.log(error);
    return null;
  }

  const now = Date.now();
  const expiredThumbnails = data.filter(
    (note: { thumbnailUrl: string; thumbnailExpiry: Date }) =>
      !note.thumbnailUrl ||
      !note.thumbnailExpiry ||
      new Date(note.thumbnailExpiry).getTime() < now,
  );

  if (expiredThumbnails.length > 0) {
    // generate signed URLs for thumbnails
    const { data: signedUrls } = await db.storage
      .from("thumbnail")
      .createSignedUrls(
        expiredThumbnails.map(
          (note: Note) => `${note.moduleCode}/${note.id}.png`,
        ),
        3600,
      );

    Promise.all(
      expiredThumbnails.map((note: Note, index: number) => {
        const signedUrl = signedUrls?.[index]?.signedUrl;
        if (!signedUrl) return;
        return serviceDB
          .from("notes")
          .update({
            thumbnail_url: signedUrl,
            thumbnail_expiry: new Date(Date.now() + 3599 * 1000).toISOString(),
          })
          .eq("id", note.id);
      }),
    );

    expiredThumbnails.map((note: Note, index: number) => {
      note.thumbnailUrl = signedUrls?.[index]?.signedUrl ?? undefined;
    });
  }

  return data;
}

export async function getComments(noteId: string) {
  const db = createClient(await cookies());
  const { data, error } = await db
    .from("comments")
    .select(
      "id::text, content, created_at, author_id, author:user_profiles(username)",
    )
    .eq("note_id", noteId)
    .order("created_at", { ascending: false })
    .overrideTypes<Comments[]>();

  if (error) {
    console.error("getComments failed:", error.message, error.code);
    return [];
  }

  return data;
}

export async function getTags(): Promise<Tag[] | null> {
  const client = createClient(await cookies());
  const { data, error } = await client.from("tags").select("id, label");

  if (error) return null;

  return data as Tag[];
}

export async function getFavouriteModules(userID: string) {
  const db = createClient(await cookies());
  const { data, error } = await db
    .from("user_module")
    .select("modules!id(*)")
    .eq("user_id", userID)
    .overrideTypes<{ modules: Module }[]>();

  if (error) return [];
  return data.map((entry) => entry.modules);
}
