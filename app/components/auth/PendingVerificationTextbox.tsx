"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingVerificationTextbox() {
  const QUERY_COOLDOWN = 3000;
  const router = useRouter();

  // query the API on a set interval until email has been verified
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await (await fetch("/api/auth/isVerified")).json();

      // if no session, return to login page
      if (response.error) {
        clearInterval(interval);
        router.push("/login");
      }

      if (response.verified) {
        clearInterval(interval);
        router.push("/dashboard");
      }
    }, QUERY_COOLDOWN);

    // ensure interval is cleared
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <h3>Please verify your account</h3>
      <p>
        A confirmation email has been sent to your email. It may be in your junk
        mail.
      </p>
    </div>
  );
}
