import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default async function Dashboard() {
  const db = createClient();
  const user = await db.auth.getUser();

  return (
    <>
      <div>Dashboard Page</div>
      <Link
        className="font-medium text-terra-500 hover:underline"
        href="/upload"
      >
        Upload your notes!
      </Link>
      <Link
        className="font-medium text-terra-500 hover:underline"
        href={`/users/${user.data.user?.id}`}
      >
        View your notes!
      </Link>
    </>
  );
}
