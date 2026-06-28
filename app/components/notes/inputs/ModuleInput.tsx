"use client";

import { useEffect, useState, useRef } from "react";
import type { Module } from "@/types/index";

type Props = {
  onChange: (input: string) => void;
};

export default function ModuleInput({ onChange }: Props) {
  const [textInput, setTextInput] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const clickedItem = useRef(false);

  useEffect(() => {
    if (textInput.length == 0) {
      return;
    }

    async function searchModules() {
      const response = await fetch(`/api/modules?search=${textInput}&count=8`);
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
    setModules([]);
    onChange("");
  }

  return (
    <div className="w-120">
      <input
        className="w-120 px-4 py-2 text-2x1 rounded-2xl bg-paper-3 text-sm placeholder-gray-600 border border-transparent focus:outline-none focus:border-terra-200 focus:bg-paper-2 transition-all duration-200"
        type="text"
        value={textInput}
        onBlur={() => {
          // ignore blur if li was clicked
          if (clickedItem.current) {
            clickedItem.current = false;
            return;
          }
          modules.length != 0 ? setModule(modules[0]) : resetModule();
        }}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Module"
      />

      <ul className="absolute bg-paper-2 shadow-lg z-50 mt-1">
        {modules.map((module) => (
          <li
            className="px-4 py-2 text-sm text-gray-800 hover:bg-paper-1 cursor-pointer transition-colors duration-100"
            key={module.id}
            onMouseDown={() => {
              clickedItem.current = true;
            }}
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
