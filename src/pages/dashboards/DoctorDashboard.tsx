import { Users, Activity, AlertTriangle, TrendingUp, Heart, Stethoscope, ClipboardList, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "My Patients", value: "48", change: "+3", icon: Users, color: "text-primary" },
  { label: "Assessments Today", value: "12", change: "+5", icon: Activity, color: "text-info" },
  { label: "High Risk Cases", value: "6", change: "-1", icon: AlertTriangle, color: "text-emergency" },
  { label: "Appointments", value: "8", change: "+2", icon: Calendar, color: "text-safe" },
];

const patients = [
  { id: 1, name: "Priya Sharma", age: 28, weeks: 32, risk: "high" as const, bp: "160/100", nextVisit: "Today" },
  { id: 2, name: "Anita Reddy", age: 25, weeks: 28, risk: "mid" as const, bp: "140/90", nextVisit: "Tomorrow" },
  { id: 3, name: "Meera Patel", age: 30, weeks: 36, risk: "low" as const, bp: "120/80", nextVisit: "Mar 3" },
  { id: 4, name: "Kavita Das", age: 22, weeks: 24, risk: "low" as const, bp: "118/76", nextVisit: "Mar 5" },
  { id: 5, name: "Sunita Rao", age: 35, weeks: 38, risk: "high" as const, bp: "155/95", nextVisit: "Today" },
];

const riskBadge = {
  low: "bg-safe/10 text-safe",
  mid: "bg-warning/10 text-warning",
  high: "bg-emergency/10 text-emergency",
};

const todaySchedule = [
  { time: "09:00 AM", patient: "Priya Sharma", type: "Prenatal Checkup" },
  { time: "10:30 AM", patient: "Sunita Rao", type: "High Risk Review" },
  { time: "12:00 PM", patient: "New Patient", type: "Initial Assessment" },
  { time: "02:00 PM", patient: "Kavita Das", type: "Ultrasound Follow-up" },
];

export default function DoctorDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-primary" />
          Doctor Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your patients and appointments overview
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
        {/* Patient List */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            My Patients
          </h2>
          <div className="space-y-3">
            {patients.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Age {p.age} • {p.weeks} weeks • BP: {p.bp}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium capitalize", riskBadge[p.risk])}>
                    {p.risk} risk
                  </span>
                  <span className="text-xs text-muted-foreground">{p.nextVisit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Today's Schedule
          </h2>
          <div className="space-y-3">
            {todaySchedule.map((s, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b last:border-0">
                <div className="text-sm font-mono text-primary font-medium w-20">{s.time}</div>
                <div>
                  <p className="text-sm font-medium">{s.patient}</p>
                  <p className="text-xs text-muted-foreground">{s.type}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground">4 appointments remaining today</p>
          </div>
        </div>
      </div>
    </div>
  );
}
