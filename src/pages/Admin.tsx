import { useEffect, useState } from "react";
import { getUnverifiedMlas, verifyMla, getUsers, setUserActive, getDistricts } from "../api/client";
import { PageHeader, EmptyState } from "../components/Ui";
import { ShieldCheck, MapPin, Users } from "lucide-react";
import type { AppUser, District, UnverifiedMla } from "../types";

export default function Admin() {
  const [unverified, setUnverified] = useState<UnverifiedMla[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    getUnverifiedMlas().then(setUnverified);
    getUsers().then(setUsers);
    getDistricts().then(setDistricts);
  }

  async function handleVerify(id) {
    await verifyMla(id);
    setUnverified((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleToggleActive(u) {
    const updated = await setUserActive(u.id, !u.active);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: updated?.active ?? !u.active } : x)));
  }

  return (
    <div>
      <PageHeader
        eyebrow="District Administration"
        title="Admin Panel"
        description="Verify MLA accounts, manage districts, and moderate user access."
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="file-card p-5 flex items-start gap-3">
          <MapPin size={18} className="text-seal mt-0.5" />
          <div>
            <p className="font-mono text-2xl font-semibold text-ink">{districts.length}</p>
            <p className="text-xs text-slateink">Districts managed</p>
          </div>
        </div>
        <div className="file-card p-5 flex items-start gap-3">
          <Users size={18} className="text-banyan mt-0.5" />
          <div>
            <p className="font-mono text-2xl font-semibold text-ink">{users.length}</p>
            <p className="text-xs text-slateink">Registered users</p>
          </div>
        </div>
        <div className="file-card p-5 flex items-start gap-3">
          <ShieldCheck size={18} className="text-marigold-light mt-0.5" />
          <div>
            <p className="font-mono text-2xl font-semibold text-ink">{unverified.length}</p>
            <p className="text-xs text-slateink">Pending MLA verification</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <p className="eyebrow mb-3">Pending MLA verification</p>
          {unverified.length === 0 ? (
            <EmptyState title="All caught up" description="No MLA accounts are awaiting verification right now." />
          ) : (
            <div className="file-card divide-y divide-ink/8">
              {unverified.map((m) => (
                <div key={m.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{m.name}</p>
                    <p className="text-xs text-slateink">{m.constituencyName} · {m.districtName}</p>
                  </div>
                  <button onClick={() => handleVerify(m.id)} className="btn-secondary shrink-0 text-xs px-3 py-1.5">
                    Verify
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow mb-3">User management</p>
          <div className="file-card divide-y divide-ink/8 max-h-[420px] overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                  <p className="text-xs text-slateink font-mono">{u.mobile} · {u.role} · {u.constituencyName}</p>
                </div>
                <button
                  onClick={() => handleToggleActive(u)}
                  className={`text-[11px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-sm border shrink-0 ${
                    u.active ? "border-banyan/40 text-banyan" : "border-seal/40 text-seal"
                  }`}
                >
                  {u.active ? "Active" : "Deactivated"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
