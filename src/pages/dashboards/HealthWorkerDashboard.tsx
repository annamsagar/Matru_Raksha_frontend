import { Heart, Users, MapPin, ClipboardCheck, TrendingUp, Phone, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Assigned Mothers", value: "32", change: "+4", icon: Users, color: "text-primary" },
  { label: "Visits This Week", value: "18", change: "+6", icon: MapPin, color: "text-info" },
  { label: "High Risk Alerts", value: "3", change: "+1", icon: AlertTriangle, color: "text-emergency" },
  { label: "Tasks Completed", value: "24", change: "+8", icon: ClipboardCheck, color: "text-safe" },
];

const assignedMothers = [
  { id: 1, name: "Lakshmi Devi", village: "Rampur", weeks: 34, risk: "high" as const, lastVisit: "2 days ago", phone: "+91 98765xxxxx" },
  { id: 2, name: "Fatima Begum", village: "Sultanpur", weeks: 28, risk: "mid" as const, lastVisit: "5 days ago", phone: "+91 87654xxxxx" },
  { id: 3, name: "Sita Kumari", village: "Rampur", weeks: 20, risk: "low" as const, lastVisit: "1 week ago", phone: "+91 76543xxxxx" },
  { id: 4, name: "Radha Rani", village: "Nayagaon", weeks: 38, risk: "high" as const, lastVisit: "Today", phone: "+91 65432xxxxx" },
  { id: 5, name: "Geeta Bai", village: "Sultanpur", weeks: 16, risk: "low" as const, lastVisit: "3 days ago", phone: "+91 54321xxxxx" },
];

const dailyTasks = [
  { id: 1, task: "Visit Lakshmi Devi — check BP and glucose", done: false, priority: "high" as const },
  { id: 2, task: "Collect hemoglobin report for Radha Rani", done: true, priority: "high" as const },
  { id: 3, task: "Distribute iron tablets in Rampur", done: false, priority: "mid" as const },
  { id: 4, task: "Follow-up call with Fatima Begum", done: false, priority: "mid" as const },
  { id: 5, task: "Submit weekly field report", done: true, priority: "low" as const },
];

const riskBadge = {
  low: "bg-safe/10 text-safe",
  mid: "bg-warning/10 text-warning",
  high: "bg-emergency/10 text-emergency",
};

const priorityBadge = {
  low: "text-safe",
  mid: "text-warning",
  high: "text-emergency",
};

export default function HealthWorkerDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Heart className="w-6 h-6 text-emergency" />
          Health Worker Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Field visits, assigned mothers, and daily tasks
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
        {/* Assigned Mothers */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Assigned Mothers
          </h2>
          <div className="space-y-3">
            {assignedMothers.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.village} • {m.weeks} weeks • Last: {m.lastVisit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium capitalize", riskBadge[m.risk])}>
                    {m.risk}
                  </span>
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
            Daily Tasks
          </h2>
          <div className="space-y-3">
            {dailyTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <CheckCircle2 className={cn("w-4 h-4 shrink-0", t.done ? "text-safe" : "text-muted-foreground/30")} />
                <div className="flex-1">
                  <p className={cn("text-sm", t.done && "line-through text-muted-foreground")}>{t.task}</p>
                </div>
                <span className={cn("text-xs font-medium", priorityBadge[t.priority])}>●</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t flex justify-between text-xs text-muted-foreground">
            <span>2 of 5 completed</span>
            <span className="text-primary font-medium">View all tasks →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
