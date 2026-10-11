import { useState, useEffect } from "react";
import { Users, Droplets, Activity, AlertTriangle, ShieldCheck, Server, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [patientsCount, setPatientsCount] = useState(0);
  const [donorsCount, setDonorsCount] = useState(0);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [patientsRes, donorsRes, logsRes] = await Promise.all([
          fetch("http://localhost:8081/api/patients", { headers }).catch(() => null),
          fetch("http://localhost:8081/api/donors", { headers }).catch(() => null),
          fetch("http://localhost:8081/api/emergency/logs", { headers }).catch(() => null),
        ]);

        if (patientsRes && patientsRes.ok) {
          const patients = await patientsRes.json();
          setPatientsCount(patients.length);
          setHighRiskCount(patients.filter((p: any) => p.highRisk).length);
        }

        if (donorsRes && donorsRes.ok) {
          const donors = await donorsRes.json();
          setDonorsCount(donors.length);
        }

        if (logsRes && logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: "Total Patients", value: patientsCount.toString(), icon: Users, color: "text-primary" },
    { label: "Active Donors", value: donorsCount.toString(), icon: Droplets, color: "text-info" },
    { label: "High Risk Alerts", value: highRiskCount.toString(), icon: AlertTriangle, color: "text-emergency" },
    { label: "SOS Emergencies", value: logs.length.toString(), icon: Activity, color: "text-safe" },
  ];

  const systemStatus = [
    { label: "Spring Boot Core API", status: "online", port: ":8081" },
    { label: "AI Random Forest Service", status: "online", port: ":5000" },
    { label: "PostgreSQL Database", status: "online", port: ":5432" },
    { label: "Vite Frontend Server", status: "online", port: ":8080" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            System Administration & Control
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            System operational status, user authorization, and network telemetry
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm transition"
          >
            Manage User Accounts
          </a>
          <a
            href="/admin/logs"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 border shadow-sm transition"
          >
            System Audit Logs
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="medical-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-xs font-medium text-safe">Live</span>
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
            Live Emergency Logs ({logs.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{log.patientLabel || "Emergency SOS"}</p>
                    <p className="text-xs text-muted-foreground">
                      Target Blood: {log.bloodGroup || "—"} • {log.donorsMatched || 0} donors matched
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emergency/10 text-emergency capitalize">
                    {log.status || "active"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-1">
              <BarChart3 className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm">No emergency activity logged yet.</p>
              <p className="text-xs">Emergency triggers will automatically show here in real time.</p>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            Infrastructure Status
          </h2>
          <div className="space-y-4">
            {systemStatus.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground font-mono">{s.port}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
                  <span className="text-xs font-medium text-safe capitalize">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
