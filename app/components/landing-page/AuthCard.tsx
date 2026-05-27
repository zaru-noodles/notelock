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
    <div>
      {/* Toggle mode */}
      <button onClick={() => setMode("login")}>Log in</button>
      <button onClick={() => setMode("signup")}>Create account</button>
      <h2>{mode === "login" ? "Welcome back." : "Get the cheatsheets."}</h2>
      <p>
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
