"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        console.error(data.error);
        return;
      }

      console.log(data.message);
      router.push("/login-page");
      router.refresh();
    } catch (err) {
      console.error("Failed to Log out");
    }
  };
  return (
    <button onClick={handleLogout} className="hover:underline">
      Log out
    </button>
  );
}
