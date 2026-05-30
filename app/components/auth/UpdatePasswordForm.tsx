"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import PasswordInput from "./text-inputs/PasswordInput";

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
        <Link className="text-blue-500 hover:underline" href="/">
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
      <PasswordInput label="PASSWORD" value={password} onChange={setPassword} />
      <PasswordInput
        label="CONFIRM PASSWORD"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      <button
        className="cursor-pointer border border-honey-500 rounded-md px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
        type="submit"
        disabled={loading}
      >
        {loading ? "Updating Password..." : "Update Password"}
      </button>
      {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}
    </form>
  );
}
