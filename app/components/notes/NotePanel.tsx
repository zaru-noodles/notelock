import { Note, Tag } from "@/types";
import {
  DownloadIcon,
  EllipsisVerticalIcon,
  GraduationCap,
  Loader2,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useDraggable } from "@dnd-kit/react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

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
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
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
    }
    toast.success("Note deleted successfully");
    reloadNotes();
  }

  async function toggleFeatureNote() {
    const db = createClient();
    const { error } = await db.rpc("pin_note", {
      note_id: noteData.id,
      pinned: !noteData.pinned,
    });

    if (error) {
      toast.error(`Failed to feature note`);
      return;
    }
    toast.success("Note updated successfully!");
    reloadNotes();
  }

  return (
    <div
      ref={(node) => {
        panelRef.current = node;
        if (isDraggable) dragRef(node);
      }}
      className={`w-[22.5%] h-fit mx-3 my-3 p-4 bg-paper-2 hover:bg-paper-3 rounded-1x rounded-2xl transition-all duration-200 hover:shadow-sh-4 ${
        isDragging ? "scale-70 opacity-50" : "scale-100 opacity-100"
      }  ${menuOpen ? "z-50 relative" : ""} ${noteData.pinned ? "border-2 border-honey-300" : "border border-terra-100"}`}
      onClick={() => {
        router.push(
          `${window.location.origin}/notes/${noteData.moduleCode}/${noteData.id}`,
        );
      }}
    >
      {/* thumbnail */}
      <div className="flex justify-center items-center rounded-xl mb-1 h-44 overflow-hidden">
        {noteData.thumbnailUrl && (
          <div className="relative">
            {thumbnailLoading && (
              <div className="flex h-42 w-60 items-center justify-center rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}

            <Image
              className={`${thumbnailLoading ? "hidden" : "block"} h-42 w-auto rounded-lg object-contain shadow-sm`}
              width={240}
              height={240}
              alt="Missing thumbnail"
              loading="eager"
              src={noteData.thumbnailUrl}
              onLoad={() => setThumbnailLoading(false)}
            />
          </div>
        )}

        {!noteData.thumbnailUrl && <p>Missing thumbnail</p>}
      </div>

      <div className="flex justify-between items-start">
        <div className="flex w-[72%] my-1">
          {noteData.pinned && (
            <GraduationCap className="w-5 h-5 mr-0.5 -translate-y-0.5 text-honey-500 fill-honey-100" />
          )}
          <h2 className="font-semibold text-sm truncate">{noteData.title}</h2>
        </div>
        <p className="text-sm text-gray-700 whitespace-nowrap shrink-0 translate-y-0.5 tracking-tighter">
          {noteData.semester}
        </p>
      </div>

      <div className="flex items-center gap-1.5 -translate-x-1.5 overflow-hidden max-w-full whitespace-nowrap">
        {noteData.tags && noteData.tags.length > 0 ? (
          noteData.tags.map((tagData: Tag) => (
            <span
              key={tagData.id}
              className={`shrink min-w-0 rounded-full border border-paper-4 bg-paper-3 ${noteData.tags!.length <= 2 ? "px-2.5 py-1 text-[11px]" : "px-1.5 py-1 text-[10.5px]"} leading-4 tracking-[0.06em] text-ink-2 overflow-hidden whitespace-nowrap truncate`}
              title={tagData.label}
            >
              {tagData.label}
            </span>
          ))
        ) : (
          <span className="shrink min-w-0 rounded-full border border-paper-4 bg-paper-3 px-2.5 py-1 text-[10px] leading-4 tracking-[0.06em] text-ink-2 overflow-hidden whitespace-nowrap truncate">
            Untagged
          </span>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex items-center">
          {showAuthor && (
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={`/users/${noteData.userId}`}
              className={`mr-2.5 flex ${noteData.userAuthLevel === 1 && "font-bold"}`}
            >
              {noteData.userAuthLevel === 1 && (
                <GraduationCap className="w-5 h-5 mr-0.5" />
              )}
              {noteData?.username ?? "Deleted user"}
            </Link>
          )}

          {!showAuthor && (
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={`/notes/${noteData.moduleCode}`}
              className="mr-2.5"
            >
              {noteData.moduleCode}
            </Link>
          )}

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

              {noteData.featurePermission && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuOpen(false);
                    toggleFeatureNote();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 transition-colors duration-150 hover:bg-paper-2"
                >
                  {noteData.pinned ? "Unfeature note" : "Feature note"}
                </button>
              )}

              {!noteData.deletePermission && !noteData.featurePermission && (
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
