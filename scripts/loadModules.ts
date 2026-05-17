import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// retrieves module data from NUSMods API, and loads it into "modules" table in the database
// RESETS TABLE before seeding modules, might lead to notes being deleted due to cascading

type Module = {
  moduleCode: string;
  title: string;
  faculty: string;
  department: string;
  // everything else in the API response is just ignored
};

async function loadModules() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_PRIVATE_KEY!,
  );

  // query nusmods api
  const data = await (
    await fetch("https://api.nusmods.com/v2/2025-2026/moduleInfo.json")
  ).json();

  // delete all rows in table
  const { error: deleteError } = await db
    .from("modules")
    .delete()
    .neq("id", "-1");

  if (deleteError) {
    console.log("Failed to delete rows, " + deleteError.message);
    return;
  }

  // load module data into db
  const { error } = await db.from("modules").insert(
    data.map((mod: Module) => ({
      moduleCode: mod.moduleCode,
      title: mod.title,
      faculty: mod.faculty,
      department: mod.department ?? "",
    })),
  );

  if (error) console.log("Failed to add rows, " + error.message);
}

loadModules();
