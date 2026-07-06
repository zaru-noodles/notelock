"use client";
import { useState, useRef, useEffect } from "react";

type Tab = "Overview" | "Favourites" | "NUSMods";
const tabs: Tab[] = ["Overview", "Favourites", "NUSMods"];

type Props = {
  overview: React.ReactNode;
  favourites: React.ReactNode;
  nusmodsSync: React.ReactNode;
};

export default function DashboardTabs({
  overview,
  favourites,
  nusmodsSync,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [height, setHeight] = useState<number | "auto">("auto");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [activeTab]);

  return (
    <div className="flex gap-6">
      <div className="flex flex-col gap-1 pt-1 w-36 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150
              ${
                activeTab === tab
                  ? "bg-paper-3 text-ink-1"
                  : "text-gray-400 hover:text-ink-1 hover:bg-paper-2"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="border-l border-paper-4" />

      <div
        style={{ height: height === "auto" ? "auto" : `${height}px` }}
        className="flex-1 overflow-hidden transition-[height] duration-300 ease-in-out"
      >
        <div ref={contentRef}>
          {activeTab === "Overview" && overview}
          {activeTab === "Favourites" && favourites}
          {activeTab === "NUSMods" && nusmodsSync}
        </div>
      </div>
    </div>
  );
}
