import type { Category, ComplaintStatus, Priority } from "../types";

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  NEW: "bg-slateink/10 text-slateink border-slateink/25",
  RECEIVED: "bg-marigold/15 text-marigold-light text-amber-800 border-marigold/40",
  IN_PROGRESS: "bg-ink/10 text-ink border-ink/25",
  RESOLVED: "bg-banyan/10 text-banyan border-banyan/30",
  REJECTED: "bg-seal/10 text-seal border-seal/30",
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  NEW: "New",
  RECEIVED: "Received",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-medium uppercase tracking-wide px-2 py-1 rounded-sm border ${STATUS_STYLES[status] || ""}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "text-slateink",
  MEDIUM: "text-marigold-light",
  HIGH: "text-seal",
  CRITICAL: "text-seal-dark",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const dots = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[priority] || 1;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono uppercase tracking-wide ${PRIORITY_STYLES[priority]}`} title={`Priority: ${priority}`}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`w-1 h-3 rounded-sm ${i < dots ? "bg-current" : "bg-current/15"}`} />
      ))}
      <span className="ml-1.5">{priority}</span>
    </span>
  );
}

export function CategoryTag({ category }: { category?: Category | string }) {
  return (
    <span className="inline-block text-[11px] font-body px-2 py-0.5 rounded-sm bg-ink/5 text-ink/70 border border-ink/10">
      {category?.replaceAll("_", " ") || "Other"}
    </span>
  );
}
