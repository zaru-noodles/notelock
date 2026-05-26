"use client";
import { LoginRequest } from "@/types/api";
import { log } from "console";
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
      <h2>Please verify your account</h2>
      <p>A confirmation email has been sent to your email.</p>
      <br />
      <h3> Did not recieve the verification email? </h3>
      <p> Check your junk inbox or</p>
      <button
        className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
        type="button"
        onClick={resendLink}
      >
        {" "}
        Resend verification link{" "}
      </button>
      <br />
      <p>{message}</p>
    </div>
  );
}
