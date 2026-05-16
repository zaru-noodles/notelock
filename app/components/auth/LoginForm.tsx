"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginRequest } from "@/types/api";

export default function LoginForm() {
  const [loginRequest, setLoginRequest] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
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
    }
  };

  return (
    <div>
      <input
        type="email"
        value={loginRequest.email}
        onChange={(e) =>
          setLoginRequest({ ...loginRequest, email: e.target.value })
        }
        placeholder="Email"
      />
      <br />
      <input
        type="password"
        value={loginRequest.password}
        onChange={(e) =>
          setLoginRequest({ ...loginRequest, password: e.target.value })
        }
        placeholder="Password"
      />
      {error && <p>{error}</p>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
