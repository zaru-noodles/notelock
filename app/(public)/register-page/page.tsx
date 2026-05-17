import RegisterForm from "@/app/components/auth/RegisterForm";

export default function Register() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-linear-to-br from-purple-200 to-blue-400 /50 px-4">
      <RegisterForm />
    </div>
  );
}
