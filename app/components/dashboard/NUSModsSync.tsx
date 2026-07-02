"use client";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function NUSMods({ userID }: { userID: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-5xl font-bold mb-2">NUSMods Integration</h2>
    </div>
  );
}
