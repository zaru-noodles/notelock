import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { pdf } from "pdf-to-img";
import type { UploadRequest } from "@/types/api";
import { SEMESTERS } from "@/utils/constants";

export async function POST(req: Request) {
  const db = createClient(await cookies());
  const formData = await req.formData();
  const uploadReq: UploadRequest = {
    title: formData.get("title") as string,
    moduleId: formData.get("moduleId") as string,
    semester: formData.get("semester") as string,
    file: formData.get("file") as File,
    tags: [],
  };

  // parse tags
  try {
    uploadReq.tags = JSON.parse(formData.get("tags") as string);
  } catch {
    return Response.json({ error: "Unable to parse tags" }, { status: 400 });
  }

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

  // validate title
  if (uploadReq.title.length > 40) {
    return Response.json({ error: "Title is too long" }, { status: 400 });
  }

  // validate semester
  if (!SEMESTERS.includes(uploadReq.semester)) {
    return Response.json({ error: "Semester is invalid" }, { status: 400 });
  }

  // validate file type
  if (uploadReq.file.type !== "application/pdf") {
    return Response.json(
      { error: "Only PDF files are allowed" },
      { status: 400 },
    );
  }

  // validate and get module code
  const num = Number(uploadReq.moduleId);
  if (!Number.isInteger(num) || uploadReq.moduleId.trim() === "") {
    return Response.json({ error: "Invalid module ID" }, { status: 401 });
  }

  const { data: module, error: moduleError } = await db
    .from("modules")
    .select("moduleCode")
    .eq("id", num)
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
    .select("id::text")
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

  const arrayBuffer = await uploadReq.file.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuffer);
  const document = await pdf(pdfBuffer, { scale: 0.5 });
  const thumbnail = await document.getPage(1);

  // upload thumbnail
  if (thumbnail) {
    await db.storage
      .from("thumbnail")
      .upload(`${module.moduleCode}/${note.id}.png`, thumbnail, {
        contentType: "image/png",
        upsert: false,
      });
  }

  // update tags table
  await db.from("note_tag").insert(
    uploadReq.tags.map((id: number) => ({
      note_id: note.id,
      tag_id: id,
    })),
  );

  return Response.json(
    { message: "Note uploaded successfully", noteId: note.id },
    { status: 200 },
  );
}
