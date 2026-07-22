import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-[28px] sm:text-[32px] font-semibold text-ink leading-tight">{title}</h1>
        {description && <p className="text-slateink text-sm mt-1.5 max-w-xl">{description}</p>}
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
    ink: "text-ink",
    seal: "text-seal",
    banyan: "text-banyan",
    marigold: "text-marigold-light",
  };
  return (
    <div className="file-card p-5">
      <p className="eyebrow mb-3">{label}</p>
      <p className={`font-mono text-[32px] font-semibold leading-none ${accentMap[accent]}`}>
        {value}
        <span className="text-base font-body font-normal text-slateink ml-1">{suffix}</span>
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
    <div className="file-card px-6 py-14 text-center">
      <p className="font-display text-lg text-ink mb-1.5">{title}</p>
      <p className="text-sm text-slateink max-w-sm mx-auto">{description}</p>
    </div>
  );
}
