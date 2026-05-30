import PostItNote from "./PostItNote";

export default function About() {
  return (
    <section id="about" className="py-16 px-6 grid-bg">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Everything you need to ace your exams, all in one place.
        </h2>

        <p className="text-gray-800 text-lg">
          We aim to provide NUS students with a convenient, free and easy way to
          access study materials, reinforce their learning through practice, and
          walk into every exam feeling prepared.
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col items-center gap-10 my-20">
        <div className="flex justify-between w-full">
          <PostItNote
            color="yellow"
            rotation={-1}
            title="View and Download"
            text="Download lecture notes and cheatsheets completely for free!"
          />
          <PostItNote
            color="blue"
            rotation={4}
            title="Filter by Modules"
            text="Specialised for NUS students, quickly find the perfect cheatsheet for your exam."
          />
          <PostItNote
            color="orange"
            rotation={-2}
            title="Quizzes"
            text="Test your understanding through AI generated quizzes!"
          />
        </div>

        <div className="flex justify-evenly w-full">
          <PostItNote
            color="pink"
            rotation={2}
            title="NUSMods Integration"
            text="Sync your modules through NUSMods' timetable link!"
          />
          <PostItNote
            color="green"
            rotation={-3}
            title="Upload Notes"
            text="Support your peers and juniors by contributing to Notelock!"
          />
        </div>
      </div>
    </section>
  );
}
