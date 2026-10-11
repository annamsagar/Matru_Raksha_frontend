import { useState, useEffect } from "react";
import { Users, AlertTriangle, Plus, CheckCircle2, Clock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

interface Referral {
  id: number;
  patient: { id: number; name: string; weeksPregnant?: number; phone?: string };
  healthWorker?: { id: number; name: string };
  doctor?: { id: number; name: string };
  reason: string;
  urgency: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRef, setSelectedRef] = useState<Referral | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const [newRef, setNewRef] = useState({
    patientId: "",
    doctorId: "",
    reason: "Elevated BP and signs of preeclampsia",
    urgency: "HIGH",
    notes: "",
  });

  const { role } = useRole();

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const refRes = await fetch("http://localhost:8081/api/referrals", { headers });
      if (refRes.ok) {
        setReferrals(await refRes.json());
      }

      if (role === "health_worker" || role === "admin") {
        const pRes = await fetch("http://localhost:8081/api/patients", { headers });
        if (pRes.ok) setPatients(await pRes.json());

        const uRes = await fetch("http://localhost:8081/api/admin/users", { headers });
        if (uRes.ok) {
          const allUsers = await uRes.json();
          setDoctors(allUsers.filter((u: any) => u.role === "doctor"));
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
    if (!newRef.patientId) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8081/api/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRef),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewRef({ patientId: "", doctorId: "", reason: "", urgency: "HIGH", notes: "" });
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
      const res = await fetch(`http://localhost:8081/api/referrals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes: reviewNotes }),
      });

      if (res.ok) {
        setSelectedRef(null);
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
              <Users className="w-6 h-6 text-emerald-600" />
              Clinical Patient Referrals
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Field health worker escalation of concerning high-risk maternal cases to doctors
            </p>
          </div>
          {(role === "health_worker" || role === "admin") && (
            <Button onClick={() => setShowAddModal(true)} className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              New Clinical Referral
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : referrals.length > 0 ? (
          <div className="space-y-4">
            {referrals.map((ref) => (
              <div key={ref.id} className="medical-card p-5 border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-bold uppercase",
                        ref.urgency === "EMERGENCY" ? "bg-red-100 text-red-800" :
                        ref.urgency === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      )}>
                        {ref.urgency} Urgency
                      </span>
                      <h3 className="text-base font-semibold text-slate-800">{ref.reason}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Patient: <span className="font-semibold text-slate-700">{ref.patient?.name}</span>
                      {ref.healthWorker ? ` • Referred by: ${ref.healthWorker.name}` : ""}
                      {ref.doctor ? ` • Target Doctor: ${ref.doctor.name}` : ""}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold capitalize w-fit",
                    ref.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" :
                    ref.status === "ACCEPTED" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                  )}>
                    ● {ref.status}
                  </span>
                </div>

                {ref.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border">
                    <span className="font-semibold text-slate-800">Clinical Referral Notes: </span>
                    {ref.notes}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Referred on {new Date(ref.createdAt).toLocaleDateString()}
                  </span>

                  {role === "doctor" && ref.status === "PENDING" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1"
                      onClick={() => {
                        setSelectedRef(ref);
                        setReviewNotes(ref.notes || "");
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Review & Accept Case
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 medical-card border-dashed space-y-2">
            <Users className="w-10 h-10 mx-auto opacity-30 text-emerald-600" />
            <h3 className="font-heading font-semibold text-base">No Clinical Referrals Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No concerning patient cases have been escalated at this time.
            </p>
          </div>
        )}

        {/* Create Referral Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="medical-card p-6 w-full max-w-md space-y-4 border shadow-xl">
              <h2 className="text-lg font-heading font-bold">Escalate Maternal Case to Doctor</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Select Patient</label>
                  <select
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={newRef.patientId}
                    onChange={(e) => setNewRef({ ...newRef, patientId: e.target.value })}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.weeksPregnant || 0} wks, BP: {p.bloodGroup || "—"})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Refer to Doctor</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={newRef.doctorId}
                    onChange={(e) => setNewRef({ ...newRef, doctorId: e.target.value })}
                  >
                    <option value="">-- Choose Specialist Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Urgency Level</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={newRef.urgency}
                    onChange={(e) => setNewRef({ ...newRef, urgency: e.target.value })}
                  >
                    <option value="NORMAL">Normal Follow-up</option>
                    <option value="HIGH">High Priority (Urgent)</option>
                    <option value="EMERGENCY">Immediate Hospital Emergency</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Reason for Referral</label>
                  <Input
                    required
                    value={newRef.reason}
                    onChange={(e) => setNewRef({ ...newRef, reason: e.target.value })}
                    placeholder="e.g. Systolic BP 150+, pedal edema, risk score HIGH"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Field Observations / Clinical Notes</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-md border border-input bg-background text-sm"
                    value={newRef.notes}
                    onChange={(e) => setNewRef({ ...newRef, notes: e.target.value })}
                    placeholder="Notes on vitals readings and symptoms..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    Submit Referral
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Doctor Review Dialog */}
        {selectedRef && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="medical-card p-6 w-full max-w-md space-y-4 border shadow-xl">
              <h2 className="text-lg font-heading font-bold">Accept Referred Patient</h2>
              <p className="text-xs text-muted-foreground">Patient: {selectedRef.patient?.name}</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Doctor's Response & Triage Instructions</label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 rounded-md border border-input bg-background text-sm"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="e.g. Schedule immediate ultrasound and lab tests, hospital bed reserved..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setSelectedRef(null)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={updating}
                    onClick={() => handleUpdate(selectedRef.id, "ACCEPTED")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {updating ? "Saving..." : "Accept Case"}
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
