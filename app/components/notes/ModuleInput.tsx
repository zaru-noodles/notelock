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

  function setModule(mod: Module) {
    setTextInput(`${mod.moduleCode} ${mod.title}`);
    onChange(`${mod.id}`);
  }

  function resetModule() {
    setTextInput("");
    onChange("");
  }

  return (
    <div>
      <input
        type="text"
        value={textInput}
        onBlur={() =>
          modules.length != 0 ? setModule(modules[0]) : resetModule()
        }
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Module"
      />

      <ul>
        {modules.map((module) => (
          <li
            key={module.id}
            onClick={() => {
              setModule(module);
              setModules([]);
            }}
          >
            {module.moduleCode} {module.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
