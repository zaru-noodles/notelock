// app/api/binders/download/route.ts
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { PDFDocument } from "pdf-lib";

export async function POST(request: Request) {
  const db = createClient(await cookies());
  const { binderId } = await request.json();

  const userID = (await db.auth.getUser()).data.user?.id;
  if (!userID) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // get notes in order
  const { data, error } = await db
    .from("binder_notes")
    .select(
      `
      position,
      notes (
        id,
        modules ( moduleCode )
      )
    `,
    )
    .eq("binder_id", binderId)
    .order("position", { ascending: true });

  if (error || !data)
    return Response.json({ error: "Failed to fetch notes" }, { status: 500 });

  // merge PDFs
  const merged = await PDFDocument.create();

  for (const bn of data) {
    const note = bn.notes[0];
    const moduleCode = note.modules[0].moduleCode;

    const { data: fileData, error: fileError } = await db.storage
      .from("notes")
      .download(`${moduleCode}/${note.id}.pdf`);

    if (fileError || !fileData) continue;

    const buffer = await fileData.arrayBuffer();
    const pdf = await PDFDocument.load(buffer);
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const mergedBuffer = await merged.save();

  return new Response(Buffer.from(mergedBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="binder.pdf"`,
    },
  });
}
