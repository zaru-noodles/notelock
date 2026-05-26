"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginRequest } from "@/types/api";
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
    <form
      onSubmit={handleLogin}
      className="flex flex-col gap-3 p-8 bg-white/20 rounded-lg shadow-lg backdrop-blur-md border border-white/30 w-full md:w-96"
    >
      <h2 className="font-bold text-2xl text-gray-500">Login</h2>
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        type="email"
        value={loginRequest.email}
        onChange={(e) =>
          setLoginRequest({ ...loginRequest, email: e.target.value })
        }
        placeholder="Email"
      />
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        type="password"
        value={loginRequest.password}
        onChange={(e) =>
          setLoginRequest({ ...loginRequest, password: e.target.value })
        }
        placeholder="Password"
      />
      {error && <p className="text-red-500 font-bold">{error}</p>}
      <button
        className="border border-gray-300 rounded px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in" : "Login"}
      </button>

      <p>
        No account?&nbsp;
        <Link className="text-blue-500 hover:underline" href="/register-page">
          Register here!
        </Link>
      </p>

      <p>
        Forgot Password?&nbsp;
        <Link className="text-blue-500 hover:underline" href="/register-page">
          Reset it here!
        </Link>
      </p>
    </form>
  );
}
