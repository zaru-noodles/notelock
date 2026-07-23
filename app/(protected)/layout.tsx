import Navbar from "../components/notes/navbar/Navbar";
import { Toaster } from "react-hot-toast";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../api/auth/current-user";
import { AuthListener } from "../components/auth/AuthListener";
export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return (
    <>
      <AuthListener />
      <Navbar
        userID={user.id}
        username={user.username}
        authLevel={user.authLevel ?? 0}
      />
      <Toaster position="top-center" />
      {children}
    </>
  );
}
