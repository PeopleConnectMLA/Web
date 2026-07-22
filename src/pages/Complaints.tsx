import { useEffect, useMemo, useState } from "react";
import { getComplaints } from "../api/client";
import { PageHeader, EmptyState } from "../components/Ui";
import { StatusBadge, PriorityBadge, CategoryTag } from "../components/Badges";
import ComplaintDrawer from "../components/ComplaintDrawer";
import { Search } from "lucide-react";
import type { Complaint, ComplaintStatus } from "../types";

type StatusFilter = ComplaintStatus | "ALL";

const STATUS_FILTERS: StatusFilter[] = ["ALL", "NEW", "RECEIVED", "IN_PROGRESS", "RESOLVED"];

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Complaint | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getComplaints().then((list) => {
      setComplaints(list);
      setLoading(false);
    });
  }

  const filtered = useMemo(() => {
    return complaints
      .filter((c) => filter === "ALL" || c.status === filter)
      .filter((c) => c.title.toLowerCase().includes(query.toLowerCase()) || c.citizenName.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return order[a.priority] - order[b.priority] || new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      });
  }, [complaints, filter, query]);

  function handleUpdated(updated: Complaint) {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    setSelected((s) => (s ? { ...s, ...updated } : s));
  }

  return (
    <div>
      <PageHeader
        eyebrow="District Register"
        title="Grievance Register"
        description="Every complaint routed to your constituency, sorted by priority."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
          <input
            className="input-field pl-9"
            placeholder="Search by title or citizen name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-sm text-xs font-mono uppercase tracking-wide border whitespace-nowrap transition-colors ${
                filter === s ? "bg-ink text-parchment border-ink" : "border-ink/15 text-slateink hover:border-ink/30"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="file-card px-6 py-14 text-center text-sm text-slateink">Loading register…</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching complaints" description="Adjust your filters or search terms to see more of the register." />
      ) : (
        <div className="file-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                <th className="eyebrow font-normal px-5 py-3">Complaint</th>
                <th className="eyebrow font-normal px-5 py-3 hidden md:table-cell">Category</th>
                <th className="eyebrow font-normal px-5 py-3">Priority</th>
                <th className="eyebrow font-normal px-5 py-3">Status</th>
                <th className="eyebrow font-normal px-5 py-3 hidden sm:table-cell">Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)} className="cursor-pointer hover:bg-ink/[0.03] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink text-[13.5px] leading-snug max-w-xs">{c.title}</p>
                    <p className="text-xs text-slateink mt-0.5">{c.citizenName} · {c.affectedCount} affected</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell"><CategoryTag category={c.category} /></td>
                  <td className="px-5 py-3.5"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-slateink font-mono">
                    {new Date(c.createdDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ComplaintDrawer complaint={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
}
