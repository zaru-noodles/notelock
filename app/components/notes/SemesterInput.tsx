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
    <div>
      <input
        type="text"
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

      <ul>
        {semesters.map((sem) => (
          <li
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
