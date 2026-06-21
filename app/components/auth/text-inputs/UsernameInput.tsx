import { User } from "lucide-react";

interface UsernameInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function UsernameInput({
  label,
  value,
  onChange,
}: UsernameInputProps) {
  return (
    <div>
      <label
        htmlFor="username"
        className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2 my-1 ml-2"
      >
        {label}
      </label>
      <div className="flex items-center pl-3.5 py-1 bg-paper-1 border border-paper-4 rounded-2xl mb-3 focus-within:border-terra-300 transition-colors">
        <label htmlFor="username">
          <User className="h-5 w-5 text-ink-1 stroke-2" />
        </label>
        <input
          id="username"
          className="rounded px-2 py-2 focus:outline-none w-full"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Zarufox"
        />
      </div>
    </div>
  );
}
