import { Folder, Pencil, Plus } from "lucide-react";
import type { Binder } from "@/types";
import { useDroppable } from "@dnd-kit/react";

type Props = {
  binder: Binder;
  editingId: string | null;
  editingTitle: string;
  setEditingId: (id: string | null) => void;
  setEditingTitle: (title: string) => void;
  updateBinderTitle: (binderId: string, title: string) => void;
};

export default function BinderListItem({
  binder,
  editingId,
  editingTitle,
  setEditingId,
  setEditingTitle,
  updateBinderTitle,
}: Props) {
  const { ref, isDropTarget } = useDroppable({ id: binder.id });

  return (
    <div
      className={`w-full pt-2 px-3 mb-2 rounded text-ink-2 border hover:bg-honey-200 duration-200 cursor-pointer flex flex-col justify-between transition-all ease-in-out ${
        isDropTarget
          ? "pb-10 border-honey-500 bg-honey-200"
          : "border-honey-300 bg-honey-100 pb-2"
      }`}
      ref={ref}
    >
      <div className="flex justify-between items-center">
        <div className="flex">
          <Folder className="h-4 w-4 text-ink-2 stroke-2 mr-1.5 translate-y-0.5" />
          {editingId === binder.id ? (
            <input
              autoFocus
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => updateBinderTitle(binder.id, editingTitle)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  updateBinderTitle(binder.id, editingTitle);
                if (e.key === "Escape") setEditingId(null);
              }}
              className="bg-transparent border-b border-terra-400 outline-none w-[75%]"
            />
          ) : (
            <p className="truncate">{binder.title}</p>
          )}
        </div>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setEditingId(binder.id);
            setEditingTitle(binder.title);
          }}
          className="shrink-0 rounded-4xl p-0.5 hover:bg-paper-3 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5 text-ink-2 stroke-2" />
        </button>
      </div>

      <div
        className={`flex justify-center items-center transition-all duration-200 ${
          isDropTarget ? "opacity-100 mt-10" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        <Plus className="h-7 w-7 text-honey-500" />
      </div>
    </div>
  );
}
