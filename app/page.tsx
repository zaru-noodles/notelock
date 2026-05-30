import Navbar from "@/app/components/landing-page/Navbar";
import Hero from "@/app/components/landing-page/Hero";
import About from "./components/landing-page/AboutSection";
import Modules from "./components/landing-page/ModuleSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center">
        <Hero />
      </div>
      <About />
      <Modules />
    </>
  );
}
