import { createClient } from "@supabase/supabase-js";

// retrieves module data from NUSMods API, and loads it into "modules" table in the database
// RESETS TABLE before seeding modules
async function loadModules() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_PRIVATE_KEY!,
  );

  const data = await (
    await fetch("https://api.nusmods.com/v2/2025-2026/moduleList.json")
  ).json();
}
