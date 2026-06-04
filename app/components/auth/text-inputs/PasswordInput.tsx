import { Lock } from "lucide-react";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function PasswordInput({
  label,
  value,
  onChange,
}: PasswordInputProps) {
  return (
    <div>
      <label className="block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2 my-1 ml-2">
        {label}
      </label>
      <div className="flex items-center pl-3.5 py-1 bg-paper-1 border border-paper-4 rounded-2xl mb-3 focus-within:border-terra-300 transition-colors">
        <label htmlFor="password">
          <Lock className="h-5 w-5 text-ink-1 stroke-2" />
        </label>
        <input
          id="password"
          className="rounded px-2 py-2 focus:outline-none w-full"
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
        />
      </div>
    </div>
  );
}
