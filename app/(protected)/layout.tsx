import Navbar from "../components/notes/navbar/Navbar";
import { Toaster } from "react-hot-toast";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const db = createClient(await cookies());
  const { data } = await db.auth.getClaims();
  if (!data?.claims) redirect("/");
  return (
    <>
      <Navbar />
      <Toaster position="top-center" />
      {children}
    </>
  );
}
