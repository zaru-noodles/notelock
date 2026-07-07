"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { Binder } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";

type Props = {
  initialBinder?: Binder[];
  selectedModuleCode: string;
};

export default function BinderPreview({
  initialBinder = [],
  selectedModuleCode,
}: Props) {
  const [binderData, setBinderData] = useState<Binder[]>(initialBinder);

  async function addBinder() {
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
  }

  return (
    <div className="w-[15%] py-3 -translate-y-3 sticky self-start top-20">
      <div className="flex justify-between align-bottom mb-2">
        <h2 className="ml-2 text-2xl font-semibold tracking-[0.08em] text-ink-2">
          Binders
        </h2>
        <button
          type="button"
          className="mr-2 rounded-full p-1 transition-colors duration-200 hover:bg-paper-4"
          onClick={async () => {
            const tmp = toast.loading("Creating binder...");
            await addBinder();
            toast.dismiss(tmp);
          }}
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
            <div key={binder.id} className="border border-paper-4 p-2 mb-2">
              <p>Binder: {binder.id}</p>
            </div>
          ))
        )}
      </div>

      <p className="text-sm py-1 pl-0.5 text-ink-3">
        Add notes by dragging them into your binders
      </p>
    </div>
  );
}
