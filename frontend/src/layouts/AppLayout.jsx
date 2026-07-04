import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  FileBarChart,
  Truck,
  Menu,
  ScrollText,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const adminNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/pemesanan", label: "Pemesanan", icon: ClipboardList },
  { to: "/kendaraan", label: "Kendaraan", icon: Truck },
  { to: "/laporan", label: "Laporan", icon: FileBarChart },
  { to: "/log-aktivitas", label: "Log Aktivitas", icon: ScrollText },
];

const approverNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/approval", label: "Approval Saya", icon: CheckSquare },
  { to: "/laporan", label: "Laporan", icon: FileBarChart },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === "admin" ? adminNav : approverNav;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-base">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-contour-dark text-white">
        <SidebarContent navItems={navItems} onLogout={handleLogout} />
      </aside>

      {/* Sidebar - mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-contour-dark text-white flex flex-col animate-[slideIn_0.2s_ease-out]">
            <SidebarContent navItems={navItems} onNavigate={() => setOpen(false)} onLogout={handleLogout} />
          </div>
          <div
            className="flex-1 bg-ink/50 animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-base-card border-b border-base-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-ink-muted hover:text-ink -ml-1 p-1.5 rounded-md hover:bg-base transition-colors"
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="font-display font-semibold text-ink text-sm lg:text-base leading-tight">
                Sistem Pemesanan Kendaraan
              </p>
              <p className="text-xs text-ink-muted hidden sm:block">{user?.region}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-ink leading-tight">{user?.name}</p>
              <p className="text-xs text-ink-muted capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-display font-semibold text-sm shrink-0">
              {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navItems, onNavigate, onLogout }) {
  return (
    <>
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10">
        <div className="w-8 h-8 rounded-md bg-ore-400 flex items-center justify-center shrink-0">
          <Truck size={18} className="text-ink" strokeWidth={2.5} />
        </div>
        <span className="font-display font-semibold text-white tracking-tight">Ningali</span>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-lg text-sm font-medium border-l-2 transition-colors ${
                isActive
                  ? "bg-white/10 text-white border-ore-400"
                  : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          Keluar
        </button>
      </div>
    </>
  );
}
