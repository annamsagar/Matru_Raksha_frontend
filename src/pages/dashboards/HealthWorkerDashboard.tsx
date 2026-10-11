import { useState, useEffect } from "react";
import { Heart, Users, MapPin, ClipboardCheck, Phone, AlertTriangle, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Patient {
  id: number;
  name: string;
  age?: number;
  weeksPregnant?: number;
  bloodGroup?: string;
  highRisk?: boolean;
  phone?: string;
  address?: string;
}

export default function HealthWorkerDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [pRes, aRes] = await Promise.all([
        fetch("http://localhost:8081/api/patients", { headers }),
        fetch("http://localhost:8081/api/appointments", { headers })
      ]);
      if (pRes.ok) {
        setPatients(await pRes.json());
      } else {
        setPatients([]);
      }
      if (aRes.ok) {
        setAppointments(await aRes.json());
      } else {
        setAppointments([]);
      }
    } catch {
      setPatients([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateBloodGroup = async (id: number, bloodGroup: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8081/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bloodGroup }),
      });
      if (res.ok) {
        fetchData(); // refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveAppointment = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8081/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "SCHEDULED" }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const highRiskCount = patients.filter((p) => p.highRisk).length;

  const stats = [
    { label: "Assigned Mothers", value: patients.length.toString(), icon: Users, color: "text-primary" },
    { label: "High Risk Alerts", value: highRiskCount.toString(), icon: AlertTriangle, color: "text-emergency" },
    { label: "Field Area", value: "Primary PHC", icon: MapPin, color: "text-info" },
    { label: "Tasks Today", value: "0", icon: ClipboardCheck, color: "text-safe" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-emergency" />
            Health Worker (ASHA) Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Community prenatal monitoring, vitals recording, and doctor escalations
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/risk-predictor"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition"
          >
            Record Vitals & Predict
          </a>
          <a
            href="/referrals"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition"
          >
            Doctor Referrals
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
                <span className="text-xs font-medium text-safe">Active</span>
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
            Assigned Mothers ({patients.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : patients.length > 0 ? (
            <div className="space-y-3">
              {patients.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      {m.address || "Area PHC"} • {m.weeksPregnant || 0} weeks • Blood: 
                      <select 
                        className="ml-1 px-1 py-0.5 bg-slate-50 border rounded text-[10px]"
                        value={m.bloodGroup || ""}
                        onChange={(e) => updateBloodGroup(m.id, e.target.value)}
                      >
                        <option value="">Set BG</option>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-xs font-medium capitalize",
                        m.highRisk ? "bg-emergency/10 text-emergency" : "bg-safe/10 text-safe"
                      )}
                    >
                      {m.highRisk ? "High Risk" : "Normal"}
                    </span>
                    {m.phone && (
                      <a href={`tel:${m.phone}`}>
                        <Phone className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-2">
              <Users className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm font-medium">No mothers assigned yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Mothers registered in your health block will automatically appear here for prenatal visits.
              </p>
            </div>
          )}
        </div>

        {/* Appointments */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Assigned Appointments ({appointments.length})
          </h2>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appt) => (
                <div key={appt.id} className="p-3 rounded-lg border bg-slate-50/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{appt.reason}</span>
                    <div className="flex gap-2 items-center">
                      {appt.status === "PENDING" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 text-[10px] px-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          onClick={() => handleApproveAppointment(appt.id)}
                        >
                          Approve
                        </Button>
                      )}
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
                        appt.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      )}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>Patient: {appt.patient?.name || "Assigned Patient"}</span>
                    <span>{new Date(appt.appointmentTime).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-2">
              <Calendar className="w-8 h-8 mx-auto opacity-30 text-emerald-600" />
              <p className="text-sm">No scheduled appointments right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
