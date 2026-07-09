"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { Binder } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";
import BinderListItem from "./BinderListItem";

type Props = {
  initialBinder?: Binder[];
  selectedModuleCode: string;
};

export default function BinderPreview({
  initialBinder = [],
  selectedModuleCode,
}: Props) {
  const [binderData, setBinderData] = useState<Binder[]>(initialBinder);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  async function addBinder() {
    const toastLoading = toast.loading("Creating binder...");
    try {
      const db = createClient();
      const { data: user } = await db.auth.getUser();

      if (!user.user) {
        toast.error("You must be logged in to create a binder.");
        return;
      }

      const { data: moduleData, error: moduleError } = await db
        .from("modules")
        .select("id")
        .eq("moduleCode", selectedModuleCode)
        .single();

      if (moduleError || !moduleData) {
        toast.error("Failed to create binder.");
        return;
      }

      const { data, error } = await db
        .from("binders")
        .insert({
          title: "New Binder",
          author_id: user.user.id,
          module_id: moduleData.id,
        })
        .select()
        .single();

      if (error || !data) {
        toast.error("Failed to create binder.");
        return;
      }

      setBinderData((prev) => [...prev, data]);
      toast.success("Binder created successfully.");
    } finally {
      toast.dismiss(toastLoading);
    }
  }

  async function updateBinderTitle(binderId: string, title: string) {
    const toastLoading = toast.loading("Editting binder...");
    try {
      const db = createClient();

      const { error } = await db
        .from("binders")
        .update({ title: title })
        .eq("id", binderId);

      if (error) {
        toast.error("Failed to edit binder.");
        return;
      }

      setBinderData((prev) =>
        prev.map((binder) =>
          binder.id === binderId ? { ...binder, title: title } : binder,
        ),
      );
      toast.success("Binder editted successfully.");
    } finally {
      toast.dismiss(toastLoading);
      setEditingId(null);
      setEditingTitle("");
    }
  }

  return (
    <div className="w-[15%] py-3 -translate-y-3 sticky self-start top-20">
      <div className="flex justify-between align-bottom mb-2">
        <h2 className="ml-2 text-3xl font-semibold tracking-[0.08em] text-ink-1">
          Binders
        </h2>
        <button
          type="button"
          className="mr-2 rounded-full p-1 transition-colors duration-200 hover:bg-paper-4"
          onClick={addBinder}
        >
          <Plus className="h-6 w-6 mb-0.5 text-ink-2 stroke-2" />
        </button>
      </div>

      <div className="flex flex-col w-full px-4 py-2 border border-paper-4 grid-bg text-sm h-[60vh] text-center justify-center">
        {binderData.length === 0 ? (
          <p>
            No binders yet. Create a binder to combine notes into one document.
          </p>
        ) : (
          binderData.map((binder) => (
            <BinderListItem
              key={binder.id}
              binder={binder}
              editingId={editingId}
              editingTitle={editingTitle}
              setEditingId={setEditingId}
              setEditingTitle={setEditingTitle}
              updateBinderTitle={updateBinderTitle}
            />
          ))
        )}
      </div>

      <p className="text-sm py-1 pl-0.5 text-ink-3">
        Add notes by dragging them into your binders
      </p>
    </div>
  );
}
