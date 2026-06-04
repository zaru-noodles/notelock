import AuthCard from "./AuthCard";

export default function Hero() {
  return (
    <section id="login" className="paper-bg w-full">
      <div className="relative xl:px-12 px-6 pt-18 pb-22 w-full max-w-7xl xl:w-[70%] mx-auto grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,420px)] gap-14 items-center xl:content-center justify-items-center xl:justify-items-start">
        {/* Left Side with design */}
        <div className="max-w-145">
          <h1 className="font-medium xl:text-[86px] text-5xl text-ink-0 mb-7 leading-none tracking-tight">
            Your notes, <br />
            <span className="font-display text-terra-400 italic">
              their{" "}
              <span className="bg-linear-to-t from-hi-yellow to-transparent bg-size-[100%_60%] bg-no-repeat bg-bottom">
                future
              </span>
              .
            </span>
          </h1>
          <p className="font-display italic font-normal text-[22px] leading-[1.45] text-ink-2 mb-9">
            Contribute now by sharing your notes with your fellow classmates!
            <br></br>A shared notebook for every NUS module, semester and
            examination.
          </p>
        </div>

        {/* Right side with login and signup */}
        <div className="bg-paper-0 border border-paper-3 shadow-sh-3 p-7 rounded-xl md:w-[70%] xl:w-full">
          <AuthCard />
        </div>
      </div>
    </section>
  );
}
