import Navbar from "../components/notes/navbar/Navbar";
import { Toaster } from "react-hot-toast";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../api/auth/current-user";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return (
    <>
      <Navbar authLevel={user.authLevel ?? 0} />
      <Toaster position="top-center" />
      {children}
    </>
  );
}
