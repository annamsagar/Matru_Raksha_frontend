import { useState, useEffect } from "react";
import { Droplets, Heart, Clock, Award, MapPin, Calendar, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyLog {
  id: number;
  patientLabel?: string;
  bloodGroup?: string;
  status?: string;
  triggeredAt?: string;
  donorsMatched?: number;
}

export default function DonorDashboard() {
  const [logs, setLogs] = useState<EmergencyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmergencyLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8081/api/emergency/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        } else {
          setLogs([]);
        }
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmergencyLogs();
  }, []);

  const stats = [
    { label: "Total Donations", value: "0", icon: Droplets, color: "text-emergency" },
    { label: "Emergency Alerts", value: logs.length.toString(), icon: Heart, color: "text-safe" },
    { label: "Availability", value: "Ready", icon: Clock, color: "text-warning" },
    { label: "Health Score", value: "95%", icon: Award, color: "text-primary" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Droplets className="w-6 h-6 text-emergency" />
          Donor Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your donation profile and live emergency broadcast requests
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
                <span className="text-xs font-medium text-safe">Active</span>
              </div>
              <p className="text-2xl font-heading font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation History */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Donation History
          </h2>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto opacity-30 text-safe" />
            <p className="text-sm font-medium">No donation history recorded yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Completed blood and platelet donations will appear here after verification by health staff.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">Status: Eligible to donate</p>
          </div>
        </div>

        {/* Nearby Requests */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Live Emergency SOS Alerts ({logs.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-emergency" />
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{r.patientLabel || "Emergency Hemorrhage Alert"}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.triggeredAt ? new Date(r.triggeredAt).toLocaleString() : "Recent"} • {r.donorsMatched || 0} donors matched
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-emergency">{r.bloodGroup || "O+"}</span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium capitalize bg-emergency/10 text-emergency">
                      {r.status || "active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <AlertCircle className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">No active emergency blood requests</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                You will be notified immediately whenever an emergency hemorrhage alert is triggered in your area.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
