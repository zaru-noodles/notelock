"use client";

import { useRouter } from "next/navigation";
import ModuleInputNavbar from "./ModuleInputNavbar";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import LogoutButton from "../../auth/LogoutButton";
import Link from "next/link";

type props = {
  authLevel: 0 | 1 | 2;
};

export default function Navbar({ authLevel }: props) {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const AUTH_LEVEL_LABELS: Record<number, string> = {
    0: "Student",
    1: "Professor",
    2: "Admin",
  };

  useEffect(() => {
    async function getUser() {
      const db = createClient();
      const {
        data: { user },
      } = await db.auth.getUser();
      setUsername(user?.user_metadata?.username ?? "");
    }
    getUser();
  }, []);

  function selectModule(moduleCode: string) {
    if (moduleCode !== "") {
      router.push(`/notes/${moduleCode}`);
    }
  }

  return (
    <nav className="hidden sticky top-0 z-10 xl:flex items-center gap-5.5 px-12 pr-18 pt-4 pb-3 border-b border-paper-3 bg-paper-2/80 backdrop-blur-md desktop-only">
      <h1 className="text-4xl leading-none translate-y-1">
        <Link href="/dashboard">NoteLock</Link>
      </h1>
      <ModuleInputNavbar onChange={selectModule} />
      <div className="ml-auto flex items-center gap-5.5">
        <Link
          href="/upload"
          className="inline-flex items-center rounded-full border border-honey-500 bg-honey-400 px-4 py-2 text-sm font-semibold text-paper-1 transition-colors duration-200 hover:bg-honey-500"
        >
          Upload notes
        </Link>
        <div className="border-r-2 border-paper-4 pr-1.5">
          <p className="text-right leading-none pb-0.5">{username}</p>
          <p className="text-sm text-gray-600 text-right leading-none">
            {AUTH_LEVEL_LABELS[authLevel] ?? "Student"}
          </p>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}
