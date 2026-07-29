import { useEffect, useMemo, useState } from "react";
import { X, MapPin, User, Calendar, Users2 } from "lucide-react";
import { StatusBadge, PriorityBadge, CategoryTag } from "./Badges";
import type { Complaint, ComplaintStatus, Officer } from "../types";
import { getAllOfficersByConstituencyId, updateComplaintStatus } from "../services";
import { SearchableSelect } from "./SearchableSelect";

const STATUS_FLOW: ComplaintStatus[] = ["NEW", "RECEIVED", "IN_PROGRESS", "RESOLVED"];

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
  const [officerId, setOfficerId] = useState("");
  const [saving, setSaving] = useState(false);
  const [justResolved, setJustResolved] = useState(false);
  const constituencyId = sessionStorage.getItem('constituencyId')

  useEffect(() => {
    const loadOfficers = async () => {
      setOfficersLoading(true);
      try {
        const res = await getAllOfficersByConstituencyId(constituencyId);
        console.log(res?.data);
        setOfficers(res?.data ?? []);
      } finally {
        setOfficersLoading(false);
      }
    };

    loadOfficers();

    setStatus(complaint.status);
    setOfficerId("");
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
      onClose()
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-parchment h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-parchment border-b border-ink/10 px-6 py-4 flex items-center justify-between z-10">
          <p className="eyebrow">Complaint #{complaint.id}</p>
          <button onClick={onClose} className="text-ink/60 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <CategoryTag category={complaint.category} />
          </div>

          <h2 className="font-display text-xl font-semibold text-ink mb-2 leading-snug">{complaint.title}</h2>
          <p className="text-sm text-ink/75 leading-relaxed mb-5">{complaint.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm mb-6">
            <div className="flex items-center gap-2 text-ink/70"><User size={14} className="text-slateink" /> {complaint.citizenName}</div>
            <div className="flex items-center gap-2 text-ink/70"><Users2 size={14} className="text-slateink" /> {complaint.affectedCount} affected</div>
            <div className="flex items-center gap-2 text-ink/70 col-span-2"><MapPin size={14} className="text-slateink" /> {complaint.addressText}</div>
            <div className="flex items-center gap-2 text-ink/70 col-span-2">
              <Calendar size={14} className="text-slateink" /> Submitted {new Date(complaint.createdDate).toLocaleString()}
            </div>
          </div>

          {complaint.imageUrl && (
            <img src={complaint.imageUrl} alt="Evidence" className="rounded-sm mb-6 border border-ink/10" />
          )}

          <div className="border-t border-ink/10 pt-5">
            <p className="eyebrow mb-3">Update status</p>

            <div className="flex items-center gap-1.5 mb-5">
              {STATUS_FLOW.map((s, i) => {
                const currentIdx = STATUS_FLOW.indexOf(status);
                const reached = i <= currentIdx;
                return (
                  <div key={s} className="flex items-center flex-1">
                    <button
                      onClick={() => setStatus(s)}
                      className={`w-full text-center py-2 text-[10px] font-mono uppercase tracking-wide rounded-sm border transition-colors ${
                        reached ? "bg-ink text-parchment border-ink" : "border-ink/15 text-slateink hover:border-ink/30"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                    {i < STATUS_FLOW.length - 1 && <div className={`h-px w-2 shrink-0 ${reached ? "bg-ink" : "bg-ink/15"}`} />}
                  </div>
                );
              })}
            </div>

            <label className="block mb-3">
              <span className="text-xs font-medium text-ink/70 mb-1.5 block">Assign officer (optional)</span>
              <SearchableSelect
                options={officerOptions}
                value={officerId}
                onChange={setOfficerId}
                loading={officersLoading}
                placeholder="— No change —"
                searchPlaceholder="Search officers..."
                emptyLabel="No officers found"
                triggerClassName="input-field"
              />
            </label>

            <label className="block mb-5">
              <span className="text-xs font-medium text-ink/70 mb-1.5 block">Remarks for the citizen</span>
              <textarea
                className="input-field min-h-[80px] resize-none"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Ward engineer inspected site, work order raised."
              />
            </label>

            <button onClick={handleSave} disabled={saving} className={`w-full ${status === "RESOLVED" ? "btn-seal" : "btn-primary"}`}>
              {saving ? "Saving…" : status === "RESOLVED" ? "Mark resolved & notify citizen" : "Save update & notify citizen"}
            </button>

            {justResolved && (
              <div className="mt-6 flex flex-col items-center animate-stamp">
                <div className="w-20 h-20 rounded-full border-4 border-seal flex items-center justify-center rotate-[-10deg] stamp-ring">
                  <span className="font-display font-bold text-seal text-[13px] tracking-wide">RESOLVED</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}