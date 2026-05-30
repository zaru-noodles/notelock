"use client";
import { useState } from "react";
import { LoginRequest, RegisterRequest } from "@/types/api";
import { Mail, Lock, ArrowRight, User } from "lucide-react";
import EmailInput from "./text-inputs/EmailInput";
import PasswordInput from "./text-inputs/PasswordInput";
import UsernameInput from "./text-inputs/UsernameInput";

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
      <EmailInput
        label="NUS EMAIL"
        value={registerRequest.email}
        onChange={(email) =>
          setRegisterRequest({ ...registerRequest, email: email })
        }
      />

      <PasswordInput
        label="PASSWORD"
        value={registerRequest.password}
        onChange={(password) =>
          setRegisterRequest({ ...registerRequest, password: password })
        }
      />

      <PasswordInput
        label="CONFIRM PASSWORD"
        value={registerRequest.confirmPassword}
        onChange={(password) =>
          setRegisterRequest({ ...registerRequest, confirmPassword: password })
        }
      />

      <UsernameInput
        label="USERNAME"
        value={registerRequest.username}
        onChange={(username) =>
          setRegisterRequest({ ...registerRequest, username: username })
        }
      />

      {error && <p className="text-red-500 font-bold">{error}</p>}
      <button
        className="cursor-pointer border border-honey-500 rounded-md px-3 py-2 bg-honey-300 text-paper-1 hover:bg-honey-500 disabled:bg-honey-400 transition-transform duration-200 hover:-translate-y-px hover:shadow-sh-4 mb-4.5"
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
