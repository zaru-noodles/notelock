import LogoutButton from "@/app/components/auth/LogoutButton";
import Link from "next/link";

export default function Dashboard() {
  return (
    <>
      <div>Dashboard Page</div>
      <Link
        className="font-medium text-terra-500 hover:underline"
        href="/upload"
      >
        Upload your notes!
      </Link>   
    </>
  );
}
