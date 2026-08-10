import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-400 mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h1>
        {description && <p className="text-slate-400 text-sm mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

type Accent = "ink" | "seal" | "banyan" | "marigold";

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: Accent;
  suffix?: string;
}

export function StatCard({ label, value, accent = "ink", suffix = "" }: StatCardProps) {
  const accentMap: Record<Accent, string> = {
    ink: "text-white",
    seal: "text-rose-400",
    banyan: "text-emerald-400",
    marigold: "text-amber-400",
  };
  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
      <p className={`font-mono text-3xl font-extrabold leading-none ${accentMap[accent]}`}>
        {value}
        <span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span>
      </p>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl px-6 py-14 text-center shadow-xl">
      <p className="text-lg font-bold text-white mb-2">{title}</p>
      <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">{description}</p>
    </div>
  );
}