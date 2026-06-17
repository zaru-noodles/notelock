"use client";
import { createClient } from "@/utils/supabase/client";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  isFavourite: boolean;
  moduleID: number;
};

export default function ModuleFavouriteButton({
  isFavourite,
  moduleID,
}: Props) {
  const [favourite, setFavourite] = useState(isFavourite);

  async function toggleFavourite() {
    const db = createClient();
    const userID = (await db.auth.getUser()).data.user?.id;

    if (!userID) {
      toast.error("Unable to update favourite status");
      return;
    }

    const { error } = favourite
      ? await db
          .from("user_module")
          .delete()
          .eq("module_id", moduleID)
          .eq("user_id", userID)
      : await db
          .from("user_module")
          .insert({ module_id: moduleID, user_id: userID });

    if (error) {
      toast.error("Unable to update favourite status");
      return;
    }

    setFavourite(!favourite);
  }

  return (
    <button
      type="button"
      onClick={toggleFavourite}
      className="inline-flex items-center gap-2 rounded-pill border border-ink-4 bg-paper-0 px-4 py-2 text-sm font-medium text-ink-1 shadow-sh-1 hover:bg-paper-1"
    >
      <Star className="size-4" /> Favourite
    </button>
  );
}
