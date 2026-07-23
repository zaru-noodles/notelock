import { Sparkles } from "lucide-react";

export function AISummaryBox({ summary }: { summary: string | null }) {
  if (!summary) return null;
  return (
    <section>
      <div className="flex items-center gap-1.5">
        <Sparkles size={15} className="text-honey-100" />
      </div>
    </section>
  );
}
