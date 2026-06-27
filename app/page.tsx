import Navbar from "@/app/components/landing-page/Navbar";
import Hero from "@/app/components/landing-page/Hero";
import About from "./components/landing-page/AboutSection";
import Modules from "./components/landing-page/ModuleSection";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const db = createClient(await cookies());
  const { data: user } = await db.auth.getClaims();
  if (user) {
    console.log("PAGE.tsx");
    redirect("/dashboard");
  }

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Modules />
    </>
  );
}
