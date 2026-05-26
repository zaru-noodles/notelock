import Link from "next/link";

export default async function ConfirmEmail({
  searchParams,
}: {
  searchParams: Promise<{ confirmation_url?: string }>;
}) {
  const { confirmation_url } = await searchParams;

  if (!confirmation_url) {
    return <p>Invalid Sign-Up link</p>;
  }

  return (
    <Link className="text-blue-800 hover:underline" href={confirmation_url}>
      Confirm Sign-Up
    </Link>
  );
}
