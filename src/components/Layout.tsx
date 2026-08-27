import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileWarning,
  Megaphone,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import Seal from "./Seal";
import { useAuth } from "../context/AuthContext";

const MLA_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/complaints", label: "Grievance Register", icon: FileWarning },
  { to: "/posts", label: "Activity Posts", icon: Megaphone },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const OFF_NAV = [
  { to: "/OfficierComplaints", label: "Grievance Register", icon: FileWarning },
];

const ADMIN_NAV = [
  { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const role = session?.user?.role;
  const nav = role === "ADMIN" ? ADMIN_NAV : role === "MLA" ? MLA_NAV : OFF_NAV;

  function confirmLogout() {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar - Sticky Full Height Container */}
      <aside
        className={`fixed lg:sticky top-0 z-30 inset-y-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header & Nav Items */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80 shrink-0">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
              <Seal size={32} />
            </div>
            <div>
              <p className="font-extrabold text-[15px] leading-tight text-white tracking-tight">
                People Connect
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold mt-0.5">
                {role === "ADMIN" ? "Admin Portal" : role === "OFFICER" ? "Officer Portal" : "MLA Register"}
              </p>
            </div>
            <button
              className="ml-auto lg:hidden text-slate-400 hover:text-white p-1"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Navigation List */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-md ring-1 ring-blue-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`
                }
              >
                <Icon size={18} strokeWidth={2} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Pinned Bottom User & Sign Out Section */}
        <div className="p-4 m-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-3 shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <UserCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{session?.user?.name || "Official User"}</p>
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {role || "USER"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-500/10 py-2.5 rounded-xl border border-slate-800 hover:border-rose-500/20 transition-all duration-200"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ⚠️ Sign Out Warning Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Confirm Sign Out</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to log out of your session? You will need to sign in again to access the register.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700/60 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <div className="flex-1 min-w-0 flex flex-col bg-slate-950">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <Seal size={28} />
            <span className="font-extrabold text-sm tracking-tight">People Connect</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}