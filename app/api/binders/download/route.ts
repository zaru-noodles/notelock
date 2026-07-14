// app/api/binders/download/route.ts
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { PDFDocument } from "pdf-lib";

const LAYOUTS: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  2: { cols: 2, rows: 1 },
  4: { cols: 2, rows: 2 },
  8: { cols: 4, rows: 2 },
};

export async function POST(request: Request) {
  const db = createClient(await cookies());
  const {
    binderId,
    pagesPerSheet = 4,
  }: { binderId: string; pagesPerSheet: number } = await request.json();

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
  const pdfBuffers: ArrayBuffer[] = [];
  for (const bn of data) {
    const note = bn.notes;
    const moduleCode = note.modules.moduleCode;

    const { data: fileData, error: fileError } = await db.storage
      .from("notes")
      .download(`${moduleCode}/${note.id}.pdf`);

    if (fileError || !fileData) continue;
    pdfBuffers.push(await fileData.arrayBuffer());
  }

  for (const bn of data) {
    const note = bn.notes;
    const moduleCode = note.modules.moduleCode;

    const { data: fileData, error: fileError } = await db.storage
      .from("notes")
      .download(`${moduleCode}/${note.id}.pdf`);

    if (fileError || !fileData) continue;
    pdfBuffers.push(await fileData.arrayBuffer());
  }

  if (pdfBuffers.length === 0) {
    return Response.json({ error: "No PDFs found" }, { status: 404 });
  }

  const mergedBuffer = await buildPDF(pdfBuffers, LAYOUTS[pagesPerSheet]);

  return new Response(Buffer.from(mergedBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="binder.pdf"`,
    },
  });
}

async function buildPDF(
  pdfBuffers: ArrayBuffer[],
  layout: { cols: number; rows: number },
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  const A4 = { width: 595, height: 842 };
  const { cols, rows } = layout;
  const perSheet = cols * rows;

  // collect all embedded pages
  const allPages = [];
  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const indices = pdf.getPageIndices();
    const embedded = await merged.embedPages(pdf.getPages()); // embed instead of copy
    allPages.push(
      ...embedded.map((embeddedPage, i) => ({
        embedded: embeddedPage,
        original: pdf.getPage(indices[i]),
      })),
    );
  }

  const cellWidth = A4.width / cols;
  const cellHeight = A4.height / rows;

  for (
    let sheetIndex = 0;
    sheetIndex < Math.ceil(allPages.length / perSheet);
    sheetIndex++
  ) {
    const sheet = merged.addPage([A4.width, A4.height]);
    const sheetPages = allPages.slice(
      sheetIndex * perSheet,
      (sheetIndex + 1) * perSheet,
    );

    sheetPages.forEach(({ embedded, original }, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * cellWidth;
      const y = A4.height - (row + 1) * cellHeight;

      const scale = Math.min(
        cellWidth / original.getWidth(),
        cellHeight / original.getHeight(),
      );

      const scaledWidth = original.getWidth() * scale;
      const scaledHeight = original.getHeight() * scale;

      sheet.drawPage(embedded, {
        x: x + (cellWidth - scaledWidth) / 2,
        y: y + (cellHeight - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
      });
    });
  }

  return merged.save();
}
