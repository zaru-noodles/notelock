import { Note } from "@/types";
import { DownloadIcon, EllipsisVerticalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

type Props = {
  noteData: Note;
  reloadNotes: () => void;
  showAuthor: boolean;
};

export default function NotePanel({
  noteData,
  reloadNotes,
  showAuthor,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

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
      ref={panelRef}
      className="w-[21%] h-fit mx-4.5 my-3 p-4 bg-paper-2 hover:bg-paper-3 rounded-1x1 border border-terra-100 rounded-2xl transition-transform duration-200 hover:shadow-sh-4"
      onClick={() =>
        router.push(
          `${window.location.origin}/notes/${noteData.moduleCode}/${noteData.id}`,
        )
      }
    >
      {/* thumbnail */}
      <div className="flex justify-center items-center rounded-xl mb-3 h-44 overflow-hidden">
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

      <div className="flex justify-between items-start mb-0">
        <h2 className="font-semibold text truncate">{noteData.title}</h2>

        <p className="text-sm text-gray-700 whitespace-nowrap shrink-0 translate-y-0.5">
          {noteData.semester}
        </p>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex items-center">
          {showAuthor && (
            <p className="mr-2.5">{noteData?.username ?? "Deleted user"}</p>
          )}

          {!showAuthor && <p className="mr-2.5">{noteData.moduleCode}</p>}

          <p>{noteData.downloadCount}</p>
          <DownloadIcon className="h-4 w-4 text-gray-500 ml-0.5 mr-2.5" />
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
            <div className="absolute top-full w-40 overflow-hidden rounded border border-terra-100 bg-paper-1 shadow-sh-4 z-10">
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
