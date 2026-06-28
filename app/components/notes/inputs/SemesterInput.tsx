"use client";

import { useEffect, useRef, useState } from "react";
import { SEMESTERS } from "@/utils/constants";

type Props = {
  onChange: (input: string) => void;
};

export default function SemesterInput({ onChange }: Props) {
  const [textInput, setTextInput] = useState("");
  const [semesters, setSemesters] = useState<string[]>([]);
  const clickedItem = useRef(false);

  useEffect(() => {
    function searchSemesters() {
      if (textInput.length == 0 || SEMESTERS.includes(textInput)) {
        setSemesters([]);
      } else {
        setSemesters(
          SEMESTERS.filter((sem) => sem.includes(textInput)).slice(0, 4),
        );
      }
    }

    searchSemesters();
  }, [textInput]);

  function setSemester(sem: string) {
    setTextInput(sem);
    onChange(sem);
  }

  function resetSemester() {
    setTextInput("");
    onChange("");
  }

  return (
    <div className="w-120">
      <input
        type="text"
        className="w-120 px-4 py-2 text-2x1 rounded-2xl bg-paper-3 text-sm placeholder-gray-600 border border-transparent focus:outline-none focus:border-terra-200 focus:bg-paper-2 transition-all duration-200"
        value={textInput}
        onBlur={() => {
          // ignore blur if li was clicked
          if (clickedItem.current || SEMESTERS.includes(textInput)) {
            clickedItem.current = false;
            return;
          }
          semesters.length != 0 ? setSemester(semesters[0]) : resetSemester();
        }}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Semester"
      />

      <ul className="absolute bg-paper-2 shadow-lg z-50 mt-1">
        {semesters.map((sem) => (
          <li
            className="px-4 py-2 text-sm text-gray-800 hover:bg-paper-1 cursor-pointer transition-colors duration-100"
            key={sem}
            onMouseDown={() => {
              clickedItem.current = true;
            }}
            onClick={() => {
              setSemester(sem);
              setSemesters([]);
            }}
          >
            {sem}
          </li>
        ))}
      </ul>
    </div>
  );
}
