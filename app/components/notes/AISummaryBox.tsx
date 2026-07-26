import { Sparkles } from "lucide-react";

export function AISummaryBox({ summary }: { summary: string | null }) {
  return (
    <section className="mt-2">
      <div className="flex items-center gap-1.5">
        <Sparkles size={15} className="text-honey-100" />
        <h2 className="font-mono text-xs uppercase tracking-wide text-ink-3">
          AI summary
        </h2>
      </div>
      {summary ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{summary}</p>
      ) : (
        <p className="mt-2 text-sm italic text-ink-3">
          AI summary not available.
        </p>
      )}
    </section>
  );
}
