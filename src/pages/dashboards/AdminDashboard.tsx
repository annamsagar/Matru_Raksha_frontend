import { Users, Droplets, Activity, AlertTriangle, TrendingUp, BarChart3, ShieldCheck, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Patients", value: "1,247", change: "+12%", icon: Users, color: "text-primary" },
  { label: "Active Donors", value: "856", change: "+8%", icon: Droplets, color: "text-info" },
  { label: "Risk Assessments", value: "3,421", change: "+24%", icon: Activity, color: "text-safe" },
  { label: "Emergencies (MTD)", value: "18", change: "-5%", icon: AlertTriangle, color: "text-emergency" },
];

const systemStatus = [
  { label: "API Server", status: "online", uptime: "99.97%" },
  { label: "ML Model", status: "online", uptime: "99.85%" },
  { label: "Database", status: "online", uptime: "99.99%" },
  { label: "SMS Gateway", status: "degraded", uptime: "98.20%" },
];

const recentLogs = [
  { id: 1, action: "Emergency SOS triggered", user: "Dr. Rao", time: "2 min ago", type: "emergency" as const },
  { id: 2, action: "New donor registered", user: "System", time: "15 min ago", type: "info" as const },
  { id: 3, action: "Risk prediction: HIGH", user: "Dr. Mitchell", time: "1 hr ago", type: "warning" as const },
  { id: 4, action: "Donor matched for O+", user: "System", time: "2 hr ago", type: "info" as const },
  { id: 5, action: "User role updated", user: "Admin", time: "3 hr ago", type: "info" as const },
];

const regionBreakdown = [
  { region: "Urban Hospitals", patients: 520, donors: 380, emergencies: 8 },
  { region: "District Centers", patients: 410, donors: 290, emergencies: 6 },
  { region: "Rural PHCs", patients: 317, donors: 186, emergencies: 4 },
];

const logTypeStyle = {
  emergency: "bg-emergency/10 text-emergency",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

const statusStyle: Record<string, string> = {
  online: "text-safe",
  degraded: "text-warning",
  offline: "text-emergency",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          System overview, logs, and regional statistics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="medical-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-xs font-medium text-safe flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-heading font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Logs */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            Recent Activity Logs
          </h2>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">by {log.user} • {log.time}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium capitalize", logTypeStyle[log.type])}>
                  {log.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status + Region */}
        <div className="space-y-6">
          <div className="medical-card p-5">
            <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-muted-foreground" />
              System Status
            </h2>
            <div className="space-y-3">
              {systemStatus.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1">
                  <span className="text-sm">{s.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{s.uptime}</span>
                    <span className={cn("text-xs font-medium capitalize", statusStyle[s.status])}>
                      ● {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="medical-card p-5">
            <h2 className="font-heading font-semibold mb-4">Regional Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Region</th>
                    <th className="pb-2 font-medium text-muted-foreground">Patients</th>
                    <th className="pb-2 font-medium text-muted-foreground">Donors</th>
                    <th className="pb-2 font-medium text-muted-foreground">SOS</th>
                  </tr>
                </thead>
                <tbody>
                  {regionBreakdown.map((r) => (
                    <tr key={r.region} className="border-b last:border-0">
                      <td className="py-2 font-medium">{r.region}</td>
                      <td className="py-2">{r.patients}</td>
                      <td className="py-2">{r.donors}</td>
                      <td className="py-2 text-emergency font-medium">{r.emergencies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
