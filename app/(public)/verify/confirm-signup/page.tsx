export default async function ConfirmEmail({
  searchParams,
}: {
  searchParams: Promise<{ confirmation_url?: string }>;
}) {
  const { confirmation_url } = await searchParams;

  if (!confirmation_url) {
    return <p>Invalid Sign-Up link</p>;
  }

  return <a href={confirmation_url}>Confirm Sign-Up</a>;
}
