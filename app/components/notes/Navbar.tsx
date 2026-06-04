"use client";

import { useRouter } from "next/navigation";
import ModuleInputNavbar from "./ModuleInputNavbar";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import LogoutButton from "../auth/LogoutButton";

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState("");

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
    <nav className="sticky top-0 z-10 flex items-center gap-5.5 px-12 pr-18 pt-4 pb-3 border-b border-paper-3 bg-paper-2/80 backdrop-blur-md">
      <h1 className="text-4xl leading-none translate-y-1">NoteLock</h1>
      <ModuleInputNavbar onChange={selectModule} />
      <div className="ml-auto flex items-center gap-5.5">
        <div className="border-r-2 border-paper-4 pr-1.5">
          <p className="text-right leading-none pb-0.5">{username}</p>
          <p className="text-sm text-gray-600 text-right leading-none">
            Student
          </p>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}
