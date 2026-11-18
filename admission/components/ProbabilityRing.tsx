"use client";

export function ProbabilityRing({
  probability,
  category,
  range,
  variant = "default",
}: {
  probability: number;
  category?: " chạy nước rút " | " xứng đôi " | " giữ gốc ";
  range?: { low: number; high: number };
  variant?: "default" | "tech";
}) {
  const p = Math.max(0, Math.min(100, probability));
  const label = category || (p < 40? " chạy nước rút ": p < 70? " xứng đôi ": " giữ gốc ");
  const tech = variant === "tech";
  const color = tech
    ? label === " chạy nước rút "
      ? "#f59e0b"
      : label === " xứng đôi "
        ? "#22d3ee"
        : "#3b82f6"
    : label === " chạy nước rút "
      ? "#b45309"
      : label === " xứng đôi "
        ? "#0f766e"
        : "#1d4ed8";
  const track = tech? "#1e3a5f": "#e7e5e4";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative grid h-40 w-40 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${p * 3.6}deg, ${track} 0)`,
          boxShadow: tech? `0 0 32px ${color}44`: undefined,
        }}
        role="img"
        aria-label={` trúng tuyển xác suất ước ${p}%`}
      >
        <div
          className={`grid h-28 w-28 place-items-center rounded-full ${
            tech? "bg-slate-950": "bg-white"
          }`}
        >
          <span
            className={`text-3xl font-semibold tabular-nums ${
              tech? "text-sky-100": "text-stone-900"
            }`}
          >
            {p}%
          </span>
        </div>
      </div>
      <span
        className="rounded-md px-3 py-1 text-sm font-medium text-white"
        style={{ background: color }}
      >
        {label}
      </span>
      {range && (
        <p className={`text-sm ${tech? "text-slate-400": "text-stone-500"}`}>
           tính ra khu lúc giữa {range.low}% – {range.high}% (không chính thức)
        </p>
      )}
    </div>
  );
}
