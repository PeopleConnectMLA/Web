import { useEffect, useMemo, useState } from "react";
import { PageHeader, EmptyState } from "../components/Ui";
import { StatusBadge, PriorityBadge, CategoryTag } from "../components/Badges";
import ComplaintDrawer from "../components/ComplaintDrawer";
import { Search, MapPin, Image as ImageIcon, ChevronRight, X } from "lucide-react";
import type { Complaint, ComplaintStatus } from "../types";
import { getComplaints } from "../services";

type StatusFilter = ComplaintStatus | "ALL";

const STATUS_FILTERS: StatusFilter[] = ["ALL", "NEW", "RECEIVED", "IN_PROGRESS", "RESOLVED"];

const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;

const PRIORITY_ACCENT: Record<keyof typeof PRIORITY_ORDER, string> = {
  CRITICAL: "bg-rose-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-emerald-500",
};

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Complaint | null>(null);
  const userId = Number(sessionStorage.getItem("userId")) || 1;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getComplaints(userId);
      setComplaints(res?.data ?? []);
    } catch (error) {
      console.error("Failed to load complaints:", error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: complaints.length };
    for (const c of complaints) counts[c.status] = (counts[c.status] ?? 0) + 1;
    return counts;
  }, [complaints]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints
      .filter((c) => filter === "ALL" || c.status === filter)
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.citizenName.toLowerCase().includes(q))
      .sort((a, b) => {
        return (
          (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3) ||
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
      });
  }, [complaints, filter, query]);

  const hasActiveFilters = filter !== "ALL" || query.trim().length > 0;

  function handleUpdated(updated: Complaint) {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    setSelected((s) => (s ? { ...s, ...updated } : s));
  }

  function clearFilters() {
    setFilter("ALL");
    setQuery("");
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        eyebrow="Constituency Register"
        title="Grievance Register"
        description="Every complaint routed to your constituency, sorted by priority and status."
      />

      {/* At-a-glance Metric Stat Cards */}
      {!loading && complaints.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Filed", value: statusCounts.ALL ?? 0, color: "text-white" },
            { label: "New", value: statusCounts.NEW ?? 0, color: "text-rose-400" },
            { label: "In Progress", value: statusCounts.IN_PROGRESS ?? 0, color: "text-amber-400" },
            { label: "Resolved", value: statusCounts.RESOLVED ?? 0, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full pl-10 pr-9 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
            placeholder="Search by title or citizen name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((s) => {
            const count = statusCounts[s] ?? 0;
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wide border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30 ring-1 ring-blue-500/20"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {s.replace("_", " ")}
                <span className={`tabular-nums px-1.5 py-0.5 rounded-md text-[10px] ${active ? "bg-blue-500/20 text-blue-300" : "bg-slate-800 text-slate-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!loading && complaints.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filtered.length}</strong> of {complaints.length}
          </span>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-blue-400 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60 shadow-xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
              <div className="w-1.5 h-10 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-800 rounded w-2/3" />
                <div className="h-2.5 bg-slate-800/60 rounded w-1/3" />
              </div>
              <div className="h-6 w-20 bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching complaints" : "No complaints filed yet"}
          description={
            hasActiveFilters
              ? "Adjust your filters or search terms to see more of the register."
              : "New complaints from your constituency will appear here as citizens file them."
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden hidden md:block shadow-xl">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/90">
                  <th className="px-3 py-3.5 w-4"></th>
                  <th className="px-5 py-3.5">Complaint</th>
                  <th className="px-5 py-3.5 hidden lg:table-cell">Category</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Filed</th>
                  <th className="px-4 py-3.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="pl-0 py-4">
                      <span className={`block h-8 w-1 rounded-r-full ${PRIORITY_ACCENT[c.priority] || "bg-emerald-500"}`} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white text-sm leading-snug max-w-md">{c.title}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2.5 flex-wrap">
                        <span>
                          {c.citizenName} · {c.affectedCount} affected
                        </span>
                        {c.imageUrl && (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <ImageIcon size={12} /> photo
                          </span>
                        )}
                        {c.latitude != null && c.longitude != null && (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <MapPin size={12} /> located
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <CategoryTag category={c.category} />
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-xs text-slate-400 font-mono">
                      {new Date(c.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight
                        size={16}
                        className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl relative overflow-hidden pl-5 pr-4 py-4 cursor-pointer active:bg-slate-800/60 transition-colors shadow-lg space-y-2.5"
              >
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${PRIORITY_ACCENT[c.priority] || "bg-emerald-500"}`} />
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-white text-sm leading-snug">{c.title}</p>
                  <ChevronRight size={16} className="text-slate-500 shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                  <span>{c.citizenName}</span>
                  {c.imageUrl && (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <ImageIcon size={12} />
                    </span>
                  )}
                  {c.latitude != null && c.longitude != null && (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <MapPin size={12} />
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <CategoryTag category={c.category} />
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                  <span className="text-[11px] text-slate-400 font-mono ml-auto">
                    {new Date(c.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <ComplaintDrawer complaint={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
}