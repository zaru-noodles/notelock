import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractPdfText(bytes: Uint8Array, maxChars = 60000) {
  const pdf = await getDocument({ data: bytes }).promise;
  let output = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    output +=
      content.items.map((i) => ("str" in i ? i.str : "")).join(" ") + "\n\n";
    if (output.length > maxChars) break;
  }
  return output.slice(0, maxChars).trim();
}
