import LogoutButton from "@/app/components/auth/LogoutButton";
import Link from "next/link";

export default function Dashboard() {
  return (
    <>
      <div>Dashboard Page</div>
      <Link className="text-blue-500 hover:underline" href="/upload">
        Upload your notes!
      </Link>
    </>
  );
}
