"use client";
import { Module } from "@/types";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function NUSMods({ userID }: { userID: string }) {
  const [modules, setModules] = useState<Module[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const savedModules = localStorage.getItem(`nusmods-modules-${userID}`);
    return savedModules ? JSON.parse(savedModules) : [];
  });
  const [timetableLink, setTimetableLink] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem(`nusmods-timetable-link-${userID}`) || "";
  });
  const [loading, setLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const router = useRouter();

  // example link: https://nusmods.com/timetable/sem-1/share?CS1101S=REC:10D,TUT:04A,LEC:1&CS1231S=TUT:19B,LEC:1&GEA1000=TUT:D43&MA1521=LEC:1&MA1522=LEC:2
  async function handleSync() {
    const REGEX = `[?|&].{5,9}=`;

    setLoading(true);
    const db = createClient();
    const link = timetableLink.trim();
    const matches = link.matchAll(RegExp(REGEX, "g"));
    const moduleCodes = Array.from(matches, (match) => match[0].slice(1, -1));

    const moduleData = await Promise.all(
      moduleCodes.map(async (moduleCode) => {
        if (moduleCode === "hidden") return;
        const { data, error } = await db
          .from("modules")
          .select()
          .eq("moduleCode", moduleCode)
          .single();
        if (error) {
          toast.error(`Error fetching module ${moduleCode}`);
          return;
        }

        if (!data) {
          toast.error(`Module ${moduleCode} not found in database.`);
          return;
        }

        return data;
      }),
    );

    setModules(
      moduleData.filter((module): module is Module => module !== undefined),
    );
    setLoading(false);
  }

  async function handleFavouriteAll() {
    if (modules.length === 0) {
      toast("No modules to favourite");
      return;
    }

    const db = createClient();
    setFavLoading(true);

    const inserts = modules.map((m) => ({ module_id: m.id, user_id: userID }));

    const { data, error } = await db
      .from("user_module")
      .upsert(inserts, {
        onConflict: "user_id,module_id",
        ignoreDuplicates: true,
      })
      .select();

    setFavLoading(false);

    if (error) {
      toast.error("Unable to add favourites");
      return;
    }

    toast.success(`Added ${data.length} modules to favourites`);
    router.refresh();
  }

  // save timetable link and modules to local storage so that they persist across page reloads
  useEffect(() => {
    return () => {
      localStorage.setItem(`nusmods-timetable-link-${userID}`, timetableLink);
      localStorage.setItem(
        `nusmods-modules-${userID}`,
        JSON.stringify(modules),
      );
    };
  }, [timetableLink, modules]);

  return (
    <div className="mb-8">
      <h2 className="text-5xl font-bold mb-2">NUSMods Integration</h2>
      <p className="text-lg text-ink-2 mb-4">
        Sync your NUSMods timetable with our platform to easily access notes for
        all your modules.
      </p>
      <div className="flex gap-2">
        {/* input */}
        <div className="w-[50%] justify-center py-4">
          <div className="flex w-full items-end gap-3 py-4">
            <div className="flex flex-col flex-1">
              <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2 my-1 ml-2">
                Timetable link
              </label>
              <input
                id="timetable-link"
                type="text"
                name="timetable-link"
                placeholder="https://nusmods.com/timetable/sem-1/share?..."
                className="w-full px-4 py-3 rounded-2xl bg-paper-3 text-sm placeholder-gray-600 border border-transparent focus:outline-none focus:border-terra-200 focus:bg-paper-2 transition-all duration-200"
                value={timetableLink}
                onChange={(e) => setTimetableLink(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-honey-500 bg-honey-300 px-6 py-2.5 text-sm font-semibold text-paper-1 transition-colors duration-200 hover:bg-honey-500 focus:outline-none focus:ring-2 focus:ring-honey-300"
              onClick={handleSync}
            >
              {loading ? "Syncing..." : "Sync"}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-ink-1">
                Modules found:
              </h3>
              {modules.length > 0 && (
                <button
                  type="button"
                  onClick={handleFavouriteAll}
                  className="inline-flex items-center gap-2 rounded-pill border border-ink-4 bg-paper-0 px-4 py-2 text-sm font-medium text-ink-1 shadow-sh-1 hover:bg-paper-1"
                >
                  <Star className="size-4" />
                  {favLoading ? "Adding..." : "Favourite all"}
                </button>
              )}
            </div>
            {modules.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {modules.map((module) => (
                  <Link
                    key={module.moduleCode}
                    href={`/notes/${module.moduleCode}`}
                    className="rounded-full border border-paper-4 bg-paper-3 px-4 py-2 text-sm font-medium text-ink-1 shadow-sm"
                  >
                    {module.moduleCode}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-ink-2">No modules found yet.</p>
            )}
          </div>
        </div>

        {/* instructions */}
        <div className="w-[50%] border-l-2 border-paper-4 pl-4 py-10">
          <h2 className="text-3xl font-bold mb-3">How to Sync</h2>
          <ol className="list-decimal list-inside space-y-3 text leading-6 text-ink-1">
            <li>
              Go to{" "}
              <a
                href="https://nusmods.com/timetable"
                target="_blank"
                rel="noopener noreferrer"
                className="text-honey-500 underline"
              >
                NUSMods Timetable Planner
              </a>{" "}
              and create your timetable.
            </li>
            <li>
              Click the &quot;Share/Sync&quot; button and copy the shareable
              link.
            </li>
            <li>
              Paste the link in the input field on the left and click
              &quot;Sync&quot;.
            </li>
            <li>
              You can now view your modules and favourite them all at once!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
