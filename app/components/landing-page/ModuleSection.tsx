import ModuleScroll from "./ModuleScroll";

export default function Modules() {
  return (
    <section id="modules" className="py-24 px-6 h-screen">
      <ModuleScroll offset={0} />
      <ModuleScroll offset={30} />
      <div className="flex flex-col items-center gap-8 my-15">
        <h1 className="text-5xl font-bold text-center text-gray-900 tracking-tight leading-tight max-w-5xl">
          Find resources for <span className="text-terra-200">every</span>{" "}
          module at NUS
        </h1>
        <p className="text-gray-700 text-lg text-center max-w-xl">
          From CS1101S to PL1101E, we have notes, cheatsheets, and quizzes for
          hundreds of modules.
        </p>
      </div>
      <ModuleScroll offset={75} />
      <ModuleScroll offset={100} />
    </section>
  );
}
