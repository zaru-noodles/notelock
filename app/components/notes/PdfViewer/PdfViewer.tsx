"use client";

export default function PdfViewer({ url }: { url: string }) {
  return (
    <div className="border border-paper-3 bg-paper-0 rounded-md shadow-sh-2">
      <iframe
        src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(url)}`}
        className="w-full h-screen border border-paper-3 rounded-md"
        title="PDF viewer"
      />
    </div>
  );
}
