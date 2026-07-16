// app/api/binders/download/route.ts
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { degrees, PDFDocument } from "pdf-lib";

const LAYOUTS: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  2: { cols: 1, rows: 2 },
  4: { cols: 2, rows: 2 },
  8: { cols: 2, rows: 4 },
};

export async function POST(request: Request) {
  const db = createClient(await cookies());
  const {
    binderId,
    pagesPerSheet = 1,
  }: { binderId: string; pagesPerSheet: number } = await request.json();

  if (!(pagesPerSheet in LAYOUTS))
    return Response.json({ error: "Invalid pages per sheet" }, { status: 400 });

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
    const embedded = await merged.embedPages(pdf.getPages());
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
      const w = original.getWidth();
      const h = original.getHeight();
      const isLandscape = w > h;

      const col = index % cols;
      const row =
        isLandscape !== (cols === 2)
          ? Math.floor(index / cols)
          : rows - Math.floor(index / cols) - 1;
      const x = col * cellWidth;
      const y = A4.height - (row + 1) * cellHeight;

      let drawWidth: number;
      let drawHeight: number;

      if (isLandscape !== (cols !== rows)) {
        const scale = Math.min(cellWidth / h, cellHeight / w);
        drawWidth = h * scale;
        drawHeight = w * scale;
      } else {
        const scale = Math.min(cellWidth / w, cellHeight / h);
        drawWidth = w * scale;
        drawHeight = h * scale;
      }

      if (isLandscape !== (cols !== rows)) {
        sheet.drawPage(embedded, {
          x: x + (cellWidth - drawWidth) / 2 + drawWidth,
          y: y + (cellHeight - drawHeight) / 2,
          width: drawHeight,
          height: drawWidth,
          rotate: degrees(90),
        });
      } else {
        sheet.drawPage(embedded, {
          x: x + (cellWidth - drawWidth) / 2,
          y: y + (cellHeight - drawHeight) / 2,
          width: drawWidth,
          height: drawHeight,
        });
      }
    });
  }

  return merged.save();
}
