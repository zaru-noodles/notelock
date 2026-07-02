import { Upload, User } from "lucide-react";
import Link from "next/link";

export default async function Overview({
  userID,
  username,
}: {
  userID: string;
  username: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-5xl font-bold mb-4">Welcome back, {username}</h1>

      {/* quick actions */}
      <div className="flex gap-3">
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-paper-4 text-ink-1 rounded-xl text-sm font-medium hover:bg-paper-4 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload notes
        </Link>
        <Link
          href={`/users/${userID}`}
          className="flex items-center gap-2 px-4 py-2 bg-paper-4 text-ink-1 rounded-xl text-sm font-medium hover:bg-paper-4 transition-colors"
        >
          <User className="w-4 h-4" />
          My uploads
        </Link>
      </div>
    </div>
  );
}
