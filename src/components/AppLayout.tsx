import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Heart,
  Activity,
  Droplets,
  AlertTriangle,
  LayoutDashboard,
  User,
  Menu,
  X,
  Shield,
  LogOut,
  Users,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";

const navByRole = {
  doctor: [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/risk-predictor", label: "Risk Predictor", icon: Activity },
    { path: "/emergency", label: "SOS Emergency", icon: AlertTriangle },
    { path: "/profile", label: "Profile", icon: User },
  ],
  donor: [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/donors", label: "Donor Network", icon: Droplets },
    { path: "/profile", label: "Profile", icon: User },
  ],
  admin: [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/risk-predictor", label: "Risk Predictor", icon: Activity },
    { path: "/donors", label: "Donor Network", icon: Droplets },
    { path: "/emergency", label: "SOS Emergency", icon: AlertTriangle },
    { path: "/profile", label: "Profile", icon: User },
  ],
  health_worker: [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/risk-predictor", label: "Risk Predictor", icon: Activity },
    { path: "/donors", label: "Donor Network", icon: Droplets },
    { path: "/emergency", label: "SOS Emergency", icon: AlertTriangle },
    { path: "/profile", label: "Profile", icon: User },
  ],
};

const roleLabels = {
  doctor: "Doctor",
  donor: "Donor",
  admin: "Admin",
  health_worker: "Health Worker",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { role, userName } = useRole();
  const navItems = navByRole[role];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-sidebar-foreground text-sm">
              Maternal-Guard
            </h1>
            <p className="text-[10px] text-sidebar-muted">& Life-Link</p>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const isEmergency = item.path === "/emergency";
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  isEmergency && !isActive && "text-emergency"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="px-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{userName}</p>
              <p className="text-[10px] text-sidebar-muted">{roleLabels[role]}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <Heart className="w-5 h-5 text-emergency" />
            <span className="font-heading font-bold text-sm">Maternal-Guard</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              D
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
