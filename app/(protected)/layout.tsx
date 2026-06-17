import Navbar from "../components/notes/navbar/Navbar";
import { Toaster } from "react-hot-toast";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <Toaster position="top-center" />
      {children}
    </>
  );
}
