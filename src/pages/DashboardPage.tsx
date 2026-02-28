import {
  LayoutDashboard,
  Users,
  Activity,
  AlertTriangle,
  Droplets,
  TrendingUp,
  Heart,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Patients", value: "1,247", change: "+12%", icon: Users, color: "text-primary" },
  { label: "Active Donors", value: "856", change: "+8%", icon: Droplets, color: "text-info" },
  { label: "Risk Assessments", value: "3,421", change: "+24%", icon: Activity, color: "text-safe" },
  { label: "Emergencies", value: "18", change: "-5%", icon: AlertTriangle, color: "text-emergency" },
];

const recentAlerts = [
  { id: 1, patient: "Patient #1042", type: "High Risk", time: "2 min ago", severity: "high" as const },
  { id: 2, patient: "Patient #1038", type: "Hemorrhage Alert", time: "15 min ago", severity: "high" as const },
  { id: 3, patient: "Patient #1035", type: "Medium Risk", time: "1 hr ago", severity: "mid" as const },
  { id: 4, patient: "Patient #1029", type: "Low Risk", time: "3 hr ago", severity: "low" as const },
  { id: 5, patient: "Patient #1025", type: "Donor Matched", time: "5 hr ago", severity: "low" as const },
];

const riskDistribution = [
  { label: "Low Risk", count: 720, pct: 58, variant: "safe" as const },
  { label: "Medium Risk", count: 380, pct: 30, variant: "warning" as const },
  { label: "High Risk", count: 147, pct: 12, variant: "emergency" as const },
];

const severityStyles = {
  high: "bg-emergency/10 text-emergency",
  mid: "bg-warning/10 text-warning",
  low: "bg-safe/10 text-safe",
};

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Maternal health monitoring overview
          </p>
        </div>

        {/* Stats grid */}
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
          {/* Recent alerts */}
          <div className="medical-card p-5">
            <h2 className="font-heading font-semibold mb-4">Recent Alerts</h2>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{alert.patient}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                  <span className={cn("px-2 py-1 rounded-md text-xs font-medium", severityStyles[alert.severity])}>
                    {alert.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk distribution */}
          <div className="medical-card p-5">
            <h2 className="font-heading font-semibold mb-4">Risk Distribution</h2>
            <div className="space-y-5">
              {riskDistribution.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.count} patients ({item.pct}%)</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", `gradient-${item.variant}`)}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Assessed</span>
                <span className="text-lg font-heading font-bold">1,247</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
