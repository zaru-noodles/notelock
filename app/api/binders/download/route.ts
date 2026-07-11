// app/api/binders/download/route.ts
import { Note } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { PDFDocument } from "pdf-lib";

export async function POST(request: Request) {
  const db = createClient(await cookies());
  const { binderId } = await request.json();

  // get notes in order
  const { data, error } = await db
    .from("binder_notes")
    .select(
      `
      position,
      notes (
        id::text,
        modules ( moduleCode )
      )
    `,
    )
    .eq("binder_id", binderId)
    .order("position", { ascending: true })
    .overrideTypes<
      {
        position: number;
        notes: { id: string; modules: { moduleCode: string } };
      }[]
    >();

  if (error || !data)
    return Response.json({ error: "Failed to fetch notes" }, { status: 500 });

  // merge PDFs
  const merged = await PDFDocument.create();

  for (const bn of data) {
    const note = bn.notes;
    const moduleCode = note.modules.moduleCode;

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
