import { getNotesListData } from "@/utils/notes/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const moduleCode = searchParams.get("moduleCode") ?? "";
  const searchText = searchParams.get("search") ?? "";
  const selectedSemester = searchParams.get("semester") ?? "";
  const count = Number(searchParams.get("count"));
  const start = Number(searchParams.get("start") ?? "0");

  if (count === null) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!Number.isInteger(count)) {
    return Response.json({ error: "count is not a number" }, { status: 400 });
  }

  if (!Number.isInteger(start)) {
    return Response.json({ error: "start is not a number" }, { status: 400 });
  }

  const data = await getNotesListData(
    searchText,
    start,
    count,
    moduleCode,
    selectedSemester,
  );

  if (data === null) {
    return Response.json(
      { error: "Unable to retrieve notes" },
      { status: 500 },
    );
  }

  return Response.json({ notes: data }, { status: 200 });
}
