import { useState, useEffect, useMemo } from "react";
import {
  ArrowUpRight,
  Phone,
  MapPin,
  BadgeCheck,
  Zap,
  Droplets,
  Trash2,
  Construction,
  CircleDot,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getComplaints, getMlaProfile } from "../services";

export interface ProfileData {
  id: number;
  name: string;
  party: string;
  constituencyId: string;
  constituencyName: string;
  districtId: string;
  districtName: string;
  phone: string;
  officeAddress: string;
  bio: string;
  photoUrl: string;
  verified: boolean;
}

export interface ComplaintItem {
  id: number;
  title: string;
  category: string;
  citizenName: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: string;
  createdDate: string;
}

const categoryMeta: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  ELECTRICITY: { icon: Zap, label: "Electricity", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  WATER: { icon: Droplets, label: "Water", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  SANITATION: { icon: Trash2, label: "Sanitation", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ROAD: { icon: Construction, label: "Road", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  OTHER: { icon: CircleDot, label: "Other", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
};

function docketNumber(id: number) {
  return `CMP-2026-${String(id).padStart(4, "0")}`;
}

function timeAgo(iso: string) {
  if (!iso) return "recently";
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  if (s === "RESOLVED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={12} /> Resolved
      </span>
    );
  }
  if (s === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock size={12} /> In Progress
      </span>
    );
  }
  if (s === "RECEIVED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <FileText size={12} /> Received
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
      <AlertCircle size={12} /> Unresolved
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priority?.toUpperCase();
  let dotColor = "bg-emerald-400";
  let label = "Low";

  if (p === "HIGH") {
    dotColor = "bg-rose-500";
    label = "High";
  } else if (p === "MEDIUM") {
    dotColor = "bg-amber-400";
    label = "Medium";
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

export default function Dashboard() {
  const { session } = useAuth();
  const mlaQueryId = session?.user?.id || 1;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!mlaQueryId) return;
      setLoading(true);
      try {
        // 1. Fetch MLA profile from API
        const profileRes = await getMlaProfile(mlaQueryId);
        const fetchedProfile = profileRes?.data;
        if (fetchedProfile) {
          setProfile(fetchedProfile);
        }

        // 2. Fetch complaints from API using MLA ID
        const targetId = fetchedProfile?.id || mlaQueryId;
        const complaintsRes = await getComplaints(targetId);
        if (complaintsRes?.data) {
          setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data.slice(0, 6) : []);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [mlaQueryId]);

  // Dynamic analytics calculated directly from complaints API response
  const analytics = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status?.toUpperCase() === "RESOLVED").length;
    const inProgress = complaints.filter((c) => c.status?.toUpperCase() === "IN_PROGRESS").length;
    const pending = complaints.filter(
      (c) => c.status?.toUpperCase() === "NEW" || c.status?.toUpperCase() === "PENDING" || c.status?.toUpperCase() === "UNRESOLVED"
    ).length;

    const breakdown: Record<string, number> = {
      ELECTRICITY: 0,
      WATER: 0,
      SANITATION: 0,
      ROAD: 0,
      OTHER: 0,
    };

    complaints.forEach((c) => {
      const cat = c.category?.toUpperCase() || "OTHER";
      breakdown[cat] = (breakdown[cat] || 0) + 1;
    });

    return {
      totalComplaints: total,
      resolvedComplaints: resolved,
      inProgressComplaints: inProgress,
      pendingComplaints: pending,
      categoryBreakdown: breakdown,
    };
  }, [complaints]);

  // Loading or empty profile state
  if (loading || !profile) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
            Loading Dashboard Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ---------------- Header Section ---------------- */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {profile.districtName} District
              </span>
              <span className="text-xs text-slate-500 font-mono">· Constituency Register</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {profile.constituencyName} Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Representative <span className="text-white font-semibold">{profile.name}</span> · {profile.party} Party
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-xl">
            {profile.photoUrl && (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
            )}
            <div className="pr-3">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white">{profile.name}</span>
                {profile.verified && (
                  <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">MLA Office</span>
            </div>
          </div>
        </div>

        {/* ---------------- Stat Cards Grid ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Filed Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Total Filed</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileText size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white tracking-tight">{analytics.totalComplaints}</span>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
                <TrendingUp size={14} /> Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">All received citizen grievances</p>
          </div>

          {/* Resolved Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Resolved</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">{analytics.resolvedComplaints}</span>
              <span className="text-xs font-medium text-slate-400 font-mono">
                {analytics.totalComplaints > 0 ? Math.round((analytics.resolvedComplaints / analytics.totalComplaints) * 100) : 0}% rate
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Action completed successfully</p>
          </div>

          {/* In Progress Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">In Progress</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-400 tracking-tight">{analytics.inProgressComplaints}</span>
              <span className="text-xs font-medium text-amber-400">Active</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Assigned to department officer</p>
          </div>

          {/* Pending Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-rose-400 tracking-tight">{analytics.pendingComplaints}</span>
              <span className="text-xs font-medium text-rose-400 font-mono">Needs Action</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Awaiting officer allocation</p>
          </div>
        </div>

        {/* ---------------- Main Split Grid ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submissions List (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Latest Submissions</h3>
                <p className="text-xs text-slate-400">Recent citizen complaints filed in constituency</p>
              </div>
              <Link
                to="/complaints"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20"
              >
                Full Register <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl divide-y divide-slate-800/60 shadow-xl overflow-hidden">
              {complaints.map((c) => {
                const catMeta = categoryMeta[c.category?.toUpperCase()] || categoryMeta.OTHER;
                const CatIcon = catMeta.icon;

                return (
                  <div
                    key={c.id}
                    className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${catMeta.bg}`}>
                        <CatIcon size={18} className={catMeta.color} />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {docketNumber(c.id)}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs text-slate-500">{timeAgo(c.createdDate)}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white truncate">
                          {c.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="capitalize">{catMeta.label}</span>
                          <span>·</span>
                          <span>filed by <strong className="text-slate-300">{c.citizenName || "Citizen"}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                );
              })}

              {complaints.length === 0 && (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No grievances filed yet for this constituency.
                </div>
              )}
            </div>
          </div>

          {/* Profile & Category Breakdown Sidebar (1 Column) */}
          <div className="space-y-6">
            {/* Representative Profile Card */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />
              
              <div className="flex items-start gap-4">
                {profile.photoUrl && (
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{profile.name}</h3>
                  <p className="text-xs text-slate-400">{profile.party} Party Representative</p>
                  {profile.verified && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <BadgeCheck size={13} /> Verified Office
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                {profile.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-slate-500 shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.officeAddress && (
                  <div className="flex items-start gap-2.5 leading-relaxed">
                    <MapPin size={14} className="text-slate-500 shrink-0 mt-0.5" />
                    <span>{profile.officeAddress}</span>
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-xs text-slate-400 leading-relaxed pt-3 border-t border-slate-800/80">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Category Distribution */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                By Category Breakdown
              </h4>

              <div className="space-y-3.5">
                {Object.entries(analytics.categoryBreakdown).map(([cat, count]) => {
                  const meta = categoryMeta[cat] || categoryMeta.OTHER;
                  const CatIcon = meta.icon;
                  const pct =
                    analytics.totalComplaints > 0
                      ? Math.round((count / analytics.totalComplaints) * 100)
                      : 0;

                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <CatIcon size={14} className={meta.color} />
                          <span>{meta.label}</span>
                        </div>
                        <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}