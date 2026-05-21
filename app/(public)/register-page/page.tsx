"use client";
import RegisterForm from "@/app/components/auth/RegisterForm";
import PendingVerificationTextbox from "@/app/components/auth/PendingVerificationTextbox";
import { useState } from "react";

export default function Register() {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  if (isRegistered) return <PendingVerificationTextbox email={email} />;
  return <RegisterForm setIsRegistered={setIsRegistered} setEmail={setEmail} />;
}
