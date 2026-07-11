"use client";

export interface PlateSample {
  plate: string;
  note: string;
}

/**
 * Demo helper: clickable example plates that exist in the mock EZAUTO
 * datahouse, so users know how to simulate a successful lookup.
 */
export function PlateExamples({
  samples,
  onPick,
  missNote = "Any other plate returns no record.",
}: {
  samples: PlateSample[];
  onPick: (plate: string) => void;
  missNote?: string;
}) {
  return (
    <div className="mt-3 rounded-lg bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Demo — plates in the mock datahouse (click to fill)
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {samples.map((s) => (
          <button
            key={s.plate}
            type="button"
            onClick={() => onPick(s.plate)}
            className="group flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:border-blue-400 hover:bg-blue-50"
            title={s.note}
          >
            <span className="font-mono font-bold tracking-wider text-slate-800 group-hover:text-blue-700">
              {s.plate}
            </span>
            <span className="text-slate-400">{s.note}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">{missNote}</p>
    </div>
  );
}
