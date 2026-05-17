"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginRequest } from "@/types/api";

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
      className="flex flex-col gap-3 w-80 p-8 bg-gray-200 rounded-lg shadow"
    >
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
      {error && <p className="text-red-400 font-bold">{error}</p>}
      <button
        className="border border-gray-300 rounded px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in" : "Login"}
      </button>
    </form>
  );
}
