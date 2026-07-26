import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Binder } from "@/types";
import { Folder } from "lucide-react";

type DashboardBinder = Binder & {
  modules: { moduleCode: string };
  binder_notes: { note_id: string }[];
};

export default async function Binders({ userID }: { userID: string }) {
  const db = createClient(await cookies());
  const { data, error } = await db
    .from("binders")
    .select("id::text, title, modules!inner(moduleCode), binder_notes(note_id)")
    .eq("author_id", userID)
    .order("title", { ascending: true })
    .overrideTypes<DashboardBinder[]>();

  const binders = error || !data ? [] : data;

  return (
    <div className="pb-5 mb-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl font-bold">Binders</h2>
          <p className="text-lg text-ink-2 mb-4">
            Manage your saved binder collections and open them for review
          </p>
        </div>
        <div className="text-lg text-ink-2 mb-5 mr-10">
          {binders.length} binder{binders.length === 1 ? "" : "s"}
        </div>
      </div>

      {binders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-paper-4 rounded-2xl">
          <p className="text-ink-2 mb-3">
            You have no binders yet. <br /> Browse notes to create your first
            binder{" "}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {binders.map((binder) => (
            <Link
              key={binder.id}
              href={`/binders/${binder.id}`}
              className="group block rounded-3xl border border-paper-4 bg-paper-3 p-6 transition-shadow duration-200 hover:shadow-sh-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex">
                  <Folder className="mr-3 mt-0.5" />
                  <h3 className="text-2xl font-semibold text-ink-1">
                    {binder.title}
                  </h3>
                  <p className="ml-2 mt-1.5 text-ink-3">
                    {binder.modules?.moduleCode ?? "Unknown module"}
                  </p>
                </div>

                <div className="rounded-full bg-paper-2 px-3 py-1 text-sm text-ink-2">
                  {binder.binder_notes?.length ?? 0} note
                  {binder.binder_notes?.length === 1 ? "" : "s"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
