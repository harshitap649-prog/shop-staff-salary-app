import type { AttendanceStatus } from "@/types";

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: "emerald" | "danger" | "warn" | "slate"; bg: string }> = {
  present: { label: "Present", color: "emerald", bg: "bg-emerald-50/50" },
  absent: { label: "Absent", color: "danger", bg: "bg-danger-50/50" },
  halfDay: { label: "Half-Day", color: "warn", bg: "bg-warn-50/50" },
  holiday: { label: "Holiday", color: "slate", bg: "bg-slate-100/50" },
};

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const cfg = STATUS_CONFIG[status];
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-700 border-emerald-200",
    danger: "text-danger-600 border-danger-200",
    warn: "text-warn-700 border-warn-200",
    slate: "text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${colorMap[cfg.color]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {cfg.label}
    </span>
  );
}
