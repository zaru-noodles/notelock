"use client";
import { useState } from "react";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";

export default function AuthCard() {
  const [mode, setMode] = useState("login");

  return (
    <div>
      <button onClick={() => setMode("login")}>Log in</button>
      <button onClick={() => setMode("signup")}>Create account</button>
      <h2>{mode === "login" ? "Welcome back." : "Get the cheatsheets."}</h2>
      <p>
        {mode === "login"
          ? "Sign in with your NUS email"
          : "Use your NUS email to sign up now!"}
      </p>
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
