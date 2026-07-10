"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { Trash2, Download, GripVertical, ArrowLeft } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Note } from "@/types";

type Props = {
  binder: { id: string; title: string; author_id: string };
  initialNotes: Partial<Note>[];
};

function SortableNote({
  note,
  index,
  onRemove,
}: {
  note: Partial<Note>;
  index: number;
  onRemove: () => void;
}) {
  const { ref, isDragging } = useSortable({ id: note.id!, index });

  return (
    <div
      ref={ref}
      className={`flex items-center gap-4 p-4 bg-paper-2 border border-paper-4 rounded-xl transition-all duration-200 ${
        isDragging ? "opacity-40 scale-95" : "opacity-100"
      }`}
    >
      <GripVertical className="h-5 w-5 text-ink-3 cursor-grab shrink-0" />
      <span className="text-ink-3 text-sm w-5 text-center shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{note.title}</p>
        <p className="text-sm text-ink-3">{note.semester}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 p-1.5 rounded-lg hover:bg-paper-4 text-ink-3 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function BinderClient({ binder, initialNotes }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<Partial<Note>[]>(initialNotes);
  const [downloading, setDownloading] = useState(false);

  async function deleteBinder() {
    if (!confirm("Are you sure you want to delete this binder?")) return;
    const db = createClient();
    const { error } = await db.from("binders").delete().eq("id", binder.id);
    if (error) {
      toast.error("Failed to delete binder.");
      return;
    }
    toast.success("Binder deleted.");
    router.push("/dashboard");
  }

  async function removeNote(noteId: string) {
    const db = createClient();
    const { error } = await db
      .from("binder_notes")
      .delete()
      .eq("binder_id", binder.id)
      .eq("note_id", noteId);

    if (error) {
      toast.error("Failed to remove note.");
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    toast.success("Note removed.");
  }

  async function saveOrder(reorderedNotes: Partial<Note>[]) {
    const db = createClient();
    const updates = reorderedNotes.map((note, index) => ({
      binder_id: binder.id,
      note_id: note.id,
      position: index + 1,
    }));
    await db
      .from("binder_notes")
      .upsert(updates, { onConflict: "binder_id,note_id" });
  }

  async function downloadPDF() {
    setDownloading(true);
    const tmp = toast.loading("Generating PDF...");
    try {
      const res = await fetch("/api/binders/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ binderId: binder.id }),
      });

      if (!res.ok) {
        toast.error("Failed to generate PDF.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${binder.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } finally {
      toast.dismiss(tmp);
      setDownloading(false);
    }
  }

  return (
    <div className="px-8 py-10 max-w-3xl mx-auto">
      {/* back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-ink-3 hover:text-ink-1 mb-6 transition-colors text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold cursor-pointer hover:text-ink-2 transition-colors">
            {binder.title}
          </h1>
          <p className="text-ink-3 mt-1">{notes.length} notes</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={deleteBinder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={downloadPDF}
            disabled={downloading || notes.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-terra-500 text-white hover:bg-terra-600 text-sm transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-paper-4 rounded-2xl text-ink-3">
          <p className="font-medium mb-1">No notes in this binder</p>
          <p className="text-sm">
            Add notes by dragging them from a module page
          </p>
        </div>
      ) : (
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) return;
            const { source, target } = event.operation;
            if (!source || !target) return;

            const oldIndex = notes.findIndex((n) => n.id === source.id);
            const newIndex = notes.findIndex((n) => n.id === target.id);
            if (oldIndex === newIndex) return;

            const reordered = [...notes];
            reordered.splice(oldIndex, 1);
            reordered.splice(newIndex, 0, notes[oldIndex]);
            setNotes(reordered);
            saveOrder(reordered);
          }}
        >
          <div className="flex flex-col gap-2">
            {notes.map((note, index) => (
              <SortableNote
                key={note.id}
                note={note}
                index={index}
                onRemove={() => removeNote(note.id!)}
              />
            ))}
          </div>
        </DragDropProvider>
      )}
    </div>
  );
}
