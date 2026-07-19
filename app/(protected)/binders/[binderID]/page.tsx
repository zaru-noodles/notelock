import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import BinderClient from "@/app/components/notes/binders/BinderClient";
import Link from "next/link";
import { Note, Module } from "@/types";

type Props = {
  params: Promise<{
    binderID: string;
  }>;
};

async function getBinderData(binderId: string) {
  const db = createClient(await cookies());
  const userID = (await db.auth.getUser()).data.user?.id;
  if (!userID) return null;

  const { data, error } = await db
    .from("binders")
    .select(
      `
      id::text,
      title,
      author_id,
      modules ( moduleCode ),
      binder_notes (
        position,
        notes (
          id::text,
          title,
          semester,
          modules ( moduleCode )
        )
      )
    `,
    )
    .eq("id", binderId)
    .eq("author_id", userID)
    .single();

  if (error || !data) {
    console.log(error);
    return null;
  }
  return data;
}

export default async function BinderPage({ params }: Props) {
  const binderID = (await params).binderID;
  const binder = await getBinderData(binderID);

  if (!binder) {
    return (
      <>
        <p>Unable to fetch binder data</p>
        <Link
          href="/dashboard"
          className="cursor-pointer border border-honey-500 rounded-md w-10 px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
        >
          Back to dashboard
        </Link>
      </>
    );
  }

  const notes = binder.binder_notes
    .sort((a, b) => a.position - b.position)
    .map((bn) => bn.notes);

  return (
    <BinderClient
      binder={binder}
      initialNotes={notes as Partial<Note>[]}
      moduleCode={(binder.modules as Partial<Module>).moduleCode!}
    />
  );
}
