import { useEffect, useMemo, useState } from "react";
import { PageHeader, EmptyState } from "../components/Ui";
import { StatusBadge, PriorityBadge, CategoryTag } from "../components/Badges";
import ComplaintDrawer from "../components/ComplaintDrawer";
import { Search, MapPin, Image as ImageIcon, ChevronRight, X } from "lucide-react";
import type { Complaint, ComplaintStatus } from "../types";
import { getOfficerComplaintsAPI } from "../services";

type StatusFilter = ComplaintStatus | "ALL";

const STATUS_FILTERS: StatusFilter[] = ["ALL", "NEW", "RECEIVED", "IN_PROGRESS", "RESOLVED"];

const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;

// Accent stripe only — the authoritative priority label still comes from
// <PriorityBadge />. This just gives the row a quiet left-edge cue so the
// eye can scan priority before reading anything.
const PRIORITY_ACCENT: Record<keyof typeof PRIORITY_ORDER, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-emerald-500",
};

export default function OfficierComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Complaint | null>(null);
  const officerId = sessionStorage.getItem("userId");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    if (!officerId) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getOfficerComplaintsAPI(officerId);
      console.log(res?.data,"-----");
      
      setComplaints(res?.data ?? []);
    } catch (error) {
      console.error("Failed to load assigned complaints:", error);
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
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
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
    <div>
      <PageHeader
        eyebrow="Officer Queue"
        title="Assigned Complaints"
        description="Complaints assigned to you for action, sorted by priority."
      />

      {/* At-a-glance counts */}
      {!loading && complaints.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {[
            { label: "Total", value: statusCounts.ALL ?? 0 },
            { label: "New", value: statusCounts.NEW ?? 0 },
            { label: "In progress", value: statusCounts.IN_PROGRESS ?? 0 },
            { label: "Resolved", value: statusCounts.RESOLVED ?? 0 },
          ].map((s) => (
            <div key={s.label} className="file-card px-4 py-3">
              <p className="eyebrow font-normal text-[10.5px] mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-ink leading-none">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
          <input
            className="input-field pl-9 pr-9"
            placeholder="Search by title or citizen name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slateink hover:text-ink transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_FILTERS.map((s) => {
            const count = statusCounts[s] ?? 0;
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3.5 py-2 rounded-sm text-xs font-mono uppercase tracking-wide border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  active ? "bg-ink text-parchment border-ink" : "border-ink/15 text-slateink hover:border-ink/30"
                }`}
              >
                {s.replace("_", " ")}
                <span className={`tabular-nums ${active ? "opacity-70" : "opacity-50"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!loading && complaints.length > 0 && (
        <div className="flex items-center justify-between mb-3 text-xs text-slateink">
          <span>
            Showing {filtered.length} of {complaints.length}
          </span>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="underline hover:text-ink transition-colors">
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="file-card overflow-hidden divide-y divide-ink/8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="h-2 w-2 rounded-full bg-ink/10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-ink/10 rounded w-2/3" />
                <div className="h-2.5 bg-ink/10 rounded w-1/3" />
              </div>
              <div className="h-5 w-16 bg-ink/10 rounded hidden sm:block" />
              <div className="h-5 w-20 bg-ink/10 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching complaints" : "No complaints assigned yet"}
          description={
            hasActiveFilters
              ? "Adjust your filters or search terms to see more of the queue."
              : "Complaints assigned to you will appear here once the MLA office assigns them."
          }
        />
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="file-card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left">
                  <th className="eyebrow font-normal px-5 py-3 w-8"></th>
                  <th className="eyebrow font-normal px-5 py-3">Complaint</th>
                  <th className="eyebrow font-normal px-5 py-3 hidden lg:table-cell">Category</th>
                  <th className="eyebrow font-normal px-5 py-3">Priority</th>
                  <th className="eyebrow font-normal px-5 py-3">Status</th>
                  <th className="eyebrow font-normal px-5 py-3 hidden sm:table-cell">Filed</th>
                  <th className="eyebrow font-normal px-5 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer hover:bg-ink/[0.03] transition-colors group"
                  >
                    <td className="pl-0 py-3.5">
                      <span className={`block h-full w-1 rounded-r ${PRIORITY_ACCENT[c.priority]}`} />
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink text-[13.5px] leading-snug max-w-xs">{c.title}</p>
                      <p className="text-xs text-slateink mt-0.5 flex items-center gap-2.5 flex-wrap">
                        <span>
                          {c.citizenName} · {c.affectedCount} affected
                        </span>
                        {c.imageUrl && (
                          <span className="inline-flex items-center gap-1 text-slateink/80">
                            <ImageIcon size={12} /> photo
                          </span>
                        )}
                        {c.latitude != null && c.longitude != null && (
                          <span className="inline-flex items-center gap-1 text-slateink/80">
                            <MapPin size={12} /> located
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <CategoryTag category={c.category} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-slateink font-mono">
                      {new Date(c.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <ChevronRight
                        size={15}
                        className="text-slateink/40 group-hover:text-slateink group-hover:translate-x-0.5 transition-all"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className="file-card relative overflow-hidden pl-4 pr-4 py-3.5 cursor-pointer active:bg-ink/[0.03] transition-colors"
              >
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${PRIORITY_ACCENT[c.priority]}`} />
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-ink text-[13.5px] leading-snug">{c.title}</p>
                  <ChevronRight size={15} className="text-slateink/40 flex-shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-slateink mt-1 flex items-center gap-2.5 flex-wrap">
                  <span>{c.citizenName}</span>
                  {c.imageUrl && (
                    <span className="inline-flex items-center gap-1 text-slateink/80">
                      <ImageIcon size={12} />
                    </span>
                  )}
                  {c.latitude != null && c.longitude != null && (
                    <span className="inline-flex items-center gap-1 text-slateink/80">
                      <MapPin size={12} />
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <CategoryTag category={c.category} />
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                  <span className="text-[11px] text-slateink font-mono ml-auto">
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