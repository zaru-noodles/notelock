import RegisterForm from "@/app/components/auth/RegisterForm";
import PendingVerificationTextbox from "@/app/components/auth/PendingVerificationTextbox";
import { useState } from "react";

export default function Register() {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  if (isRegistered) return <PendingVerificationTextbox />;
  return <RegisterForm />;
}
