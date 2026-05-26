"use client";
import { useState } from "react";
import { LoginRequest, RegisterRequest } from "@/types/api";

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
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-3 p-8 bg-white/20 rounded-lg shadow-lg backdrop-blur-md border border-white/30 w-full md:w-96"
    >
      <h2 className="font-bold text-2xl text-gray-500">Sign up now!</h2>
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        type="email"
        value={registerRequest.email}
        onChange={(e) =>
          setRegisterRequest({ ...registerRequest, email: e.target.value })
        }
        placeholder="Email"
      />
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        type="password"
        value={registerRequest.password}
        onChange={(e) =>
          setRegisterRequest({ ...registerRequest, password: e.target.value })
        }
        placeholder="Password"
      />
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        type="password"
        value={registerRequest.confirmPassword}
        onChange={(e) =>
          setRegisterRequest({
            ...registerRequest,
            confirmPassword: e.target.value,
          })
        }
        placeholder="Confirm password"
      />
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        type="text"
        value={registerRequest.username}
        onChange={(e) =>
          setRegisterRequest({ ...registerRequest, username: e.target.value })
        }
        placeholder="Username"
      />
      {error && <p className="text-red-500 font-bold">{error}</p>}
      <button
        className="border border-gray-300 rounded px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
        type="submit"
        disabled={loading}
      >
        Create an Account
      </button>
    </form>
  );
}
