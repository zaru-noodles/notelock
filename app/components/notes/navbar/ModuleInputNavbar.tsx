"use client";

import { useRef, useState } from "react";
import type { Module } from "@/types/index";

const DEBOUNCE_MS = 300;

async function searchModules(
  textInput: string,
  signal?: AbortSignal,
): Promise<Module[]> {
  const response = await fetch(
    `/api/modules?search=${encodeURIComponent(textInput)}&count=8`,
    { signal },
  );
  const data = await response.json();

  if (response.ok) {
    return data.modules;
  } else {
    return [];
  }
}

type Props = {
  onChange: (input: string) => void;
};

export default function ModuleInput({ onChange }: Props) {
  const [textInput, setTextInput] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function runSearch(value: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    try {
      const results = await searchModules(value, controller.signal);
      setModules(results);
      setStatus("success");
      setActiveIndex(-1);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatus("error");
      setModules([]);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTextInput(value);
    setIsOpen(true);

    clearTimeout(debounceRef.current ?? undefined);

    if (!value.trim()) {
      abortRef.current?.abort();
      setModules([]);
      setStatus("idle");
      return;
    }

    debounceRef.current = setTimeout(() => runSearch(value), DEBOUNCE_MS);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || modules.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % modules.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + modules.length) % modules.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) setModule(modules[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function setModule(mod: Module) {
    setTextInput(`${mod.moduleCode} ${mod.title}`);
    onChange(`${mod.moduleCode}`);
    setIsOpen(false);
    setStatus("success");
  }

  function onBlur() {
    setIsOpen(false);
    setTextInput("");
    onChange("");
  }

  return (
    <div className="relative w-120">
      <input
        className="w-full px-4 py-2 text-sm rounded-2xl bg-paper-3 placeholder-gray-600 border border-transparent focus:outline-none focus:border-terra-200 focus:bg-paper-2 transition-all duration-200"
        type="text"
        value={textInput}
        onBlur={onBlur}
        onFocus={() => textInput.trim() && setIsOpen(true)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Module"
      />

      {isOpen && (
        <ul className="absolute w-full bg-paper-2 shadow-lg z-50 mt-1 rounded-xl overflow-hidden">
          {status === "loading" && (
            <li className="px-4 py-2 text-sm text-gray-500">Searching…</li>
          )}

          {status === "error" && (
            <li className="px-4 py-2 text-sm text-red-600">
              Something went wrong.
            </li>
          )}

          {status === "success" && modules.length === 0 && (
            <li className="px-4 py-2 text-sm text-gray-500">
              No modules found.
            </li>
          )}

          {status === "success" &&
            modules.map((module, index) => (
              <li
                className={`px-4 py-2 text-sm text-gray-800 cursor-pointer transition-colors duration-100 ${
                  index === activeIndex ? "bg-paper-1" : "hover:bg-paper-1"
                }`}
                key={module.id}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setModule(module)}
              >
                <div className="font-medium">
                  <b>{module.moduleCode}</b> {module.title}
                </div>
                <div className="text-xs text-gray-500">
                  {module.department} | {module.faculty}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
