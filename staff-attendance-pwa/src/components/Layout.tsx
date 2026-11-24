import { useState } from "react";
import {
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import logoSrc from "@/assets/logo.svg";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Daily Attendance", href: "/attendance", icon: Calendar },
  { name: "Staff Directory", href: "/staff", icon: Users },
  { name: "Reports & Salary", href: "/reports", icon: FileText },
  { name: "Salary Slips", href: "/slips", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const { owner, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full border-r border-slate-200 bg-white/90 backdrop-blur z-40 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:relative lg:translate-x-0 lg:w-80 lg:static",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200">
          <img
            src={logoSrc}
            alt="Shop Logo"
            className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%2310b981' rx='8'/%3E%3Ctext x='20' y='26' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E";
            }}
          />
          <span className="text-sm font-semibold text-slate-900 lg:block hidden">
            {owner?.shopName || "Shop"}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <Smartphone className="w-5 h-5 text-slate-400" />
              <span className="text-xs text-slate-500">PWA</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Works offline &amp; syncs when online
            </p>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-100 transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden lg:flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Live</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-slate-600 font-medium">
          Staff Attendance &amp; Salary
        </span>
      </div>
    </header>
  );
}

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative lg:ml-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
