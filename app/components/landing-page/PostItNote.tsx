"use client";
import { useState } from "react";

type PresetColor = "yellow" | "pink" | "blue" | "green" | "orange" | "purple";

interface PostItNoteProps {
  color?: PresetColor | string;
  title?: string;
  text?: string;
  width?: number;
  rotation?: number;
}

const defaultColors: Record<PresetColor, { bg: string; shadow: string }> = {
  yellow: { bg: "#fef08a", shadow: "#eab308" },
  pink: { bg: "#fda4af", shadow: "#e11d48" },
  blue: { bg: "#93c5fd", shadow: "#2563eb" },
  green: { bg: "#86efa0", shadow: "#16a34a" },
  orange: { bg: "#fed7aa", shadow: "#ea580c" },
  purple: { bg: "#c4b5fd", shadow: "#7c3aed" },
};

export default function PostItNote({
  color = "yellow",
  title = "",
  text = "",
  width = 220,
  rotation = -2,
}: PostItNoteProps) {
  const [hovered, setHovered] = useState(false);

  const palette =
    color in defaultColors
      ? defaultColors[color as PresetColor]
      : { bg: color, shadow: "#00000030" };

  const currentRotation = hovered ? rotation + 3 : rotation;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: `${width}px`,
        minHeight: `${width}px`,
        backgroundColor: palette.bg,
        transform: `rotate(${currentRotation}deg)`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: hovered
          ? `4px 6px 12px rgba(0,0,0,0.25)`
          : `2px 3px 8px rgba(0,0,0,0.15)`,
      }}
      className="relative flex flex-col p-4 cursor-default select-none"
    >
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 rounded-sm opacity-40"
        style={{
          width: `${width * 0.35}px`,
          background: "linear-gradient(180deg, #f5f5f4, #d6d3d1)",
        }}
      />

      {title && (
        <h3
          className="font-bold tracking-tight leading-tight mb-2 mt-1 text-lg"
          style={{ color: "rgba(0,0,0,0.9)" }}
        >
          {title}
        </h3>
      )}

      <div className="flex-1 flex items-center justify-center">
        <p
          className="text-sm leading-snug text-center wrap-break-word w-full"
          style={{ color: "rgba(0,0,0,0.8)" }}
        >
          {text}
        </p>
      </div>

      <div
        className="absolute bottom-0 right-0 w-0 h-0"
        style={{
          borderStyle: "solid",
          borderWidth: "0 0 16px 16px",
          borderColor: `transparent transparent rgba(0,0,0,0.08) transparent`,
        }}
      />
    </div>
  );
}
