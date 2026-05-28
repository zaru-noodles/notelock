"use client";
import { useState } from "react";
import { LoginRequest, RegisterRequest } from "@/types/api";
import { Mail, Lock, ArrowRight, User } from "lucide-react";

type Props = {
  setLoginInfomation: (value: LoginRequest) => void;
};

export default function RegisterForm({ setLoginInfomation }: Props) {
  const [registerRequest, setRegisterRequest] = useState<RegisterRequest>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerRequest),
      });
      const data = await response.json();

      if (response.ok) {
        setLoginInfomation({
          email: registerRequest.email,
          password: registerRequest.password,
        });
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
    <form onSubmit={handleRegister} className="flex flex-col gap-1 w-full">
      <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
        EMAIL
      </label>
      <div className="flex items-center pl-3.5 py-1 bg-paper-1 border border-paper-4 rounded-2xl mb-3">
        <Mail className="h-5 w-5 text-ink-1 stroke-2" />
        <input
          className="rounded px-2 py-2 focus:outline-none w-[90%]"
          type="email"
          value={registerRequest.email}
          onChange={(e) =>
            setRegisterRequest({
              ...registerRequest,
              email: e.target.value.toLowerCase(),
            })
          }
          placeholder="e0123456@u.nus.edu"
        />
      </div>
      <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
        PASSWORD
      </label>
      <div className="flex items-center pl-3.5 py-1 bg-paper-1 border border-paper-4 rounded-2xl mb-3">
        <Lock className="h-5 w-5 text-ink-1 stroke-2"></Lock>
        <input
          className="rounded px-2 py-2 focus:outline-none w-[90%]"
          type="password"
          value={registerRequest.password}
          onChange={(e) =>
            setRegisterRequest({ ...registerRequest, password: e.target.value })
          }
          placeholder="••••••••"
        />
      </div>
      <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
        CONFIRM PASSWORD
      </label>
      <div className="flex items-center pl-3.5 py-1 bg-paper-1 border border-paper-4 rounded-2xl mb-3">
        <Lock className="h-5 w-5 text-ink-1 stroke-2"></Lock>
        <input
          className="rounded px-2 py-2 focus:outline-none w-[90%]"
          type="password"
          value={registerRequest.confirmPassword}
          onChange={(e) =>
            setRegisterRequest({
              ...registerRequest,
              confirmPassword: e.target.value,
            })
          }
          placeholder="••••••••"
        />
      </div>
      <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
        USERNAME
      </label>
      <div className="flex items-center pl-3.5 py-1 bg-paper-1 border border-paper-4 rounded-2xl mb-3">
        <User className="h-5 w-5 text-ink-1 stroke-2"></User>
        <input
          className="rounded px-2 py-2 focus:outline-none w-[90%]"
          type="text"
          value={registerRequest.username}
          onChange={(e) =>
            setRegisterRequest({ ...registerRequest, username: e.target.value })
          }
          placeholder="Zarufox"
        />
      </div>
      {error && <p className="text-red-500 font-bold">{error}</p>}
      <button
        className="border border-honey-500 rounded-md px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:translate-y-[-1px] hover:shadow-sh-4 mb-4.5"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span>Creating account...</span>
        ) : (
          <span className="flex justify-center">
            Create an account&nbsp;<ArrowRight className="h-5.75"></ArrowRight>
          </span>
        )}
      </button>
    </form>
  );
}
