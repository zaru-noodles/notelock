"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginRequest } from "@/types/api";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    <form onSubmit={handleLogin} className="flex flex-col gap-3 w-full">
      <div className="flex items-center pl-3.5 py-1 bg-paper-1 border border-paper-4 rounded-2xl">
        <Mail className="h-5 w-5 text-ink-1 stroke-[1.5]" />
        <input
          className="rounded px-2 py-2 focus:outline-none w-[90%]"
          type="email"
          value={loginRequest.email}
          onChange={(e) =>
            setLoginRequest({
              ...loginRequest,
              email: e.target.value.toLowerCase(),
            })
          }
          placeholder="e0123456@u.nus.edu"
        />
      </div>
      <div className="flex items-center pl-3.5 py-1 bg-paper-1 border border-paper-4 rounded-2xl">
        <Lock className="h-5 w-5 text-ink-1 stroke-[1.5]"></Lock>
        <input
          className="rounded px-2 py-2 focus:outline-none w-[90%]"
          type="password"
          value={loginRequest.password}
          onChange={(e) =>
            setLoginRequest({ ...loginRequest, password: e.target.value })
          }
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-red-500 font-bold">{error}</p>}
      <button
        className="border border-honey-500 rounded px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:translate-y-[-1px] hover:shadow-sh-4"
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
        No account?&nbsp;
        <Link
          className="font-medium text-terra-500 hover:underline"
          href="/register-page"
        >
          Register here!
        </Link>
      </p>

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
