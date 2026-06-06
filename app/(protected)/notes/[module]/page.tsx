"use client";
import { useState, useEffect } from "react";
import type { Module } from "@/types";
import Link from "next/link";

type Props = {
  params: Promise<{
    module: string;
  }>;
};

export default function ModulePage({ params }: Props) {
  const [moduleData, setModuleData] = useState<Module>();
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const moduleCode = (await params).module;
      const response = await fetch(`/api/modules?search=${moduleCode}&count=1`);

      if (!response.ok) {
        setError(`Unable to retrieve data: Status: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.modules.length === 0) {
        setError(`Invalid module code: ${moduleCode}`);
      }
      setModuleData(data.modules[0]);
    };

    fetchData();
  }, []);

  if (error !== "") {
    return (
      <>
        <p>{error}</p>
        <Link
          href="/dashboard"
          className="cursor-pointer border border-honey-500 rounded-md w-4 px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
        >
          Back to dashboard
        </Link>
      </>
    );
  }

  return (
    <div className="px-8 py-10 w-full mx-4">
      {/* header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">
          {moduleData?.faculty}
        </p>
        <h1 className="text-5xl font-bold mb-2">{moduleData?.moduleCode}</h1>
        <p className="text-xl text-gray-600">{moduleData?.title}</p>
      </div>

      {/* search bar */}
      <div className="relative mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-100 text-sm text-gray-700 placeholder-gray-400 border border-transparent focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </div>
    </div>
  );
}
