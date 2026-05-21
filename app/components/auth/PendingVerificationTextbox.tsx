"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  email: string;
};

export default function PendingVerificationTextbox({ email }: Props) {
  const QUERY_COOLDOWN = 3000;
  const router = useRouter();

  // query the API on a set interval until email has been verified
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch("/api/auth/isVerified", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });
      const data = await response.json();

      // if no session, return to login page
      if (data.error) {
        clearInterval(interval);
        router.push("/login-page");
      }

      if (data.verified) {
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
