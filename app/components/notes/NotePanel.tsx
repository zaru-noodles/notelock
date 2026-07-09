import { Note, Tag } from "@/types";
import {
  DownloadIcon,
  EllipsisVerticalIcon,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useDraggable } from "@dnd-kit/react";
import Image from "next/image";

type Props = {
  noteData: Note;
  reloadNotes: () => void;
  showAuthor: boolean;
  isDraggable?: boolean;
};

export default function NotePanel({
  noteData,
  reloadNotes,
  showAuthor,
  isDraggable = false,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { ref: dragRef, isDragging } = useDraggable({
    id: noteData.id,
  });

  /** close the dropdown menu when clicking outside of it */
  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  async function deleteNote() {
    const response = await fetch(`/api/notes/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: noteData.id,
        moduleCode: noteData.moduleCode,
      }),
    });

    if (!response.ok) {
      toast.error(`Unable to delete note: Status ${response.status}`);
      return;
    } else {
      toast.success("Note deleted successfully");
      reloadNotes();
    }
  }

  return (
    <div
      ref={(node) => {
        panelRef.current = node;
        if (isDraggable) dragRef(node);
      }}
      className={`w-[22.5%] h-fit mx-3 my-3 p-4 bg-paper-2 hover:bg-paper-3 rounded-1x1 border border-terra-100 rounded-2xl transition-all duration-200 hover:shadow-sh-4 ${
        isDragging ? "scale-70 opacity-50" : "scale-100 opacity-100"
      }  ${menuOpen ? "z-50 relative" : ""}`}
      onClick={() =>
        router.push(
          `${window.location.origin}/notes/${noteData.moduleCode}/${noteData.id}`,
        )
      }
    >
      {/* thumbnail */}
      <div className="flex justify-center items-center rounded-xl mb-1 h-44 overflow-hidden">
        {noteData.thumbnailUrl && (
          <Image
            className="h-42 w-auto object-contain rounded-lg shadow-sm"
            width={240}
            height={240}
            alt="Missing thumbnail"
            loading="eager"
            src={noteData.thumbnailUrl}
          />
        )}

        {!noteData.thumbnailUrl && <p>Missing thumbnail</p>}
      </div>

      <div className="flex justify-between items-start">
        <h2 className="font-semibold text truncate">{noteData.title}</h2>

        <p className="text-sm text-gray-700 whitespace-nowrap shrink-0 translate-y-0.5">
          {noteData.semester}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 -translate-x-1.5">
        {noteData.tags && noteData.tags.length > 0 ? (
          noteData.tags.map((tagData: Tag) => (
            <span
              key={tagData.id}
              className="rounded-full border border-paper-4 bg-paper-3 px-2.5 py-1 text-[11px] tracking-[0.06em] text-ink-2"
            >
              {tagData.label}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-paper-4 bg-paper-3 px-2.5 py-1 text-[11px] tracking-[0.06em] text-ink-2">
            Untagged
          </span>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex items-center">
          {showAuthor && (
            <p className="mr-2.5">{noteData?.username ?? "Deleted user"}</p>
          )}

          {!showAuthor && <p className="mr-2.5">{noteData.moduleCode}</p>}

          <p>{noteData.downloadCount}</p>
          <DownloadIcon className="h-4 w-4 text-gray-500 ml-0.5 mr-2.5" />

          <p>{noteData.upvoteCount}</p>
          <ThumbsUp className="h-3.5 w-3.5 text-gray-500 ml-0.5 mr-2.5" />

          <p>{noteData.downvoteCount}</p>
          <ThumbsDown className="h-3.5 w-3.5 text-gray-500 ml-0.5 mr-2.5" />
        </div>

        {/* dropdown menu */}
        <div className="relative">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            className="rounded-full p-1 transition-colors duration-200 hover:bg-paper-4"
          >
            <EllipsisVerticalIcon className="h-5 w-5 text-gray-900" />
          </button>

          {menuOpen && (
            <div className="absolute top-full w-40 overflow-hidden rounded border border-terra-100 bg-paper-1 shadow-sh-4 z-50">
              {noteData.deletePermission && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuOpen(false);
                    deleteNote();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 transition-colors duration-150 hover:bg-paper-2"
                >
                  Delete note
                </button>
              )}

              {!noteData.deletePermission && (
                <p className="w-full px-4 py-2 text-left text-sm text-gray-500">
                  No actions available
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
