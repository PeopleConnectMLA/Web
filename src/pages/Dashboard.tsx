import { useState } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";

// ---------------------------------------------------------------------------
// Design tokens — "Official Register" system (kept as a reference map for
// values Tailwind's default palette can't express — banyan green, marigold,
// stamp red, and the warm ledger-paper neutrals).
// ---------------------------------------------------------------------------
const tokens = {
  ink: "#1C2420",
  inkSoft: "#3A4440",
  paper: "#F3F0E6",
  paperRaised: "#FBF9F2",
  line: "#DDD6C2",
  banyan: "#2F6B54",
  banyanSoft: "#E4EEE7",
  marigold: "#C97D24",
  seal: "#A23B2E",
  sealSoft: "#F2E0DB",
  slate: "#6B6558",
};

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
`;

// ---------------------------------------------------------------------------
// Sample data — shaped exactly like the real API responses
// ---------------------------------------------------------------------------
const analytics = {
  categoryBreakdown: { ELECTRICITY: 2, OTHER: 1, ROAD: 1, SANITATION: 1, WATER: 2 },
  inProgressComplaints: 0,
  pendingComplaints: 7,
  resolutionRatePercent: 0,
  resolvedComplaints: 0,
  totalComplaints: 7,
};

const profile = {
  bio: "MLA representing the Thoothukudi Assembly Constituency, committed to improving public infrastructure and citizen services.",
  constituencyName: "Thoothukkudi",
  districtName: "Thoothukudi",
  name: "Srinath",
  officeAddress: "Near Collector Office, Thoothukudi, Tamil Nadu - 628001",
  party: "Independent",
  phone: "9345678901",
  photoUrl:
    "https://media.dinamani.com/dinamani/2026-03-29/2raptv5o/tut29tvk_srinath_2903chn_32_6.jpg?w=1200&q=65&auto=format%2Ccompress&fit=max",
  verified: true,
};

const complaints = [
  { id: 7, title: "More problem", category: "OTHER", citizenName: "Arockia Wilfread", priority: "LOW", status: "NEW", createdDate: "2026-07-29T18:10:11" },
  { id: 6, title: "Streetlight not working on Velachery Main Road", category: "ELECTRICITY", citizenName: "System Administrator", priority: "LOW", status: "NEW", createdDate: "2026-07-29T17:56:45" },
  { id: 5, title: "No drinking water supply", category: "WATER", citizenName: "System Administrator", priority: "MEDIUM", status: "NEW", createdDate: "2026-07-26T22:50:27" },
  { id: 4, title: "Garbage not collected", category: "SANITATION", citizenName: "System Administrator", priority: "LOW", status: "NEW", createdDate: "2026-07-26T22:50:04" },
  { id: 3, title: "Drainage overflow near market", category: "WATER", citizenName: "System Administrator", priority: "MEDIUM", status: "NEW", createdDate: "2026-07-26T22:49:56" },
];

const categoryMeta = {
  ELECTRICITY: { icon: Zap, label: "Electricity" },
  WATER: { icon: Droplets, label: "Water" },
  SANITATION: { icon: Trash2, label: "Sanitation" },
  ROAD: { icon: Construction, label: "Road" },
  OTHER: { icon: CircleDot, label: "Other" },
};

const priorityMeta = {
  LOW: { hex: tokens.banyan, label: "Low" },
  MEDIUM: { hex: tokens.marigold, label: "Medium" },
  HIGH: { hex: tokens.seal, label: "High" },
};

function docketNumber(id) {
  return `CMP-2026-${String(id).padStart(4, "0")}`;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function Stamp({ value, label, dotHex }) {
  return (
    <div className="relative w-full overflow-hidden rounded-[4px] border border-[#DDD6C2] bg-[#FBF9F2] px-[18px] pb-4 pt-[18px]">
      <div
        className="absolute right-[10px] top-[10px] h-2 w-2 rounded-full"
        style={{ background: dotHex }}
      />
      <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6B6558]">
        {label}
      </p>
      <p className="font-serif text-[34px] font-semibold leading-none text-[#1C2420]">
        {value}
      </p>
    </div>
  );
}

function CategoryTag({ category }) {
  const meta = categoryMeta[category] || categoryMeta.OTHER;
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#DDD6C2] bg-[#F3F0E6] py-[3px] pl-1.5 pr-2 font-mono text-[10.5px] uppercase tracking-[0.04em] text-[#3A4440]">
      <Icon size={11} strokeWidth={2} />
      {meta.label}
    </span>
  );
}

function PriorityDot({ priority }) {
  const meta = priorityMeta[priority] || priorityMeta.LOW;
  return (
    <span className="inline-flex items-center gap-[5px] text-[11px] text-[#6B6558]">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: meta.hex }}
      />
      {meta.label} priority
    </span>
  );
}

function StatusStamp({ status }) {
  const isNew = status === "NEW";
  return (
    <div
      className={`inline-block -rotate-2 rounded-[3px] border-[1.5px] px-[9px] py-[3px] font-mono text-[10px] font-semibold tracking-[0.06em] ${isNew
          ? "border-[#A23B2E] bg-[#F2E0DB] text-[#A23B2E]"
          : "border-[#2F6B54] bg-[#E4EEE7] text-[#2F6B54]"
        }`}
    >
      {isNew ? "UNRESOLVED" : status}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div className="min-h-full w-full  bg-[#F3F0E6] font-sans">
      <style>{fontImport}</style>
      <style>{`
        .register-serif { font-family: 'Source Serif 4', serif; }
        .register-mono { font-family: 'IBM Plex Mono', monospace; }
        .register-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="register-sans mx-auto w-full">
        {/* ---------------- Header ---------------- */}
        <div className="mb-7 flex w-full flex-wrap items-end justify-between gap-4 border-b-2 border-[#1C2420] pb-5">
          <div>
            <p className="register-mono mb-2 text-[11px] uppercase tracking-[0.14em] text-[#A23B2E]">
              Constituency Register · {profile.districtName} District
            </p>
            <h1 className="register-serif m-0 text-4xl font-bold tracking-[-0.01em] text-[#1C2420]">
              {profile.constituencyName} Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-[#6B6558]">
              {profile.name} · {profile.party}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="h-14 w-14 rounded-[4px] border border-[#DDD6C2] object-cover"
            />
          </div>
        </div>

        {/* ---------------- Stat stamps ---------------- */}
        <div className="mb-9 grid w-full grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          <Stamp value={analytics.totalComplaints} label="Total filed" dotHex={tokens.ink} />
          <Stamp value={analytics.resolvedComplaints} label="Resolved" dotHex={tokens.banyan} />
          <Stamp value={analytics.inProgressComplaints} label="In progress" dotHex={tokens.marigold} />
          <Stamp value={analytics.pendingComplaints} label="Pending" dotHex={tokens.seal} />
        </div>

        <div className="grid w-full grid-cols-1 gap-7 lg:grid-cols-[1.7fr_1fr]">
          {/* ---------------- Case register ---------------- */}
          <div className="w-full">
            <div className="mb-3 flex w-full items-baseline justify-between">
              <p className="register-mono text-[11px] uppercase tracking-[0.1em] text-[#6B6558]">
                Latest submissions
              </p>
              <Link
                to="/complaints"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#2F6B54] no-underline"
              >
                View full register <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="w-full rounded-[4px] border border-[#DDD6C2] bg-[#FBF9F2]">
              {complaints.map((c, i) => (
                <div
                  key={c.id}
                  onMouseEnter={() => setHoveredRow(c.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`flex w-full gap-4 px-[18px] py-4 transition-colors duration-150 ${i < complaints.length - 1 ? "border-b border-dashed border-[#DDD6C2]" : ""
                    } ${hoveredRow === c.id ? "bg-[#F3F0E6]" : "bg-transparent"}`}
                >
                  <div className="w-24 flex-shrink-0 pt-0.5">
                    <p className="register-mono text-[11px] font-semibold text-[#6B6558]">
                      {docketNumber(c.id)}
                    </p>
                    <p className="register-mono mt-0.5 text-[10px] text-[#6B6558] opacity-70">
                      {timeAgo(c.createdDate)}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="register-serif mb-1.5 truncate text-[15.5px] font-semibold text-[#1C2420]">
                      {c.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryTag category={c.category} />
                      <span className="text-xs text-[#6B6558]">filed by {c.citizenName}</span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <StatusStamp status={c.status} />
                    <PriorityDot priority={c.priority} />
                  </div>
                </div>
              ))}
              {complaints.length === 0 && (
                <p className="px-[18px] py-8 text-center text-sm text-[#6B6558]">
                  No complaints filed yet.
                </p>
              )}
            </div>
          </div>

          {/* ---------------- Profile ID card ---------------- */}
          <div className="w-full">
            <p className="register-mono mb-3 text-[11px] uppercase tracking-[0.1em] text-[#6B6558]">
              Office of record
            </p>

            <div className="w-full overflow-hidden rounded-[4px] border border-[#DDD6C2] bg-[#FBF9F2]">
              <div
                className="h-1.5 w-full"
                style={{
                  background: `linear-gradient(90deg, ${tokens.banyan}, ${tokens.marigold} 50%, ${tokens.seal})`,
                }}
              />

              <div className="w-full p-[22px]">
                <div className="mb-4 flex w-full items-start gap-3.5">
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="h-16 w-16 flex-shrink-0 rounded-[4px] border border-[#DDD6C2] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="register-serif text-xl font-bold text-[#1C2420]">
                      {profile.name}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-[#6B6558]">{profile.party}</p>
                    {profile.verified && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-[3px] border border-[#2F6B5433] bg-[#E4EEE7] px-[7px] py-[3px] font-mono text-[10.5px] uppercase tracking-[0.05em] text-[#2F6B54]">
                        <BadgeCheck size={12} strokeWidth={2.5} />
                        Verified office
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2.5 border-t border-dashed border-[#DDD6C2] pt-3.5">
                  <p className="flex items-center gap-2 text-[13.5px] text-[#3A4440]">
                    <Phone size={14} className="text-[#6B6558]" />
                    {profile.phone}
                  </p>
                  <p className="flex items-start gap-2 text-[13.5px] leading-snug text-[#3A4440]">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#6B6558]" />
                    {profile.officeAddress}
                  </p>
                </div>

                {profile.bio && (
                  <p className="mt-4 border-t border-dashed border-[#DDD6C2] pt-3.5 text-[12.5px] leading-relaxed text-[#6B6558]">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Category breakdown — quiet secondary read */}
            <div className="mt-[18px] w-full">
              <p className="register-mono mb-2.5 text-[11px] uppercase tracking-[0.1em] text-[#6B6558]">
                By category
              </p>
              <div className="flex w-full flex-col gap-2">
                {Object.entries(analytics.categoryBreakdown).map(([cat, count]) => {
                  const meta = categoryMeta[cat] || categoryMeta.OTHER;
                  const Icon = meta.icon;
                  const pct = Math.round((count / analytics.totalComplaints) * 100);
                  return (
                    <div key={cat} className="flex w-full items-center gap-2">
                      <Icon size={13} className="flex-shrink-0 text-[#6B6558]" />
                      <span className="w-[78px] flex-shrink-0 text-[12.5px] text-[#3A4440]">
                        {meta.label}
                      </span>
                      <div className="h-[5px] flex-1 overflow-hidden rounded-[3px] border border-[#DDD6C2] bg-[#F3F0E6]">
                        <div
                          className="h-full bg-[#1C2420] opacity-75"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="register-mono w-4 text-right text-[11px] text-[#6B6558]">
                        {count}
                      </span>
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