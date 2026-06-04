"use client";
import ModuleInput from "./ModuleInput";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 flex items-center gap-5.5 px-8 pt-4 pb-1 border-b border-paper-3 bg-paper-1/80 backdrop-blur-md">
      <h1 className="text-4xl">NoteLock</h1>
      <ModuleInput
        onChange={() => {}}
        autocomplete={false}
        placeholder="Search modules..."
      />
    </nav>
  );
}
