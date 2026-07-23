import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Favourites from "@/app/components/dashboard/favourites";
import Overview from "@/app/components/dashboard/overview";
import DashboardTabs from "@/app/components/dashboard/dashboardTabs";
import NUSModsSync from "@/app/components/dashboard/NUSModsSync";
import Binders from "@/app/components/dashboard/binders";

export default async function Dashboard() {
  const db = createClient(await cookies());
  const user = (await db.auth.getUser()).data.user;
  const userID = user?.id;

  if (!userID) return <p>Unable to fetch user data</p>;

  const username = user?.user_metadata?.username;
  const { data, error } = await db
    .from("users")
    .select("auth_level")
    .eq("id", user?.id)
    .single();

  if (error || data === null) return <p>Unable to fetch user data</p>;

  return (
    <div className="grid-bg min-h-screen min-w-screen">
      <div className="px-8 py-10 w-[80vw] mx-auto bg-paper-1 rounded-3xl shadow-sh-4">
        <DashboardTabs
          overview={
            <Overview
              userID={userID}
              username={username}
              authLevel={data.auth_level}
            />
          }
          favourites={<Favourites userID={userID} />}
          binders={<Binders userID={userID} />}
          nusmodsSync={<NUSModsSync userID={userID} />}
        />
      </div>
    </div>
  );
}
