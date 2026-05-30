"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginRequest } from "@/types/api";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import EmailInput from "./text-inputs/EmailInput";
import PasswordInput from "./text-inputs/PasswordInput";

export default function LoginForm() {
  const [loginRequest, setLoginRequest] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginRequest),
      });
      const data = await response.json();
      if (response.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-1 w-full">
      <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
        NUS EMAIL
      </label>
      <EmailInput
        value={loginRequest.email}
        onChange={(email) => setLoginRequest({ ...loginRequest, email: email })}
      />

      <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
        PASSWORD
      </label>
      <PasswordInput
        value={loginRequest.password}
        onChange={(password) =>
          setLoginRequest({ ...loginRequest, password: password })
        }
      />

      {error && <p className="text-red-500 font-bold">{error}</p>}
      <button
        className="cursor-pointer border border-honey-500 rounded-md px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:translate-y-[-1px] hover:shadow-sh-4 mb-4.5"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span>Logging in...</span>
        ) : (
          <div className="flex justify-center">
            <span>Login&nbsp;</span>
            <ArrowRight className="h-5.75"></ArrowRight>
          </div>
        )}
      </button>

      <p>
        Forgot Password?&nbsp;
        <Link
          className="font-medium text-terra-500 hover:underline"
          href="/reset-password"
        >
          Reset it here!
        </Link>
      </p>
    </form>
  );
}
