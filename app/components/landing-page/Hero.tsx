import AuthCard from "./AuthCard";

export default function Hero() {
  return (
    <section className="paper-bg relative px-12 pt-18 pb-22 max-w-7x1 mx-auto grid grid-cols-[minmax(0,1.05fr)_minmax(0,420px)] gap-14 items-start">
      <div>
        {/* Left side */}
        <h1 className="font-medium text-[96px] text-ink-0 max-w-160 mb-7 leading-none tracking-tight [font-variation-settings:'opsz'_72]">
          Your notes, <br />
          <span className="font-display text-terra-400 italic">
            their{" "}
            <span className="bg-linear-to-t from-hi-yellow to-transparent bg-size-[100%_60%] bg-no-repeat bg-bottom">
              future
            </span>
            .
          </span>
        </h1>
        <p className="font-display italic font-normal text-[22px] leading-[1.45] text-ink-2 mb-9 max-w-130">
          Contribute now by sharing your notes with your fellow classmates! A
          shared notebook for every NUS module, semester and examinations.
        </p>
        {/* Right side with login and signup */}
        <AuthCard />
      </div>
    </section>
  );
}
