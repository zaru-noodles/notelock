"use client";
import RegisterForm from "@/app/components/auth/RegisterForm";
import PendingVerificationTextbox from "@/app/components/auth/PendingVerificationTextbox";
import { useState } from "react";
import { LoginRequest } from "@/types/api";

export default function Register() {
  const [loginInfomation, setLoginInfomation] = useState<LoginRequest>();

  if (loginInfomation !== undefined)
    return <PendingVerificationTextbox loginRequest={loginInfomation} />;
  return <RegisterForm setLoginInfomation={setLoginInfomation} />;
}
