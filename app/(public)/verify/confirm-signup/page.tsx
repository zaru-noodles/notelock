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
    <Link
      className="cursor-pointer border border-honey-500 rounded-md px-7 py-3 bg-honey-300 text-white hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
      href={confirmation_url}
    >
      Confirm Sign-Up
    </Link>
  );
}
