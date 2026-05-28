import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { UploadRequest } from "@/types/api";

export async function POST(req: Request) {
  const db = createClient(await cookies());
  const formData = await req.formData();
  const uploadReq: UploadRequest = {
    title: formData.get("title") as string,
    moduleId: formData.get("moduleId") as string,
    semester: formData.get("semester") as string,
    file: formData.get("file") as File,
  };

  // get user
  const {
    data: { user },
    error: userError,
  } = await db.auth.getUser();

  // check if all fields exist
  if (
    !uploadReq.file ||
    !uploadReq.title ||
    !uploadReq.moduleId ||
    !uploadReq.semester
  ) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  // validate file type
  if (uploadReq.file.type !== "application/pdf") {
    return Response.json(
      { error: "Only PDF files are allowed" },
      { status: 400 },
    );
  }

  // validate and get module code
  const { data: module, error: moduleError } = await db
    .from("modules")
    .select("moduleCode")
    .eq("id", uploadReq.moduleId)
    .single();

  if (moduleError || !module) {
    return Response.json({ error: "Module not found" }, { status: 401 });
  }

  // insert into note table
  const { data: note, error: noteError } = await db
    .from("notes")
    .insert({
      title: uploadReq.title,
      module_id: uploadReq.moduleId,
      semester: uploadReq.semester,
      author_id: user!.id,
    })
    .select()
    .single();

  if (noteError) {
    return Response.json({ error: "Unable to create note" }, { status: 500 });
  }

  // upload file
  const { error: uploadError } = await db.storage
    .from("notes")
    .upload(`${module.moduleCode}/${note.id}.pdf`, uploadReq.file, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    await db.from("notes").delete().eq("id", note.id);
    return Response.json({ error: "Unable to upload note" }, { status: 500 });
  }

  return Response.json(
    { message: "Note uploaded successfully", noteId: note.id },
    { status: 200 },
  );
}
