"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const db = createClient();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // if account with email exists and is verified, send reset password email
  async function sendEmail(e: React.SyntheticEvent) {
    e.preventDefault();

    setLoading(true);
    const { data, error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);

    if (error !== null) {
      setMessage(error.message);
    } else {
      setMessage(
        "A link to reset password has been successfully sent to your email!",
      );
    }
  }

  if (message !== "") {
    return (
      <>
        <p>{message}</p>
        <Link className="text-blue-500 hover:underline" href="/login-page">
          Return to login page
        </Link>
      </>
    );
  }

  return (
    <form
      onSubmit={sendEmail}
      className="flex flex-col gap-3 p-8 bg-white/20 rounded-lg shadow-lg backdrop-blur-md border border-white/30 w-full md:w-96"
    >
      <h2 className="font-bold text-2xl text-gray-500">Reset Password</h2>
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <button
        className="border border-gray-300 rounded px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
        type="submit"
        disabled={loading}
      >
        {loading ? "Sending link..." : "Send Password Reset Link"}
      </button>
    </form>
  );
}
