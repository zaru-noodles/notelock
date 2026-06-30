import UploadForm from "@/app/components/notes/UploadForm";
import { Tag } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

async function getTags(): Promise<Tag[] | null> {
  const client = createClient(await cookies());
  const { data, error } = await client.from("tags").select("id, label");

  if (error) return null;

  return data as Tag[];
}

export default async function Upload() {
  const tags = await getTags();

  return (
    <div className="justify-center m-13">
      <h2 className="text-5xl mb-0.5">Upload Notes</h2>
      <div className="flex h-[75vh] items-center justify-center">
        <UploadForm tags={tags} />
      </div>
    </div>
  );
}
