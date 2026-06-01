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
      className="cursor-pointer border border-honey-500 rounded-md px-7 py-3 bg-honey-300 text-white hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
      href={endpoint}
      prefetch={false}
    >
      Reset Password
    </Link>
  );
}
