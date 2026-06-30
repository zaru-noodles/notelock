"use client";
import type { UploadRequest } from "@/types/api";
import Link from "next/link";
import { useState } from "react";
import ModuleInput from "./inputs/ModuleInput";
import SemesterInput from "./inputs/SemesterInput";
import { Tag } from "@/types";

type Props = {
  tags: Tag[] | null;
};

export default function UploadForm({ tags }: Props) {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadReq, setUploadReq] = useState<UploadRequest>({
    title: "",
    moduleId: "",
    semester: "",
    file: null,
    tags: [],
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name == "file") {
      const files = e.target.files;
      if (files) setUploadReq({ ...uploadReq, [e.target.name]: files[0] });
    } else {
      setUploadReq({ ...uploadReq, [e.target.name]: e.target.value });
    }
  }

  function toggleTag(id: number) {
    if (uploadReq.tags.includes(id)) {
      setUploadReq({
        ...uploadReq,
        tags: uploadReq.tags.filter((x: number) => x !== id),
      });
    } else {
      setUploadReq({ ...uploadReq, tags: [...uploadReq.tags, id] });
    }
  }

  async function handleUpload(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");

    if (uploadReq.file === null) {
      setError("File not found");
      return;
    }

    if (uploadReq.file.type !== "application/pdf") {
      setError(`Invalid file type: ${uploadReq.file.type}`);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", uploadReq.file!);
    formData.append("title", uploadReq.title);
    formData.append("moduleId", uploadReq.moduleId);
    formData.append("semester", uploadReq.semester);
    formData.append("tags", JSON.stringify(uploadReq.tags));

    const response = await fetch("/api/notes/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      setMessage("Note uploaded. Thank you!");
    } else {
      setError(data.error);
    }

    setLoading(false);
  }

  if (message !== "") {
    return (
      <div className="max-w-xl w-full rounded-3xl border border-paper-4 bg-paper-2 p-8 shadow-sh-2 text-center">
        <p className="mb-4 text-lg font-semibold text-ink-1">{message}</p>
        <Link
          className="inline-flex items-center justify-center rounded-full border border-honey-500 bg-honey-300 px-4 py-2 text-sm font-semibold text-paper-1 transition-colors duration-200 hover:bg-honey-500"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleUpload}
      className="w-full max-w-xl rounded-3xl border border-paper-4 bg-paper-2 p-8 shadow-sh-2"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2 my-1 ml-2">
            title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={uploadReq.title}
            onChange={handleChange}
            placeholder="Enter note title"
            className="w-120 px-4 py-2 text-2x1 rounded-2xl bg-paper-3 text-sm placeholder-gray-600 border border-transparent focus:outline-none focus:border-terra-200 focus:bg-paper-2 transition-all duration-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2 my-1 ml-2">
            semester
          </label>
          <SemesterInput
            onChange={(sem) => setUploadReq({ ...uploadReq, semester: sem })}
          />
        </div>

        <div className="flex flex-col">
          <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2 my-1 ml-2">
            module
          </label>
          <ModuleInput
            onChange={(id) => setUploadReq({ ...uploadReq, moduleId: id })}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="file"
            className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2 my-1 ml-2"
          >
            Note File
          </label>
          <input
            id="file"
            type="file"
            name="file"
            accept=".pdf"
            onChange={handleChange}
            className="h-14 w-120 cursor-pointer rounded-2xl border border-paper-4 bg-paper-3 px-4 py-2 text-sm text-ink-1 file:rounded-full file:border-none file:bg-honey-300 file:px-4 file:py-2 file:text-paper-1 file:font-semibold hover:file:bg-honey-400 focus:outline-none focus:border-terra-200 transition-all duration-200"
          />
        </div>

        {/* note tags */}
        <div className="flex flex-col">
          <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2 my-1 ml-2">
            TAGS
          </label>
          {tags && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tagData: Tag) => {
                const isSelected = uploadReq.tags.includes(tagData.id);

                return (
                  <button
                    key={tagData.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleTag(tagData.id)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                      isSelected
                        ? "border-honey-500 bg-honey-300 text-paper-1 shadow-sh-1"
                        : "border-paper-4 bg-paper-3 text-ink-2 hover:border-honey-400 hover:bg-paper-2"
                    }`}
                  >
                    {tagData.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl border border-honey-500 bg-honey-300 px-4 py-3 text-sm font-semibold text-paper-1 transition duration-200 hover:-translate-y-px hover:bg-honey-500 hover:shadow-sh-4 disabled:bg-honey-400 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {error && <p className="text-red-500 font-bold">{error}</p>}
      </div>
    </form>
  );
}
