import { useEffect, useState } from "react";
import { PageHeader, StatCard } from "../components/Ui";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { AnalyticsResponse } from "../types";
import { getAnalytics } from "../services";

const COLORS = ["#A63A2C", "#D9A02A", "#2E5339", "#1B2740", "#5B6472", "#C24E3D", "#3E6B4B", "#28395c"];

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const userId = sessionStorage.getItem('userId')
  
  useEffect(() => {
    getAnalytics(userId).then((res) => {
      setAnalytics(res?.data ?? {});
    });
  }, [userId]);

  if (!analytics) return <p className="text-slateink text-sm">Loading analytics…</p>;

  const categoryData = Object.entries(analytics.categoryBreakdown || {}).map(([name, value]) => ({
    name: name.replaceAll("_", " "),
    value,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Performance Record"
        title="Analytics"
        description="How your office is performing against the constituency's grievance load."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Complaints" value={analytics.totalComplaints} accent="ink" />
        <StatCard label="Resolved" value={analytics.resolvedComplaints} accent="banyan" />
        <StatCard label="Pending" value={analytics.pendingComplaints} accent="seal" />
        <StatCard label="Resolution Rate" value={analytics.resolutionRatePercent} suffix="%" accent="marigold" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="file-card p-5">
          <p className="eyebrow mb-4">Complaints by category</p>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 2, border: "1px solid rgba(27,39,64,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-xs text-ink/70">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                {c.name} <span className="text-slateink font-mono ml-auto">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="file-card p-5">
          <p className="eyebrow mb-4">Status distribution</p>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart
                data={[
                  { name: "Resolved", value: analytics.resolvedComplaints, fill: "#2E5339" },
                  { name: "In Progress", value: analytics.inProgressComplaints, fill: "#1B2740" },
                  { name: "Pending", value: analytics.pendingComplaints, fill: "#A63A2C" },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,39,64,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "Inter", fill: "#5B6472" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fontFamily: "IBM Plex Mono", fill: "#5B6472" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 2, border: "1px solid rgba(27,39,64,0.1)" }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
