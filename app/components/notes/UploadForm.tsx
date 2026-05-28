"use client";
import type { UploadRequest } from "@/types/api";
import { useState } from "react";

export default function UploadForm() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadReq, setUploadReq] = useState<UploadRequest>({
    title: "",
    moduleId: "",
    semester: "",
    file: null,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadReq({ ...uploadReq, [e.target.name]: e.target.value });
  }

  async function handleUpload(e: React.SyntheticEvent) {
    return;
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

      <input
        type="text"
        name="moduleId"
        onChange={handleChange}
        placeholder="Module"
      />

      <input type="file" name="file" accept=".pdf" onChange={handleChange} />

      {error && <p className="text-red-500 font-bold">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
