"use client";

import { useRouter } from "next/navigation";
import ModuleInputNavbar from "./ModuleInputNavbar";

export default function Navbar() {
  const router = useRouter();

  function selectModule(moduleCode: string) {
    if (moduleCode !== "") {
      router.push(`/notes/${moduleCode}`);
    }
  }

  return (
    <nav className="sticky top-0 z-10 flex items-center gap-5.5 px-8 pt-4 pb-3 border-b border-paper-3 bg-paper-2/80 backdrop-blur-md">
      <h1 className="text-4xl leading-none translate-y-1">NoteLock</h1>
      <ModuleInputNavbar onChange={selectModule} />
    </nav>
  );
}
