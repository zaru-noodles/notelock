import { headers } from "next/headers";

// find the URL of the website
export async function getOriginURL() {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
