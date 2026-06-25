"use client";
import { LoginRequest } from "@/types/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Props = {
  loginRequest: LoginRequest;
};

export default function PendingVerificationTextbox({ loginRequest }: Props) {
  const QUERY_COOLDOWN = 3000;
  const router = useRouter();
  const [message, setMessage] = useState("");

  // query the API on a set interval until email has been verified
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginRequest),
      });
      const data = await response.json();

      // if unable to login, retry
      if (data.error) {
        return;
      }

      clearInterval(interval);
      router.push("/dashboard");
    }, QUERY_COOLDOWN);

    // ensure interval is cleared
    return () => {
      clearInterval(interval);
    };
  }, []);

  // requests backend to resend verification link
  async function resendLink() {
    const response = await fetch("/api/auth/resendVerification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: loginRequest.email }),
    });

    const data = await response.json();
    setMessage(data?.error ? data.error : data.message);
  }

  return (
    <div>
      <h2 className="font-display text-[28px] font-medium text-ink-0 tracking-[-0.015em] mt-1.5">
        Verify your account
      </h2>

      <br />
      <p className="mb-1.5">
        A verification email has been sent to your email! <br /> Check your junk
        mail.
      </p>
      <br />
      <button
        className="cursor-pointer border border-honey-500 rounded-md px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
        type="button"
        onClick={resendLink}
      >
        Resend verification link
      </button>
      {message && <p className="mb-1.5">{message}</p>}
    </div>
  );
}
