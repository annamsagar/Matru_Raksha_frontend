import { useState, useEffect } from "react";
import { BarChart3, ShieldCheck, Clock, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

interface AuditLog {
  id: number;
  action: string;
  performedBy: string;
  userRole?: string;
  targetResource?: string;
  details?: string;
  timestamp: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8081/api/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              Security & Clinical Audit Logs
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Immutable telemetry tracking medical record access, role updates, and system events
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Logs
          </Button>
        </div>

        <div className="medical-card p-6 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 font-semibold">Timestamp</th>
                    <th className="pb-3 font-semibold">Action</th>
                    <th className="pb-3 font-semibold">Initiated By</th>
                    <th className="pb-3 font-semibold">Resource</th>
                    <th className="pb-3 font-semibold">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-slate-800 font-sans font-medium">
                        {log.performedBy}
                        {log.userRole ? <span className="text-[10px] text-muted-foreground ml-1">({log.userRole})</span> : ""}
                      </td>
                      <td className="py-3 text-slate-700 font-sans font-medium">
                        {log.targetResource || "—"}
                      </td>
                      <td className="py-3 text-slate-600 font-sans">
                        {log.details || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 space-y-2">
              <BarChart3 className="w-10 h-10 mx-auto opacity-30 text-emerald-600" />
              <h3 className="font-heading font-semibold text-base">No Audit Logs Recorded</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Actions such as user authentication, record views, and ML predictions will be recorded here automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
