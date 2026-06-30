import { NoteListSearchParams, SortOrder } from "@/types";
import { getNotesList } from "@/utils/notes/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const count = Number(searchParams.get("count") ?? "5");
  if (!Number.isInteger(count)) {
    return Response.json({ error: "count is not a number" }, { status: 400 });
  }

  const start = Number(searchParams.get("start") ?? "0");
  if (!Number.isInteger(start)) {
    return Response.json({ error: "start is not a number" }, { status: 400 });
  }

  const sortBy = searchParams.get("sortBy") ?? "";
  if (!Object.values(SortOrder).includes(sortBy as SortOrder)) {
    return Response.json({ error: "sortBy is invalid" }, { status: 400 });
  }

  const tagIds = (searchParams.getAll("tagIds") ?? []).map(Number);
  if (tagIds.length > 3) {
    return Response.json({ error: "Too many tagIds" }, { status: 400 });
  }

  for (const id of tagIds) {
    if (!Number.isInteger(id)) {
      return Response.json({ error: "tagId is not a number" }, { status: 400 });
    }
  }

  const tmp: NoteListSearchParams = {
    searchText: searchParams.get("searchText") ?? "",
    start: start,
    count: count,
    selectedModuleCode: searchParams.get("selectedModuleCode") ?? "",
    selectedSemester: searchParams.get("selectedSemester") ?? "",
    selectedAuthorID: searchParams.get("selectedAuthorID") ?? "",
    sortBy: sortBy as SortOrder,
    tagIds: tagIds,
  };
  const data = await getNotesList(tmp);

  if (data === null) {
    return Response.json(
      { error: "Unable to retrieve notes" },
      { status: 500 },
    );
  }

  return Response.json({ notes: data }, { status: 200 });
}
