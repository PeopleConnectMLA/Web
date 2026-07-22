import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAnalytics, getComplaints, getMlaProfile } from "../api/client";
import { PageHeader, StatCard } from "../components/Ui";
import { StatusBadge, PriorityBadge, CategoryTag } from "../components/Badges";
import { ArrowUpRight, Phone, MapPin } from "lucide-react";
import type { AnalyticsResponse, Complaint, MlaProfile } from "../types";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [profile, setProfile] = useState<MlaProfile | null>(null);

  useEffect(() => {
    getAnalytics().then(setAnalytics);
    getComplaints().then((list) => setComplaints(list.slice(0, 5)));
    getMlaProfile().then(setProfile);
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Constituency Overview"
        title={profile ? `${profile.constituencyName} Dashboard` : "Dashboard"}
        description={profile ? `${profile.name} · ${profile.party} · ${profile.districtName} District` : ""}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Complaints" value={analytics?.totalComplaints ?? "—"} accent="ink" />
        <StatCard label="Resolved" value={analytics?.resolvedComplaints ?? "—"} accent="banyan" />
        <StatCard label="In Progress" value={analytics?.inProgressComplaints ?? "—"} accent="marigold" />
        <StatCard label="Pending" value={analytics?.pendingComplaints ?? "—"} accent="seal" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="eyebrow">Latest submissions</p>
            <Link to="/complaints" className="text-sm text-seal hover:text-seal-dark font-medium inline-flex items-center gap-1">
              View register <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="file-card divide-y divide-ink/8">
            {complaints.map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{c.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <CategoryTag category={c.category} />
                    <span className="text-xs text-slateink">by {c.citizenName}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              </div>
            ))}
            {complaints.length === 0 && (
              <p className="px-5 py-8 text-sm text-slateink text-center">No complaints yet.</p>
            )}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-3">Your profile</p>
          <div className="file-card p-5">
            <div className="w-14 h-14 rounded-full bg-ink/10 flex items-center justify-center font-display text-xl text-ink mb-3">
              {profile?.name?.[0] || "M"}
            </div>
            <p className="font-display text-lg text-ink font-semibold">{profile?.name}</p>
            <p className="text-xs text-slateink mb-4">{profile?.party}</p>
            <div className="space-y-2.5 text-sm text-ink/80">
              <p className="flex items-center gap-2"><Phone size={14} className="text-slateink" /> {profile?.phone}</p>
              <p className="flex items-start gap-2"><MapPin size={14} className="text-slateink mt-0.5" /> {profile?.officeAddress}</p>
            </div>
            {profile?.bio && <p className="text-xs text-slateink mt-4 leading-relaxed border-t border-ink/8 pt-4">{profile.bio}</p>}
            {profile?.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wide text-banyan mt-4">
                ● Verified office
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
