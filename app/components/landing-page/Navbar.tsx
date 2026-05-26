export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 flex items-center gap-5.5 px-12 py-4 border-b border-paper-3 bg-paper-1/80 backdrop-blur-md">
      <div className="flex gap-6 ml-6">
        <a
          className="text-ink-2 text-[18px] font-medium px-1.5 py-1 border-b border-transparent transition-colors duration-250 hover:text-ink-1  hover:border-b-ink-2"
          href="#about"
        >
          About
        </a>
        <a
          className="text-ink-2 text-[18px] font-medium px-1.5 py-1 border-b border-transparent transition-colors duration-250 hover:text-ink-1 hover:border-b-ink-2"
          href="#modules"
        >
          Modules
        </a>
        <a
          className="text-ink-2 text-[18px] font-medium px-1.5 py-1 border-b border-transparent transition-colors duration-250 hover:text-ink-1 hover:border-b-ink-2"
          href="#stories"
        >
          Stories
        </a>
        <a
          className="text-ink-2 text-[18px] font-medium px-1.5 py-1 border-b border-transparent transition-colors duration-250 hover:text-ink-1 hover:border-b-ink-2"
          href="#faq"
        >
          FAQ
        </a>
      </div>
    </nav>
  );
}
