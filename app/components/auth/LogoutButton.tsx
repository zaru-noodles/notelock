"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const handleLogout = async () => {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        console.error(data.error);
        return;
      }
      console.log(data.message);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Failed to Log out");
    } finally {
      setPending(false);
    }
  };
  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="inline-flex items-center gap-1.5 font-mono text-sm text-ink-2 transition hover:text-ink-1 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut className="size-4" />
      {pending ? "Signing out" : "Sign out"}
    </button>
  );
}
