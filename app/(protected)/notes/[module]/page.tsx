"use client";
import { useState, useEffect } from "react";
import type { Module } from "@/types";
import Link from "next/link";
import { Search } from "lucide-react";

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
      <div className="mb-6">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">
          {moduleData?.faculty} | {moduleData?.department}
        </p>
        <h1 className="text-5xl font-bold mb-0.5">{moduleData?.moduleCode}</h1>
        <p className="text-2xl text-gray-700">{moduleData?.title}</p>
      </div>

      {/* search bar */}
      <div className="flex w-120 px-4 py-2 text-2x1 rounded-2xl bg-paper-3 text-x1 placeholder-gray-600 border border-transparent focus:outline-none focus:border-terra-200 focus:bg-paper-2 transition-all duration-200">
        <Search className="h-5 w-5 text-ink-1 stroke-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="rounded focus:outline-none w-full pl-2"
        />
      </div>
    </div>
  );
}
