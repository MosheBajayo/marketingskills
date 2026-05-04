import { INTEGRATIONS } from "@/lib/constants";

export function Integrations() {
  return (
    <div className="mt-2">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
        Integrate with
      </p>
      <ul className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
        {INTEGRATIONS.map((label) => (
          <li
            key={label}
            className="rounded-full bg-white/5 ring-1 ring-white/10 px-4 py-1.5 text-sm font-semibold text-white/85"
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
