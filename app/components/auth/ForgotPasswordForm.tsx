"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import EmailInput from "./text-inputs/EmailInput";

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
        <Link
          className="cursor-pointer border border-honey-500 rounded-md px-4 py-2 bg-honey-300 text-white hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
          href="/"
        >
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
      <h2 className="font-bold text-2xl">Reset Password</h2>
      <EmailInput label="EMAIL" value={email} onChange={setEmail} />

      <button
        className="cursor-pointer border border-honey-500 rounded-md px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
        type="submit"
        disabled={loading}
      >
        {loading ? "Sending link..." : "Send Password Reset Link"}
      </button>
    </form>
  );
}
