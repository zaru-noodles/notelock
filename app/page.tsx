import Navbar from "@/app/components/landing-page/Navbar";
import Hero from "@/app/components/landing-page/Hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center">
        <Hero />
      </div>
    </>
  );
}
