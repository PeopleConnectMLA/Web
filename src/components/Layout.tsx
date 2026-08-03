import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileWarning, Megaphone, BarChart3, ShieldCheck, LogOut, Menu, X } from "lucide-react";
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
  const nav = session?.user?.role === "ADMIN" ? ADMIN_NAV : session?.user?.role === 'MLA' ? MLA_NAV : OFF_NAV;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-parchment bg-grain">
      {/* Sidebar */}
      <aside className={`fixed lg:static z-30 inset-y-0 left-0 w-64 bg-ink text-parchment flex flex-col transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 px-5 py-6 border-b border-parchment/10">
          <Seal size={34} />
          <div>
            <p className="font-display font-semibold text-[15px] leading-tight">People Connect</p>
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-parchment/50">MLA Register</p>
          </div>
          <button className="ml-auto lg:hidden text-parchment/70" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${isActive
                  ? "bg-parchment/10 text-parchment border-l-2 border-marigold pl-[10px]"
                  : "text-parchment/60 hover:text-parchment hover:bg-parchment/5"
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-5 border-t border-parchment/10">
          <p className="text-sm font-medium">{session?.user?.name}</p>
          <p className="text-[11px] font-mono uppercase tracking-wide text-parchment/50 mb-3">{session?.user?.role}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-parchment/60 hover:text-parchment transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-ink/40 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-ink text-parchment sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Seal size={26} />
            <span className="font-display font-semibold text-sm">People Connect</span>
          </div>
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-9 max-w w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
