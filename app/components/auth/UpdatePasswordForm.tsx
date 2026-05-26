"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function UpdatePasswordForm() {
  const db = createClient();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function updatePassword(e: React.SyntheticEvent) {
    e.preventDefault();

    if (confirmPassword !== password) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    const { data, error } = await db.auth.updateUser({ password: password });
    await db.auth.signOut();
    setLoading(false);

    if (error !== null) {
      setErrorMessage(error.message);
    } else {
      setMessage("Your password has been reset!");
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
      onSubmit={updatePassword}
      className="flex flex-col gap-3 p-8 bg-white/20 rounded-lg shadow-lg backdrop-blur-md border border-white/30 w-full md:w-96"
    >
      <h2 className="font-bold text-2xl text-gray-500">Reset Password</h2>
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <input
        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm password"
      />

      <button
        className="border border-gray-300 rounded px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
        type="submit"
        disabled={loading}
      >
        {loading ? "Updating Password..." : "Update Password"}
      </button>
      {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}
    </form>
  );
}
