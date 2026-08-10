import { useEffect, useState } from "react";
import { PageHeader, StatCard } from "../components/Ui";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { AnalyticsResponse } from "../types";
import { getAnalytics } from "../services";
import { Loader2, TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";

// Vibrant Modern Dark Mode Palette
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6", "#06B6D4", "#EC4899"];

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("userId") || "";

  useEffect(() => {
    setLoading(true);
    getAnalytics(userId)
      .then((res) => {
        setAnalytics(res?.data ?? null);
      })
      .catch((err) => {
        console.error("Analytics fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading || !analytics) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
            Loading Analytics Engine...
          </p>
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(analytics.categoryBreakdown || {}).map(([name, value]) => ({
    name: name.replaceAll("_", " "),
    value,
  }));

  const statusData = [
    { name: "Resolved", value: analytics.resolvedComplaints, fill: "#10B981" },
    { name: "In Progress", value: analytics.inProgressComplaints, fill: "#F59E0B" },
    { name: "Pending", value: analytics.pendingComplaints, fill: "#F43F5E" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 text-slate-100">
      <PageHeader
        eyebrow="Performance Record"
        title="Performance Analytics"
        description="Real-time performance metrics tracking your office's resolution efficiency and category workload."
      />

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Total Complaints</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{analytics.totalComplaints}</span>
            <span className="text-xs text-blue-400 font-mono font-semibold">100% Volume</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Resolved</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">{analytics.resolvedComplaints}</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 size={13} /> Fixed
            </span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Pending</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-400 tracking-tight">{analytics.pendingComplaints}</span>
            <span className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
              <AlertCircle size={13} /> Needs Action
            </span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Resolution Rate</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {analytics.resolutionRatePercent}%
            </span>
            <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
              <TrendingUp size={13} /> Efficiency
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Data Visualization Split */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Donut Chart */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Complaints by Category</h3>
            <p className="text-xs text-slate-400">Distribution across infrastructure & service domains</p>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  stroke="none"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderRadius: "12px",
                    border: "1px solid #1E293B",
                    color: "#F8FAFC",
                    fontSize: "12px",
                    fontWeight: "bold",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{ color: "#38BDF8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t border-slate-800/80">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-xs text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="capitalize">{c.name}</span>
                <span className="font-mono text-slate-400 font-bold ml-auto">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Bar Chart */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Status Distribution</h3>
            <p className="text-xs text-slate-400">Active status breakdown for current docket</p>
          </div>

          <div style={{ width: "100%", height: 290 }}>
            <ResponsiveContainer>
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(30, 41, 59, 0.4)" }}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderRadius: "12px",
                    border: "1px solid #1E293B",
                    color: "#F8FAFC",
                    fontSize: "12px",
                    fontWeight: "bold",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}