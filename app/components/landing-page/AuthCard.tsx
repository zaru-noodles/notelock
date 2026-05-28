"use client";
import { useState } from "react";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";
import PendingVerificationTextbox from "../auth/PendingVerificationTextbox";
import { LoginRequest } from "@/types/api";

export default function AuthCard() {
  const [mode, setMode] = useState("login");
  const [loginInformation, setLoginInfomation] = useState<LoginRequest>();

  if (loginInformation !== undefined) {
    return <PendingVerificationTextbox loginRequest={loginInformation} />;
  }

  return (
    <div className="flex flex-col bg-paper-0 border border-paper-3 shadow-sh-3 p-7 gap-1 rounded-xl">
      {/* Toggle mode */}
      <div className="flex justify-evenly bg-paper-3 border border-paper-4 rounded-xl mb-3 px-0.5 py-0.5">
        <button
          onClick={() => setMode("login")}
          className={`px-6 py-2.25 rounded-pill font-sans text-[16px] font-semibold cursor-pointer transition-colors duration-150 w-full
            ${
              mode === "login"
                ? "text-ink-0 bg-paper-0 shadow-sh-1"
                : "text-ink-3"
            }`}
        >
          Log in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`px-4 py-2.25 rounded-pill font-sans text-[16px] font-semibold cursor-pointer transition-colors duration-150 w-full
            ${
              mode === "signup"
                ? "text-ink-0 bg-paper-0 shadow-sh-1"
                : "text-ink-3"
            }`}
        >
          Sign up
        </button>
      </div>
      <h2 className="font-display text-[28px] font-medium text-ink-0 tracking-[-0.015em] mt-1.5">
        {mode === "login" ? "Welcome back." : "Get the cheatsheets."}
      </h2>
      <p className="mb-1.5">
        {mode === "login"
          ? "Sign in with your NUS email"
          : "Use your NUS email to sign up now!"}
      </p>
      {/* Different forms */}
      {mode === "login" ? (
        <LoginForm />
      ) : (
        <RegisterForm setLoginInfomation={setLoginInfomation} />
      )}
    </div>
  );
}
