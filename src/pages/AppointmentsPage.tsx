import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, CheckCircle, XCircle, User, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

interface Appointment {
  id: number;
  patient: { id: number; name: string; weeksPregnant?: number };
  doctor?: { id: number; name: string };
  appointmentTime: string;
  reason: string;
  status: string;
  clinicalNotes?: string;
  doctorRecommendation?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [updating, setUpdating] = useState(false);

  const [newAppt, setNewAppt] = useState({
    patientId: "",
    appointmentTime: "",
    reason: "Routine Prenatal Follow-up",
  });

  const { role } = useRole();

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const apptRes = await fetch("http://localhost:8081/api/appointments", { headers });
      if (apptRes.ok) {
        setAppointments(await apptRes.json());
      }

      if (role === "doctor" || role === "health_worker" || role === "admin") {
        const pRes = await fetch("http://localhost:8081/api/patients", { headers });
        if (pRes.ok) {
          setPatients(await pRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientId) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8081/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: newAppt.patientId,
          appointmentTime: newAppt.appointmentTime || new Date(Date.now() + 86400000 * 3).toISOString(),
          reason: newAppt.reason,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewAppt({ patientId: "", appointmentTime: "", reason: "Routine Prenatal Follow-up" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id: number, status: string) => {
    setUpdating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8081/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          clinicalNotes,
          doctorRecommendation: recommendation,
        }),
      });

      if (res.ok) {
        setSelectedAppt(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-600" />
              Clinical Appointments
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Prenatal consultations, ultrasounds, and clinical checkup schedules
            </p>
          </div>
          {(role === "doctor" || role === "health_worker" || role === "admin") && (
            <Button onClick={() => setShowAddModal(true)} className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              Book Appointment
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="medical-card p-5 border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">{appt.reason}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Patient: <span className="font-medium text-slate-700">{appt.patient?.name}</span>
                      {appt.patient?.weeksPregnant ? ` • ${appt.patient.weeksPregnant} weeks` : ""}
                      {appt.doctor?.name ? ` • Doctor: ${appt.doctor.name}` : ""}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold capitalize w-fit",
                    appt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" :
                    appt.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                  )}>
                    ● {appt.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    {new Date(appt.appointmentTime).toLocaleDateString()} at {new Date(appt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Clinical Notes & Recommendations */}
                {(appt.clinicalNotes || appt.doctorRecommendation) && (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-200">
                    {appt.clinicalNotes && (
                      <p><span className="font-semibold text-slate-700">Clinical Observations: </span>{appt.clinicalNotes}</p>
                    )}
                    {appt.doctorRecommendation && (
                      <p><span className="font-semibold text-emerald-700">Doctor's Plan: </span>{appt.doctorRecommendation}</p>
                    )}
                  </div>
                )}

                {/* Doctor Action Buttons */}
                {role === "doctor" && appt.status === "SCHEDULED" && (
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                      onClick={() => {
                        setSelectedAppt(appt);
                        setClinicalNotes(appt.clinicalNotes || "");
                        setRecommendation(appt.doctorRecommendation || "");
                      }}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Add Clinical Notes
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleUpdate(appt.id, "COMPLETED")}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Completed
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 medical-card border-dashed space-y-2">
            <Calendar className="w-10 h-10 mx-auto opacity-30 text-emerald-600" />
            <h3 className="font-heading font-semibold text-base">No Appointments Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are currently no scheduled appointments on record.
            </p>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="medical-card p-6 w-full max-w-md space-y-4 border shadow-xl">
              <h2 className="text-lg font-heading font-bold">Schedule Maternal Appointment</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Select Patient</label>
                  <select
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={newAppt.patientId}
                    onChange={(e) => setNewAppt({ ...newAppt, patientId: e.target.value })}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.weeksPregnant || 0} wks)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Appointment Date & Time</label>
                  <Input
                    type="datetime-local"
                    required
                    value={newAppt.appointmentTime}
                    onChange={(e) => setNewAppt({ ...newAppt, appointmentTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Reason for Consultation</label>
                  <Input
                    required
                    value={newAppt.reason}
                    onChange={(e) => setNewAppt({ ...newAppt, reason: e.target.value })}
                    placeholder="e.g. 3rd Trimester Ultrasound & BP Review"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    Book Appointment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Clinical Notes Dialog */}
        {selectedAppt && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="medical-card p-6 w-full max-w-md space-y-4 border shadow-xl">
              <h2 className="text-lg font-heading font-bold">Doctor's Clinical Notes</h2>
              <p className="text-xs text-muted-foreground">Patient: {selectedAppt.patient?.name}</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Clinical Observations</label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 rounded-md border border-input bg-background text-sm"
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="e.g. Normal fetal heart rate, slight maternal edema observed..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Recommendations & Care Plan</label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 rounded-md border border-input bg-background text-sm"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="e.g. Increase hydration, bed rest recommended, monitor BP daily..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setSelectedAppt(null)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={updating}
                    onClick={() => handleUpdate(selectedAppt.id, "SCHEDULED")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {updating ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
