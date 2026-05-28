"use client";
import type { UploadRequest } from "@/types/api";
import Link from "next/link";
import { useState } from "react";
import ModuleInput from "./ModuleInput";

export default function UploadForm() {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadReq, setUploadReq] = useState<UploadRequest>({
    title: "",
    moduleId: "",
    semester: "",
    file: null,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name == "file") {
      const files = e.target.files;
      if (files) setUploadReq({ ...uploadReq, [e.target.name]: files[0] });
    } else {
      setUploadReq({ ...uploadReq, [e.target.name]: e.target.value });
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
      <>
        <p> {message} </p>
        <Link className="text-blue-500 hover:underline" href="/dashboard">
          {" "}
          Back to dashboard{" "}
        </Link>
      </>
    );
  }

  return (
    <form onSubmit={handleUpload}>
      <input
        type="text"
        name="title"
        onChange={handleChange}
        placeholder="Title"
      />

      <input
        type="text"
        name="semester"
        onChange={handleChange}
        placeholder="Semester"
      />

      <ModuleInput
        onChange={(id) => setUploadReq({ ...uploadReq, moduleId: id })}
      />

      <input type="file" name="file" accept=".pdf" onChange={handleChange} />

      {error && <p className="text-red-500 font-bold">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
