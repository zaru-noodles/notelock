"use client";

import { useEffect, useState } from "react";
import type { Module } from "@/types/index";

type Props = {
  onChange: (input: string) => void;
};

export default function ModuleInput({ onChange }: Props) {
  const [textInput, setTextInput] = useState("");
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    if (textInput.length == 0) {
      return;
    }

    async function searchModules() {
      const response = await fetch(`/api/modules?search=${textInput}&count=5`);
      const data = await response.json();

      if (response.ok) {
        setModules(data.modules);
      } else {
        setModules([]);
      }
    }

    searchModules();
  }, [textInput]);

  function handleClick(mod: Module) {
    setTextInput(`${mod.moduleCode} ${mod.name}`);
    onChange(`${mod.id}`);
  }

  return (
    <div>
      <input
        type="text"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Module"
      />

      <ul>
        {modules.map((module) => (
          <li key={module.id} onClick={() => handleClick(module)}>
            {module.moduleCode} {module.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
