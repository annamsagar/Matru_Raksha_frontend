import { useState, useEffect } from "react";
import { Users, Activity, AlertTriangle, TrendingUp, Stethoscope, ClipboardList, Calendar, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Patient {
  id: number;
  name: string;
  age?: number;
  weeksPregnant?: number;
  bloodGroup?: string;
  highRisk?: boolean;
  dueDate?: string;
  phone?: string;
  status?: string;
  checkups?: any[];
}

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: 26,
    weeksPregnant: 24,
    phone: "",
    highRisk: false,
  });

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

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newPatient,
          status: "active",
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewPatient({ name: "", age: 26, weeksPregnant: 24, phone: "", highRisk: false });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
  const totalAssessments = patients.reduce((acc, p) => acc + (p.checkups ? p.checkups.length : 0), 0);
  const activeCount = patients.filter((p) => p.status === "active").length;

  const stats = [
    { label: "Total Patients", value: patients.length.toString(), icon: Users, color: "text-primary" },
    { label: "Assessments", value: totalAssessments.toString(), icon: Activity, color: "text-info" },
    { label: "High Risk Cases", value: highRiskCount.toString(), icon: AlertTriangle, color: "text-emergency" },
    { label: "Active Cases", value: activeCount.toString(), icon: Calendar, color: "text-safe" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            Doctor Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time maternal patient records and clinical overview
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Add Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="medical-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-xs font-medium text-muted-foreground">Active</span>
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
            My Patients ({patients.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : patients.length > 0 ? (
            <div className="space-y-3">
              {patients.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Age {p.age || "—"} • {p.weeksPregnant || 0} weeks • Blood: {p.bloodGroup || "—"}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-xs font-medium capitalize",
                        p.highRisk ? "bg-emergency/10 text-emergency" : "bg-safe/10 text-safe"
                      )}
                    >
                      {p.highRisk ? "High Risk" : "Normal"}
                    </span>
                    <span className="text-xs text-muted-foreground">{p.phone || "No phone"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-2">
              <ClipboardList className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm">No patients registered in database yet.</p>
              <Button onClick={() => setShowAddModal(true)} variant="outline" size="sm" className="mt-2">
                Register First Patient
              </Button>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="medical-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Scheduled Appointments ({appointments.length})
            </h2>
            <a href="/appointments" className="text-xs text-primary hover:underline font-medium">
              Manage All
            </a>
          </div>

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
              <a href="/appointments" className="text-xs text-primary hover:underline block">
                Schedule a clinical checkup
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="medical-card p-6 w-full max-w-md space-y-4 border shadow-xl">
            <h2 className="text-lg font-heading font-bold">Register Maternal Patient</h2>
            <form onSubmit={handleAddPatient} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Patient Full Name</label>
                <Input
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="e.g. Rekha Devi"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Age</label>
                  <Input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 20 })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Weeks Pregnant</label>
                  <Input
                    type="number"
                    value={newPatient.weeksPregnant}
                    onChange={(e) => setNewPatient({ ...newPatient, weeksPregnant: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-medium">Phone</label>
                  <Input
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="highRisk"
                  checked={newPatient.highRisk}
                  onChange={(e) => setNewPatient({ ...newPatient, highRisk: e.target.checked })}
                  className="rounded border-input"
                />
                <label htmlFor="highRisk" className="text-sm font-medium text-emergency">
                  Flag as High Risk Pregnancy
                </label>
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Patient"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
