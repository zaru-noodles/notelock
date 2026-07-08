import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../api/auth/current-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.authLevel < 2) {
    redirect("/dashboard");
  }
  return (
    <div className="mx-auto mt-5 w-full xl:w-[90%]">
      <div className="mb-6 flex items-center gap-4 border-b border-ink-4 pb-3">
        <h1 className="font-display text-2xl text-ink-0">Admin</h1>
        <nav className="flex gap-4 font-mono text-sm text-ink-2">
          <Link href="/admin" className="hover:text-ink-1">
            Overview
          </Link>
          <Link href="/admin/users" className="hover:text-ink-1">
            Users
          </Link>
          <Link href="/admin/reports" className="hover:text-ink-1">
            Reports
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
