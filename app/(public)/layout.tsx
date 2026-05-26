import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient(await cookies());
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-linear-to-br from-purple-200 to-blue-400/50 px-4">
      {children}
    </div>
  );
}
