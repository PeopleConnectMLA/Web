import { useEffect, useMemo, useState } from "react";
import { X, MapPin, User, Calendar, Users2, CheckCircle2 } from "lucide-react";
import { StatusBadge, PriorityBadge, CategoryTag } from "./Badges";
import type { Complaint, ComplaintStatus, Officer } from "../types";
import { getAllOfficersByConstituencyId, updateComplaintStatus } from "../services";
import { SearchableSelect } from "./SearchableSelect";

const STATUS_FLOW: ComplaintStatus[] = ["NEW", "RECEIVED", "IN_PROGRESS", "RESOLVED", "REJECTED"];

interface ComplaintDrawerProps {
  complaint: Complaint;
  onClose: () => void;
  onUpdated: (updated: Complaint) => void;
}

export default function ComplaintDrawer({ complaint, onClose, onUpdated }: ComplaintDrawerProps) {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [remarks, setRemarks] = useState("");
  const [officerId, setOfficerId] = useState(complaint?.assignedOfficer || "");
  const [saving, setSaving] = useState(false);
  const [justResolved, setJustResolved] = useState(false);
  const constituencyId = sessionStorage.getItem("constituencyId");

  useEffect(() => {
    const loadOfficers = async () => {
      setOfficersLoading(true);
      try {
        const res = await getAllOfficersByConstituencyId(constituencyId);
        setOfficers(res?.data ?? []);
      } finally {
        setOfficersLoading(false);
      }
    };

    loadOfficers();

    setStatus(complaint.status);
    setOfficerId(complaint?.assignOfficerId ? String(complaint.assignOfficerId) : "");
    setJustResolved(false);
  }, [complaint, constituencyId]);

  const officerOptions = useMemo(
    () =>
      officers.map((o) => ({
        id: String(o.id),
        label: o.name,
        sublabel: o.wardName ?? o.constituencyName ?? o.districtName,
      })),
    [officers]
  );

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateComplaintStatus(complaint.id, {
        status,
        remarks,
        assignOfficerId: officerId || undefined,
      });
      if (status === "RESOLVED" && complaint.status !== "RESOLVED") setJustResolved(true);
      onUpdated({ ...complaint, ...updated, status });
      setRemarks("");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between z-10">
          <p className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider">
            Complaint #{complaint.id}
          </p>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 flex-1">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <CategoryTag category={complaint.category} />
          </div>

          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-white mb-2 leading-snug">{complaint.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{complaint.description}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-300">
              <User size={14} className="text-slate-500 shrink-0" /> {complaint.citizenName}
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Users2 size={14} className="text-slate-500 shrink-0" /> {complaint.affectedCount} affected
            </div>
            <div className="flex items-center gap-2 text-slate-300 col-span-2">
              <MapPin size={14} className="text-slate-500 shrink-0" /> {complaint.addressText}
            </div>
            <div className="flex items-center gap-2 text-slate-400 col-span-2 font-mono">
              <Calendar size={14} className="text-slate-500 shrink-0" /> Submitted {new Date(complaint.createdDate).toLocaleString()}
            </div>
          </div>

          {/* Image Evidence */}
          {complaint.imageUrl && (
            <img src={complaint.imageUrl} alt="Evidence" className="rounded-xl border border-slate-800 w-full object-cover max-h-60 shadow-lg" />
          )}

          {/* Update Section */}
          <div className="border-t border-slate-800 pt-5 space-y-5">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Update Status Flow
            </p>

            {/* Status Steps */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {STATUS_FLOW.map((s, i) => {
                const currentIdx = STATUS_FLOW.indexOf(status);
                const reached = i <= currentIdx;
                return (
                  <div key={s} className="flex items-center flex-1 min-w-[70px]">
                    <button
                      onClick={() => setStatus(s)}
                      className={`w-full text-center py-2 text-[10px] font-mono uppercase font-bold tracking-wide rounded-xl border transition-all ${
                        reached
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                          : "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Assign Officer Select */}
            <label className="block">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Assign Officer (Optional)
              </span>
              <SearchableSelect
                options={officerOptions}
                value={officerId}
                onChange={setOfficerId}
                loading={officersLoading}
                placeholder="— No change —"
                searchPlaceholder="Search officers..."
                emptyLabel="No officers found"
                triggerClassName="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </label>

            {/* Remarks */}
            <label className="block">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Remarks for Citizen
              </span>
              <textarea
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[90px] resize-none"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Ward engineer inspected site, work order raised."
              />
            </label>

            {/* Submit Action Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                status === "RESOLVED"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-600/20"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-blue-600/20"
              }`}
            >
              {saving ? "Saving…" : status === "RESOLVED" ? "Mark Resolved & Notify Citizen" : "Save Update & Notify Citizen"}
            </button>

            {justResolved && (
              <div className="mt-6 flex flex-col items-center animate-bounce">
                <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} /> RESOLVED & NOTIFIED
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}