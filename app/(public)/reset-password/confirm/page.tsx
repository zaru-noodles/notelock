import Link from "next/link";
import { getOriginURL } from "@/utils/api/helper";

export default async function ConfirmEmail({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string }>;
}) {
  const { token_hash } = await searchParams;

  if (!token_hash) {
    return <p>Invalid Reset Password link</p>;
  }

  const endpoint =
    (await getOriginURL()) +
    "/api/auth/confirmAccount?type=recovery&next=/reset-password/update&token_hash=" +
    token_hash;

  return (
    <Link
      className="text-blue-800 hover:underline"
      href={endpoint}
      prefetch={false}
    >
      Reset Password
    </Link>
  );
}
